import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Building2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Info,
  Mail
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Business } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { initiateRazorpayPayment } from '../../services/razorpayService';
import { sendSubscriptionSuccessEmail, sendSubscriptionFailedEmail } from '../../services/emailService';
import { calculateTrialStatus } from '../../lib/trialHelper';

export interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBusiness: Business | null;
  onPlanUpdated?: (newPlan: 'starter' | 'growth') => void;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentBusiness,
  onPlanUpdated,
}) => {
  const { user, updateBusiness, updateCurrentBusiness } = useAuth();
  const { addToast } = useToast();

  const [processing, setProcessing] = useState(false);
  const [showEnterpriseInfo, setShowEnterpriseInfo] = useState(false);

  const trialStatus = calculateTrialStatus(currentBusiness);
  const currentPlan = (currentBusiness?.plan || 'starter').toLowerCase();
  const isPaidActive = trialStatus.isActiveSubscription;

  const handleCheckout = async (plan: 'starter' | 'growth') => {
    if (processing) return;
    setProcessing(true);

    const planName = plan === 'starter' ? 'ZellonAI Starter Plan' : 'ZellonAI Growth Plan';
    const amountStr = plan === 'starter' ? '₹99' : '₹499';

    await initiateRazorpayPayment({
      planId: plan,
      planName,
      businessId: currentBusiness?.id,
      customerName: currentBusiness?.ownerName || user?.name || '',
      customerEmail: currentBusiness?.email || user?.email || '',
      customerPhone: currentBusiness?.phone || '',
      onSuccess: async (paymentId, subscriptionId) => {
        setProcessing(false);
        try {
          if (currentBusiness?.id) {
            await updateBusiness({
              id: currentBusiness.id,
              plan,
            });
            updateCurrentBusiness({
              plan,
              status: 'active',
              subscriptionId,
            });
          }

          if (onPlanUpdated) {
            onPlanUpdated(plan);
          }

          addToast(
            'success',
            `Successfully upgraded to ${planName}! (Sub ID: ${subscriptionId})`,
            'Subscription Activated'
          );

          // Dispatches verified subscription activation email via Resend
          sendSubscriptionSuccessEmail({
            to: currentBusiness?.email || user?.email || '',
            ownerName: currentBusiness?.ownerName || user?.name || '',
            planName,
            amount: amountStr,
            paymentId,
            subscriptionId,
            businessName: currentBusiness?.businessName || currentBusiness?.name || 'Your Business',
          }).catch(console.warn);

          onClose();
        } catch (err: any) {
          addToast('error', err.message || 'Failed to sync upgraded plan.', 'Update Error');
        }
      },
      onError: (errorMsg) => {
        setProcessing(false);
        addToast('error', errorMsg, 'Payment Notice');
        sendSubscriptionFailedEmail({
          to: currentBusiness?.email || user?.email || '',
          ownerName: currentBusiness?.ownerName || user?.name || '',
          planName,
          amount: amountStr,
          reason: errorMsg,
          businessName: currentBusiness?.businessName || currentBusiness?.name || 'Your Business',
        }).catch(console.warn);
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Business Plan"
      description="Scale your reputation with instant Google review routing and multi-location management."
      maxWidth="lg"
      id="plan-upgrade-modal"
    >
      <div className="space-y-4 pt-2">
        {/* Enterprise Notice Banner when clicked */}
        {showEnterpriseInfo && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">
                Enterprise Plan (Unlimited Locations) is Coming Soon!
              </p>
              <p className="text-slate-300 leading-relaxed">
                Currently, you can use our <strong>Starter Plan (₹99 for 1 location)</strong> or upgrade to the <strong>Growth Plan (₹499 for up to 3 locations)</strong>. If your enterprise requires custom franchise onboarding immediately, reach us at{' '}
                <a href="mailto:help.solita@gmail.com" className="text-amber-300 underline font-medium">
                  help.solita@gmail.com
                </a>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. STARTER PLAN */}
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
              currentPlan === 'starter'
                ? 'border-indigo-600 bg-indigo-950/20 shadow-xs'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Starter
                </span>
                {currentPlan === 'starter' && isPaidActive && (
                  <Badge variant="success" size="sm">Active</Badge>
                )}
                {currentPlan === 'starter' && !isPaidActive && (
                  <Badge variant="warning" size="sm">14-Day Trial</Badge>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">₹99</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Essential review gateway for single businesses.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-medium text-white">1 Business Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Google 5-Star Filter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1-3 Star Shielding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>14-Day Free Trial</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80">
              {currentPlan === 'starter' && isPaidActive ? (
                <Button variant="secondary" size="sm" className="w-full text-xs cursor-default opacity-80" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                  disabled={processing}
                  onClick={() => handleCheckout('starter')}
                >
                  {currentPlan === 'starter' && !isPaidActive ? 'Lock In ₹99/mo' : 'Choose Starter'}
                </Button>
              )}
            </div>
          </div>

          {/* 2. GROWTH PLAN (RECOMMENDED) */}
          <div
            className={`p-4 rounded-2xl border-2 relative flex flex-col justify-between transition-all bg-linear-to-b from-indigo-950/40 to-slate-900/80 ${
              currentPlan === 'growth'
                ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'border-indigo-500/50 hover:border-indigo-400'
            }`}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <span className="px-2.5 py-0.5 rounded-full bg-linear-to-r from-indigo-600 to-indigo-500 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Recommended
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Growth
                </span>
                {currentPlan === 'growth' && (
                  <Badge variant="success" size="sm">Active</Badge>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">₹499</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-[11px] text-indigo-200/80 mt-0.5">
                  Best for growing brands & multiple locations.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-bold text-emerald-400">Up to 3 Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-Business Switcher</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instant SMS & Email Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Custom Standee Branding</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80">
              {currentPlan === 'growth' ? (
                <Button variant="secondary" size="sm" className="w-full text-xs cursor-default opacity-80" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                  disabled={processing}
                  onClick={() => handleCheckout('growth')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {processing ? 'Processing...' : 'Upgrade to Growth (₹499)'}
                </Button>
              )}
            </div>
          </div>

          {/* 3. ENTERPRISE PLAN (COMING SOON) */}
          <div
            onClick={() => setShowEnterpriseInfo(true)}
            className="p-4 rounded-2xl border-2 border-slate-800 bg-slate-900/40 hover:border-slate-700 flex flex-col justify-between transition-all cursor-pointer opacity-90 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Enterprise
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Coming Soon
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Large enterprises & unlimited franchises.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-slate-200">Unlimited Locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Dedicated API & Webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Multi-Tenant Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Custom SLA & Manager</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs bg-slate-800/80 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-300 border border-transparent group-hover:border-amber-500/30 transition-all font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnterpriseInfo(true);
                }}
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-500">
          All plans include 256-bit SSL encryption, automated review routing, and verified customer shielding.
        </div>
      </div>
    </Modal>
  );
};
