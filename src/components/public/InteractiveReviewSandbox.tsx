import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Star,
  ShieldCheck,
  ArrowRight,
  QrCode,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PresetBusiness {
  name: string;
  category: string;
  icon: string;
  googleReviewUrl?: string;
}

const PRESET_BUSINESSES: PresetBusiness[] = [
  {
    name: 'Solita Solutions',
    category: 'Software & IT Solutions',
    icon: '⚡',
    googleReviewUrl: 'https://g.page/r/CaN_yK2UD5qJEBM/review',
  },
  {
    name: 'Apex Dental Care',
    category: 'Healthcare & Dental',
    icon: '🏥',
    googleReviewUrl: 'https://g.page/r/CaN_yK2UD5qJEBM/review',
  },
  {
    name: 'The Roast Cafe',
    category: 'Restaurant & Dining',
    icon: '☕',
    googleReviewUrl: 'https://g.page/r/CaN_yK2UD5qJEBM/review',
  },
  {
    name: 'Aura Unisex Salon',
    category: 'Beauty & Wellness',
    icon: '💇',
    googleReviewUrl: 'https://g.page/r/CaN_yK2UD5qJEBM/review',
  },
  {
    name: 'Prime Auto Works',
    category: 'Automotive & Detailing',
    icon: '🔧',
    googleReviewUrl: 'https://g.page/r/CaN_yK2UD5qJEBM/review',
  },
];

