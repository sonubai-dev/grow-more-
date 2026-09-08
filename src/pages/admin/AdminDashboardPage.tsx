import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  MousePointerClick,
  Star,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Ban,
  Eye,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { AdminDashboardMetrics, Business, FeedbackItem } from '../../types';
import { fetchAdminDashboardStats, updateBusinessStatus } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { toAppError } from '../../lib/apiError';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspectingBiz, setInspectingBiz] = useState<Business | null>(null);
  const { addToast } = useToast();

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const data = await fetchAdminDashboardStats();
      setMetrics(data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
      addToast('error', 'Failed to load live admin statistics', 'Data Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleToggleStatus = async (biz: Business) => {
    const nextStatus = biz.status === 'suspended' || biz.isActive === false ? 'active' : 'suspended';
    try {
      await updateBusinessStatus(biz.id, nextStatus);
      addToast(
        nextStatus === 'active' ? 'success' : 'warning',
        `Business "${biz.name}" has been ${nextStatus === 'active' ? 'activated' : 'suspended'}.`,
        'Status Updated'
      );
      loadStats();
      if (inspectingBiz && inspectingBiz.id === biz.id) {
        setInspectingBiz((prev) => (prev ? { ...prev, status: nextStatus, isActive: nextStatus === 'active' } : null));
      }
    } catch (err: unknown) {
      const appErr = toAppError(err, 'Failed to update business status.');
      addToast('error', appErr.userMessage, appErr.code === 'FORBIDDEN' ? 'Access Denied' : 'Error');
    }
  };

  return (
    <div id="admin-dashboard-root" className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              System Administration
            </span>
            <span className="text-xs text-slate-500 font-medium">ZellonAI Authority Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Platform Command Center
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="admin-refresh-stats-btn"
            variant="outline"
            size="sm"
            onClick={loadStats}
            isLoading={refreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Metrics
          </Button>
          <Link to="/admin/businesses">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Manage All Businesses
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          id="admin-total-businesses"
          title="Total Businesses"
          value={metrics?.totalBusinesses ?? '...'}
          change={`${metrics?.activeBusinesses ?? 0} active`}
          changeType="neutral"
          subtitle={`${metrics?.suspendedBusinesses ?? 0} suspended`}
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />
        <DashboardCard
          id="admin-active-businesses"
          title="Active Businesses"
          value={metrics?.activeBusinesses ?? '...'}
          change="Operational"
          changeType="positive"
          subtitle="Accepting reviews"
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <DashboardCard
          id="admin-total-feedback"
          title="Total Feedback"
          value={metrics?.totalFeedback ?? '...'}
          change={`${metrics?.fiveStarFeedback ?? 0} 5-Stars`}
          changeType="positive"
          subtitle="Collected platform-wide"
          icon={<MessageSquare className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600"
        />
        <DashboardCard
          id="admin-google-clicks"
          title="Total Google Clicks"
          value={metrics?.totalGoogleClicks ?? '...'}
          change="Conversions"
          changeType="positive"
          subtitle="Redirected to Google"
          icon={<MousePointerClick className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600"
        />
        <DashboardCard
          id="admin-avg-rating"
          title="Average Platform Rating"
          value={metrics ? `${metrics.averagePlatformRating} ★` : '...'}
          change="High Quality"
          changeType="positive"
          subtitle="Across all tenants"
          icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Grid: New Businesses + Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Businesses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">New Businesses</h3>
              <p className="text-xs text-slate-500">Recently created tenant registrations</p>
            </div>
            <Link to="/admin/businesses">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Directory
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics?.newBusinesses && metrics.newBusinesses.length > 0 ? (
              metrics.newBusinesses.map((biz) => (
                <div key={biz.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{biz.name}</div>
                      <div className="text-xs text-slate-500">{biz.contactEmail} • <span className="font-mono text-indigo-600">/r/{biz.slug}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={biz.status === 'suspended' ? 'danger' : 'success'}
                      size="sm"
                      className="capitalize"
                    >
                      {biz.status || (biz.isActive ? 'active' : 'suspended')}
                    </Badge>
                    <button
                      onClick={() => setInspectingBiz(biz)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                      title="Inspect Business"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No businesses recorded yet.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Feedback */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Platform Feedback</h3>
              <p className="text-xs text-slate-500">Live incoming customer submissions</p>
            </div>
            <Link to="/admin/feedback">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Feed
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.recentFeedback && metrics.recentFeedback.length > 0 ? (
              metrics.recentFeedback.map((fb) => (
                <div key={fb.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{fb.businessName || 'Business Client'}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600">{fb.customerName || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-bold text-slate-900">
                        <span>{fb.rating}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                      {fb.googleRedirected || fb.clickedGoogleReview ? (
                        <Badge variant="success" size="sm">Google Redirected</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Direct Feedback</Badge>
                      )}
                    </div>
                  </div>
                  {fb.comment && (
                    <p className="text-xs text-slate-700 italic mt-1.5 line-clamp-2">
                      "{fb.comment}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No feedback received yet.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Inspect Business Modal */}
      <Modal
        isOpen={!!inspectingBiz}
        onClose={() => setInspectingBiz(null)}
        title="Tenant Admin Details"
        description="Inspect business properties and manage status."
      >
        {inspectingBiz && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{inspectingBiz.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">/r/{inspectingBiz.slug}</p>
                </div>
                <Badge
                  variant={inspectingBiz.status === 'suspended' ? 'danger' : 'success'}
                  size="md"
                  className="capitalize"
                >
                  {inspectingBiz.status || (inspectingBiz.isActive ? 'active' : 'suspended')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Owner / Contact</span>
                <span className="font-bold text-slate-900">{inspectingBiz.contactEmail}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Category</span>
                <span className="font-bold text-slate-900">{inspectingBiz.category || 'General'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Total Feedback</span>
                <span className="font-bold text-slate-900">{inspectingBiz.stats?.totalFeedback ?? 0}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Google Review Clicks</span>
                <span className="font-bold text-indigo-600">{inspectingBiz.stats?.googleClicks ?? 0}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Google Review Destination URL:
              </span>
              <p className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg break-all font-mono">
                {inspectingBiz.googleReviewUrl || 'No review URL provided'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant={inspectingBiz.status === 'suspended' ? 'primary' : 'danger'}
                size="sm"
                onClick={() => handleToggleStatus(inspectingBiz)}
              >
                {inspectingBiz.status === 'suspended' ? 'Activate Business' : 'Suspend Business'}
              </Button>
              <div className="flex gap-2">
                <Link to={`/r/${inspectingBiz.slug}`} target="_blank">
                  <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Public Page
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setInspectingBiz(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
