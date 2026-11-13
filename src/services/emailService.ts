/**
 * ZellonAI Email Service
 * Powered by Resend (https://resend.com)
 * 
 * Includes:
 * 1. Sign Up Welcome Message (sendWelcomeEmail)
 * 2. Subscription Started (sendSubscriptionStartedEmail)
 * 3. Subscription Reminder (sendSubscriptionReminderEmail)
 * 4. Subscription Success (sendSubscriptionSuccessEmail)
 * 5. Subscription Failed (sendSubscriptionFailedEmail)
 * 6. Low Rating Interception Alert (1-3 stars) (sendNegativeReviewAlert)
 * 7. Marketing Updates & Broadcasts (sendMarketingUpdate)
 * 8. Enterprise Plan Inquiries (sendEnterpriseLeadEmail)
 */

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

export interface WelcomeEmailParams {
  to: string;
  ownerName: string;
  businessName: string;
  slug: string;
}

export interface SubscriptionStartedParams {
  to: string;
  ownerName: string;
  businessName?: string;
  planName?: string;
  amount?: string;
  trialDays?: number;
}

export interface SubscriptionReminderParams {
  to: string;
  ownerName: string;
  businessName?: string;
  planName?: string;
  amount?: string;
  renewalDate?: string;
}

export interface SubscriptionSuccessParams {
  to: string;
  ownerName: string;
  planName: string;
  amount: string;
  paymentId?: string;
  subscriptionId?: string;
  businessName?: string;
}

export interface SubscriptionFailedParams {
  to: string;
  ownerName: string;
  planName: string;
  amount: string;
  reason?: string;
  businessName?: string;
}

export interface NegativeReviewAlertParams {
  to: string;
  businessName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: number;
  comment?: string;
  businessId?: string;
}

