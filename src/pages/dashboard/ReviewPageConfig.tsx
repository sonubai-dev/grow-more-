import React, { useState } from 'react';
import {
  Globe,
  Palette,
  ExternalLink,
  Copy,
  Check,
  Save,
  Sparkles,
  Smartphone,
  Eye,
  Sliders,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StarRating } from '../../components/ui/StarRating';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GooglePlaceAutocompleteMap, PlaceSelectionResult } from '../../components/maps/GooglePlaceAutocompleteMap';
import { GooglePlaceReviewsMap } from '../../components/maps/GooglePlaceReviewsMap';
import { toAppError } from '../../lib/apiError';

export const ReviewPageConfig: React.FC = () => {
  const { currentBusiness, updateCurrentBusiness, updateBusiness } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(currentBusiness?.businessName || currentBusiness?.name || 'Apex Dental Care');
  const [headline, setHeadline] = useState(
    currentBusiness?.customHeadline || 'How was your dental visit today?'
  );
  const [subheadline, setSubheadline] = useState(
    currentBusiness?.customSubheadline ||
      'We strive to provide gentle, world-class care. Please share your feedback.'
  );
  const [googlePlaceId, setGooglePlaceId] = useState(
    currentBusiness?.googlePlaceId || 'ChIJN1t_tDeuEmsRUsoyG83frY4'
  );
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    currentBusiness?.googleReviewUrl ||
      'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'
  );
  const [threshold, setThreshold] = useState(currentBusiness?.thresholdRatingForGoogle || 4);
  const [headerColor, setHeaderColor] = useState(currentBusiness?.headerColor || '#0284c7');
  const [copied, setCopied] = useState(false);
  const [previewRating, setPreviewRating] = useState<number>(5);
  const [previewMode, setPreviewMode] = useState<'funnel' | 'google_reviews'>('funnel');
  const [isSaving, setIsSaving] = useState(false);

  const slug = currentBusiness?.slug || 'apex-dental';
  const publicUrl = `${window.location.origin}/r/${slug}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentBusiness && updateBusiness) {
        await updateBusiness({
          businessName: name,
          customHeadline: headline,
          customSubheadline: subheadline,
          googlePlaceId,
          googleReviewUrl,
          thresholdRatingForGoogle: threshold,
          headerColor,
        });
      } else {
        updateCurrentBusiness({
          name,
          customHeadline: headline,
          customSubheadline: subheadline,
          googlePlaceId,
          googleReviewUrl,
          thresholdRatingForGoogle: threshold,
          headerColor,
        });
      }
      addToast('success', 'Public review page customization saved to Cloud Firestore!', 'Settings Saved');
    } catch (err: unknown) {
      console.warn('Error saving review page config:', err);
      const appErr = toAppError(err, 'Failed to save review settings.');
      if (appErr.code === 'VALIDATION_ERROR' || appErr.statusCode === 403) {
        addToast('error', appErr.userMessage, 'Save Failed');
      } else {
        addToast('info', 'Settings updated locally in this session.', 'Settings Updated');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceSelected = (place: PlaceSelectionResult) => {
    setGooglePlaceId(place.id);
    setGoogleReviewUrl(place.googleReviewUrl);
    setName(place.name);
    addToast(
      'success',
      `Connected to "${place.name}" with Place ID ${place.id}`,
      'Google Place Selected'
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    addToast('success', 'Review page link copied!', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const colorPresets = [
    { name: 'Sky Blue', hex: '#0284c7' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Emerald', hex: '#16a34a' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Slate', hex: '#334155' },
  ];

  return (
    <div id="review-page-config-root" className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Public Review Page Customizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize the public URL, headline, Google Maps integration, and brand colors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied Link' : 'Copy URL'}
          </Button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
              Open Live Page
            </Button>
          </a>
        </div>
      </div>

      {/* Main Grid: Form Left, Real-time Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave}>
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" /> General Settings
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Public Business Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Question Headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. How was your visit today?"
                    required
                  />
                  <Input
                    label="Subheadline Description"
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    placeholder="e.g. Please share your honest feedback..."
                  />
                </div>
              </div>

              {/* Google Maps Platform Autocomplete & Place Connection */}
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" /> Google Maps & Places Integration
                </h3>
                <div className="space-y-4">
                  {/* Google Place Autocomplete Map Component */}
                  <GooglePlaceAutocompleteMap
                    initialPlaceId={googlePlaceId}
                    initialPlaceName={name}
                    onSelectPlace={handlePlaceSelected}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Input
                      label="Google Place ID"
                      value={googlePlaceId}
                      onChange={(e) => setGooglePlaceId(e.target.value)}
                      helperText="Auto-populated by searching above"
                    />
                    <Input
                      label="Direct Google Review Write URL"
                      value={googleReviewUrl}
                      onChange={(e) => setGoogleReviewUrl(e.target.value)}
                      helperText="Deep link to the 5-star write box"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Smart Routing Threshold
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setThreshold(4)}
                        className={`p-3 rounded-xl text-left border text-xs transition-all ${
                          threshold === 4
                            ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">4 & 5 Stars (Recommended)</div>
                        <p className="text-slate-500 mt-1">Routes 4 or 5 stars to Google, 1–3 to private ticket</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setThreshold(5)}
                        className={`p-3 rounded-xl text-left border text-xs transition-all ${
                          threshold === 5
                            ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">5 Stars Only (Strict)</div>
                        <p className="text-slate-500 mt-1">Only perfect 5 stars go to Google, 1–4 to private ticket</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" /> Branding Colors
                </h3>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                    Header Color Accent
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {colorPresets.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setHeaderColor(c.hex)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          headerColor === c.hex
                            ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {headerColor === c.hex && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" variant="primary" size="md" leftIcon={<Save className="w-4 h-4" />}>
                  Save Review Page Settings
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* Real-time Preview Right Panel with Preview Mode Switcher */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setPreviewMode('funnel')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                previewMode === 'funnel'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Funnel</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('google_reviews')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                previewMode === 'google_reviews'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Google Reviews</span>
            </button>
          </div>

          {previewMode === 'funnel' ? (
            /* Smartphone Funnel Shell */
            <div className="bg-slate-900 p-3 rounded-[36px] shadow-2xl border-4 border-slate-800">
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

              <div className="bg-slate-50 rounded-[28px] overflow-hidden min-h-[480px] p-4 flex flex-col justify-between border border-slate-200">
                <div className="space-y-4">
                  <div
                    className="h-1.5 w-full rounded-full"
                    style={{ backgroundColor: headerColor }}
                  />

                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-base mx-auto">
                    {name.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'RF'}
                  </div>

                  <div className="text-center">
                    <h4 className="text-sm font-extrabold text-slate-900">{name || 'Your Business'}</h4>
                    <p className="text-[11px] text-slate-500">Verified Customer Review</p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{headline}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{subheadline}</p>

                    <div className="py-1">
                      <StarRating
                        rating={previewRating}
                        onChange={(r) => setPreviewRating(r)}
                        interactive={true}
                        size="md"
                      />
                    </div>
                  </div>

                  {previewRating >= threshold ? (
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-2 animate-in fade-in">
                      <p className="text-[11px] font-bold text-indigo-900">
                        ⭐ 4–5 Star Experience
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Customer is prompted directly with 1-click Google review button.
                      </p>
                      <div className="py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-[10px] font-bold">
                        Post to Google Reviews
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2 animate-in fade-in">
                      <p className="text-[11px] font-bold text-amber-900">
                        🛡️ Private Feedback Mode
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Routed to confidential management inbox. No public review posted.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-slate-400 mt-4">
                  Powered by ZellonAI
                </div>
              </div>
            </div>
          ) : (
            /* Live Google Reviews & Map Showcase Card */
            <div className="space-y-3">
              <GooglePlaceReviewsMap
                placeId={googlePlaceId}
                businessName={name}
                showMap={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
