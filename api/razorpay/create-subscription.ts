import type { VercelRequest, VercelResponse } from '@vercel/node';

const RAZORPAY_PLANS: Record<string, string> = {
  starter: process.env.RAZORPAY_PLAN_STARTER || 'plan_TZTMkUGhuBUCYl',
  growth: process.env.RAZORPAY_PLAN_GROWTH || 'plan_TZTNpjDON3uJXQ',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  const { plan = 'growth', businessId } = req.body || {};

  if (!keyId || !keySecret) {
    return res.status(400).json({
      error: 'Razorpay Key ID or Secret is not configured in environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).',
    });
  }

  try {
    const planId = RAZORPAY_PLANS[plan] || RAZORPAY_PLANS.growth;

    // 14 days free trial -> AutoPay starts after 14 days
    const trialDays = 14;
    const startAt = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: 120, // 10 years monthly
        quantity: 1,
        start_at: startAt,
        customer_notify: 1,
        notes: {
          platform: 'ZellonAI',
          plan,
          businessId: businessId || '',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Razorpay Subscription Error]:', data);
      return res.status(response.status).json({
        error: data.error?.description || 'Subscription creation failed.',
      });
    }

    return res.json({
      ...data,
      keyId,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay subscription:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
