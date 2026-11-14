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

    // 1. Primary: Use Supabase Edge Function (razorpay-subscription for recurring plans)
    if (isSupabaseConfigured) {
      try {
        const { data: subData, error: subErr } = await supabase.functions.invoke('razorpay-subscription', {
          body: {
            plan: params.planId,
            businessId: params.businessId || 'default_biz',
            customerEmail: params.customerEmail,
            customerPhone: params.customerPhone,
          },
        });

        if (!subErr && (subData?.subscriptionId || subData?.id)) {
          paymentData = {
            ...subData,
            isSubscription: true,
            id: subData.subscriptionId || subData.id,
          };
        } else if (subErr) {
          console.warn('[Supabase Edge Function razorpay-subscription]:', subErr);
        }
      } catch (e) {
        console.warn('Error invoking Supabase razorpay-subscription:', e);
      }
    }

    // 2. Secondary: Fallback to Supabase Edge Function (razorpay-order) if subscription unavailable
    if (!paymentData && isSupabaseConfigured) {
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('razorpay-order', {
          body: {
            plan: params.planId,
            amount: planAmount,
            businessId: params.businessId || 'default_biz',
          },
        });

        if (!edgeErr && edgeData?.id) {
          paymentData = { ...edgeData, isSubscription: false };
        } else if (edgeErr) {
          console.warn('[Supabase Edge Function razorpay-order]:', edgeErr);
        }
      } catch (e) {
        console.warn('Error invoking Supabase razorpay-order:', e);
      }
    }

    // 3. Fallback: Use Vercel Serverless Function (/api/razorpay/create-subscription or create-order)
    if (!paymentData) {
      try {
        const subRes = await fetch('/api/razorpay/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: params.planId,
            businessId: params.businessId || 'default_biz',
          }),
        });

        if (subRes.ok) {
          const subResData = await subRes.json();
          paymentData = { ...subResData, isSubscription: true, id: subResData.id };
        }
      } catch (e) {
        console.warn('Fallback create-subscription failed:', e);
      }

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
    }

    const razorpayKey =
      paymentData.keyId ||
      (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
      'rzp_live_TzmKhRURxgHz6t';

    if (!razorpayKey) {
      throw new Error('Razorpay Key ID is missing. Please configure RAZORPAY_KEY_ID.');
    }

    // 4. Open Razorpay Checkout Modal
    const options: RazorpayOptions = {
      key: razorpayKey,
      ...(paymentData.isSubscription ? { subscription_id: paymentData.id } : { order_id: paymentData.id }),
      name: 'ZellonAI',
      description: `${params.planName} — Monthly Subscription`,
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

          // 5. Verify signature via Supabase Edge Function (razorpay-verify)
          if (isSupabaseConfigured) {
            try {
              const { data: vData, error: vErr } = await supabase.functions.invoke('razorpay-verify', {
                body: {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_subscription_id: paymentResponse.razorpay_subscription_id || (paymentData.isSubscription ? paymentData.id : undefined),
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
            const isSub = Boolean(paymentResponse.razorpay_subscription_id || paymentData.isSubscription);
            const verifyEndpoint = isSub
              ? '/api/razorpay/verify-subscription'
              : '/api/razorpay/verify-payment';
            const verifyPayload = isSub
              ? {
                  razorpay_subscription_id: paymentResponse.razorpay_subscription_id || paymentData.id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }
              : {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                };

            const verifyRes = await fetch(verifyEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyPayload),
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
              paymentResponse.razorpay_subscription_id || paymentResponse.razorpay_order_id || 'payment_success'
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
