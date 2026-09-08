import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Star,
  ShieldCheck,
  Building2,
  Filter,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FeedbackItem, Business } from '../../types';
import { fetchPlatformFeedback, fetchAllBusinesses } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminFeedbackPage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [fbs, bizs] = await Promise.all([
        fetchPlatformFeedback(),
        fetchAllBusinesses(),
      ]);
      setFeedbackList(fbs);
      setBusinesses(bizs);
    } catch (err) {
      console.error('Error loading platform feedback:', err);
      addToast('error', 'Failed to retrieve feedback stream', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = feedbackList.filter((fb) => {
    if (selectedTenant !== 'all' && fb.businessId !== selectedTenant) return false;
    if (ratingFilter !== 'all' && fb.rating !== ratingFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComment = fb.comment.toLowerCase().includes(q);
      const matchBiz = fb.businessName?.toLowerCase().includes(q);
      const matchCust = fb.customerName?.toLowerCase().includes(q);
      const matchEmail = fb.customerEmail?.toLowerCase().includes(q);
      return matchComment || matchBiz || matchCust || matchEmail;
    }
    return true;
  });

  return (
    <div id="admin-feedback-root" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Feedback Stream
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative platform-wide review audit, customer submissions, and Google routing logs.
          </p>
        </div>
        <Button
          id="admin-feedback-refresh-btn"
          variant="outline"
          size="sm"
          onClick={loadData}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter by Business */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                Business:
              </label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Businesses ({businesses.length})</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || b.businessName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Rating */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                Rating:
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Ratings (1-5)</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="w-full lg:w-80">
            <Input
              id="admin-search-feedback"
              placeholder="Search comments, customer, business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Feedback Feed */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <Card key={item.id} className="p-5 hover:border-slate-300 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900 text-sm">{item.businessName || 'Client Business'}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600">
                  Customer: <strong>{item.customerName || 'Anonymous'}</strong>
                </span>
                {item.customerEmail && (
                  <span className="text-xs text-slate-400 hidden md:inline">
                    ({item.customerEmail})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold text-slate-900">
                  <span>{item.rating}.0</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                {item.googleRedirected || item.clickedGoogleReview || item.rating === 5 ? (
                  <Badge variant="success" size="sm">Google Redirected</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Private Feedback</Badge>
                )}
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 ml-1"
                  title="Inspect Feedback"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-800 italic mt-3 leading-relaxed">
              "{item.comment}"
            </p>

            {item.internalNotes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Manager Note: </span>
                {item.internalNotes}
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && !loading && (
          <Card className="p-12 text-center text-slate-400 text-xs">
            No feedback found matching the active criteria.
          </Card>
        )}
      </div>

      {/* Inspect Feedback Item Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Feedback Audit Record"
        description="Comprehensive customer submission metadata and audit details."
      >
        {selectedItem && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">{selectedItem.businessName}</h4>
                <p className="text-xs text-slate-500">Tenant ID: {selectedItem.businessId}</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-sm font-bold text-slate-900">
                <span>{selectedItem.rating}.0</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Customer Information</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Name</span>
                  <span className="font-bold text-slate-900">{selectedItem.customerName || 'Anonymous'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-bold text-slate-900">{selectedItem.customerEmail || 'Not provided'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Phone</span>
                  <span className="font-bold text-slate-900">{selectedItem.customerPhone || 'Not provided'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Source</span>
                  <span className="font-bold text-indigo-600">{selectedItem.source || 'public_review_page'}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Feedback Content</span>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 italic">
                "{selectedItem.comment}"
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
