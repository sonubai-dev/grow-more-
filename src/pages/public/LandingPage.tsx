import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  QrCode,
  BellRing,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Building,
  Smartphone,
  Lock,
  ThumbsUp,
  HeartHandshake
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = 'ZellonAI — AI-Powered Customer Feedback & Google Review Management';
    const desc = 'Grow your local business with ZellonAI. Automatically route happy 5-star customers to Google Reviews while capturing negative feedback privately.';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute('href', 'https://zellonai.online');
    
    // Inject SoftwareApplication / Organization Schema
    let schemaScript = document.getElementById('seo-zellonai-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'seo-zellonai-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "ZellonAI",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "url": "https://zellonai.online",
          "description": desc,
          "offers": {
            "@type": "Offer",
            "price": "99.00",
            "priceCurrency": "INR"
          }
        },
        {
          "@type": "Organization",
          "name": "ZellonAI",
          "url": "https://zellonai.online",
          "logo": "https://zellonai.online/logo.png"
        }
      ]
    };
    schemaScript.textContent = JSON.stringify(schemaData);
    
    return () => {
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  const faqs = [
    {
      q: 'How does ZellonAI help get more Google Reviews?',
      a: 'ZellonAI gives your business a unique, frictionless review link and printable QR code. When happy customers rate you 4 or 5 stars, ZellonAI automatically prompts and redirects them directly into Google Maps to post their 5-star review in one click.',
    },
    {
      q: 'What happens when a customer has a negative experience (1–3 stars)?',
      a: 'Instead of posting publicly to Google or Yelp, customers giving 1–3 stars are routed to a private, confidential feedback form. You and your management team receive an instant alert so you can resolve the issue privately before it hurts your public rating.',
    },
    {
      q: 'Is ZellonAI compliant with Google review policies?',
      a: 'Yes. ZellonAI ensures clear, transparent customer communications and encourages genuine feedback across all customer touchpoints while helping businesses systematically resolve customer dissatisfaction.',
    },
    {
      q: 'Do customers need to download an app?',
      a: 'Not at all. The review link opens instantly in any mobile browser (Safari, Chrome, etc.) via SMS, email, or QR code scan with zero sign-in barriers.',
    },
    {
      q: 'How quickly can we set up ZellonAI?',
      a: 'Under 2 minutes. Enter your business name, connect your Google Maps Place ID, and your public review link (`ZellonAI.com/r/your-business`) and QR code are instantly active.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₹99',
      period: '/month',
      description: 'Simple and honest starter plan for single-location small businesses.',
      features: [
        '1 Business Location',
        'Custom Review Link (/r/your-name)',
        'Printable QR Code Generator',
        'Smart Feedback Routing',
        'Email Alerts on Negative Feedback',
        'Standard Analytics Dashboard',
      ],
      popular: false,
      cta: 'Get Started at ₹99',
    },
    {
      name: 'Growth',
      price: '₹499',
      period: '/month',
      description: 'Our most popular plan for dental offices, restaurants, and clinics.',
      features: [
        'Up to 3 Business Locations',
        'Automated Google Review Redirect',
        'Instant SMS & Email Alerts',
        'Custom Branding & Color Customizer',
        'In-depth Conversion Analytics',
        'Team Member Access (5 seats)',
        'Priority Customer Support',
      ],
      popular: true,
      cta: 'Get Started at ₹499',
    },
    {
      name: 'Enterprise',
      price: '₹1,499',
      period: '/month',
      description: 'For multi-location franchises, medical groups, and agencies.',
      features: [
        'Unlimited Business Locations',
        'Multi-Tenant Admin Portal',
        'Custom Domain Support',
        'API & Webhook Integrations',
        'Dedicated Account Manager',
        'Custom Staff Training & SLA',
      ],
      popular: false,
      cta: 'Get Enterprise at ₹1,499',
    },
  ];

  return (
    <div id="landing-page-root" className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100 bg-linear-to-b from-indigo-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold tracking-wide border border-indigo-200/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>The #1 Google Review & Feedback Engine for Local Businesses</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Get More <span className="text-indigo-600">5-Star Google Reviews</span> and Catch Complaints Privately
            </h1>

            {/* Subheadline / Product Explanation */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              ZellonAI gives your business a custom review link. Happy customers are guided to Google Reviews in seconds, while unhappy customers submit private feedback directly to you.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button id="hero-cta-signup" variant="primary" size="lg" className="w-full sm:w-auto shadow-md shadow-indigo-200" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Free 14-Day Trial
                </Button>
              </Link>
              <Link to="/r/apex-dental" className="w-full sm:w-auto">
                <Button id="hero-cta-demo" variant="outline" size="lg" className="w-full sm:w-auto" leftIcon={<Star className="w-4 h-4 text-amber-500 fill-amber-500" />}>
                  Try Live Review Page
                </Button>
              </Link>
            </div>

            {/* Micro reassurance badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Setup in Under 2 Minutes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cancel Anytime
              </span>
            </div>
          </div>

          {/* Product Dashboard Visual Preview */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-2xl p-2 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl backdrop-blur-xs">
              <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-inner">
                {/* Mock Window Top Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-slate-500 ml-2">https://ZellonAI.com/dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Live Preview</span>
                  </div>
                </div>

                {/* Dashboard Screenshot Mock Layout */}
                <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Total Feedback</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">148</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">↑ +24% this month</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Average Rating</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1">
                      4.8 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Top 5% in category</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">5-Star Feedback</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">126</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">85% satisfaction</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium">Google Review Clicks</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">94</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">74.6% conversion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Simple 3-Step Flow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How ZellonAI Protects and Boosts Your Reputation
            </p>
            <p className="text-slate-600 text-base mt-3">
              A frictionless bridge between your counter, tables, or checkout and your public Google Maps listing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative p-6 sm:p-8 bg-white border border-slate-200 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Share Your Custom Link</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Customers scan your desk QR stand, click your SMS checkout receipt, or visit your branded link (e.g. <span className="font-mono text-indigo-600 font-semibold">ZellonAI.com/r/your-biz</span>).
              </p>
              <div className="mt-auto w-full pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>QR stands, SMS, & email ready</span>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="relative p-6 sm:p-8 bg-white border border-slate-200 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Rates 1 to 5 Stars</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Customers answer a single simple question: "How was your experience?" on a clean mobile-friendly screen with zero logins.
              </p>
              <div className="mt-auto w-full pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>3-second completion time</span>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="relative p-6 sm:p-8 bg-white border-2 border-indigo-500/40 shadow-sm flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Intelligent Smart Routing</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                <strong className="text-slate-900">4–5 Stars:</strong> Prompted directly to post on Google Reviews.<br />
                <strong className="text-slate-900">1–3 Stars:</strong> Routed to private internal feedback so you can fix it.
              </p>
              <div className="mt-auto w-full pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero public negative review leaks</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Powerful Features</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything Your Business Needs to Dominate Local Search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">1-Click Google Review Boost</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your Google Maps Place ID. Happy customers land directly in the Google review modal with 5 stars pre-selected.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Negative Feedback Firewall</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Catch frustrated customers before they post venting rants on Google or Yelp. Resolve issues privately and win back loyalty.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real-Time Team Alerts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get immediate notification via email and SMS the second a customer submits feedback, giving you instant response agility.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Printable QR Generator</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate high-resolution QR codes formatted for table tents, counter acrylics, business cards, and receipt printers.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Conversion Funnel Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track how many customers opened your link, their star distribution, and the exact conversion rate to Google Reviews.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Custom Brand Theming</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Customize colors, logos, headlines, and thank-you messages to match your clinic or restaurant branding seamlessly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="preview" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="purple" size="md">Intuitive Control Center</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                All Your Customer Sentiments in One Single Clean View
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                ZellonAI provides complete operational visibility. See real-time ratings, respond to private feedback tickets, track staff performance, and watch your Google Maps ranking soar.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Feedback Categorization</h4>
                    <p className="text-xs text-slate-400">Filter between 5-star Google redirects and internal resolution tickets.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Multi-Location Capable</h4>
                    <p className="text-xs text-slate-400">Manage multiple clinics, dining outlets, or stores from a single login.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link to="/dashboard">
                  <Button id="preview-dashboard-btn" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Business Dashboard Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                    AD
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Apex Dental Care</p>
                    <p className="text-xs text-slate-400">Live Customer Feed</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  4.8 ★ Avg Rating
                </span>
              </div>

              {/* Sample feedback entries */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">Marcus Holloway</span>
                    <span className="text-emerald-400 font-bold">5 Stars → Google Clicked</span>
                  </div>
                  <p className="text-xs text-slate-300">"Dr. Sarah and the hygienist were so patient and gentle. Best dental checkup in years!"</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">David Chen</span>
                    <span className="text-amber-400 font-bold">2 Stars → Private Ticket</span>
                  </div>
                  <p className="text-xs text-slate-300">"Front desk receptionist had a 25-minute delay without explanation."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Simple & Honest Pricing (INR)</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Invest in More Reviews and Higher Customer Retention
            </p>
            <p className="text-slate-600 text-base mt-3">
              Simple, transparent pricing with no hidden charges. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <Card
                key={i}
                className={`relative p-8 flex flex-col justify-between ${
                  plan.popular ? 'border-2 border-indigo-600 shadow-xl bg-white scale-[1.02]' : 'bg-white border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-sm font-medium text-slate-500">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 text-sm text-slate-600">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/signup" className="w-full">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    size="md"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Common Questions</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 bg-linear-to-b from-indigo-950 via-slate-900 to-slate-950 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accelerate Your Reputation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Accelerate Your 5-Star Reviews?
          </h2>
          <p className="text-indigo-100/80 text-base max-w-xl mx-auto leading-relaxed">
            Join forward-thinking dental clinics, restaurants, salons, and home service providers using ZellonAI today.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                id="cta-signup-btn"
                variant="white"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-lg"
                rightIcon={<ArrowRight className="w-4 h-4 text-indigo-600" />}
              >
                Create Your Review Link Now
              </Button>
            </Link>
            <Link to="/r/apex-dental" className="w-full sm:w-auto">
              <Button
                id="cta-demo-review-btn"
                variant="outline-white"
                size="lg"
                className="w-full sm:w-auto font-semibold"
              >
                View Customer Experience
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
