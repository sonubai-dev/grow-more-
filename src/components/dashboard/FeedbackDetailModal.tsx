import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FeedbackItem } from '../../types';

interface FeedbackDetailModalProps {
  feedback: FeedbackItem | null;
  businessName: string;
  onClose: () => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  businessName,
  onClose,
}) => {
  return (
    <Modal
      isOpen={!!feedback}
      onClose={onClose}
      title="Feedback Details"
      description={`Customer submission for ${businessName}`}
    >
      {feedback && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                Rating Given
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-900">{feedback.rating} / 5</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                Routing Action
              </span>
              <div className="mt-1">
                {feedback.rating === 5 ? (
                  <Badge variant="success" size="md">
                    5-Star Google Redirect
                  </Badge>
                ) : (
                  <Badge variant="warning" size="md">
                    Private Feedback Ticket
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer Comment
            </label>
            <div className="mt-1.5 p-4 rounded-xl bg-white border border-slate-200/80 text-sm text-slate-800 leading-relaxed italic shadow-2xs">
              {feedback.comment ? `"${feedback.comment}"` : 'No written comment submitted'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
              <span className="text-slate-500 block mb-0.5 font-medium">Customer Name</span>
              <span className="font-semibold text-slate-900 text-sm truncate block">
                {feedback.customerName || 'Anonymous'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
              <span className="text-slate-500 block mb-0.5 font-medium">Contact Info</span>
              <span className="font-semibold text-slate-900 text-sm truncate block">
                {feedback.customerEmail || feedback.customerPhone || 'None provided'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
              <span className="text-slate-500 block mb-0.5 font-medium">Source</span>
              <span className="font-semibold text-slate-900 text-sm truncate block">
                {feedback.source || 'public_review_page'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/80">
              <span className="text-slate-500 block mb-0.5 font-medium">Date Submitted</span>
              <span className="font-semibold text-slate-900 text-sm truncate block">
                {new Date(feedback.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            <Link to="/dashboard/feedback" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                Open Feedback Manager
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
};
