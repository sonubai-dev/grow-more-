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

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'WnDgteJiOgxUwoQYcgSKi6AV';
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
    const plan = PLAN_MAP[rawPlanId] || notes.plan || 'growth';

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