export interface MarketingUpdateParams {
  to: string | string[];
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface EnterpriseLeadParams {
  adminEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  businessName: string;
  message?: string;
}

/**
 * Helper to get admin emails list for CC/notification
 */
export function getAdminEmails(): string[] {
  const adminStr = import.meta.env.VITE_ADMIN_EMAILS || 'admin@zellonai.online,ssdd747346@gmail.com';
  return adminStr
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Helper to resolve the current website origin for email links
 */
function getAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://ZellonAI-five.vercel.app';
}

/**
 * Core function to send emails via the server-side Resend proxy (/api/send-email)
 * Does not block or crash the UI on failure.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[EmailService] Failed to send email via Resend:', errorData);
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log('[EmailService] Email sent successfully via Resend:', data.id);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.warn('[EmailService] Network error sending email:', err.message);
    return { success: false, error: err.message };
  }
}

// ==========================================
// 1. SIGN UP WELCOME EMAIL
// ==========================================
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const reviewUrl = `${origin}/r/${params.slug}`;
  const dashboardUrl = `${origin}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
          .header p { color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 500; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .intro { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
          .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px; }
          .link-box { font-size: 16px; font-weight: 600; color: #4f46e5; word-break: break-all; }
          .badge { display: inline-block; background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
          .steps { margin-bottom: 28px; }
          .step { margin-bottom: 14px; font-size: 14px; color: #334155; line-height: 1.5; }
          .step strong { color: #4f46e5; }
          .btn-container { text-align: center; margin: 32px 0 20px; }
          .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ZellonAI! 🚀</h1>
            <p>Your AI-Powered Google Review & Reputation Accelerator</p>
          </div>
          <div class="body">
            <span class="badge">₹499 Premium Plan — 14-Day Free Trial Active</span>
            <div class="greeting">Hi ${params.ownerName || 'Partner'},</div>
            <div class="intro">
              Congratulations on setting up <strong>${params.businessName}</strong>! ZellonAI helps you capture 5-star Google Reviews on autopilot while intercepting negative feedback privately before it harms your public reputation.
            </div>

            <div class="card">
              <div class="card-title">Your Live Review Link</div>
              <div class="link-box"><a href="${reviewUrl}" style="color: #4f46e5; text-decoration: none;">${reviewUrl}</a></div>
            </div>

            <div class="steps">
              <div style="font-weight: 700; margin-bottom: 12px; color: #0f172a; font-size: 15px;">How ZellonAI Protects & Boosts Your Rating:</div>
              <div class="step"><strong>1. Share your link:</strong> Display your QR code stand or send your review link via WhatsApp or SMS to happy customers.</div>
              <div class="step"><strong>2. 5-Star Boost:</strong> Happy customers (4-5★) are directed directly to your official Google Reviews page.</div>
              <div class="step"><strong>3. Private Interception:</strong> Unhappy ratings (1-3★) are privately routed to your dashboard and emailed instantly to you so you can resolve them.</div>
            </div>

            <div class="btn-container">
              <a href="${dashboardUrl}" class="btn">Open Your Dashboard</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI Review Accelerator. All rights reserved.<br>
            Need help? Reply to this email or reach us at admin@zellonai.online
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `🚀 Welcome to ZellonAI — ${params.businessName} is ready for 5-Star Reviews!`,
    html,
  });
}

// ==========================================
// 2. SUBSCRIPTION STARTED EMAIL
// ==========================================
export async function sendSubscriptionStartedEmail(params: SubscriptionStartedParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const dashboardUrl = `${origin}/dashboard`;
  const plan = params.planName || '₹499 Growth Plan';
  const amount = params.amount || '₹499 / month';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { color: #d1fae5; margin: 8px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .message { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .plan-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .plan-title { font-size: 18px; font-weight: 800; color: #166534; margin-bottom: 6px; }
          .plan-price { font-size: 14px; color: #15803d; font-weight: 600; }
          .features { list-style: none; padding: 0; margin: 16px 0 0 0; font-size: 14px; color: #334155; }
          .features li { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
          .features li:last-child { border-bottom: none; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Started!</h1>
            <p>Your ZellonAI Premium Review Protection is Now Active</p>
          </div>
          <div class="body">
            <div class="greeting">Hi ${params.ownerName || 'there'},</div>
            <div class="message">
              Great news! Your subscription for <strong>${params.businessName || 'your business'}</strong> has officially started. You now have full access to our automated review filtering and reputation management features.
            </div>

            <div class="plan-box">
              <div class="plan-title">${plan}</div>
              <div class="plan-price">Billing: ${amount}</div>
              <ul class="features">
                <li>✅ <strong>1 to 3 Star Interception:</strong> Negative feedback is trapped privately.</li>
                <li>✅ <strong>5-Star Google Acceleration:</strong> Direct Google review rerouting.</li>
                <li>✅ <strong>Instant Email Alerts:</strong> Immediate notification via Resend on every low rating.</li>
                <li>✅ <strong>Multi-Location & QR Stand Support:</strong> Unlimited customer scans.</li>
              </ul>
            </div>

            <div class="btn-container">
              <a href="${dashboardUrl}" class="btn">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI. Support: admin@zellonai.online
          </div>
        </div>
      </body>
    </html>
  `;

  // Inform both user and admin
  const adminEmails = getAdminEmails();
  const allRecipients = Array.from(new Set([params.to, ...adminEmails]));

  return sendEmail({
    to: allRecipients,
    subject: `🎉 Subscription Started: ${plan} for ${params.businessName || 'ZellonAI Account'}`,
    html,
  });
}

// ==========================================
// 3. SUBSCRIPTION REMINDER EMAIL
// ==========================================
export async function sendSubscriptionReminderEmail(params: SubscriptionReminderParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const billingUrl = `${origin}/dashboard/settings`;
  const plan = params.planName || '₹499 Growth Plan';
  const amount = params.amount || '₹499 / month';
  const dateStr = params.renewalDate || 'in 3 days';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 30px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
          .header p { color: #fef3c7; margin: 6px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .message { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fef3c7; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #92400e; font-weight: 600; }
          .detail-value { color: #78350f; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #d97706; color: #ffffff !important; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Subscription Reminder</h1>
            <p>Your ZellonAI Plan Renews Soon</p>
          </div>
          <div class="body">
            <div class="greeting">Hi ${params.ownerName || 'there'},</div>
            <div class="message">
              This is a friendly reminder that your subscription for <strong>${params.businessName || 'your business'}</strong> is scheduled to renew ${dateStr}.
            </div>

            <div class="card">
              <div class="detail-row">
                <span class="detail-label">Current Plan:</span>
                <span class="detail-value">${plan}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Renewal Amount:</span>
                <span class="detail-value">${amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Renewal Timeline:</span>
                <span class="detail-value">${dateStr}</span>
              </div>
            </div>

            <p class="message">
              Your service will continue automatically without any interruption to your Google review routing or 1-3 star negative feedback interception.
            </p>

            <div class="btn-container">
              <a href="${billingUrl}" class="btn">Review Billing Settings</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI. Support: admin@zellonai.online
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `⏰ Upcoming Renewal: Your ZellonAI ${plan} Renews Soon`,
    html,
  });
}

// ==========================================
// 4. SUBSCRIPTION SUCCESS EMAIL
// ==========================================
export async function sendSubscriptionSuccessEmail(params: SubscriptionSuccessParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const dashboardUrl = `${origin}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { color: #d1fae5; margin: 6px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .message { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .receipt { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-value { color: #0f172a; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #10b981; color: #ffffff !important; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Confirmed!</h1>
            <p>Thank you for choosing ZellonAI</p>
          </div>
          <div class="body">
            <div class="greeting">Hi ${params.ownerName || 'there'},</div>
            <div class="message">
              Your subscription payment was completed successfully! Your account is active on the <strong>${params.planName}</strong>.
            </div>

            <div class="receipt">
              <div class="detail-row">
                <span class="detail-label">Plan Name:</span>
                <span class="detail-value">${params.planName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">${params.amount}</span>
              </div>
              ${params.paymentId ? `
              <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">${params.paymentId}</span>
              </div>` : ''}
              ${params.subscriptionId ? `
              <div class="detail-row">
                <span class="detail-label">Subscription ID:</span>
                <span class="detail-value">${params.subscriptionId}</span>
              </div>` : ''}
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #10b981;">Active & Protected</span>
              </div>
            </div>

            <div class="btn-container">
              <a href="${dashboardUrl}" class="btn">Open ZellonAI Dashboard</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI. Support: admin@zellonai.online
          </div>
        </div>
      </body>
    </html>
  `;

  // Inform both user and admin
  const adminEmails = getAdminEmails();
  const allRecipients = Array.from(new Set([params.to, ...adminEmails]));

  return sendEmail({
    to: allRecipients,
    subject: `🎉 Payment Confirmed: ${params.planName} is Active!`,
    html,
  });
}

// ==========================================
// 5. SUBSCRIPTION FAILED EMAIL
// ==========================================
export async function sendSubscriptionFailedEmail(params: SubscriptionFailedParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const retryUrl = `${origin}/dashboard/settings`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fecaca; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
          .header p { color: #fee2e2; margin: 6px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .message { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .alert-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffe4e6; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #9f1239; font-weight: 600; }
          .detail-value { color: #881337; font-weight: 700; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #dc2626; color: #ffffff !important; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Subscription Payment Failed</h1>
            <p>Action Required to Maintain Review Protection</p>
          </div>
          <div class="body">
            <div class="greeting">Hi ${params.ownerName || 'there'},</div>
            <div class="message">
              We were unable to process your payment for <strong>${params.planName}</strong> (${params.amount}). To prevent any interruption to your Google review routing and negative review alerts, please update your payment method.
            </div>

            <div class="alert-box">
              <div class="detail-row">
                <span class="detail-label">Attempted Plan:</span>
                <span class="detail-value">${params.planName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Billing Amount:</span>
                <span class="detail-value">${params.amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Error Reason:</span>
                <span class="detail-value">${params.reason || 'Payment was declined or cancelled'}</span>
              </div>
            </div>

            <div class="btn-container">
              <a href="${retryUrl}" class="btn">Retry Payment in Dashboard</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI. Support: admin@zellonai.online
          </div>
        </div>
      </body>
    </html>
  `;

  // Inform both user and admin
  const adminEmails = getAdminEmails();
  const allRecipients = Array.from(new Set([params.to, ...adminEmails]));

  return sendEmail({
    to: allRecipients,
    subject: `⚠️ Action Required: Subscription Payment Failed for ${params.planName}`,
    html,
  });
}

// ==========================================
// 6. LOW RATING INTERCEPTION ALERT (1-3 STARS)
// ==========================================
export async function sendNegativeReviewAlert(params: NegativeReviewAlertParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const feedbackDashboardUrl = `${origin}/dashboard/feedback`;
  const starIcons = '⭐'.repeat(Math.max(1, Math.min(5, params.rating)));

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fecaca; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 28px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
          .header p { color: #fee2e2; margin: 6px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .alert-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
          .rating-box { background: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
          .rating-stars { font-size: 22px; margin-bottom: 4px; }
          .rating-text { font-size: 14px; font-weight: 700; color: #9f1239; }
          .comment-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px; font-style: italic; color: #334155; line-height: 1.6; font-size: 15px; }
          .customer-details { background: #f8fafc; border-radius: 10px; padding: 18px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
          .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-value { color: #0f172a; font-weight: 600; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #dc2626; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; }
          .tip-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; font-size: 13px; color: #1e40af; line-height: 1.5; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Attention: Negative Feedback Intercepted</h1>
            <p>ZellonAI protected your public Google rating by keeping this private.</p>
          </div>
          <div class="body">
            <span class="alert-badge">Intercepted Rating (1-3★)</span>
            <div style="font-size: 16px; color: #334155; margin-bottom: 18px;">
              A customer left a <strong>${params.rating}-Star</strong> review for <strong>${params.businessName}</strong>. This was <em>not</em> posted to Google Reviews.
            </div>

            <div class="rating-box">
              <div class="rating-stars">${starIcons}</div>
              <div class="rating-text">Customer Rated: ${params.rating} out of 5 Stars</div>
            </div>

            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 8px;">Customer's Private Feedback:</div>
            <div class="comment-box">
              "${params.comment || 'No written message provided.'}"
            </div>

            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 8px;">Customer Contact Information:</div>
            <div class="customer-details">
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${params.customerName || 'Anonymous Customer'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${params.customerEmail || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${params.customerPhone || 'Not provided'}</span>
              </div>
            </div>

            <div class="tip-box">
              💡 <strong>Action Tip:</strong> Reach out to this customer within 24 hours to address their concerns. Resolving customer complaints proactively turns unhappy customers into your most loyal advocates!
            </div>

            <div class="btn-container">
              <a href="${feedbackDashboardUrl}" class="btn">View & Resolve in Dashboard</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI Review Management System.
          </div>
        </div>
      </body>
    </html>
  `;

  // Inform both business owner and admin
  const adminEmails = getAdminEmails();
  const allRecipients = Array.from(new Set([params.to, ...adminEmails]));

  return sendEmail({
    to: allRecipients,
    subject: `⚠️ [499 Premium Plan] Low Rating Alert (${params.rating}★) Intercepted for ${params.businessName}`,
    html,
  });
}

// ==========================================
// 7. MARKETING UPDATES
// ==========================================
export async function sendMarketingUpdate(params: MarketingUpdateParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = getAppOrigin();
  const actionUrl = params.ctaUrl || `${origin}/dashboard`;
  const actionText = params.ctaText || 'Check Dashboard';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #1e1b4b; padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
          .body { padding: 32px 28px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .message { font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 28px; white-space: pre-line; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ZellonAI News & Updates 📣</h1>
          </div>
          <div class="body">
            <div class="title">${params.title}</div>
            <div class="message">${params.message}</div>
            <div class="btn-container">
              <a href="${actionUrl}" class="btn">${actionText}</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI. Support: admin@zellonai.online
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `📣 ${params.title}`,
    html,
  });
}

// ==========================================
// 8. ENTERPRISE LEAD EMAIL
// ==========================================
export async function sendEnterpriseLeadEmail(params: EnterpriseLeadParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #4f46e5; padding: 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; }
          .body { padding: 32px 28px; }
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-weight: 600; font-size: 14px; }
          .detail-value { color: #0f172a; font-weight: 700; font-size: 14px; text-align: right; max-width: 60%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 New Enterprise Lead!</h1>
          </div>
          <div class="body">
            <p>Someone just filled out the Enterprise Plan request form.</p>
            <div class="summary-box">
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${params.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value"><a href="mailto:${params.customerEmail}">${params.customerEmail}</a></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${params.customerPhone || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Business:</span>
                <span class="detail-value">${params.businessName}</span>
              </div>
            </div>
            ${params.message ? `
            <p><strong>Message:</strong></p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-style: italic;">
              ${params.message}
            </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.adminEmail,
    subject: `🏢 Enterprise Request: ${params.businessName}`,
    html,
  });
}
