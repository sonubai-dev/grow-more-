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
 * Calculates current trial progress and remaining days
 */
export function calculateTrialStatus(business: Business | null | undefined): TrialStatus {
  const now = Date.now();

  // If business has paid active subscription
  if (business?.status === 'active' && business?.subscriptionId) {
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
  const isExpired = daysRemaining === 0 && business?.status !== 'active';

  return {
    isTrial: !isExpired && business?.status !== 'active',
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
