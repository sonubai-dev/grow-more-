import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  Compass,
  CheckCircle2,
  Printer,
  Share2,
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

interface TableOfContentItem {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  version?: string;
  badgeText?: string;
  toc?: TableOfContentItem[];
  children: ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = 'September 1, 2026',
  version = 'v2.4',
  badgeText = 'Official Policy',
  toc = [],
  children,
}) => {
  const location = useLocation();
  const [copiedLink, setCopiedLink] = React.useState(false);

  const legalNavItems = [
    {
      label: 'Compliance Hub',
      path: '/legal',
      icon: Shield,
      description: 'Trust, certifications & overview',
    },
    {
      label: 'Privacy Policy',
      path: '/privacy',
      icon: Lock,
      description: 'Data collection & end-user rights',
    },
    {
      label: 'Terms of Service',
      path: '/terms',
      icon: FileText,
      description: 'Platform subscription & permissible use',
    },
    {
      label: 'Google Policy Guidelines',
      path: '/google-guidelines',
      icon: Compass,
      description: 'Review gating rules & Google compliance',
    },
    {
      label: 'Security & GDPR',
      path: '/security',
      icon: CheckCircle2,
      description: 'Encryption, multi-tenancy & EU privacy',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-slate-900 text-white pt-24 pb-14 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link to="/legal" className="hover:text-white transition-colors">Security & Legal</Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-indigo-400 font-medium">{title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                <span>Version {version}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {title}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Copy</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-xl transition-colors shadow-sm"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Link</span>
                  </>
                )}
              </button>
              <a
                href="mailto:compliance@ZellonAI.com"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 rounded-xl transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Legal</span>
              </a>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Last Effective Revision: <strong className="text-slate-200">{lastUpdated}</strong></span>
            <span className="hidden sm:inline">Applicable to all ZellonAI tenants, business users & customer respondents</span>
          </div>
        </div>
      </section>

      {/* Main Content Area with Navigation Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Sub-Navigation Sidebar (Col 1-3) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
                Legal & Governance Documents
              </h3>
              <nav className="space-y-1">
                {legalNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/legal' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="leading-snug">{item.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* In-page Table of Contents if provided */}
            {toc.length > 0 && (
              <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm sticky top-24">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Document Outline
                </h3>
                <nav className="space-y-1 text-xs">
                  {toc.map((item, index) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-slate-400">{index + 1}.</span>
                      <span className="truncate">{item.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Compliance Help & DPO Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Compliance Inquiries</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Questions regarding our Data Processing Addendum (DPA), GDPR rights, or Google review policies?
              </p>
              <div className="pt-1">
                <a
                  href="mailto:compliance@ZellonAI.com"
                  className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  compliance@ZellonAI.com
                </a>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Guaranteed response within 48 business hours
              </p>
            </div>
          </aside>

          {/* Document Content (Col 4-12) */}
          <main className="lg:col-span-9">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm prose prose-slate max-w-none">
              {children}
            </div>

            {/* Document Footer Sign-off */}
            <div className="mt-8 bg-slate-100 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>
                  ZellonAI SaaS Platform • Legal, Security & Regulatory Compliance Division • Delaware, USA
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/legal" className="text-indigo-600 hover:underline font-semibold">
                  Compliance Directory
                </Link>
                <span>•</span>
                <a href="#main-footer" className="text-slate-500 hover:text-slate-900">
                  Back to Top
                </a>
              </div>
            </div>
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
};
