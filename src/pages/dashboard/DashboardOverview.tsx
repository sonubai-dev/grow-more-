import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FeedbackItem,
  FeedbackStats,
  ReviewClickEvent,
  DateRangeFilter,
  BusinessAggregatedStatsDoc,
} from '../../types';
import {
  getFeedbackByBusiness,
  getReviewClicksByBusiness,
  getBusinessAggregatedStats,
  calculateBusinessStats,
  isDateInFilter,
} from '../../services/feedbackService';
import { GooglePlaceReviewsMap } from '../../components/maps/GooglePlaceReviewsMap';
import { DateFilterSelector } from '../../components/dashboard/DateFilterSelector';
import { DashboardMetricsGrid } from '../../components/dashboard/DashboardMetricsGrid';
import { DashboardCharts } from '../../components/dashboard/DashboardCharts';
import { OnboardingEmptyState } from '../../components/dashboard/OnboardingEmptyState';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { RecentFeedbackTable } from '../../components/dashboard/RecentFeedbackTable';
import { FeedbackDetailModal } from '../../components/dashboard/FeedbackDetailModal';
import { QrStandModal } from '../../components/dashboard/QrStandModal';
import { toAppError } from '../../lib/apiError';

export const DashboardOverview: React.FC = () => {
  const { currentBusiness, user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Raw data from Firestore
  const [rawFeedbackList, setRawFeedbackList] = useState<FeedbackItem[]>([]);
  const [rawClicksList, setRawClicksList] = useState<ReviewClickEvent[]>([]);
  const [aggregatedDoc, setAggregatedDoc] = useState<BusinessAggregatedStatsDoc | null>(null);

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ preset: 'all' });

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const businessId = currentBusiness?.id || '';
  const ownerId = currentBusiness?.ownerId || '';
  const businessName = currentBusiness?.businessName || currentBusiness?.name || 'Your Business';
  const businessSlug = currentBusiness?.slug || '';

  const reviewLink = `${window.location.origin}/r/${businessSlug}`;

  // Data Loading function
  const loadDashboardData = async (showInlineSpinner = true) => {
    if (showInlineSpinner) setLoading(true);
    setErrorState(null);

    try {
      const isAdmin = user?.role === 'admin';
      // Scalable fetch: retrieve aggregated stats doc alongside paginated/recent records
      const [aggStats, feedbackData, clicksData] = await Promise.all([
        getBusinessAggregatedStats(businessId, user?.id, ownerId, isAdmin),
        getFeedbackByBusiness(businessId, ownerId, 250, user?.id, isAdmin),
        getReviewClicksByBusiness(businessId, 250, user?.id, ownerId, isAdmin),
      ]);

      setAggregatedDoc(aggStats);
      setRawFeedbackList(feedbackData);
      setRawClicksList(clicksData);
    } catch (err: unknown) {
      console.error('Error loading dashboard metrics:', err);
      const appErr = toAppError(err, 'Failed to connect to database.');
      setErrorState(appErr.userMessage);
      addToast('error', appErr.userMessage, 'Sync Failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [businessId, ownerId, user?.id]);

  // Handle Manual Refresh
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(false);
    addToast('info', 'Dashboard metrics synchronized with Cloud Firestore.', 'Refreshed');
  };

  // Copy Review Link with Toast: "Review link copied"
  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    addToast('success', 'Review link copied', 'Link Copied');
    setTimeout(() => setCopied(false), 2500);
  };

  // Filter feedback & clicks by active Date Range Filter
  const filteredFeedback = useMemo(() => {
    return rawFeedbackList.filter((item) => isDateInFilter(item.createdAt, dateFilter));
  }, [rawFeedbackList, dateFilter]);

  const filteredClicks = useMemo(() => {
    return rawClicksList.filter((item) => isDateInFilter(item.createdAt, dateFilter));
  }, [rawClicksList, dateFilter]);

  // Dynamically compute filtered statistics
  const currentStats: FeedbackStats = useMemo(() => {
    // If all time and we have aggregated doc with zero raw items loaded, fallback cleanly
    if (dateFilter.preset === 'all' && aggregatedDoc && rawFeedbackList.length === 0) {
      return {
        totalFeedback: aggregatedDoc.totalFeedback || 0,
        averageRating: aggregatedDoc.averageRating || 5.0,
        fiveStarCount: aggregatedDoc.totalFiveStar || 0,
        fourStarCount: aggregatedDoc.totalFourStar || 0,
        threeStarCount: aggregatedDoc.totalThreeStar || 0,
        twoStarCount: aggregatedDoc.totalTwoStar || 0,
        oneStarCount: aggregatedDoc.totalOneStar || 0,
        googleClicks: aggregatedDoc.googleClicks || 0,
        googleClickRate: aggregatedDoc.googleClickRate || 0,
      };
    }

    return calculateBusinessStats(filteredFeedback, filteredClicks);
  }, [filteredFeedback, filteredClicks, dateFilter, aggregatedDoc, rawFeedbackList.length]);

  // Generate timeline chart series adapted to active date filter
  const trendTimelineData = useMemo(() => {
    let daysToGenerate = 7;
    if (dateFilter.preset === 'today') daysToGenerate = 1;
    else if (dateFilter.preset === '7days') daysToGenerate = 7;
    else if (dateFilter.preset === '30days') daysToGenerate = 14;
    else if (dateFilter.preset === '90days') daysToGenerate = 12;
    else daysToGenerate = 7;

    const data: { date: string; fullDate: string; feedback: number; googleClicks: number }[] = [];
    const now = new Date();

    if (dateFilter.preset === 'today') {
      const todayKey = now.toISOString().split('T')[0];
      const todayFb = filteredFeedback.filter((f) => f.createdAt.startsWith(todayKey)).length;
      const todayClk = filteredClicks.filter((c) => c.createdAt.startsWith(todayKey)).length;

      data.push({
        date: 'Morning',
        fullDate: `${todayKey} Morning`,
        feedback: Math.floor(todayFb * 0.4),
        googleClicks: Math.floor(todayClk * 0.4),
      });
      data.push({
        date: 'Afternoon',
        fullDate: `${todayKey} Afternoon`,
        feedback: Math.floor(todayFb * 0.4),
        googleClicks: Math.floor(todayClk * 0.4),
      });
      data.push({
        date: 'Evening',
        fullDate: `${todayKey} Evening`,
        feedback: todayFb - Math.floor(todayFb * 0.8),
        googleClicks: todayClk - Math.floor(todayClk * 0.8),
      });
      return data;
    }

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const step = dateFilter.preset === '90days' ? 7 : dateFilter.preset === '30days' ? 2 : 1;
      const d = new Date();
      d.setDate(now.getDate() - i * step);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(undefined, {
        weekday: daysToGenerate <= 7 ? 'short' : undefined,
        month: 'numeric',
        day: 'numeric',
      });

      let fbCount = 0;
      let clkCount = 0;

      if (step === 1) {
        fbCount = filteredFeedback.filter((f) => f.createdAt.startsWith(dateKey)).length;
        clkCount = filteredClicks.filter((c) => c.createdAt.startsWith(dateKey)).length;
      } else {
        const startWindow = new Date(d.getTime() - step * 24 * 60 * 60 * 1000);
        fbCount = filteredFeedback.filter((f) => {
          const t = new Date(f.createdAt);
          return t <= d && t >= startWindow;
        }).length;
        clkCount = filteredClicks.filter((c) => {
          const t = new Date(c.createdAt);
          return t <= d && t >= startWindow;
        }).length;
      }

      data.push({
        date: i === 0 ? 'Today' : label,
        fullDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        feedback: fbCount,
        googleClicks: clkCount,
      });
    }

    return data;
  }, [filteredFeedback, filteredClicks, dateFilter]);

  const isEmptyBusiness = !loading && rawFeedbackList.length === 0 && rawClicksList.length === 0;

  return (
    <div id="dashboard-overview" className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero Bar sub-component */}
      <DashboardHeader
        businessName={businessName}
        businessSlug={businessSlug}
        reviewLink={reviewLink}
        copied={copied}
        onCopyLink={handleCopyLink}
        onOpenQrModal={() => setQrModalOpen(true)}
      />

      {/* Date Filters & Live Sync Control Bar */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
        id="dashboard-date-filter-bar"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Date Filter:
          </span>
          <DateFilterSelector filter={dateFilter} onChange={setDateFilter} />
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto">
          {refreshing && (
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> Syncing...
            </span>
          )}
          <Button
            id="dash-refresh-metrics-btn"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            className="text-xs font-semibold"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error State Banner */}
      {errorState && (
        <div
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs"
          id="dashboard-error-banner"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorState}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadDashboardData(true)}
            className="text-xs bg-white"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="space-y-6" id="dashboard-loading-skeleton" aria-busy="true" aria-label="Loading dashboard metrics">
          {/* Metrics Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100" />
                  <div className="w-12 h-5 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-24 rounded bg-slate-100" />
                  <div className="h-7 w-20 rounded bg-slate-200" />
                </div>
                <div className="h-3 w-32 rounded bg-slate-100 pt-1" />
              </div>
            ))}
          </div>

          {/* Quick Action / Review Link Skeleton */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
              <div className="space-y-1">
                <div className="h-3 w-36 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-xl bg-slate-100" />
          </div>

          {/* Charts Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 w-36 rounded bg-slate-200" />
                    <div className="h-3 w-48 rounded bg-slate-100" />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100" />
                </div>
                <div className="h-64 rounded-xl bg-slate-50 flex items-end justify-between p-4 gap-3">
                  {[40, 65, 85, 30, 95, 55, 75].map((h, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-slate-200 rounded-t-md"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isEmptyBusiness ? (
        /* Empty Business Onboarding State */
        <OnboardingEmptyState
          businessName={businessName}
          businessSlug={businessSlug}
          onCopyLink={handleCopyLink}
          copied={copied}
          onOpenQr={() => setQrModalOpen(true)}
        />
      ) : (
        /* Main Production Dashboard Content */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Dashboard Metrics (1–9) */}
          <DashboardMetricsGrid stats={currentStats} loading={loading} />

          {/* 4 Production Visualizations */}
          <DashboardCharts
            stats={currentStats}
            trendTimelineData={trendTimelineData}
          />

          {/* Live Google Place Reviews Map Widget */}
          <Card className="p-6" id="live-google-reviews-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Live Google Maps Location & Verified Reviews
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Google Maps Synced
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified customer reviews and interactive location pinned for {businessName}
                </p>
              </div>
              <Link to="/dashboard/review-page">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Configure Google Place
                </Button>
              </Link>
            </div>

            <GooglePlaceReviewsMap
              placeId={currentBusiness?.googlePlaceId || ''}
              businessName={businessName}
              address={currentBusiness?.address || ''}
              showMap={true}
            />
          </Card>

          {/* Recent Submissions Table Sub-Component */}
          <RecentFeedbackTable
            feedback={filteredFeedback}
            onSelectFeedback={setSelectedFeedback}
          />
        </div>
      )}

      {/* Printable QR Code Modal Sub-Component */}
      <QrStandModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        reviewLink={reviewLink}
        copied={copied}
        onCopyLink={handleCopyLink}
      />

      {/* Feedback Detail Modal Sub-Component */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        businessName={businessName}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
};
