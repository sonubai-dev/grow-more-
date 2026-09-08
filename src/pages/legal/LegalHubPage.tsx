import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import {
  ShieldCheck,
  Lock,
  FileText,
  Compass,
  ArrowRight,
  CheckCircle2,
  Download,
  Mail,
  Shield,
  ExternalLink,
  Award,
  Globe2,
  Server
} from 'lucide-react';

export const LegalHubPage: React.FC = () => {
  const documents = [
    {
      title: 'Privacy Policy',
      path: '/privacy',
      icon: Lock,
      badge: 'Data Protection',
      summary:
        'Comprehensive overview of how customer feedback data, merchant account records, and QR scan metrics are gathered, processed, and safeguarded.',
      highlights: ['Zero data sale policy', 'GDPR Article 6 compliance', 'Sub-processor audit list', '30-day erasure timeline'],
      linkText: 'Read Privacy Policy',
    },
    {
      title: 'Terms of Service',
      path: '/terms',
      icon: FileText,
      badge: 'Master Agreement',
      summary:
        'Governs the platform subscription relationship, billing terms, 14-day free trial, prohibited conduct, intellectual property, and service level commitments.',
      highlights: ['SaaS license grant', 'Prohibited fake review conduct', 'Starter, Growth & Enterprise tiers', '99.9% uptime SLA target'],
      linkText: 'Review Terms of Service',
    },
    {
      title: 'Google Policy Guidelines',
      path: '/google-guidelines',
      icon: Compass,
      badge: 'Platform Compliance',
      summary:
        'Essential blueprint for merchants on Google Maps User Contributed Content rules, anti-gating compliance, and ethical reputation management.',
      highlights: ['Review gating explanation', 'Zero-tolerance for review bribery', 'FTC endorsement rules', 'Handling negative reviews ethically'],
      linkText: 'Explore Google Guidelines',
    },
    {
      title: 'Security & GDPR',
      path: '/security',
      icon: ShieldCheck,
      badge: 'Infrastructure & Privacy',
      summary:
        'Technical architectural documentation on our TLS 1.3 / AES-256 encryption, multi-tenant isolation, SOC 2 hosting facilities, and DPA agreements.',
      highlights: ['Google Cloud SOC 2 / ISO 27001 centers', 'AES-256 at-rest encryption', 'Pre-signed DPA for EU merchants', '72-hour breach notification SLA'],
      linkText: 'Inspect Security & GDPR',
    },
  ];

  return (
    <LegalLayout
      title="Security, Legal & Trust Center"
      subtitle="The central trust authority for ZellonAI. Explore our data protection policies, platform terms, and Google compliance architecture."
      lastUpdated="September 1, 2026"
      version="v2.4"
      badgeText="Trust & Compliance Authority"
    >
      <div className="space-y-12">
        
        {/* Trust Statement */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>Certified Reputation Integrity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Built for High-Growth Businesses That Value Compliance
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              ZellonAI connects tens of thousands of consumer interactions to public Google listings and private merchant inboxes. We maintain rigorous standards to ensure our merchants succeed without risking algorithmic penalties or regulatory scrutiny.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
            <div>
              <div className="text-indigo-400 font-bold text-lg">100%</div>
              <div className="text-slate-400">Google Policy Compliant</div>
            </div>
            <div>
              <div className="text-indigo-400 font-bold text-lg">TLS 1.3</div>
              <div className="text-slate-400">Full-Transit Encryption</div>
            </div>
            <div>
              <div className="text-indigo-400 font-bold text-lg">GDPR / CCPA</div>
              <div className="text-slate-400">Privacy Standard Aligned</div>
            </div>
            <div>
              <div className="text-indigo-400 font-bold text-lg">SOC 2 / ISO</div>
              <div className="text-slate-400">Audited Cloud Centers</div>
            </div>
          </div>
        </div>

        {/* 4 Core Legal Pillars */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Core Legal & Compliance Documents
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline">Updated regularly by legal counsel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.path}
                  className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-wide">
                        {doc.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                      {doc.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      to={doc.path}
                      className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-white group-hover:bg-indigo-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-indigo-600 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <span>{doc.linkText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact and Direct Help Channels */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Dedicated Regulatory & Legal Contacts
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <strong className="text-slate-900 block text-sm">Privacy & GDPR Rights</strong>
              <p className="text-slate-600">For data subject access, erasure, or rectification requests.</p>
              <a href="mailto:privacy@ZellonAI.com" className="text-indigo-600 font-bold hover:underline block pt-1">
                privacy@ZellonAI.com
              </a>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <strong className="text-slate-900 block text-sm">Legal & Contracts</strong>
              <p className="text-slate-600">For enterprise MSA negotiation, sub-processor inquiries, and signed DPAs.</p>
              <a href="mailto:compliance@ZellonAI.com" className="text-indigo-600 font-bold hover:underline block pt-1">
                compliance@ZellonAI.com
              </a>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <strong className="text-slate-900 block text-sm">Security & Vulnerabilities</strong>
              <p className="text-slate-600">For coordinated security disclosure and incident response.</p>
              <a href="mailto:security@ZellonAI.com" className="text-indigo-600 font-bold hover:underline block pt-1">
                security@ZellonAI.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};
