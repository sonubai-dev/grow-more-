import { Business } from '../types';
import { sendTrialExpiredEmail } from '../services/emailService';

export interface TrialStatus {
  isTrial: boolean;
  isActiveSubscription: boolean;
  isExpired: boolean;
  daysTotal: number;
  daysRemaining: number;
  dayNumber: number; // e.g. Day 1, Day 2 of 14
  progressPercent: number;
  trialEndsDate: Date;
  statusLabel: string;
}

const TRIAL_DAYS = 14;

/**
 * Checks whether a business has a confirmed, active paid subscription via Razorpay
 */
export function hasActiveSubscription(business: Business | null | undefined): boolean {
  if (!business) return false;
  // A business is active if status is explicitly 'active', 'subscribed', or has a verified subscriptionId
  // Accounts on free evaluation have status: 'trial'
  if (business.status === 'trial') return false;
  return Boolean(
    business.status === 'active' ||
    business.status === 'subscribed' ||
    (business as any)?.planStatus === 'active' ||
    business.subscriptionId
  );
}

/**
 * Format plan name cleanly for UI display
 * Maps legacy 'premium_499' or undefined to 'Starter (₹99)'
 */
export function formatPlanName(plan?: string): string {
  if (!plan) return 'Starter (₹99)';
  const lower = plan.toLowerCase();
  if (lower.includes('growth')) return 'Growth (₹499)';
  if (lower.includes('enterprise')) return 'Enterprise (Coming Soon)';
  return 'Starter (₹99)';
}

/**
 * Get maximum allowed business locations by plan
 * Starter: 1 location
 * Growth: up to 3 locations (multiple businesses)
 * Enterprise: Coming Soon (or custom)
 */
export function getPlanLocationLimit(plan?: string): number {
  if (!plan) return 1;
  const lower = plan.toLowerCase();
  if (lower.includes('growth')) return 3;
  if (lower.includes('enterprise')) return 20;
  return 1;
}

/**
 * Calculates current trial progress and remaining days
 */
export function calculateTrialStatus(business: Business | null | undefined): TrialStatus {
  const now = Date.now();

  // If business has paid active subscription
  if (hasActiveSubscription(business)) {
    return {
      isTrial: false,
      isActiveSubscription: true,
      isExpired: false,
      daysTotal: TRIAL_DAYS,
      daysRemaining: 0,
      dayNumber: TRIAL_DAYS,
      progressPercent: 100,
      trialEndsDate: new Date(),
      statusLabel: 'Active Paid Subscription',
    };
  }

  // Calculate based on createdAt date or explicit trialEndsAt
  let createdTime = now;
  if (business?.createdAt) {
    const parsed = new Date(business.createdAt).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      createdTime = parsed;
    }
  }

  let trialEndsTime = createdTime + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  if (business?.trialEndsAt) {
    const parsedEnds = new Date(business.trialEndsAt).getTime();
    if (!isNaN(parsedEnds) && parsedEnds > 0) {
      trialEndsTime = parsedEnds;
    }
  }

  const msRemaining = trialEndsTime - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.min(TRIAL_DAYS, Math.max(0, TRIAL_DAYS - daysRemaining));
  const dayNumber = Math.min(TRIAL_DAYS, daysElapsed + 1);
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / TRIAL_DAYS) * 100)));
  const isExpired = daysRemaining === 0;

  return {
    isTrial: !isExpired,
    isActiveSubscription: false,
    isExpired,
    daysTotal: TRIAL_DAYS,
    daysRemaining,
    dayNumber,
    progressPercent,
    trialEndsDate: new Date(trialEndsTime),
    statusLabel: isExpired
      ? 'Trial Expired'
      : `${daysRemaining} Day${daysRemaining === 1 ? '' : 's'} Left in Free Trial`,
  };
}

/**
 * Requests browser notification permission and sends notification if allowed
 */
export async function sendBrowserNotification(title: string, options?: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    }
  } catch (err) {
    console.warn('[TrialHelper] Browser notification dispatch failed:', err);
  }

  return false;
}

/**
 * Checks trial state and dispatches browser notifications + reminder emails
 */
export async function checkAndTriggerTrialAlerts(
  business: Business | null | undefined,
  userEmail?: string
): Promise<void> {
  if (!business) return;

  const status = calculateTrialStatus(business);
  const todayStr = new Date().toISOString().split('T')[0];
  const notifKey = `zellonai_trial_alert_${business.id}_${todayStr}`;

  // Check if we already alerted today
  try {
    if (localStorage.getItem(notifKey)) {
      return;
    }
  } catch {}

  const targetEmail = business.contactEmail || business.email || userEmail;
  const businessName = business.name || business.businessName || 'Your Business';
  const ownerName = business.ownerName || 'Partner';
  const slug = business.slug || 'your-business';

  if (status.isExpired) {
    // 1. Browser Notification for Expired Trial
    sendBrowserNotification('⚠️ ZellonAI 14-Day Trial Ended', {
      body: `Your trial for ${businessName} has expired. Activate ₹99/mo Starter Plan to keep your Google review portal active!`,
      tag: 'trial-expired',
    });

    // 2. Email alert via Resend
    if (targetEmail) {
      sendTrialExpiredEmail({
        to: targetEmail,
        ownerName,
        businessName,
        slug,
      }).catch(console.warn);
    }

    try {
      localStorage.setItem(notifKey, 'expired_sent');
    } catch {}
  } else if (status.isTrial && status.daysRemaining <= 2) {
    // Alert when 1 or 2 days left
    sendBrowserNotification('⏳ ZellonAI Trial Ending Soon', {
      body: `Only ${status.daysRemaining} day(s) left in your free trial for ${businessName}. Activate your ₹99/mo plan now.`,
      tag: 'trial-ending',
    });

    try {
      localStorage.setItem(notifKey, 'ending_soon_sent');
    } catch {}
  }
}
