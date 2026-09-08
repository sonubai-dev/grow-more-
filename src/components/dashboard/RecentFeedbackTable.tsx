import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FeedbackItem } from '../../types';

interface RecentFeedbackTableProps {
  feedback: FeedbackItem[];
  onSelectFeedback: (item: FeedbackItem) => void;
}

export const RecentFeedbackTable: React.FC<RecentFeedbackTableProps> = ({
  feedback,
  onSelectFeedback,
}) => {
  return (
    <Card className="p-5 sm:p-6" id="recent-feedback-feed">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Recent Customer Submissions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest feedback received through your review gateway and QR stand
          </p>
        </div>
        <Link to="/dashboard/feedback" className="self-start sm:self-auto">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Feedback Manager
          </Button>
        </Link>
      </div>

      {feedback.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          No customer feedback in the selected date range.
        </div>
      ) : (
        <>
          {/* Mobile Card List (<640px) */}
          <div className="sm:hidden flex flex-col divide-y divide-slate-100">
            {feedback.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {(item.customerName || 'A')[0].toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-xs text-slate-900 block truncate">
                        {item.customerName || 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60">
                    <span className="font-bold text-xs text-slate-900">{item.rating}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                {item.comment && (
                  <p className="text-xs text-slate-700 line-clamp-2 italic leading-relaxed">
                    "{item.comment}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 text-xs">
                  {item.rating >= 4 ? (
                    <Badge variant="success" size="sm">
                      {item.googleRedirected ? 'Google Review Clicked' : 'Google Eligible'}
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Private Feedback Ticket
                    </Badge>
                  )}

                  <button
                    id={`view-feedback-mobile-${item.id}`}
                    onClick={() => onSelectFeedback(item)}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>=640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Routing / Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedback.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {(item.customerName || 'A')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-xs truncate">
                            {item.customerName || 'Anonymous Customer'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.customerEmail || item.customerPhone || 'No contact provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-slate-900">{item.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-700">
                      {item.comment ? (
                        `"${item.comment}"`
                      ) : (
                        <span className="text-slate-400 italic">No comment left</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.rating >= 4 ? (
                        <Badge variant="success" size="sm">
                          {item.googleRedirected ? 'Google Review Clicked' : 'Google Eligible'}
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Private Feedback Ticket
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`view-feedback-${item.id}`}
                        onClick={() => onSelectFeedback(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
};
