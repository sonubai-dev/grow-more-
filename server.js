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

/**
 * Endpoint 1: Create Razorpay Order
 */
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', plan, businessId } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount in paise is required.' });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.warn('[Razorpay API Warning] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in environment variables.');
      // Return dummy order ID for testing if keys not provided in dev
      const mockOrderId = `order_mock_${Date.now()}`;
      return res.json({
        id: mockOrderId,
        entity: 'order',
        amount: Number(amount),
        currency: currency || 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        keyId: RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
      });
    }

    // Auth header for Razorpay API (Basic Auth using key_id:key_secret)
    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amount), // in paise (e.g. ₹499 = 49900)
        currency: currency || 'INR',
        receipt: `rcpt_${businessId || 'biz'}_${Date.now().toString().slice(-6)}`,
        notes: {
          plan: plan || 'starter',
          businessId: businessId || '',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.description || 'Razorpay order creation failed.' });
    }

    return res.json({
      ...data,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ error: 'Internal Server Error while creating payment order.' });
  }
});

/**
 * Endpoint 2: Verify Razorpay Payment Signature
 */
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment details.' });
    }

    // Mock bypass if secret key not set in local demo environment
    if (!RAZORPAY_KEY_SECRET) {
      return res.json({ success: true, message: 'Payment verified (Demo mode).' });
    }

    // Verify HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.json({ success: true, message: 'Razorpay payment verified successfully.' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment signature. Potential tampering detected.' });
    }
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    return res.status(500).json({ error: 'Internal Server Error while verifying payment.' });
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
