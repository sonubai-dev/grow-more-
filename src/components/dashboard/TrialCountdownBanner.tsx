import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, Bell, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Business } from '../../types';
import { calculateTrialStatus, checkAndTriggerTrialAlerts, sendBrowserNotification } from '../../lib/trialHelper';

interface TrialCountdownBannerProps {
  business: Business | null | undefined;
  userEmail?: string;
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({ business, userEmail }) => {
  const [notificationEnabled, setNotificationEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const trialStatus = calculateTrialStatus(business);

  useEffect(() => {
    // Check and trigger trial notifications and emails on mount
    if (business) {
      checkAndTriggerTrialAlerts(business, userEmail);
    }
  }, [business, userEmail]);

  const handleEnableNotification = async () => {
    const success = await sendBrowserNotification('🔔 ZellonAI Alerts Enabled', {
      body: 'You will receive daily countdown alerts and low rating warnings directly in your browser.',
    });
    if (success) {
      setNotificationEnabled(true);
    }
  };

  // If already paid active subscription, show no warning
  if (trialStatus.isActiveSubscription) {
    return null;
  }

  // 1. TRIAL EXPIRED STATE
  if (trialStatus.isExpired) {
    return (
      <div
        id="trial-expired-banner"
        className="rounded-2xl bg-linear-to-r from-amber-950 via-orange-950 to-slate-900 border border-amber-500/50 p-5 text-white shadow-lg animate-in fade-in"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-amber-300">
                  ⚠️ 14-Day Free Trial Has Ended
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Your 14-day evaluation period for <strong>{business?.name || 'your business'}</strong> is complete. Activate your <strong>₹99/month Starter Plan</strong> now to keep your public Google review redirect link and 1-3 star shielding active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/dashboard/settings">
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 shadow-md shadow-amber-500/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Activate ₹99/Month
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE 14-DAY TRIAL COUNTDOWN STATE
  return (
    <div
      id="trial-countdown-banner"
      className="rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 p-4 sm:p-5 text-white shadow-md relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-400/30">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">
                14-Day Free Trial: Day {trialStatus.dayNumber} of 14
              </span>
              <span className="text-[11px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold">
                ⏱️ {trialStatus.daysRemaining} Day{trialStatus.daysRemaining === 1 ? '' : 's'} Remaining
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                Default: ₹99/mo Starter
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full Google 5-star review acceleration and 1-3 star negative feedback shielding are 100% active.
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          {!notificationEnabled && typeof window !== 'undefined' && 'Notification' in window && (
            <button
              type="button"
              onClick={handleEnableNotification}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Get daily countdown and review notifications"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Allow Notifications</span>
            </button>
          )}

          <Link to="/dashboard/settings">
            <Button
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 text-xs shadow-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Lock In ₹99/mo Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${Math.max(8, trialStatus.progressPercent)}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono shrink-0">
          {trialStatus.progressPercent}% of trial used
        </span>
      </div>
    </div>
  );
};
