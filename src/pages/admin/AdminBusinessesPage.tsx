import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  ExternalLink,
  Star,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Business } from '../../types';
import { fetchAllBusinesses, updateBusinessStatus } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { toAppError } from '../../lib/apiError';

export const AdminBusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBusinesses();
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      addToast('error', 'Failed to load businesses from database', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = businesses.filter((b) => {
    const isSuspended = b.status === 'suspended' || b.isActive === false;
    if (statusFilter === 'active' && isSuspended) return false;
    if (statusFilter === 'suspended' && !isSuspended) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = b.businessName?.toLowerCase().includes(q) || b.name?.toLowerCase().includes(q);
      const matchEmail = b.email?.toLowerCase().includes(q) || b.contactEmail?.toLowerCase().includes(q);
      const matchCat = b.category?.toLowerCase().includes(q);
      const matchSlug = b.slug?.toLowerCase().includes(q);
      return matchName || matchEmail || matchCat || matchSlug;
    }
    return true;
  });

  const handleStatusChange = async (biz: Business, nextStatus: 'active' | 'suspended') => {
    try {
      setActionLoading(true);
      await updateBusinessStatus(biz.id, nextStatus);
      
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === biz.id ? { ...b, status: nextStatus, isActive: nextStatus === 'active' } : b
        )
      );

      if (selectedBiz && selectedBiz.id === biz.id) {
        setSelectedBiz((prev) => (prev ? { ...prev, status: nextStatus, isActive: nextStatus === 'active' } : null));
      }

      addToast(
        nextStatus === 'active' ? 'success' : 'warning',
        `Business "${biz.name || biz.businessName}" is now ${nextStatus.toUpperCase()}.`,
        'Status Changed'
      );
    } catch (err: unknown) {
      const appErr = toAppError(err, 'Failed to update business status.');
      addToast('error', appErr.userMessage, appErr.code === 'FORBIDDEN' ? 'Access Denied' : 'Update Failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div id="admin-businesses-root" className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Businesses Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative platform directory. Manage tenant activation, inspect metrics, and enforce compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="admin-businesses-refresh-btn"
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tenants ({businesses.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active ({businesses.filter((b) => b.status !== 'suspended' && b.isActive !== false).length})
            </button>
            <button
              onClick={() => setStatusFilter('suspended')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'suspended'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Suspended ({businesses.filter((b) => b.status === 'suspended' || b.isActive === false).length})
            </button>
          </div>

          <div className="w-full sm:w-80">
            <Input
              id="admin-search-businesses-input"
              placeholder="Search by name, owner email, category, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Authoritative Businesses Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Business Name</th>
                <th className="py-3.5 px-4">Owner Email</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Feedback Count</th>
                <th className="py-3.5 px-4 text-center">Google Clicks</th>
                <th className="py-3.5 px-6 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((biz) => {
                const isSuspended = biz.status === 'suspended' || biz.isActive === false;
                const createdDateStr = biz.createdAt
                  ? typeof biz.createdAt === 'string'
                    ? new Date(biz.createdAt).toLocaleDateString()
                    : 'Recent'
                  : 'Recent';

                return (
                  <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Business name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                          {(biz.name || biz.businessName || 'B').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{biz.name || biz.businessName}</div>
                          <div className="text-xs text-indigo-600 font-mono">/r/{biz.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Owner email */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-700">
                      {biz.email || biz.contactEmail || 'N/A'}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-700">
                      {biz.category || 'General'}
                    </td>

                    {/* Created date */}
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {createdDateStr}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <Badge
                        variant={isSuspended ? 'danger' : 'success'}
                        size="sm"
                        className="capitalize font-semibold"
                      >
                        {isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>

                    {/* Feedback count */}
                    <td className="py-4 px-4 text-xs font-bold text-slate-900 text-center">
                      {biz.stats?.totalFeedback ?? 0}
                    </td>

                    {/* Google click count */}
                    <td className="py-4 px-4 text-xs font-bold text-indigo-600 text-center">
                      {biz.stats?.googleClicks ?? 0}
                    </td>

                    {/* Admin actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          id={`admin-view-biz-${biz.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBiz(biz)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>

                        {isSuspended ? (
                          <Button
                            id={`admin-activate-biz-${biz.id}`}
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(biz, 'active')}
                            disabled={actionLoading}
                            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            id={`admin-suspend-biz-${biz.id}`}
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatusChange(biz, 'suspended')}
                            disabled={actionLoading}
                            leftIcon={<Ban className="w-3.5 h-3.5" />}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No businesses matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Business Modal */}
      <Modal
        isOpen={!!selectedBiz}
        onClose={() => setSelectedBiz(null)}
        title="Business Tenant Authority Inspection"
        description="Comprehensive audit of tenant status, configuration, and review activity."
      >
        {selectedBiz && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">{selectedBiz.name || selectedBiz.businessName}</h4>
                <p className="text-xs text-slate-500 font-mono">https://ZellonAI.com/r/{selectedBiz.slug}</p>
              </div>
              <Badge
                variant={selectedBiz.status === 'suspended' || selectedBiz.isActive === false ? 'danger' : 'success'}
                size="md"
                className="capitalize"
              >
                {selectedBiz.status === 'suspended' || selectedBiz.isActive === false ? 'Suspended' : 'Active'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Owner / Contact</span>
                <span className="font-bold text-slate-900">{selectedBiz.email || selectedBiz.contactEmail}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Category</span>
                <span className="font-bold text-slate-900">{selectedBiz.category || 'General'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Feedback Count</span>
                <span className="font-bold text-slate-900">{selectedBiz.stats?.totalFeedback ?? 0} reviews</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Google Click Count</span>
                <span className="font-bold text-indigo-600">{selectedBiz.stats?.googleClicks ?? 0} clicks</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Google Review Destination URL:
              </span>
              <p className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg break-all font-mono">
                {selectedBiz.googleReviewUrl || 'No review URL provided'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {selectedBiz.status === 'suspended' || selectedBiz.isActive === false ? (
                <Button
                  id="admin-modal-activate-btn"
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange(selectedBiz, 'active')}
                  disabled={actionLoading}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Activate Business
                </Button>
              ) : (
                <Button
                  id="admin-modal-suspend-btn"
                  variant="danger"
                  size="sm"
                  onClick={() => handleStatusChange(selectedBiz, 'suspended')}
                  disabled={actionLoading}
                  leftIcon={<Ban className="w-4 h-4" />}
                >
                  Suspend Business
                </Button>
              )}

              <div className="flex gap-2">
                <Link to={`/r/${selectedBiz.slug}`} target="_blank">
                  <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Public Page
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBiz(null)}>
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
