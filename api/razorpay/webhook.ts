import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yrhyisgvjgvpogtawuze.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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

  // If secret is set, verify the webhook signature
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
    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    const payload = event.payload;

    if (eventType === 'order.paid' || eventType === 'payment.captured' || eventType === 'subscription.charged') {
      const payment = payload?.payment?.entity;
      const order = payload?.order?.entity;
      const subscription = payload?.subscription?.entity;

      const notes = payment?.notes || order?.notes || subscription?.notes || {};
      const businessId = notes.businessId;
      const plan = notes.plan || 'growth';

      if (businessId && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('businesses')
          .update({
            plan,
            status: 'active',
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', businessId);

        console.log(`[Razorpay Webhook] Successfully upgraded business ${businessId} to plan ${plan}`);
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
