import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Loader2,
  Phone,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { FeedbackItem, FeedbackRating, FeedbackStatus, DateRangeFilter } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getFeedbackByBusiness,
  updateFeedbackItem,
  isDateInFilter,
} from '../../services/feedbackService';
import { DateFilterSelector } from '../../components/dashboard/DateFilterSelector';
import { toAppError } from '../../lib/apiError';

export const FeedbackPage: React.FC = () => {
  const { currentBusiness, user } = useAuth();
  const { addToast } = useToast();

  const businessId = currentBusiness?.id || '';
  const ownerId = currentBusiness?.ownerId || '';
  const businessName = currentBusiness?.businessName || currentBusiness?.name || 'Your Business';
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [ratingFilter, setRatingFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ preset: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load real Firestore feedback
  const loadData = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const data = await getFeedbackByBusiness(businessId, ownerId, undefined, user?.id, isAdmin);
      setFeedbackList(data);
    } catch (err) {
      console.warn('Error loading feedback list:', err);
      const appErr = toAppError(err);
      setErrorState(appErr.userMessage);
      addToast('error', appErr.userMessage, 'Error Loading Feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId, ownerId, user?.id, isAdmin]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, dateFilter, searchQuery]);

  // Filter items
  const filteredItems = feedbackList.filter((item) => {
    // Date filter
    if (!isDateInFilter(item.createdAt, dateFilter)) {
      return false;
    }

    // Rating Filter: All, 5 star, 4 star, 3 star, 2 star, 1 star
    if (ratingFilter !== 'all' && item.rating !== ratingFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.customerName?.toLowerCase().includes(q);
      const matchComment = item.comment?.toLowerCase().includes(q);
      const matchEmail = item.customerEmail?.toLowerCase().includes(q);
      const matchPhone = item.customerPhone?.toLowerCase().includes(q);
      if (!matchName && !matchComment && !matchEmail && !matchPhone) return false;
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus) => {
    setUpdatingStatus(true);
    try {
      await updateFeedbackItem(id, { status: newStatus }, user?.id, businessId, isAdmin);
      setFeedbackList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      addToast('success', `Feedback status updated to ${newStatus}.`, 'Status Updated');
    } catch (err: unknown) {
      console.warn('Error updating status:', err);
      const appErr = toAppError(err, 'Could not update status.');
      addToast('error', appErr.userMessage, 'Update Failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !internalNoteInput.trim()) return;

    const noteText = internalNoteInput.trim();
    try {
      await updateFeedbackItem(selectedItem.id, { internalNotes: noteText }, user?.id, businessId, isAdmin);
      setFeedbackList((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, internalNotes: noteText } : item
        )
      );
      setSelectedItem((prev) =>
        prev ? { ...prev, internalNotes: noteText } : null
      );
      setInternalNoteInput('');
      addToast('success', 'Internal team note saved.', 'Note Saved');
    } catch (err: unknown) {
      console.warn('Error saving note:', err);
      const appErr = toAppError(err, 'Failed to save team note.');
      addToast('error', appErr.userMessage, 'Note Failed');
    }
  };

  // Counts for each star filter
  const count5 = feedbackList.filter((f) => f.rating === 5).length;
  const count4 = feedbackList.filter((f) => f.rating === 4).length;
  const count3 = feedbackList.filter((f) => f.rating === 3).length;
  const count2 = feedbackList.filter((f) => f.rating === 2).length;
  const count1 = feedbackList.filter((f) => f.rating === 1).length;

  return (
    <div id="feedback-page-root" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Feedback & Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, and take action on feedback submissions for {businessName}.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
            Range:
          </span>
          <DateFilterSelector filter={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {/* Error State Banner */}
      {errorState && (
        <div
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs"
          id="feedback-error-banner"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorState}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            className="text-xs bg-white"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Star Rating Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 -mx-1 px-1">
            <button
              id="filter-all"
              onClick={() => setRatingFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                ratingFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({feedbackList.length})
            </button>

            <button
              id="filter-5-star"
              onClick={() => setRatingFilter(5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                ratingFilter === 5
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> 5★ ({count5})
            </button>

            <button
              id="filter-4-star"
              onClick={() => setRatingFilter(4)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                ratingFilter === 4
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> 4★ ({count4})
            </button>

            <button
              id="filter-3-star"
              onClick={() => setRatingFilter(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                ratingFilter === 3
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> 3★ ({count3})
            </button>

            <button
              id="filter-2-star"
              onClick={() => setRatingFilter(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                ratingFilter === 2
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> 2★ ({count2})
            </button>

            <button
              id="filter-1-star"
              onClick={() => setRatingFilter(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                ratingFilter === 1
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" /> 1★ ({count1})
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-72">
            <Input
              id="search-feedback-input"
              placeholder="Search comments, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Feedback List Container (Dual-View: Desktop Table + Mobile Cards) */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-3" />
            <span className="text-sm font-medium">Loading feedback submissions...</span>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <EmptyState
              title="No feedback matching your filters"
              description={
                searchQuery
                  ? `No results found for "${searchQuery}". Try clearing your search query.`
                  : 'No feedback submissions found for this filter.'
              }
              icon={<MessageSquare className="w-10 h-10 text-slate-400" />}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200/80 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Rating</th>
                    <th className="py-3.5 px-4 sm:px-6">Comment</th>
                    <th className="py-3.5 px-4 sm:px-6">Customer</th>
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4 sm:px-6">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Rating Column */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-md ${
                              item.rating === 5
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.rating === 4
                                ? 'bg-teal-50 text-teal-700'
                                : item.rating === 3
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {item.rating} ★
                          </span>
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < item.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Comment Column */}
                      <td className="py-4 px-4 sm:px-6 max-w-xs md:max-w-md">
                        <p className="text-xs sm:text-sm text-slate-800 line-clamp-2 italic leading-relaxed">
                          {item.comment ? `"${item.comment}"` : <span className="text-slate-400 font-normal not-italic">No comment provided</span>}
                        </p>
                        {item.internalNotes && (
                          <div className="mt-1 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold inline-block">
                            Note: {item.internalNotes}
                          </div>
                        )}
                      </td>

                      {/* Customer Column */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate max-w-[160px]">
                          {item.customerName || 'Anonymous Customer'}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[160px]">
                          {item.customerEmail || item.customerPhone || 'No contact info'}
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500">
                        <div className="font-medium text-slate-700">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {item.rating === 5 ? (
                          <Badge variant="success" size="sm">
                            {item.googleRedirected ? 'Google Review Clicked' : '5-Star Google Eligible'}
                          </Badge>
                        ) : item.status === 'resolved' ? (
                          <Badge variant="success" size="sm">
                            Resolved
                          </Badge>
                        ) : item.status === 'reviewed' ? (
                          <Badge variant="info" size="sm">
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            New Ticket
                          </Badge>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <Button
                          id={`view-btn-${item.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setInternalNoteInput(item.internalNotes || '');
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (< 640px) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paginatedItems.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  {/* Top line: rating and date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded-md ${
                          item.rating === 5
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.rating === 4
                            ? 'bg-teal-50 text-teal-700'
                            : item.rating === 3
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.rating} ★
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {item.customerName || 'Anonymous Customer'}
                    </h4>
                    {(item.customerEmail || item.customerPhone) && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.customerEmail || item.customerPhone}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-700 italic line-clamp-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {item.comment ? `"${item.comment}"` : <span className="text-slate-400 not-italic">No comment provided</span>}
                  </p>

                  {item.internalNotes && (
                    <div className="text-[11px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg font-medium">
                      Note: {item.internalNotes}
                    </div>
                  )}

                  {/* Bottom Action bar */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div>
                      {item.rating === 5 ? (
                        <Badge variant="success" size="sm">
                          {item.googleRedirected ? 'Google Clicked' : '5-Star Google'}
                        </Badge>
                      ) : item.status === 'resolved' ? (
                        <Badge variant="success" size="sm">
                          Resolved
                        </Badge>
                      ) : item.status === 'reviewed' ? (
                        <Badge variant="info" size="sm">
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          New Ticket
                        </Badge>
                      )}
                    </div>

                    <Button
                      id={`mobile-view-btn-${item.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setInternalNoteInput(item.internalNotes || '');
                      }}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-900">
              {filteredItems.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredItems.length)}
            </span>{' '}
            of <span className="font-bold text-slate-900">{filteredItems.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>

            <div className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Details & Resolution Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Feedback & Customer Details"
        description="Customer submission details and internal resolution notes"
        maxWidth="lg"
      >
        {selectedItem && (
          <div className="space-y-5">
            {/* Top Score summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-xs ${
                    selectedItem.rating === 5
                      ? 'bg-emerald-600'
                      : selectedItem.rating === 4
                      ? 'bg-teal-600'
                      : selectedItem.rating === 3
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  }`}
                >
                  {selectedItem.rating}★
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {selectedItem.rating} out of 5 Stars
                  </h4>
                  <p className="text-xs text-slate-500">
                    Source: {selectedItem.source || 'public_review_page'}
                  </p>
                </div>
              </div>

              <div>
                {selectedItem.rating === 5 ? (
                  <Badge variant="success" size="md">
                    {selectedItem.googleRedirected ? 'Google Review Clicked' : '5-Star Direct'}
                  </Badge>
                ) : (
                  <Badge variant={selectedItem.status === 'resolved' ? 'success' : 'warning'} size="md">
                    {selectedItem.status?.toUpperCase() || 'NEW TICKET'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Customer Message
              </label>
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-sm text-slate-800 leading-relaxed italic shadow-2xs">
                {selectedItem.comment ? `"${selectedItem.comment}"` : 'No written feedback was provided.'}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5" /> Customer Name
                </span>
                <span className="font-bold text-slate-900 block text-sm truncate">
                  {selectedItem.customerName || 'Anonymous'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="font-bold text-slate-900 block text-sm truncate">
                  {selectedItem.customerEmail || 'None provided'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-bold text-slate-900 block text-sm truncate">
                  {selectedItem.customerPhone || 'None provided'}
                </span>
              </div>
            </div>

            {/* Internal Resolution Note */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-1">
              <label htmlFor="internal-note-input" className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                Internal Team Notes
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="internal-note-input"
                  placeholder="e.g. Called customer, offered resolution..."
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
                  Save Note
                </Button>
              </div>
            </form>

            {/* Status Switcher & Close */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 w-full sm:w-auto">Update:</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedItem.id, 'reviewed')}
                  className={selectedItem.status === 'reviewed' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : ''}
                >
                  Mark Reviewed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedItem.id, 'resolved')}
                  className={selectedItem.status === 'resolved' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : ''}
                >
                  Mark Resolved
                </Button>
              </div>

              <Button variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
