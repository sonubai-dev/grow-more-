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
  subscription_id: string; // Used for subscriptions instead of order_id
  name: string;
  description: string;
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
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface InitiatePaymentParams {
  planId: 'starter' | 'growth' | 'enterprise';
  planName: string;
  businessId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string, subscriptionId: string) => void;
  onError: (errorMsg: string) => void;
}

/**
 * Initiates Razorpay subscription checkout modal for UPI AutoPay
 */
export async function initiateRazorpayPayment(params: InitiatePaymentParams): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    params.onError('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  try {
    // 1. Create subscription on backend API
    const response = await fetch('/api/razorpay/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: params.planId,
        businessId: params.businessId || 'default_biz',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create subscription.');
    }

    const subData = await response.json();
    const razorpayKey = subData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';

    if (!razorpayKey) {
      throw new Error('Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID.');
    }

    // 2. Open Razorpay Checkout Modal for Subscriptions
    const options: RazorpayOptions = {
      key: razorpayKey,
      subscription_id: subData.id,
      name: 'ZellonAI',
      description: `Subscription: ${params.planName} (14-Day Free Trial)`,
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
          // 3. Verify subscription signature on backend
          const verifyRes = await fetch('/api/razorpay/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_subscription_id: paymentResponse.razorpay_subscription_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              businessId: params.businessId,
              plan: params.planId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            params.onSuccess(paymentResponse.razorpay_payment_id, paymentResponse.razorpay_subscription_id);
          } else {
            params.onError(verifyData.error || 'Subscription verification failed.');
          }
        } catch (err: any) {
          params.onError(err.message || 'Error verifying subscription.');
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
