import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  if (!keyId || !keySecret) {
    return res.status(400).json({
      error: 'Razorpay Key ID or Secret is not configured in environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).',
    });
  }

  const { amount = 499, currency = 'INR', plan = 'growth', businessId } = req.body || {};

  try {
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const amountInPaise = Math.round(Number(amount) * 100);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          platform: 'ZellonAI',
          plan,
          businessId: businessId || '',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Razorpay Order Error]:', data);
      return res.status(response.status).json({
        error: data.error?.description || 'Order creation failed.',
      });
    }

    return res.json({
      ...data,
      keyId,
    });
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
