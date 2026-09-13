import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Star,
  Users,
  ExternalLink,
  QrCode,
  Smartphone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Loader2,
  ArrowUpRight,
  MousePointerClick,
  Percent,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { DashboardCard } from '../../components/ui/DashboardCard';
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
import { DateFilterSelector } from '../../components/dashboard/DateFilterSelector';
import { DashboardMetricsGrid } from '../../components/dashboard/DashboardMetricsGrid';
import { DashboardCharts } from '../../components/dashboard/DashboardCharts';
import { OnboardingEmptyState } from '../../components/dashboard/OnboardingEmptyState';
import { QrStandModal } from '../../components/dashboard/QrStandModal';
import { toAppError } from '../../lib/apiError';

export const AnalyticsPage: React.FC = () => {
  const { currentBusiness, user } = useAuth();
  const { addToast } = useToast();

  const businessId = currentBusiness?.id || 'solita-solutions';
  const ownerId = currentBusiness?.ownerId || '';
  const businessName = currentBusiness?.businessName || currentBusiness?.name || 'Solita Solutions';
  const businessSlug = currentBusiness?.slug || 'solita-solutions';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [rawFeedbackList, setRawFeedbackList] = useState<FeedbackItem[]>([]);
  const [rawClicksList, setRawClicksList] = useState<ReviewClickEvent[]>([]);
  const [aggregatedDoc, setAggregatedDoc] = useState<BusinessAggregatedStatsDoc | null>(null);

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ preset: 'all' });

  const reviewLink = `${window.location.origin}/r/${businessSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    addToast('success', 'Review link copied', 'Link Copied');
    setTimeout(() => setCopied(false), 2500);
  };

  const loadAnalytics = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const isAdmin = user?.role === 'admin';
      const [aggStats, feedbackData, clicksData] = await Promise.all([
        getBusinessAggregatedStats(businessId, user?.id, ownerId, isAdmin),
        getFeedbackByBusiness(businessId, ownerId, 250, user?.id, isAdmin),
        getReviewClicksByBusiness(businessId, 250, user?.id, ownerId, isAdmin),
      ]);

      setAggregatedDoc(aggStats);
      setRawFeedbackList(feedbackData);
      setRawClicksList(clicksData);
    } catch (err: unknown) {
      console.warn('Error loading analytics:', err);
      const appErr = toAppError(err, 'Failed to load analytics.');
      addToast('error', appErr.userMessage, 'Error Loading Analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [businessId, ownerId, user?.id]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics(false);
    addToast('info', 'Analytics synchronized with Cloud Firestore.', 'Refreshed');
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
    <div id="analytics-page-root" className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reputation & Conversion Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time conversion metrics, rating distribution, and Google review click trends for {businessName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            className="text-xs font-semibold"
          >
            Sync Data
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs" id="analytics-date-filter-bar">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Date Filter:
          </span>
          <DateFilterSelector filter={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-3xl" />
            ))}
          </div>
          <div className="h-72 bg-slate-200 rounded-3xl" />
        </div>
      ) : isEmptyBusiness ? (
        <OnboardingEmptyState
          businessName={businessName}
          businessSlug={businessSlug}
          onCopyLink={handleCopyLink}
          copied={copied}
          onOpenQr={() => setQrModalOpen(true)}
        />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Metrics Grid */}
          <DashboardMetricsGrid stats={currentStats} loading={loading} />

          {/* 4 Required Charts */}
          <DashboardCharts
            stats={currentStats}
            trendTimelineData={trendTimelineData}
          />
        </div>
      )}

      {/* QR Stand Modal */}
      <QrStandModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        reviewLink={reviewLink}
        copied={copied}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
};
