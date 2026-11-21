import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yrhyisgvjgvpogtawuze.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const PLAN_MAP: Record<string, string> = {
  plan_TZTMkUGhuBUCYl: 'starter',
  plan_TZTNpjDON3uJXQ: 'growth',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  const razorpaySignature = req.headers['x-razorpay-signature'] as string;

  const eventPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // 1. Verify Razorpay cryptographic webhook signature
  if (webhookSecret && razorpaySignature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(eventPayload)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        console.warn('[Razorpay Webhook] Signature mismatch. Received:', razorpaySignature);
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    } catch (e) {
      console.error('[Razorpay Webhook] Signature verification error:', e);
      return res.status(400).json({ error: 'Signature verification failed.' });
    }
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event.event;
    console.log(`[Razorpay Webhook] Processing event: ${eventType}`);

    const payload = event.payload;
    const payment = payload?.payment?.entity;
    const order = payload?.order?.entity;
    const subscription = payload?.subscription?.entity;

    const notes = payment?.notes || order?.notes || subscription?.notes || {};
    const businessId = notes.businessId;
    const customerEmail = payment?.email || subscription?.customer_email || notes.customerEmail;
    
    // Resolve plan name from plan_id or notes
    const rawPlanId = subscription?.plan_id || notes.plan_id;
    const plan = PLAN_MAP[rawPlanId] || notes.plan || 'starter';

    if (supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Helper to find and update business by businessId or email
      const updateBusinessStatus = async (status: string, isActive: boolean, newPlan?: string) => {
        const updateData: Record<string, any> = {
          status,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        };
        if (newPlan) updateData.plan = newPlan;

        if (businessId && businessId !== 'default_biz' && businessId !== 'test-business') {
          await supabase.from('businesses').update(updateData).eq('id', businessId);
          console.log(`[Razorpay Webhook] Business ${businessId} updated: status=${status}, plan=${newPlan || 'unchanged'}`);
        } else if (customerEmail) {
          await supabase.from('businesses').update(updateData).ilike('email', customerEmail.trim());
          console.log(`[Razorpay Webhook] Business with email ${customerEmail} updated: status=${status}`);
        }
      };

      switch (eventType) {
        case 'order.paid':
        case 'payment.captured':
        case 'subscription.charged':
        case 'subscription.activated':
        case 'subscription.authenticated':
        case 'subscription.resumed':
        case 'subscription.updated':
          // Customer successfully paid / subscription is live
          await updateBusinessStatus('active', true, plan);

          // Dispatch Subscription Activated email to customer via Resend
          if (customerEmail && process.env.RESEND_API_KEY) {
            try {
              const resendApiKey = process.env.RESEND_API_KEY;
              const fromEmail = process.env.RESEND_FROM_EMAIL || 'ZellonAI <onboarding@resend.dev>';
              const planDisplay = plan === 'starter' ? '₹99 Starter Plan' : (plan === 'enterprise' ? 'Enterprise Plan' : '₹499 Growth Plan');
              const amountDisplay = plan === 'starter' ? '₹99 / month' : (plan === 'enterprise' ? 'Custom' : '₹499 / month');

              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: fromEmail,
                  to: customerEmail,
                  subject: `🎉 Subscription Activated: ${planDisplay} is now Live!`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                      <h2 style="color: #4f46e5;">🎉 Subscription Activated!</h2>
                      <p>Your subscription to <strong>${planDisplay}</strong> (${amountDisplay}) has been verified and is now live.</p>
                      <p>Your Google 5-Star Review Funnel, QR stand gateway, and private negative review shielding are running 24/7 without interruption.</p>
                      <div style="margin: 24px 0;">
                        <a href="https://zellonai.online/dashboard" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Dashboard &rarr;</a>
                      </div>
                      <p style="font-size: 12px; color: #64748b;">Need help? Contact support at help.solita@gmail.com</p>
                    </div>
                  `,
                }),
              });
            } catch (emailErr) {
              console.warn('[Razorpay Webhook] Failed to send subscription email:', emailErr);
            }
          }
          break;

        case 'subscription.paused':
          // Subscription paused
          await updateBusinessStatus('paused', true);
          break;

        case 'subscription.cancelled':
          // Subscription cancelled
          await updateBusinessStatus('cancelled', false);
          break;

        case 'payment.failed':
          // Failed payment attempt
          console.warn(`[Razorpay Webhook] Payment failed for ${customerEmail || businessId}`);
          break;

        case 'subscription.pending':
          // Waiting for user confirmation
          console.log(`[Razorpay Webhook] Subscription pending for ${customerEmail || businessId}`);
          break;

        default:
          console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`);
      }
    }

    return res.status(200).json({ status: 'ok', event: eventType, received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
