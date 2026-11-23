import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Building2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
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
      <div className="space-y-4 pt-1">
        {/* Enterprise Notice Banner when clicked */}
        {showEnterpriseInfo && (
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-slate-800 text-xs flex items-start gap-3 animate-in fade-in">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm">
                Enterprise Plan (Unlimited Locations) is Coming Soon!
              </p>
              <p className="text-slate-600 leading-relaxed">
                Currently, you can use our <strong>Starter Plan (₹99 for 1 location)</strong> or upgrade to the <strong>Growth Plan (₹499 for up to 3 locations)</strong>. If your enterprise requires custom multi-branch franchise onboarding immediately, contact us at{' '}
                <a href="mailto:help.solita@gmail.com" className="text-blue-600 underline font-semibold">
                  help.solita@gmail.com
                </a>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. STARTER PLAN */}
          <div
            className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all bg-white ${
              currentPlan === 'starter' && isPaidActive
                ? 'border-blue-600 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Starter Plan
                </span>
                {currentPlan === 'starter' && isPaidActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Active
                  </span>
                )}
                {currentPlan === 'starter' && !isPaidActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    14-Day Trial
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹99</span>
                  <span className="text-xs text-slate-500 font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Essential Google review funnel for single business locations.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-900">1 Business Location</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Google 5-Star Reviews Filter</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>1-3 Star Feedback Shielding</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span>14-Day Free Evaluation</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-3 border-t border-slate-100">
              {currentPlan === 'starter' && isPaidActive ? (
                <button
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 cursor-default"
                >
                  ✓ Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleCheckout('starter')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {currentPlan === 'starter' && !isPaidActive ? 'Lock In ₹99/mo' : 'Select Starter'}
                </button>
              )}
            </div>
          </div>

          {/* 2. GROWTH PLAN (RECOMMENDED) */}
          <div
            className={`p-5 rounded-2xl border-2 relative flex flex-col justify-between transition-all bg-gradient-to-b from-blue-50/40 via-white to-white ${
              currentPlan === 'growth' && isPaidActive
                ? 'border-blue-600 shadow-md shadow-blue-500/10'
                : 'border-blue-600 shadow-lg shadow-blue-500/10 hover:border-blue-700'
            }`}
          >
            {/* Recommendation badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommended
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  Growth Plan
                </span>
                {currentPlan === 'growth' && isPaidActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹499</span>
                  <span className="text-xs text-slate-500 font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                  Best for growing brands & multiple location businesses.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 pt-3 border-t border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-black text-blue-700">Up to 3 Locations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-900">Multi-Business Switcher</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Instant SMS & Email Alerts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Custom Standee & QR Branding</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-3 border-t border-blue-100">
              {currentPlan === 'growth' && isPaidActive ? (
                <button
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200 cursor-default"
                >
                  ✓ Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleCheckout('growth')}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5"
                >
                  <span>{processing ? 'Processing...' : 'Upgrade to Growth (₹499)'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. ENTERPRISE PLAN (COMING SOON) */}
          <div
            onClick={() => setShowEnterpriseInfo(true)}
            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-300 bg-white flex flex-col justify-between transition-all cursor-pointer shadow-xs group"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Enterprise
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                  Coming Soon
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">Custom</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Large enterprises & franchise networks across India.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-900">Unlimited Locations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Dedicated API & Webhooks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Multi-Tenant Portal</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Custom SLA & Manager</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-3 border-t border-slate-100">
              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-700 text-xs font-bold transition-all border border-slate-200 group-hover:border-blue-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEnterpriseInfo(true);
                }}
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-slate-400">
          All plans include 256-bit SSL encryption, automated review routing, and verified customer shielding.
        </div>
      </div>
    </Modal>
  );
};
