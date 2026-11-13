import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Business, FeedbackItem, FeedbackSubmissionInput, PlatformSettings } from '../types';
import { sendNegativeReviewAlert } from './emailService';

export interface CreateBusinessInput {
  ownerId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  category: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  googleReviewUrl: string;
  googlePlaceId?: string;
  slug?: string;
  plan?: string;
}

export function mapSupabaseBusiness(row: any): Business {
  return {
    id: row.id,
    ownerId: row.owner_id,
    businessName: row.business_name,
    name: row.business_name,
    ownerName: row.owner_name || '',
    email: row.email || '',
    contactEmail: row.email || '',
    phone: row.phone || '',
    category: row.category || 'Healthcare & Dental',
    address: row.address || '',
    website: row.website || '',
    logoUrl: row.logo_url || '',
    googleReviewUrl: row.google_review_url || '',
    googlePlaceId: row.google_place_id || '',
    slug: row.slug,
    headerColor: row.header_color || '#4f46e5',
    accentColor: row.accent_color || '#6366f1',
    customHeadline: row.custom_headline || '',
    customSubheadline: row.custom_subheadline || '',
    thresholdRatingForGoogle: row.threshold_rating_for_google ?? 5,
    isActive: row.is_active ?? true,
    plan: (row.plan || 'growth') as any,
    status: (row.status || 'active') as any,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSupabaseFeedback(row: any): FeedbackItem {
  return {
    id: row.id,
    businessId: row.business_id,
    customerName: row.customer_name || '',
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone || '',
    rating: row.rating,
    comment: row.comment || '',
    source: row.source || 'public_review_page',
    status: row.status || 'new',
    googleRedirected: row.google_redirected || false,
    clickedGoogleReview: row.clicked_google_review || false,
    internalNotes: row.internal_notes || '',
    createdAt: row.created_at,
  };
}

// 1. Fetch Business by Slug (Public Review Page /r/:slug)
export async function getBusinessBySlugFromSupabase(slug: string): Promise<Business | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug.trim())
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn('[Supabase] Error getting business by slug:', error);
    return null;
  }
  return mapSupabaseBusiness(data);
}

// 2. Fetch Businesses by Owner ID
export async function getBusinessesByOwnerFromSupabase(ownerId: string): Promise<Business[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.warn('[Supabase] Error getting businesses by owner:', error);
    return [];
  }
  return data.map(mapSupabaseBusiness);
}

// 3. Create Business
export async function createBusinessInSupabase(input: CreateBusinessInput): Promise<Business> {
  const slug = input.slug || input.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  const payload = {
    owner_id: input.ownerId,
    business_name: input.businessName,
    owner_name: input.ownerName || '',
    email: input.email || '',
    phone: input.phone || '',
    category: input.category || 'Healthcare & Dental',
    address: input.address || '',
    website: input.website || '',
    logo_url: input.logoUrl || '',
    google_review_url: input.googleReviewUrl || '',
    google_place_id: input.googlePlaceId || '',
    slug,
    plan: input.plan || 'premium_499',
    status: 'active',
    is_active: true,
  };

  const { data, error } = await supabase
    .from('businesses')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSupabaseBusiness(data);
}

// 4. Update Business
export async function updateBusinessInSupabase(businessId: string, updates: Partial<Business>): Promise<Business> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.businessName !== undefined) payload.business_name = updates.businessName;
  if (updates.ownerName !== undefined) payload.owner_name = updates.ownerName;
  if (updates.contactEmail !== undefined) payload.email = updates.contactEmail;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.website !== undefined) payload.website = updates.website;
  if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;
  if (updates.googleReviewUrl !== undefined) payload.google_review_url = updates.googleReviewUrl;
  if (updates.googlePlaceId !== undefined) payload.google_place_id = updates.googlePlaceId;
  if (updates.headerColor !== undefined) payload.header_color = updates.headerColor;
  if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;
  if (updates.customHeadline !== undefined) payload.custom_headline = updates.customHeadline;
  if (updates.customSubheadline !== undefined) payload.custom_subheadline = updates.customSubheadline;
  if (updates.thresholdRatingForGoogle !== undefined) payload.threshold_rating_for_google = updates.thresholdRatingForGoogle;

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSupabaseBusiness(data);
}

