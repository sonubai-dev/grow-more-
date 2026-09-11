/**
 * Helper to dynamically load Razorpay Checkout Script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface InitiatePaymentParams {
  planId: 'starter' | 'growth' | 'enterprise';
  planName: string;
  amountInINR: number;
  businessId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onError: (errorMsg: string) => void;
}

/**
 * Initiates Razorpay payment checkout modal
 */
export async function initiateRazorpayPayment(params: InitiatePaymentParams): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    params.onError('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  try {
    // 1. Create order on backend API
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountInINR * 100, // Amount in paise
        currency: 'INR',
        plan: params.planId,
        businessId: params.businessId || 'default_biz',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create payment order.');
    }

    const orderData = await response.json();
    const razorpayKey = orderData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';

    if (!razorpayKey) {
      throw new Error('Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID in environment variables.');
    }

    // 2. Open Razorpay Checkout Modal
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'ZellonAI',
      description: `Subscription: ${params.planName}`,
      order_id: orderData.id,
      prefill: {
        name: params.customerName || '',
        email: params.customerEmail || '',
        contact: params.customerPhone || '',
      },
      notes: {
        plan: params.planId,
        businessId: params.businessId || '',
      },
      theme: {
        color: '#4f46e5', // ZellonAI Indigo theme
      },
      handler: async (paymentResponse) => {
        try {
          // 3. Verify payment signature on backend
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              businessId: params.businessId,
              plan: params.planId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            params.onSuccess(paymentResponse.razorpay_payment_id, paymentResponse.razorpay_order_id);
          } else {
            params.onError(verifyData.error || 'Payment signature verification failed.');
          }
        } catch (err: any) {
          params.onError(err.message || 'Error verifying payment signature.');
        }
      },
      modal: {
        ondismiss: () => {
          params.onError('Payment window was closed before completion.');
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    params.onError(err.message || 'Payment initiation failed.');
  }
}
