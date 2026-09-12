/**
 * ZellonAI Email Service
 * Powered by Resend (https://resend.com)
 * 
 * Supports:
 * - New Account Creation (Welcome Email)
 * - Negative Review Interception Alert (Rating <= 3)
 * - Platform & Marketing Updates
 */

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface WelcomeEmailParams {
  to: string;
  ownerName: string;
  businessName: string;
  slug: string;
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

/**
 * Sends an email via the server-side Resend proxy (/api/send-email)
 * Does not block or throw unhandled errors to avoid degrading user experience.
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
      console.warn('[EmailService] Failed to send email:', errorData);
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log('[EmailService] Email sent successfully:', data.id);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.warn('[EmailService] Network error sending email:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a welcome email when a user creates a new account
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zellonai.online';
  const reviewUrl = `${origin}/r/${params.slug}`;
  const dashboardUrl = `${origin}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #4f46e5; padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .intro { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
          .card-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
          .link-box { font-size: 16px; font-weight: 600; color: #4f46e5; word-break: break-all; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; }
          .steps { margin-bottom: 28px; }
          .step { display: flex; margin-bottom: 12px; font-size: 14px; color: #334155; }
          .step-num { font-weight: 700; color: #4f46e5; margin-right: 8px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ZellonAI! ??</h1>
            <p>Your AI-Powered Google Review & Reputation Accelerator</p>
          </div>
          <div class="body">
            <div class="greeting">Hi ${params.ownerName || 'there'},</div>
            <div class="intro">
              Congratulations on setting up <strong>${params.businessName}</strong>! ZellonAI is built to help you get more 5-star Google reviews while keeping unhappy feedback private so you can fix customer issues before they reach public channels.
            </div>

            <div class="card">
              <div class="card-title">Your Official Review Link</div>
              <div class="link-box"><a href="${reviewUrl}" style="color: #4f46e5; text-decoration: none;">${reviewUrl}</a></div>
            </div>

            <div class="steps">
              <div style="font-weight: 700; margin-bottom: 10px; color: #0f172a;">3 Quick Steps to Get Started:</div>
              <div class="step"><span class="step-num">1.</span> Share your review link via WhatsApp, SMS, or QR code stand with happy customers.</div>
              <div class="step"><span class="step-num">2.</span> Customers giving 5 stars are instantly directed to your Google Reviews page.</div>
              <div class="step"><span class="step-num">3.</span> Any lower rating is captured privately into your dashboard with instant email alerts.</div>
            </div>

            <div class="btn-container">
              <a href="${dashboardUrl}" class="btn">Open Your Dashboard</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI. Automated Review Acceleration System.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `?? Welcome to ZellonAI - ${params.businessName} is ready for 5-Star Reviews!`,
    html,
  });
}

/**
 * Sends an urgent alert to the business owner when a customer submits negative or neutral feedback (1-3 stars)
 */
export async function sendNegativeReviewAlert(params: NegativeReviewAlertParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zellonai.online';
  const feedbackDashboardUrl = `${origin}/dashboard/feedback`;

  const starIcons = '⭐'.repeat(Math.max(1, Math.min(5, params.rating)));

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fecaca; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #dc2626; padding: 28px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
          .header p { color: #fee2e2; margin: 6px 0 0 0; font-size: 14px; }
          .body { padding: 32px 28px; }
          .alert-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
          .rating-box { background: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
          .rating-stars { font-size: 20px; margin-bottom: 4px; }
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
            <h1>?? Attention: Negative Feedback Intercepted</h1>
            <p>ZellonAI protected your public Google rating by keeping this private.</p>
          </div>
          <div class="body">
            <span class="alert-badge">Intercepted Feedback</span>
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
              ?? <strong>Action Tip:</strong> Reach out to this customer within 24 hours to address their concerns. Customers who receive prompt personal attention often become your most loyal advocates!
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

  return sendEmail({
    to: params.to,
    subject: `⚠️ [Action Required] New ${params.rating}-Star Feedback for ${params.businessName}`,
    html,
  });
}

/**
 * Sends a marketing or product update email to users
 */
export async function sendMarketingUpdate(params: MarketingUpdateParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zellonai.online';
  const actionUrl = params.ctaUrl || `${origin}/dashboard`;
  const actionText = params.ctaText || 'Check Dashboard';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
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
            <h1>ZellonAI News & Updates ?</h1>
          </div>
          <div class="body">
            <div class="title">${params.title}</div>
            <div class="message">${params.message}</div>
            <div class="btn-container">
              <a href="${actionUrl}" class="btn">${actionText}</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `?? ${params.title}`,
    html,
  });
}

export interface SubscriptionSuccessParams {
  to: string;
  ownerName: string;
  planName: string;
  amount: string;
}

/**
 * Sends a confirmation email when a user successfully subscribes to a plan
 */
export async function sendSubscriptionSuccessEmail(params: SubscriptionSuccessParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #10b981; padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
          .body { padding: 32px 28px; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .message { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px; }
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-weight: 600; font-size: 14px; }
          .detail-value { color: #0f172a; font-weight: 700; font-size: 14px; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Confirmed!</h1>
          </div>
          <div class="body">
            <div class="greeting">Hi ${params.ownerName || 'there'},</div>
            <div class="message">
              Thank you for subscribing to ZellonAI! Your account has been successfully upgraded. You can now access all the premium features included in your plan.
            </div>
            
            <div class="summary-box">
              <div class="detail-row">
                <span class="detail-label">Plan Name:</span>
                <span class="detail-value">${params.planName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Billing Amount:</span>
                <span class="detail-value">${params.amount} / month</span>
              </div>
            </div>
            <div class="message">
              If you have any questions, simply reply to this email. We're here to help you grow!
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ZellonAI.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `🎉 Upgrade Successful - Welcome to ${params.planName}!`,
    html,
  });
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
 * Sends a lead notification to the admin when someone requests the Enterprise plan
 */
export async function sendEnterpriseLeadEmail(params: EnterpriseLeadParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
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
    to: params.adminEmail, // Admin email
    subject: `🏢 Enterprise Request: ${params.businessName}`,
    html,
  });
}
