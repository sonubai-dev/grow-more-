import React from 'react';
import {
  Sparkles,
  Copy,
  ExternalLink,
  QrCode,
  ArrowRight,
  Share2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface OnboardingEmptyStateProps {
  businessName: string;
  businessSlug: string;
  onCopyLink: () => void;
  copied: boolean;
  onOpenQr: () => void;
}

export const OnboardingEmptyState: React.FC<OnboardingEmptyStateProps> = ({
  businessName,
  businessSlug,
  onCopyLink,
  copied,
  onOpenQr,
}) => {
  const reviewLink = `${window.location.origin}/r/${businessSlug}`;

  return (
    <Card className="p-8 sm:p-10 border-2 border-dashed border-indigo-200/80 bg-linear-to-b from-indigo-50/40 via-white to-slate-50/50 rounded-3xl text-center" id="onboarding-empty-state-root">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Visual Badge */}
        <div className="w-16 h-16 bg-indigo-600/10 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-indigo-50/80 shadow-xs">
          <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to collect 5-star Google Reviews for {businessName}!
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            You don't have any feedback submissions yet. Share your dedicated review gateway link with customers to start receiving verified Google ratings and private customer feedback.
          </p>
        </div>

        {/* Action Link Box */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Your Public Review Link
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 truncate block">
              {reviewLink}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
            <Button
              id="empty-copy-review-link-btn"
              variant="primary"
              size="sm"
              onClick={onCopyLink}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial text-xs font-bold"
            >
              {copied ? 'Copied' : 'Copy Review Link'}
            </Button>
            <Button
              id="empty-view-qr-stand-btn"
              variant="outline"
              size="sm"
              onClick={onOpenQr}
              leftIcon={<QrCode className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial text-xs font-bold"
            >
              View QR Stand
            </Button>
            <a
              id="empty-open-review-page-btn"
              href={reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Open Review Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3 Step Quick Start Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">Share with Customers</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Send your link via SMS, email receipts, or place your QR code at the counter.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">5-Star Google Funnel</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Happy customers who tap 5 stars are seamlessly guided straight to write a Google Review.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">Private Resolution</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              1–4 star feedback stays 100% private in this dashboard for internal resolution.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
