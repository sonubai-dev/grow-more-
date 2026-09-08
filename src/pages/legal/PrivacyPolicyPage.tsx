import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Shield, Lock, Eye, Database, Globe, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const toc = [
    { id: 'introduction', title: '1. Introduction & Overview' },
    { id: 'roles-scope', title: '2. Controller vs. Processor Roles' },
    { id: 'data-collected', title: '3. Personal Information We Collect' },
    { id: 'how-we-use', title: '4. How We Use Collected Data' },
    { id: 'legal-basis', title: '5. Legal Bases for Processing' },
    { id: 'third-parties', title: '6. Third-Party Disclosures & Sub-Processors' },
    { id: 'cookies-storage', title: '7. Cookies & Local Storage' },
    { id: 'retention-deletion', title: '8. Data Retention & Erasure' },
    { id: 'international-transfers', title: '9. Cross-Border Data Transfers' },
    { id: 'user-rights', title: '10. Your Privacy Rights (GDPR & CCPA)' },
    { id: 'security-measures', title: '11. Security Commitments' },
    { id: 'contact-dpo', title: '12. Contact Us & Data Protection Officer' },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How ZellonAI collects, processes, and protects data for business subscribers and end-customer feedback respondents."
      lastUpdated="September 1, 2026"
      version="v2.4"
      badgeText="Data Protection & Privacy"
      toc={toc}
    >
      <div className="space-y-10 text-slate-700 leading-relaxed">
        
        {/* Quick Summary Box */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 text-sm">
          <div className="flex items-center gap-2 font-bold text-indigo-900 mb-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Executive Privacy Highlights</span>
          </div>
          <ul className="space-y-2 text-indigo-950/80 list-disc list-inside">
            <li><strong>Zero Sale of Data:</strong> ZellonAI never sells, rents, or monetizes personal consumer data or business contact lists.</li>
            <li><strong>Dual Processing Model:</strong> We act as a <em>Data Controller</em> for business account owners, and as a <em>Data Processor</em> for customer feedback gathered through customer portals (<code className="text-xs bg-indigo-100 px-1 py-0.5 rounded">/r/:slug</code>).</li>
            <li><strong>Targeted Google Redirects:</strong> High-rating customers are routed directly to public Google Maps profiles where their reviews are governed by Google's Privacy Policy.</li>
            <li><strong>Constructive Feedback Privacy:</strong> Low-rating feedback is delivered privately to the business subscriber to allow internal service resolution without public exposure.</li>
          </ul>
        </div>

        {/* Section 1 */}
        <section id="introduction" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            1. Introduction & Overview
          </h2>
          <p>
            Welcome to ZellonAI (&quot;ZellonAI&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). ZellonAI operates an enterprise-grade customer feedback routing, QR code review acceleration, and reputation management platform provided via our website, portals, and software-as-a-service applications (collectively, the &quot;Service&quot;).
          </p>
          <p>
            This Privacy Policy describes how we collect, store, use, disclose, and protect personal data when you create an account as a business subscriber, access our website, or when an end-customer scans a ZellonAI QR stand, visits a public review portal (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/r/:businessSlug</code>), or submits customer sentiment ratings.
          </p>
          <p>
            By using our Service or submitting feedback through any ZellonAI portal, you acknowledge the terms described in this Privacy Policy.
          </p>
        </section>

        {/* Section 2 */}
        <section id="roles-scope" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            2. Controller vs. Processor Roles
          </h2>
          <p>
            Under global privacy frameworks such as the European Union General Data Protection Regulation (EU GDPR) and the California Consumer Privacy Act as amended by the CPRA (CCPA), the classification of roles is as follows:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">Role: Data Controller</span>
              <h3 className="font-bold text-slate-900">ZellonAI as Data Controller</h3>
              <p className="text-xs text-slate-600">
                We act as a Data Controller for our direct business account holders, partners, and website visitors. This includes registration data, billing records, authentication credentials, and platform usage analytics.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">Role: Data Processor</span>
              <h3 className="font-bold text-slate-900">ZellonAI as Data Processor</h3>
              <p className="text-xs text-slate-600">
                We act as a Data Processor on behalf of the registered Business Subscriber (the Data Controller) when collecting customer feedback, ratings, and optional contact notes submitted through their customized <code className="text-[11px] bg-slate-200 px-1 py-0.5 rounded">/r/:slug</code> portal.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="data-collected" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            3. Personal Information We Collect
          </h2>
          <p>We collect information across two distinct categories of users:</p>

          <h3 className="text-lg font-bold text-slate-900 mt-4">A. Business Subscribers & Account Users</h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
            <li><strong>Account Identity:</strong> Full name, professional email address, account password hash, and profile picture.</li>
            <li><strong>Business Profile Data:</strong> Business name, industry category, physical location address, telephone number, website URL, and Google Maps Place ID.</li>
            <li><strong>Commercial & Billing Records:</strong> Subscription tier, transaction histories, and payment processor identifiers (note: raw credit card details are handled directly by PCI-DSS Level 1 certified gateways).</li>
            <li><strong>Custom Configuration:</strong> Logo graphics, brand colors, custom SMS/Email message templates, rating threshold triggers, and team member permissions.</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 mt-4">B. End-Customers / Feedback Respondents</h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
            <li><strong>Sentiment Feedback:</strong> Star ratings (1 through 5 stars), category satisfaction tags, and written qualitative responses.</li>
            <li><strong>Optional Contact Details:</strong> Name, email address, or telephone number provided voluntarily by the customer when requesting follow-up regarding a service complaint.</li>
            <li><strong>Technical Metadata:</strong> Timestamp, approximate geographic location derived from IP address (city/country level), device operating system, browser user-agent, and QR scan referral source (used solely for abuse mitigation and rate limiting).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="how-we-use" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            4. How We Use Collected Data
          </h2>
          <p>ZellonAI processes collected information strictly for specified, lawful business purposes:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Seamless Review Acceleration:</strong> Connecting 4-star and 5-star customer ratings seamlessly to the business&apos;s verified Google Maps review entry point.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Private Remediation Pipeline:</strong> Routing constructive complaints and low ratings into the business dashboard inbox so owners can address customer dissatisfaction directly.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Reputation & Conversion Analytics:</strong> Calculating aggregate metrics, Net Promoter Score (NPS), QR scan velocity, and staff performance trends.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Platform Security & Abuse Prevention:</strong> Detecting fraudulent review campaigns, spam submissions, automated bots, and protecting tenant systems.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="legal-basis" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            5. Legal Bases for Processing (GDPR Art. 6)
          </h2>
          <p>
            When processing personal data of individuals located within the European Economic Area (EEA), United Kingdom, or Switzerland, we rely on the following lawful bases:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2">
            <li><strong>Performance of a Contract:</strong> Creating, provisioning, and maintaining your ZellonAI subscription agreement.</li>
            <li><strong>Consent:</strong> Explicit permission provided when an end-customer elects to share their contact information for resolution, or when subscribing to communications.</li>
            <li><strong>Legitimate Interests:</strong> Operating a secure SaaS platform, preventing fraudulent attacks, monitoring service uptime, and providing reporting to business owners.</li>
            <li><strong>Legal Obligations:</strong> Compliance with statutory tax, financial, and regulatory reporting mandates.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="third-parties" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            6. Third-Party Disclosures & Sub-Processors
          </h2>
          <p>
            We do not sell, rent, or trade your personal data. We disclose data solely to trusted sub-processors and external service providers under strict confidentiality and data protection agreements:
          </p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 border-b">Sub-Processor</th>
                  <th className="p-3 border-b">Purpose</th>
                  <th className="p-3 border-b">Data Transferred</th>
                  <th className="p-3 border-b">Compliance Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Google Cloud / Firebase</td>
                  <td className="p-3">Database, Auth & Cloud Storage</td>
                  <td className="p-3">Encrypted account & feedback data</td>
                  <td className="p-3">SOC 2 Type II, ISO 27001, EU SCCs</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Google Maps Platform</td>
                  <td className="p-3">Places API & Review Redirection</td>
                  <td className="p-3">Place ID, Merchant address coordinates</td>
                  <td className="p-3">Google Terms of Service</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Netlify / Cloud CDN</td>
                  <td className="p-3">Edge Web Serving & DNS</td>
                  <td className="p-3">Encrypted web traffic & IP logs</td>
                  <td className="p-3">SOC 2, Privacy Shield 2.0 / SCCs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7 */}
        <section id="cookies-storage" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            7. Cookies & Local Storage
          </h2>
          <p>
            ZellonAI uses essential session cookies and browser <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">localStorage</code> tokens strictly to authenticate logged-in business subscribers, maintain workspace state, and track temporary preview tokens.
          </p>
          <p>
            We do not use cross-site tracking cookies, third-party advertising retargeting pixels, or behavioral advertising cookies on our customer review portals (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/r/:slug</code>).
          </p>
        </section>

        {/* Section 8 */}
        <section id="retention-deletion" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            8. Data Retention & Erasure
          </h2>
          <p>
            We retain personal data only for as long as necessary to fulfill the purposes outlined in this Policy, comply with legal obligations, or until a legitimate erasure request is received:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
            <li><strong>Active Business Accounts:</strong> Stored for the duration of the subscription agreement. Upon account cancellation, data is purged after a 30-day grace period.</li>
            <li><strong>Customer Feedback Entries:</strong> Kept in the business subscriber&apos;s history until explicitly deleted by the business owner or upon a verified consumer request.</li>
            <li><strong>Technical Logs:</strong> IP and server access logs are systematically rotated and expunged after 90 days.</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section id="international-transfers" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            9. Cross-Border Data Transfers
          </h2>
          <p>
            ZellonAI infrastructure is hosted in premier cloud regions (including the United States and EU Google Cloud facilities). When personal data of individuals located in the EEA, UK, or Switzerland is transferred outside of those jurisdictions, we ensure appropriate safeguards are implemented, specifically European Commission Standard Contractual Clauses (SCCs) and UK International Data Transfer Agreements (IDTAs).
          </p>
        </section>

        {/* Section 10 */}
        <section id="user-rights" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            10. Your Privacy Rights (GDPR & CCPA/CPRA)
          </h2>
          <p>
            Depending on your jurisdiction, you are entitled to exercise comprehensive statutory privacy rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs my-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-sm mb-1">Right to Access (GDPR Art. 15)</strong>
              Request confirmation and an exportable copy of all personal data held concerning you.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-sm mb-1">Right to Rectification (Art. 16)</strong>
              Correct inaccurate or incomplete business profile or personal records.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-sm mb-1">Right to Erasure / Forgotten (Art. 17)</strong>
              Request permanent deletion of customer feedback logs or subscriber accounts.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-slate-900 block text-sm mb-1">California CCPA Disclosures</strong>
              Right to know, right to delete, right to opt-out of sale/sharing (ZellonAI never sells data).
            </div>
          </div>
          <p className="text-sm">
            To submit a privacy request, please contact our Data Protection Office at{' '}
            <a href="mailto:privacy@ZellonAI.com" className="text-indigo-600 font-semibold hover:underline">
              privacy@ZellonAI.com
            </a>. Requests are fulfilled within 30 days without fee.
          </p>
        </section>

        {/* Section 11 */}
        <section id="security-measures" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            11. Security Commitments
          </h2>
          <p>
            We implement industry-standard administrative, physical, and technical safeguards designed to prevent unauthorized access, disclosure, or alteration of data. All communication channels utilize TLS 1.3 encryption, database storage is protected with AES-256 encryption at rest, and access is enforced through strict role-based access control (RBAC). For full details, see our dedicated <a href="/security" className="text-indigo-600 font-semibold hover:underline">Security & GDPR</a> policy.
          </p>
        </section>

        {/* Section 12 */}
        <section id="contact-dpo" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            12. Contact Us & Data Protection Officer
          </h2>
          <p>
            For questions, notices, or concerns regarding our privacy practices or to communicate with our appointed Data Protection Officer (DPO), please reach out to:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm space-y-1">
            <p><strong>ZellonAI Platform Legal & Privacy Department</strong></p>
            <p>Email: <a href="mailto:privacy@ZellonAI.com" className="text-indigo-600 hover:underline">privacy@ZellonAI.com</a></p>
            <p>Support: <a href="mailto:support@ZellonAI.com" className="text-indigo-600 hover:underline">support@ZellonAI.com</a></p>
            <p>Security Team: <a href="mailto:security@ZellonAI.com" className="text-indigo-600 hover:underline">security@ZellonAI.com</a></p>
            <p className="text-xs text-slate-500 pt-2">Corporation Registered in Delaware, United States.</p>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};
