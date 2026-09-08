import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  ShieldCheck,
  Globe,
  Star,
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GooglePlaceAutocompleteMap, PlaceSelectionResult } from '../../components/maps/GooglePlaceAutocompleteMap';
import { isValidUrl } from '../../services/businessService';
import { toAppError } from '../../lib/apiError';

export const BusinessProfilePage: React.FC = () => {
  const { currentBusiness, updateBusiness } = useAuth();
  const { addToast } = useToast();

  const [businessName, setBusinessName] = useState(currentBusiness?.businessName || currentBusiness?.name || '');
  const [ownerName, setOwnerName] = useState(currentBusiness?.ownerName || '');
  const [category, setCategory] = useState(currentBusiness?.category || 'Healthcare & Dental');
  const [email, setEmail] = useState(currentBusiness?.email || currentBusiness?.contactEmail || '');
  const [phone, setPhone] = useState(currentBusiness?.phone || '');
  const [address, setAddress] = useState(currentBusiness?.address || '');
  const [website, setWebsite] = useState(currentBusiness?.website || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(currentBusiness?.googleReviewUrl || '');
  const [googlePlaceId, setGooglePlaceId] = useState(currentBusiness?.googlePlaceId || '');

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(currentBusiness?.logoUrl || '');

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);

  // Sync when currentBusiness changes
  useEffect(() => {
    if (currentBusiness) {
      setBusinessName(currentBusiness.businessName || currentBusiness.name || '');
      setOwnerName(currentBusiness.ownerName || '');
      setCategory(currentBusiness.category || 'Healthcare & Dental');
      setEmail(currentBusiness.email || currentBusiness.contactEmail || '');
      setPhone(currentBusiness.phone || '');
      setAddress(currentBusiness.address || '');
      setWebsite(currentBusiness.website || '');
      setGoogleReviewUrl(currentBusiness.googleReviewUrl || '');
      setGooglePlaceId(currentBusiness.googlePlaceId || '');
      if (currentBusiness.logoUrl && !logoFile) {
        setLogoPreview(currentBusiness.logoUrl);
      }
    }
  }, [currentBusiness]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Logo image file must be less than 5MB.');
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

  const handlePlaceSelect = (place: PlaceSelectionResult) => {
    setBusinessName(place.name);
    setAddress(place.formattedAddress);
    setGooglePlaceId(place.id);
    if (place.googleReviewUrl) {
      setGoogleReviewUrl(place.googleReviewUrl);
    }
    addToast('info', `Updated address and place ID for ${place.name}`, 'Google Place Linked');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Business Name is required.');
      return;
    }
    if (!googleReviewUrl.trim()) {
      setErrorMessage('Google Review URL is required.');
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

    setIsSaving(true);
    try {
      await updateBusiness({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        category,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
        googlePlaceId: googlePlaceId.trim(),
        logoFile: logoFile,
        logoUrl: logoPreview && !logoFile ? logoPreview : undefined,
      });

      setLogoFile(null);
      addToast('success', 'Business profile saved to Cloud Firestore!', 'Changes Saved');
    } catch (err: unknown) {
      console.error('Save business profile error:', err);
      const appErr = toAppError(err, 'Failed to update business profile.');
      setErrorMessage(appErr.userMessage);
      addToast('error', appErr.userMessage, 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const publicReviewUrl = currentBusiness
    ? `${window.location.origin}/r/${currentBusiness.slug}`
    : `${window.location.origin}/r/apex-dental`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicReviewUrl);
    setCopiedSlug(true);
    addToast('success', 'Public review link copied to clipboard!', 'Copied');
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  return (
    <div id="business-profile-root" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header & Slug Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Business Profile & Location
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your official business details, verified Google review funnel, and logo stored in Firebase.
          </p>
        </div>

        {currentBusiness?.slug && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 shadow-xs text-xs">
            <span className="text-slate-400 font-semibold">Public URL:</span>
            <span className="font-mono text-indigo-600 font-bold">/r/{currentBusiness.slug}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
              title="Copy URL"
            >
              {copiedSlug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`/r/${currentBusiness.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
              title="Open public review page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
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

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          {/* Logo & Identity Preview */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
            {logoPreview ? (
              <div className="relative w-20 h-20 rounded-2xl bg-slate-50 border-2 border-indigo-200 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                <img src={logoPreview} alt="Business logo" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                  title="Remove logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-2xl shadow-xs shrink-0">
                {businessName.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'RF'}
              </div>
            )}

            <div className="text-center sm:text-left space-y-2 flex-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{businessName || 'Your Business Name'}</h3>
                <p className="text-xs text-slate-500">{category}</p>
              </div>

              <div>
                <label
                  htmlFor="change-profile-logo"
                  className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{logoPreview ? 'Change Logo Image' : 'Upload Logo'}</span>
                  <input
                    id="change-profile-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Owner / Contact Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <div>
              <label htmlFor="edit-category" className="text-sm font-medium text-slate-700 block mb-1.5">
                Business Category
              </label>
              <select
                id="edit-category"
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
                <option value="Other">Other Local Business</option>
              </select>
            </div>

            <Input
              label="Contact / Notification Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Receives urgent alerts on negative 1–3 star complaints"
            />

            <Input
              label="Business Phone"
              type="tel"
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

            <div className="sm:col-span-2">
              <Input
                label="Physical Address / Suite"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Google Review Funnel Setting */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Google Review Direct URL *</span>
            </h3>
            <Input
              label="Direct Google Review URL"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              required
              leftIcon={<LinkIcon className="w-4 h-4 text-indigo-600" />}
              helperText="Format: https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
            />
          </div>

          {/* Google Places Autocomplete Search & Pinning */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Google Place Autocomplete & Locator
                </h4>
                <p className="text-xs text-slate-500">
                  Search on Google Maps to update Place ID and address coordinates
                </p>
              </div>
            </div>

            <GooglePlaceAutocompleteMap
              initialPlaceId={googlePlaceId}
              initialPlaceName={businessName}
              initialAddress={address}
              onSelectPlace={handlePlaceSelect}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Changes synced to Firestore</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving to Firestore...' : 'Save Profile Changes'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
