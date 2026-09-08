import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarRating } from '../../components/ui/StarRating';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Business, FeedbackRating } from '../../types';

import { getBusinessBySlug, PublicBusinessProfile } from '../../services/businessService';
import {
  submitFeedback,
  recordGoogleReviewClick,
} from '../../services/feedbackService';
import { AppError } from '../../lib/apiError';
import {
  CheckCircle2,
  Star,
  ExternalLink,
  Heart,
  Sparkles,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Home,
  Loader2,
  ArrowRight,
  Send,
  MessageSquare,
} from 'lucide-react';
import { ReviewTemplateGenerator } from '../../components/public/ReviewTemplateGenerator';

export const PublicReviewPage: React.FC = () => {
  const params = useParams<{ slug?: string; businessSlug?: string }>();
  const rawSlug = params.slug || params.businessSlug || '';

  const [business, setBusiness] = useState<PublicBusinessProfile | Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // Rating State: 0 (unselected), 1-5
  const [rating, setRating] = useState<FeedbackRating | 0>(0);

  // 1-4 Star Feedback Form Fields
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted1to4, setSubmitted1to4] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 5-Star State & Google Redirect
  const [redirectingGoogle, setRedirectingGoogle] = useState(false);
  const [googleRedirectSuccess, setGoogleRedirectSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBusinessData() {
      setLoading(true);
      setNotFound(false);
      setInvalidLink(false);

      if (!rawSlug) {
        if (isMounted) {
          setBusiness(null);
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      // Check for malformed slug
      if (!/^[a-zA-Z0-9_-]+$/.test(rawSlug)) {
        if (isMounted) {
          setBusiness(null);
          setInvalidLink(true);
          setLoading(false);
        }
        return;
      }

      try {
        const firestoreBiz = await getBusinessBySlug(rawSlug);
        if (firestoreBiz) {
          if (isMounted) {
            setBusiness(firestoreBiz);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setBusiness(null);
          setNotFound(true);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading public business:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    loadBusinessData();

    return () => {
      isMounted = false;
    };
  }, [rawSlug]);

  // Dynamic business-specific SEO metadata without exposing private credentials
  useEffect(() => {
    const defaultTitle = 'ZellonAI — Customer Feedback & Google Review Management';
    const defaultDesc = 'ZellonAI empowers local businesses to collect private customer feedback, prevent negative public reviews, and seamlessly route happy 5-star customers directly to Google Reviews.';
    const canonicalLink = document.querySelector('link[rel="canonical"]');

    if (business) {
      const name = business.businessName || business.name || 'Verified Business';
      const pageTitle = `ZellonAI Review — ${name}`;
      const pageDesc = `Share your verified customer feedback and review experience for ${name} on ZellonAI.`;
      const canonicalUrl = `https://zellonai.online/r/${business.slug}`;

      document.title = pageTitle;

      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      }

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', pageDesc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', pageTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', pageDesc);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
    } else if (notFound) {
      document.title = 'Business Not Found — ZellonAI';
    } else if (invalidLink) {
      document.title = 'Invalid Review Link — ZellonAI';
    }

    return () => {
      document.title = defaultTitle;
      if (canonicalLink) canonicalLink.setAttribute('href', 'https://zellonai.online');
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', defaultDesc);
    };
  }, [business, notFound, invalidLink]);

  const businessDisplayName = business?.businessName || business?.name || 'Verified Business';
  const headerAccentColor = business?.headerColor || '#4f46e5';
  const threshold = business?.thresholdRatingForGoogle ?? 4;
  const isGoogleEligible = rating >= threshold;
  const targetGoogleUrl =
    business?.googleReviewUrl?.trim() ||
    (business?.googlePlaceId
      ? `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`
      : 'https://search.google.com/local/writereview');

  const initials = businessDisplayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || 'BZ';

  // Handle Private Feedback Submission for ratings below threshold
  const handle1to4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitted1to4 || !business || rating === 0 || rating >= threshold) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await submitFeedback({
        businessId: business.id,
        ownerId: business.ownerId,
        rating: rating as FeedbackRating,
        comment: comment.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        source: 'public_review_page',
        googleRedirected: false,
      });

      setSubmitted1to4(true);
      try {
        sessionStorage.setItem(`zellonai_submitted_${business.id}`, 'true');
      } catch {}
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      if (err instanceof AppError) {
        setFormError(err.userMessage);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Google Review button click (for rating >= threshold)
  const handleGoogleReviewClick = async () => {
    if (redirectingGoogle || googleRedirectSuccess || !business) return;

    setRedirectingGoogle(true);
    const googleUrl = targetGoogleUrl;

    // Open Google review immediately in user gesture context to avoid popup blocker
    const win = window.open(googleUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = googleUrl;
    }
    setGoogleRedirectSuccess(true);
    try {
      sessionStorage.setItem(`zellonai_submitted_${business.id}`, 'true');
    } catch {}

    // Track asynchronously after the window is already open
    try {
      const fbRecord = await submitFeedback({
        businessId: business.id,
        ownerId: business.ownerId,
        rating: (rating || 5) as FeedbackRating,
        comment: 'Customer initiated Google review',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        source: 'public_review_page',
        googleRedirected: true,
      });
      await recordGoogleReviewClick(business.id, fbRecord?.id || null, business.ownerId);
    } catch (err) {
      console.warn('Error during click tracking:', err);
    } finally {
      setRedirectingGoogle(false);
    }
  };

  // Zero-CLS Card Skeleton Loading View
  if (loading) {
    return (
      <div id="public-review-loading" className="min-h-screen bg-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg mx-auto flex items-center justify-between text-xs text-slate-400 mb-4 animate-pulse">
          <div className="h-4 w-28 bg-slate-200 rounded-md" />
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
        </div>
        <div className="w-full max-w-lg mx-auto my-auto">
          <div className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl overflow-hidden relative animate-pulse space-y-6">
            <div className="h-2 bg-indigo-100 absolute top-0 left-0 right-0" />
            <div className="flex flex-col items-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200" />
              <div className="h-6 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-32 bg-slate-100 rounded-md" />
            </div>
            <div className="space-y-3 py-4 text-center">
              <div className="h-5 w-64 bg-slate-200 rounded-md mx-auto" />
              <div className="h-4 w-44 bg-slate-100 rounded-md mx-auto" />
              <div className="flex justify-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400">
          Powered by <span className="text-indigo-600 font-semibold">ZellonAI</span>
        </div>
      </div>
    );
  }

  // Invalid Review Link View
  if (invalidLink) {
    return (
      <div id="business-invalid-link-page" className="min-h-screen bg-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto text-center">
          <Card className="p-8 sm:p-10 bg-white border border-slate-200/90 shadow-xl rounded-3xl space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold">
                Invalid Review Link
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Malformed Review Link
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The link you followed contains invalid characters. Please verify the URL provided on your receipt or QR stand.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link to="/">
                <Button variant="primary" className="w-full justify-center" size="md" leftIcon={<Home className="w-4 h-4" />}>
                  Return to ZellonAI Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-400">
          Powered by <Link to="/" className="text-indigo-600 hover:underline font-semibold">ZellonAI</Link>
        </div>
      </div>
    );
  }

  // 404 Not Found View
  if (notFound || !business) {
    return (
      <div id="business-not-found-page" className="min-h-screen bg-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto text-center">
          <Card className="p-8 sm:p-10 bg-white border border-slate-200/90 shadow-xl rounded-3xl space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                404 • Not Found
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Business Portal Not Found
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The review link{' '}
                <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                  /r/{rawSlug}
                </span>{' '}
                does not correspond to an active business or may have been renamed.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link to="/">
                <Button variant="primary" className="w-full justify-center" size="md" leftIcon={<Home className="w-4 h-4" />}>
                  Return to ZellonAI Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-400">
          Powered by <Link to="/" className="text-indigo-600 hover:underline font-semibold">ZellonAI</Link>
        </div>
      </div>
    );
  }

  // Suspended Business View
  if (business.status === 'suspended' || business.isActive === false) {
    return (
      <div id="business-suspended-page" className="min-h-screen bg-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto my-auto text-center">
          <Card className="p-8 sm:p-10 bg-white border border-slate-200/90 shadow-xl rounded-3xl space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-mono font-bold">
                Account Suspended
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Feedback Channel Suspended
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Feedback collection for <strong>{businessDisplayName}</strong> is currently paused or inactive by platform administration.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link to="/">
                <Button variant="outline" className="w-full justify-center" size="md" leftIcon={<Home className="w-4 h-4" />}>
                  Return to Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="text-center text-xs text-slate-400">
          Powered by <Link to="/" className="text-indigo-600 hover:underline font-semibold">ZellonAI</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      id="public-review-page-root"
      className="min-h-screen bg-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white"
    >
      {/* Top Header */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between text-xs text-slate-500 mb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-indigo-600">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>ZellonAI Verified</span>
        </Link>
        <span className="inline-flex items-center gap-1 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Customer Portal
        </span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto my-auto space-y-4">
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-xl rounded-3xl overflow-hidden relative">
          {/* Top Brand Accent Strip */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: headerAccentColor }}
          />

          {/* Business Branding */}
          <div className="text-center space-y-3 pt-2">
            {business.logoUrl && !logoFailed ? (
              <div className="w-20 h-20 rounded-2xl border-2 border-indigo-100 bg-white shadow-xs mx-auto overflow-hidden flex items-center justify-center p-1">
                <img
                  src={business.logoUrl}
                  alt={`${businessDisplayName} Logo`}
                  width="80"
                  height="80"
                  loading="eager"
                  decoding="async"
                  onError={() => setLogoFailed(true)}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-xl shadow-xs mx-auto">
                {initials}
              </div>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {businessDisplayName}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {business.category}
              </p>
              {business.address && (
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-1 truncate max-w-xs mx-auto">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{business.address}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            {/* ============================================================== */}
            {/* SUBMITTED STATE: 1-4 Stars */}
            {/* ============================================================== */}
            {submitted1to4 ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Thank You for Your Feedback</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Your response has been received. Our management team personally reviews every submission to ensure the highest standard of care.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted1to4(false);
                      setRating(0);
                      setComment('');
                      setCustomerName('');
                      setCustomerEmail('');
                      setCustomerPhone('');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline cursor-pointer"
                  >
                    Submit another response
                  </button>
                </div>
              </div>
            ) : isGoogleEligible && rating === 5 ? (
              /* ============================================================== */
              /* STEP 2: 5-STAR TEMPLATE GENERATOR */
              /* ============================================================== */
              <div className="space-y-4 animate-in fade-in duration-200 pt-1 flex flex-col items-center">
                <div className="flex flex-col items-center gap-1.5 mb-2">
                  <StarRating
                    id="star-display-eligible-5"
                    rating={rating}
                    onChange={(r) => setRating(r)}
                    interactive={true}
                    size="lg"
                  />
                  <button
                    type="button"
                    onClick={() => setRating(0)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Change rating
                  </button>
                </div>
                
                <ReviewTemplateGenerator 
                  businessData={{
                    businessName: businessDisplayName,
                    category: business.category,
                    location: business.address
                  }}
                  onContinueToGoogle={handleGoogleReviewClick}
                  isRedirecting={redirectingGoogle}
                />

                {googleRedirectSuccess && (
                  <div className="w-full mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Review page opened in a new tab!</p>
                    <p className="text-[11px] text-slate-500">
                      If the window did not open,{' '}
                      <a
                        href={targetGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline font-semibold"
                      >
                        click here to open Google Reviews
                      </a>.
                    </p>
                  </div>
                )}
              </div>
            ) : isGoogleEligible && rating >= 1 ? (
              /* ============================================================== */
              /* STEP 2: GOOGLE REVIEW FLOW (Rating >= threshold) */
              /* ============================================================== */
              <div className="space-y-6 animate-in fade-in duration-200 pt-1 text-center">
                {/* Rating display & Change button */}
                <div className="flex flex-col items-center gap-1.5">
                  <StarRating
                    id="star-display-eligible"
                    rating={rating}
                    onChange={(r) => setRating(r)}
                    interactive={true}
                    size="lg"
                  />
                  <button
                    type="button"
                    onClick={() => setRating(0)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Change rating
                  </button>
                </div>

                {/* Customer Appreciation Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white px-3 py-1 rounded-full shadow-2xs border border-emerald-100 mx-auto">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{rating === 5 ? '5-Star Experience' : 'Great Experience'}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                    Thank you! We're glad you had a wonderful visit.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Would you take 10 seconds to share your experience on Google? It helps others find us!
                  </p>
                </div>

                {/* Leave a Google Review Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    id="leave-google-review-btn"
                    onClick={handleGoogleReviewClick}
                    disabled={redirectingGoogle}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm sm:text-base rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-75"
                  >
                    {redirectingGoogle ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Write a Review on Google</span>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-tight">
                    You will be redirected directly to Google's official review page for {businessDisplayName}.
                  </p>
                </div>

                {googleRedirectSuccess && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800">Review page opened in a new tab!</p>
                    <p className="text-[11px] text-slate-500">
                      If the window did not open,{' '}
                      <a
                        href={targetGoogleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline font-semibold"
                      >
                        click here to open Google Reviews
                      </a>.
                    </p>
                  </div>
                )}
              </div>
            ) : rating >= 1 && rating < threshold ? (
              /* ============================================================== */
              /* STEP 2: PRIVATE RESOLUTION FEEDBACK FORM */
              /* ============================================================== */
              <div className="space-y-5 animate-in fade-in duration-200 pt-1">
                {/* Rating display & Change button */}
                <div className="flex flex-col items-center gap-1.5 pb-1">
                  <StarRating
                    id="star-picker-1-4"
                    rating={rating}
                    onChange={(r) => setRating(r)}
                    interactive={true}
                    size="lg"
                  />
                  <button
                    type="button"
                    onClick={() => setRating(0)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                  >
                    Change rating
                  </button>
                </div>

                {/* Empathetic Prompt */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Heart className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>We value your feedback</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Please tell us what went wrong so we can address your concerns directly and improve your next visit.
                  </p>
                </div>

                {/* Feedback Form */}
                <form onSubmit={handle1to4Submit} className="space-y-4">
                  {/* Comment field */}
                  <div>
                    <label htmlFor="feedback-comment" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Comments <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="feedback-comment"
                      required
                      rows={3}
                      disabled={submitting}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Please share what happened and how we can make things right..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  {/* Customer Name */}
                  <div>
                    <Input
                      id="feedback-customer-name"
                      label="Your Name (Optional)"
                      placeholder="e.g. Sarah M."
                      disabled={submitting}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  {/* Customer Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      id="feedback-customer-email"
                      type="email"
                      label="Email (Optional)"
                      placeholder="sarah@example.com"
                      disabled={submitting}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                    <Input
                      id="feedback-customer-phone"
                      type="tel"
                      label="Phone (Optional)"
                      placeholder="(555) 000-0000"
                      disabled={submitting}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <Button
                    id="submit-customer-feedback-btn"
                    type="submit"
                    variant="primary"
                    className="w-full justify-center mt-2"
                    size="lg"
                    disabled={submitting || !comment.trim()}
                    leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  >
                    {submitting ? 'Submitting Feedback...' : 'Send Private Feedback to Management'}
                  </Button>

                  <p className="text-[11px] text-slate-400 text-center leading-tight">
                    🔒 100% Confidential: Delivered directly to {businessDisplayName}'s management.
                  </p>
                </form>
              </div>
            ) : (
              /* ============================================================== */
              /* STEP 1: INITIAL STAR RATING SELECTION */
              /* ============================================================== */
              <div className="text-center py-4 space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {business.customHeadline || `How was your experience with ${businessDisplayName}?`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {business.customSubheadline || 'Please tap a star rating below to share your feedback:'}
                  </p>
                </div>

                <div className="py-2 flex justify-center">
                  <StarRating
                    id="public-star-selector-step1"
                    rating={rating}
                    onChange={(r) => setRating(r)}
                    interactive={true}
                    size="xl"
                    showLabel={true}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="w-full max-w-lg mx-auto text-center text-xs text-slate-400 pt-6">
        <span>Powered by </span>
        <Link to="/" className="text-indigo-600 hover:underline font-semibold">
          ZellonAI
        </Link>
        <span> • Direct Reputation & Customer Feedback Management</span>
      </div>
    </div>
  );
};
