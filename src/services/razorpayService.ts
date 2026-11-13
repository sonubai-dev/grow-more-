import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
 * Initiates Razorpay checkout powered by Supabase Edge Functions backend
 */
export async function initiateRazorpayPayment(params: InitiatePaymentParams): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    params.onError('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  try {
    let paymentData: any = null;
    const planAmount = params.planId === 'starter' ? 99 : 499;

    // 1. Primary: Use Supabase Edge Function (razorpay-order)
    if (isSupabaseConfigured) {
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('razorpay-order', {
          body: {
            plan: params.planId,
            amount: planAmount,
            businessId: params.businessId || 'default_biz',
          },
        });

        if (!edgeErr && edgeData?.id) {
          paymentData = edgeData;
        } else if (edgeErr) {
          console.warn('[Supabase Edge Function razorpay-order]:', edgeErr);
        }
      } catch (e) {
        console.warn('Error invoking Supabase razorpay-order:', e);
      }
    }

    // 2. Fallback: Use Vercel Serverless Function (/api/razorpay/create-order)
    if (!paymentData) {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    }

    const razorpayKey =
      paymentData.keyId ||
      (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
      'rzp_live_TzmKhRURxgHz6t';

    if (!razorpayKey) {
      throw new Error('Razorpay Key ID is missing. Please configure RAZORPAY_KEY_ID.');
    }

    // 3. Open Razorpay Checkout Modal
    const options: RazorpayOptions = {
      key: razorpayKey,
      order_id: paymentData.id,
      name: 'ZellonAI',
      description: `${params.planName} — Review Accelerator`,
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
          let verified = false;

          // 4. Verify signature via Supabase Edge Function (razorpay-verify)
          if (isSupabaseConfigured) {
            try {
              const { data: vData, error: vErr } = await supabase.functions.invoke('razorpay-verify', {
                body: {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  businessId: params.businessId,
                  plan: params.planId,
                  customerEmail: params.customerEmail,
                  ownerName: params.customerName,
                },
              });

              if (!vErr && vData?.success) {
                verified = true;
              } else if (vErr) {
                console.warn('[Supabase razorpay-verify error]:', vErr);
              }
            } catch (e) {
              console.warn('Error invoking Supabase razorpay-verify:', e);
            }
          }

          // Fallback verification via Vercel serverless function
          if (!verified) {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              verified = true;
            } else {
              params.onError(verifyData.error || 'Payment signature verification failed.');
              return;
            }
          }

          if (verified) {
            params.onSuccess(
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_order_id || 'order_success'
            );
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

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    params.onError(err.message || 'Payment initiation failed.');
  }
}
