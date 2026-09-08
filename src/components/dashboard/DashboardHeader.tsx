import React from 'react';
import { Sparkles, ExternalLink, QrCode, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardHeaderProps {
  businessName: string;
  businessSlug: string;
  reviewLink: string;
  copied: boolean;
  onCopyLink: () => void;
  onOpenQrModal: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  businessName,
  businessSlug,
  reviewLink,
  copied,
  onCopyLink,
  onOpenQrModal,
}) => {
  return (
    <div
      id="dashboard-hero-banner"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xs relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reputation Funnel Live</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {businessName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            High-rating customers are routed directly to leave verified Google reviews, while private feedback is securely captured for internal management resolution.
          </p>
        </div>

        {/* Quick Action Box: Copy Review Link & Open Review Page */}
        <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex flex-col text-xs min-w-0 pr-2">
            <span className="text-slate-400 font-medium">Public Review Gateway</span>
            <span className="font-mono text-indigo-400 text-xs font-bold truncate max-w-[200px]">
              /r/{businessSlug}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              id="dash-copy-review-link-btn"
              variant="white"
              size="sm"
              onClick={onCopyLink}
              className="flex-1 sm:flex-initial text-xs"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-700" />}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>

            <a
              id="dash-open-review-page-btn"
              href={reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-600/60"
              title="Open Review Page in New Tab"
            >
              <span>Test Flow</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              id="dash-open-qr-btn"
              type="button"
              onClick={onOpenQrModal}
              className="inline-flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-600/60"
              title="View Printable QR Stand"
              aria-label="View QR Code Stand"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