// 5. Submit Customer Feedback with Resend / Edge Function low rating alert for 499 Plan
export async function submitFeedbackToSupabase(input: FeedbackSubmissionInput, business?: Business | null): Promise<FeedbackItem> {
  const payload = {
    business_id: input.businessId,
    customer_name: input.customerName || 'Anonymous Customer',
    customer_email: input.customerEmail || '',
    customer_phone: input.customerPhone || '',
    rating: input.rating,
    comment: input.comment || '',
    source: input.source || 'public_review_page',
    google_redirected: Boolean(input.googleRedirected),
    status: 'new',
  };

  const { data, error } = await supabase
    .from('feedback')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);

  const feedback = mapSupabaseFeedback(data);

  // If low rating (<= 3 stars) intercepted, trigger email notification for 499 Plan
  if (input.rating <= 3) {
    try {
      // 1. Invoke Supabase Edge Function notify-low-rating
      supabase.functions.invoke('notify-low-rating', {
        body: {
          businessName: business?.name || business?.businessName || 'Your Business',
          ownerEmail: business?.contactEmail || business?.email || '',
          rating: input.rating,
          comment: input.comment || '',
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          plan: 'premium_499',
        },
      }).catch((edgeErr) => console.warn('[EdgeFunction notify-low-rating]:', edgeErr));

      // 2. Also dispatch via Resend client service to ensure delivery to admin & owner
      sendNegativeReviewAlert({
        to: business?.contactEmail || business?.email || 'admin@zellonai.online',
        businessName: business?.name || business?.businessName || 'Your Business',
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        rating: input.rating,
        comment: input.comment,
        businessId: input.businessId,
      }).catch((emailErr) => console.warn('[EmailService Alert]:', emailErr));
    } catch (alertErr) {
      console.warn('Low rating alert error:', alertErr);
    }
  }

  return feedback;
}

// 6. Record Google Review Click
export async function recordGoogleClickInSupabase(businessId: string, feedbackId?: string): Promise<void> {
  await supabase.from('review_clicks').insert([{
    business_id: businessId,
    feedback_id: feedbackId || null,
  }]);
}

// 7. Fetch Feedback list for business
export async function getFeedbackByBusinessFromSupabase(businessId: string): Promise<FeedbackItem[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapSupabaseFeedback);
}

// 8. Fetch Platform Settings
export async function getPlatformSettingsFromSupabase(): Promise<PlatformSettings | null> {
  const { data } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  if (!data) return null;
  return {
    platformName: data.platform_name || 'ZellonAI',
    maintenanceMode: data.maintenance_mode || false,
    allowSignups: data.allow_signups ?? true,
    defaultTrialDays: data.default_trial_days || 14,
    googleSyncInterval: 30,
    supportEmail: data.support_email || 'admin@zellonai.online',
    defaultThresholdRating: data.default_threshold_rating || 5,
    requireEmailVerification: data.require_email_verification || false,
    updatedAt: data.updated_at,
  };
}

// 9. Upsert User Profile
export async function upsertProfileInSupabase(
  userId: string,
  email: string,
  displayName?: string,
  role?: string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || 'admin@zellonai.online,ssdd747346@gmail.com';
  const adminEmails = adminEmailsStr.split(',').map((e: string) => e.trim().toLowerCase());
  const resolvedRole = role || (adminEmails.includes(email.toLowerCase()) ? 'admin' : 'business_owner');

  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: email.trim(),
      display_name: displayName || email.split('@')[0],
      role: resolvedRole,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.warn('[Supabase] Error upserting profile:', error);
  }
}
