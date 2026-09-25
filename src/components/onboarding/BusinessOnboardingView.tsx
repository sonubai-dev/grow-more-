import React, { useState, useEffect } from 'react';
import {
  Building2,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  X,
  Loader2,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { generateBaseSlug, isValidUrl } from '../../services/businessService';
import { GooglePlaceAutocompleteMap, PlaceSelectionResult } from '../maps/GooglePlaceAutocompleteMap';
import { toAppError } from '../../lib/apiError';

export const BusinessOnboardingView: React.FC = () => {
  const { user, createBusiness } = useAuth();
  const { addToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [category, setCategory] = useState('Healthcare & Dental');
  const [customCategory, setCustomCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');

  // Prefill from signup draft if available
  useEffect(() => {
    try {
      const pendingStr = localStorage.getItem('reviewflow_pending_onboarding');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending.businessName) setBusinessName(pending.businessName);
        if (pending.ownerName) setOwnerName(pending.ownerName);
        if (pending.category) setCategory(pending.category);
      }
    } catch (e) {
      console.warn('Failed to parse pending onboarding data', e);
    }
  }, []);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Form handling & validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleMapHelper, setShowGoogleMapHelper] = useState(false);

  // Live slug generation
  const currentSlug = generateBaseSlug(businessName || 'my-business');

  // Handle Logo file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Logo file size must be less than 5MB.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  // Google Place Autocomplete Selection
  const handlePlaceSelect = (place: PlaceSelectionResult) => {
    setBusinessName(place.name);
    setAddress(place.formattedAddress);
    setGooglePlaceId(place.id);
    if (place.googleReviewUrl) {
      setGoogleReviewUrl(place.googleReviewUrl);
    } else {
      setGoogleReviewUrl(`https://search.google.com/local/writereview?placeid=${place.id}`);
    }
    addToast('success', `Imported details for ${place.name} from Google Maps!`, 'Google Place Linked');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Required Fields
    if (!businessName.trim()) {
      setErrorMessage('Business Name is required.');
      return;
    }
    if (!ownerName.trim()) {
      setErrorMessage('Owner Name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Business Contact Email is required.');
      return;
    }
    if (!googleReviewUrl.trim()) {
      setErrorMessage('Google Review URL is required to route 4 & 5-star customer reviews.');
      return;
    }
    if (!isValidUrl(googleReviewUrl)) {
      setErrorMessage('Please enter a valid Google Review URL (must start with https:// or http://).');
      return;
    }
    if (website.trim() && !isValidUrl(website)) {
      setErrorMessage('Please enter a valid Website URL (must start with https:// or http://).');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    setIsSubmitting(true);
    try {
      const newBiz = await createBusiness({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category: finalCategory,
        address: address.trim(),
        website: website.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
        googlePlaceId: googlePlaceId.trim(),
        logoFile: logoFile,
      });

      try {
        localStorage.removeItem('reviewflow_pending_onboarding');
      } catch {}

      addToast(
        'success',
        `Welcome to ZellonAI! Your public review portal is live at /r/${newBiz.slug}`,
        'Business Created!'
      );
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      console.error('Business onboarding error:', err);
      const appErr = toAppError(err, 'Failed to create business profile. Please check your details.');
      setErrorMessage(appErr.userMessage);
      addToast('error', appErr.userMessage, 'Onboarding Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="business-onboarding-container" className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Initial Setup & Onboarding
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Create your business profile
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Set up your official business profile to generate your unique review funnel, QR codes, and automated Google review routing.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Google Place Search Helper Toggle */}
        <Card className="p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0 border border-white/10">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  1-Click Auto-Fill with Google Maps
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">Fast</span>
                </h3>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Search your business name on Google to instantly retrieve your verified address and direct review link.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowGoogleMapHelper(!showGoogleMapHelper)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0 w-full sm:w-auto"
            >
              {showGoogleMapHelper ? 'Hide Map Search' : 'Open Google Search'}
            </Button>
          </div>

          {showGoogleMapHelper && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <GooglePlaceAutocompleteMap
                onPlaceSelect={handlePlaceSelect}
                initialPlaceId={googlePlaceId}
              />
            </div>
          )}
        </Card>

        {/* Main Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm">
            {/* Section 1: Business Identity & Logo */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>1. Business Identity</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Name *"
                  placeholder="e.g. Sharma Dental Clinic"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  leftIcon={<Building2 className="w-4 h-4" />}
                />

                <Input
                  label="Owner / Manager Name *"
                  placeholder="e.g. Dr. Aryan Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  leftIcon={<UserIcon className="w-4 h-4" />}
                />
              </div>

              {/* Live URL Slug Preview */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-medium">
                  <LinkIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Your Dedicated Review Link:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    /r/{currentSlug}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal">
                  (Unique suffix auto-appended if taken)
                </span>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">
                  Business Logo (Firebase Storage)
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-20 h-20 rounded-2xl border-2 border-indigo-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-xs">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                        title="Remove Logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Building2 className="w-7 h-7" />
                      <span className="text-[9px] uppercase font-bold mt-1">No Logo</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label
                      htmlFor="onboarding-logo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 text-slate-700 text-xs font-semibold shadow-xs transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{logoPreview ? 'Change Logo Image' : 'Upload Business Logo'}</span>
                      <input
                        id="onboarding-logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">
                      PNG, JPG, SVG, or WEBP up to 5MB. Stored securely in Cloud Storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Contact & Industry */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>2. Contact & Industry Category</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onboarding-category" className="text-sm font-medium text-slate-700 block mb-1.5">
                    Business Category *
                  </label>
                  <select
                    id="onboarding-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  >
                    <option value="Healthcare & Dental">Healthcare & Dental</option>
                    <option value="Restaurant & Dining">Restaurant & Dining</option>
                    <option value="Automotive & Repair">Automotive & Repair</option>
                    <option value="Beauty, Spa & Wellness">Beauty, Spa & Wellness</option>
                    <option value="Home & Trade Services">Home & Trade Services</option>
                    <option value="Legal & Financial">Legal & Financial</option>
                    <option value="Fitness & Recreation">Fitness & Recreation</option>
                    <option value="Retail & Boutique">Retail & Boutique</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>

                {category === 'Other' && (
                  <Input
                    label="Specify Category Name"
                    placeholder="e.g. Specialty Pet Care"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                )}

                <Input
                  label="Contact Email *"
                  type="email"
                  placeholder="contact@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="Used to send private alerts for 1–3 star feedback"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Company Website"
                  type="url"
                  placeholder="https://www.yourbusiness.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  leftIcon={<Globe className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Physical Address / Service Area"
                placeholder="e.g. 100 Main Street, Suite 400, Seattle, WA 98101"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Google Review Funnel Setup */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>3. Google Review URL (Required)</span>
              </h2>

              <p className="text-xs text-slate-500">
                When happy customers leave a 4 or 5-star rating on your public page, ZellonAI automatically opens this Google review box.
              </p>

              <Input
                label="Direct Google Review URL *"
                placeholder="https://search.google.com/local/writereview?placeid=..."
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                required
                leftIcon={<LinkIcon className="w-4 h-4 text-indigo-600" />}
                helperText="Format: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID or your Google Maps shortlink"
              />

              {/* Sample Google Review Link Generator shortcut */}
              {!googleReviewUrl && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500 font-medium">Quick examples:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setGoogleReviewUrl('https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4')
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg font-semibold"
                  >
                    Insert Demo Google Review Link
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure Firestore Document with Owner ABAC Isolation</span>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Profile in Firestore...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Business Profile
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};
