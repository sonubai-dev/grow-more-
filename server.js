import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Razorpay API Credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Hardcoded Plan IDs provided by user
const RAZORPAY_PLANS = {
  starter: 'plan_TZTMkUGhuBUCYl',
  growth: 'plan_TZTNpjDON3uJXQ',
};

/**
 * Endpoint 1: Create Razorpay Subscription (with Trial Period)
 */
app.post('/api/razorpay/create-subscription', async (req, res) => {
  try {
    const { plan, businessId } = req.body;

    if (!plan || !RAZORPAY_PLANS[plan]) {
      return res.status(400).json({ error: 'Valid plan (starter or growth) is required.' });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.warn('[Razorpay API Warning] Keys missing. Using mock response.');
      return res.json({
        id: `sub_mock_${Date.now()}`,
        entity: 'subscription',
        status: 'created',
        keyId: RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
      });
    }

    // 14 days free trial -> AutoPay starts after 14 days
    const trialDays = 14;
    // Calculate start_at in UNIX timestamp (must be at least 24h in the future)
    const startAt = Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60);

    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: RAZORPAY_PLANS[plan],
        total_count: 120, // max 10 years
        quantity: 1,
        start_at: startAt, // Starts after trial period
        customer_notify: 1,
        notes: {
          businessId: businessId || '',
          plan: plan,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Razorpay subscription error:', data);
      return res.status(response.status).json({ error: data.error?.description || 'Subscription creation failed.' });
    }

    return res.json({
      ...data,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay subscription:', err);
    return res.status(500).json({ error: 'Internal Server Error while creating subscription.' });
  }
});

/**
 * Endpoint 2: Verify Razorpay Subscription Signature
 */
app.post('/api/razorpay/verify-subscription', async (req, res) => {
  try {
    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing subscription or payment details.' });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return res.json({ success: true, message: 'Verified (Demo mode).' });
    }

    // Razorpay Subscription verification needs: payment_id + "|" + subscription_id
    const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.json({ success: true, message: 'Subscription verified successfully.' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid signature.' });
    }
  } catch (err) {
    console.error('Error verifying Razorpay subscription:', err);
    return res.status(500).json({ error: 'Internal Server Error while verifying subscription.' });
  }
});

// Serve static assets from build output directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
}));

// SPA Fallback: serve index.html for all frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZellonAI server running on port ${PORT}`);
});
