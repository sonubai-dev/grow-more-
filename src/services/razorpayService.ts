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
  order_id?: string;
  subscription_id?: string;
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
  handler: (response: any) => void;
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
 * Initiates Razorpay checkout (Subscriptions with 14-day trial or Direct Order fallback)
 */
export async function initiateRazorpayPayment(params: InitiatePaymentParams): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    params.onError('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  try {
    let paymentData: any = null;
    let isOrder = false;

    // 1. First attempt: Create subscription with 14-day trial
    const subRes = await fetch('/api/razorpay/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: params.planId,
        businessId: params.businessId || 'default_biz',
      }),
    });

    if (subRes.ok) {
      paymentData = await subRes.json();
    } else {
      // 2. Fallback attempt: Create standard order for ₹499 / ₹99
      const planAmount = params.planId === 'starter' ? 99 : 499;
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: params.planId,
          amount: planAmount,
          businessId: params.businessId || 'default_biz',
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initialize Razorpay payment.');
      }
      paymentData = await orderRes.json();
      isOrder = true;
    }

    const razorpayKey = paymentData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';

    if (!razorpayKey) {
      throw new Error('Razorpay Key ID is missing. Please configure RAZORPAY_KEY_ID.');
    }

    // 3. Open Razorpay Checkout Modal
    const options: RazorpayOptions = {
      key: razorpayKey,
      name: 'ZellonAI',
      description: `${params.planName} (14-Day Free Trial)`,
      prefill: {
        name: params.customerName || '',
        email: params.customerEmail || '',
        contact: params.customerPhone || '',
      },
      notes: {
        platform: 'ZellonAI',
        plan: params.planId,
        businessId: params.businessId || '',
      },
      theme: {
        color: '#4f46e5', // ZellonAI Indigo
      },
      handler: async (paymentResponse: any) => {
        try {
          if (isOrder) {
            // Verify Order signature
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              params.onSuccess(paymentResponse.razorpay_payment_id, paymentResponse.razorpay_order_id || 'order_success');
            } else {
              params.onError(verifyData.error || 'Payment signature verification failed.');
            }
          } else {
            // Verify Subscription signature
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
          }
        } catch (err: any) {
          params.onError(err.message || 'Error verifying payment with server.');
        }
      },
      modal: {
        ondismiss: () => {
          params.onError('Payment window was closed before completion.');
        },
      },
    };

    if (isOrder && paymentData.id) {
      options.order_id = paymentData.id;
    } else if (paymentData.id) {
      options.subscription_id = paymentData.id;
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    params.onError(err.message || 'Payment initiation failed.');
  }
}
