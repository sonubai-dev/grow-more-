import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

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

  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing order or payment details.' });
  }

  if (!keySecret) {
    return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET is not configured in environment variables.' });
  }

  try {
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, message: 'Payment verified successfully.' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid Razorpay signature.' });
    }
  } catch (err: any) {
    console.error('Error verifying Razorpay payment:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