export const InteractiveReviewSandbox: React.FC = () => {
  const [businessName, setBusinessName] = useState('Solita Solutions');
  const [selectedCategory, setSelectedCategory] = useState('Software & IT Solutions');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://g.page/r/CaN_yK2UD5qJEBM/review');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'phone' | 'stand'>('phone');
  const [copied, setCopied] = useState(false);
  const [simulatedGoogleRedirect, setSimulatedGoogleRedirect] = useState(false);
  const [privateFeedbackSent, setPrivateFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Generate clean slug
  const slug = businessName
    ? businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : 'your-business';

  const reviewUrl = `https://zellonai.online/r/${slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    reviewUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  const isPositive = currentDisplayRating >= 4;

  const ratingLabels: Record<number, { text: string; mood: string }> = {
    1: { text: 'Terrible Experience', mood: '😡 Unhappy Customer' },
    2: { text: 'Poor Quality', mood: '😕 Disappointed' },
    3: { text: 'Average / Neutral', mood: '😐 Needs Improvement' },
    4: { text: 'Good Experience', mood: '🙂 Satisfied Customer' },
    5: { text: 'Outstanding & Loved It!', mood: '🤩 Super Happy Advocate' },
  };

  return (
    <section id="interactive-simulator" className="py-20 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Simulator • Try Before Sign Up</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            See How ZellonAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Protects Your Business</span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Type your business name and test any star rating below. Watch how positive customers are routed to Google Maps while negative feedback is safely intercepted.
          </p>
        </div>

        {/* Main Grid: Left Controls + Right Live Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-slate-800/90 border-slate-700/80 p-6 sm:p-7 shadow-xl backdrop-blur-sm space-y-6">
              
              {/* Business Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  1. Enter Your Business Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setSimulatedGoogleRedirect(false);
                      setPrivateFeedbackSent(false);
                    }}
                    placeholder="e.g. Apex Dental Care"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {PRESET_BUSINESSES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setBusinessName(preset.name);
                        setSelectedCategory(preset.category);
                        if (preset.googleReviewUrl) {
                          setGoogleReviewUrl(preset.googleReviewUrl);
                        }
                        setSimulatedGoogleRedirect(false);
                        setPrivateFeedbackSent(false);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        businessName === preset.name
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <span className="mr-1">{preset.icon}</span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Rating Clicker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                  <span>2. Simulate Customer Star Rating</span>
                  <span className="text-xs text-indigo-400 font-normal">Tap any star</span>
                </label>

                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = starValue <= currentDisplayRating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => {
                            setRating(starValue);
                            setSimulatedGoogleRedirect(false);
                            setPrivateFeedbackSent(false);
                          }}
                          className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                          title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                              isFilled
                                ? starValue >= 4
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                                  : 'text-amber-500 fill-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-sm font-semibold text-white mt-2">
                    {ratingLabels[currentDisplayRating]?.mood}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ratingLabels[currentDisplayRating]?.text}
                  </p>
                </div>
              </div>

              {/* Dynamic Logic Explanation Card */}
              <div
                className={`rounded-xl p-4 border transition-all ${
                  isPositive
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isPositive ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="font-bold text-sm text-white flex items-center gap-2">
                      {isPositive ? (
                        <>
                          <span className="text-emerald-400">Google Review Boost Active!</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                            4-5 STARS
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-amber-400">Negative Review Shielded!</span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                            1-3 STARS
                          </span>
                        </>
                      )}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {isPositive
                        ? 'Customer is guided directly to your Google Business Profile to publish their glowing 5-star review on Google Maps in under 10 seconds!'
                        : 'Google review link is hidden! Instead, customer writes a private internal feedback note so your team can resolve it privately before it ever reaches Google Maps.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Free Trial Conversion Call To Action */}
              <div className="pt-2">
                <Link
                  to={`/signup?business=${encodeURIComponent(businessName)}&category=${encodeURIComponent(
                    selectedCategory
                  )}`}
                  className="block w-full"
                >
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 group"
                    rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  >
                    Claim /r/{slug} &amp; Free QR Stand
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-slate-400 mt-2.5">
                  ✨ Instant 14-day free trial • No credit card required • Active in 2 minutes
                </p>
              </div>

            </Card>
          </div>

          {/* Right Column: Interactive Device Mockup (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* View Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('phone')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'phone'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Customer Screen</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stand')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'stand'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Desk QR Stand Kit</span>
              </button>
            </div>

            {/* TAB 1: Mobile Phone Mockup */}
            {activeTab === 'phone' && (
              <div className="w-full max-w-[340px] sm:max-w-[360px] relative">
                {/* Smartphone Chassis */}
                <div className="relative rounded-[40px] p-3.5 bg-slate-950 border-4 border-slate-700 shadow-2xl ring-1 ring-white/10">
                  
                  {/* Top Speaker / Camera Notch */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-slate-800 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-3" />
                  </div>

                  {/* Phone Screen Canvas */}
                  <div className="rounded-[32px] bg-slate-50 text-slate-900 overflow-hidden min-h-[520px] flex flex-col shadow-inner relative">
                    
                    {/* Simulated Browser Bar */}
                    <div className="bg-slate-200/80 px-4 pt-6 pb-2 text-center border-b border-slate-300/80">
                      <div className="bg-white rounded-lg py-1 px-3 text-[11px] font-mono text-slate-600 truncate flex items-center justify-center gap-1.5 shadow-2xs">
                        <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span>zellonai.online/r/{slug}</span>
                      </div>
                    </div>

                    {/* Customer Review Page Inside Mobile Phone */}
                    <div className="p-5 flex-1 flex flex-col justify-between text-center">
                      <div>
                        {/* Business Brand Header */}
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-200 mb-3">
                          {businessName.charAt(0) || 'Z'}
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                          {businessName || 'Your Business'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Verified Local Customer Feedback
                        </p>

                        <div className="my-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                          <p className="text-xs font-semibold text-slate-700 mb-2.5">
                            How was your visit today?
                          </p>

                          {/* 5 Stars inside the phone screen */}
                          <div className="flex items-center justify-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setRating(s);
                                  setSimulatedGoogleRedirect(false);
                                  setPrivateFeedbackSent(false);
                                }}
                                className="transition-transform hover:scale-125 focus:outline-none p-0.5"
                              >
                                <Star
                                  className={`w-7 h-7 ${
                                    s <= rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* DYNAMIC RESULT INSIDE PHONE */}
                        {isPositive ? (
                          // 4-5 Stars: Direct Google Route
                          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-left space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2">
                              {/* Google G Icon */}
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                <path
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                  fill="#4285F4"
                                />
                                <path
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  fill="#34A853"
                                />
                                <path
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  fill="#FBBC05"
                                />
                                <path
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  fill="#EA4335"
                                />
                              </svg>
                              <div>
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                  Thank you for {rating} Stars!
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  Would you post this on Google Maps?
                                </p>
                              </div>
                            </div>

                            <a
                              href={googleReviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setSimulatedGoogleRedirect(true)}
                              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                            >
                              <span>Continue to Google Reviews</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {simulatedGoogleRedirect && (
                              <p className="text-[10px] text-emerald-700 font-medium text-center animate-in fade-in">
                                ✓ Opens your Google Review page in a new tab with 5 stars!
                              </p>
                            )}
                          </div>
                        ) : (
                          // 1-3 Stars: Negative Review Shielded / Private Form
                          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-left space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 text-amber-800">
                              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
                              <span className="text-xs font-bold">
                                Private Feedback Box (Google Hidden)
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-snug">
                              We are sorry we missed the mark. How can our management make this right?
                            </p>

                            <textarea
                              rows={2}
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="Describe your issue privately..."
                              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setPrivateFeedbackSent(true);
                                setFeedbackText('');
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Send Private Feedback to Owner</span>
                            </button>

                            {privateFeedbackSent && (
                              <p className="text-[10px] text-emerald-700 font-semibold text-center animate-in fade-in">
                                ✓ Private alert sent to business owner inbox! 0 bad reviews on Google.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Phone Footer */}
                      <p className="text-[10px] text-slate-400 mt-4">
                        Powered by <strong className="text-slate-600">ZellonAI</strong>
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Counter QR Stand Kit Preview */}
            {activeTab === 'stand' && (
              <div className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center animate-in fade-in duration-200">
                {/* Physical Acrylic Desk Stand Simulation */}
                <div className="w-full bg-white text-slate-900 rounded-2xl p-6 border-4 border-slate-200 shadow-2xl relative flex flex-col items-center text-center">
                  
                  {/* Stand Top Arc / Clip */}
                  <div className="w-16 h-1.5 bg-slate-300 rounded-full mb-4" />

                  {/* Header */}
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Share Your Feedback
                  </p>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5 leading-snug">
                    {businessName || 'Your Business'}
                  </h4>

                  {/* 5-Star Graphics */}
                  <div className="flex items-center justify-center gap-1 my-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Scannable Live QR Code Box */}
                  <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm my-2">
                    <img
                      src={qrCodeUrl}
                      alt={`${businessName} QR Stand`}
                      className="w-44 h-44 object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Scan Instructions */}
                  <p className="text-xs font-semibold text-slate-700 mt-2">
                    Scan with any phone camera
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Takes only 5 seconds • No app download
                  </p>

                  {/* Stand Base Visual */}
                  <div className="w-full pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>ZellonAI Smart Stand</span>
                    <span className="font-mono text-indigo-600 font-bold">/r/{slug}</span>
                  </div>
                </div>

                {/* Stand Base Reflection */}
                <div className="w-48 h-3 bg-slate-700/40 rounded-full blur-xs -mt-1 mb-4" />

                {/* Stand Action Buttons */}
                <div className="w-full flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
                  </button>

                  <Link
                    to={`/signup?business=${encodeURIComponent(businessName)}`}
                    className="flex-1"
                  >
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Get Stand Free →</span>
                    </button>
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Social Proof Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs text-slate-400">
          <div>
            <strong className="block text-2xl font-black text-white">4.9 / 5</strong>
            <span>Average Google Rating Boost</span>
          </div>
          <div>
            <strong className="block text-2xl font-black text-indigo-400">83%</strong>
            <span>Unhappy Feedback Intercepted</span>
          </div>
          <div>
            <strong className="block text-2xl font-black text-white">&lt; 3 Sec</strong>
            <span>Customer Scan-to-Rate Time</span>
          </div>
          <div>
            <strong className="block text-2xl font-black text-emerald-400">100%</strong>
            <span>Google API &amp; Policy Compliant</span>
          </div>
        </div>

      </div>
    </section>
  );
};
