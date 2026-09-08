import React from 'react';
import { LegalLayout } from './LegalLayout';
import {
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  FileCheck2,
  RefreshCw,
  AlertCircle,
  Download,
  Mail,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const SecurityGdprPage: React.FC = () => {
  const toc = [
    { id: 'security-overview', title: '1. Security Architecture & Trust' },
    { id: 'cloud-infrastructure', title: '2. Cloud Infrastructure & Hosting' },
    { id: 'encryption-standards', title: '3. Data Encryption (In-Transit & At-Rest)' },
    { id: 'tenant-isolation', title: '4. Multi-Tenant Logical Isolation' },
    { id: 'access-control', title: '5. Authentication & Access Control' },
    { id: 'gdpr-compliance', title: '6. GDPR & UK Data Protection Framework' },
    { id: 'data-processing-addendum', title: '7. Data Processing Addendum (DPA)' },
    { id: 'data-subject-rights', title: '8. Exercising Data Subject Rights' },
    { id: 'ccpa-cpra', title: '9. California CCPA / CPRA Compliance' },
    { id: 'incident-response', title: '10. Incident Response & 72h Notification' },
    { id: 'responsible-disclosure', title: '11. Responsible Vulnerability Disclosure' },
  ];

  return (
    <LegalLayout
      title="Security & GDPR Compliance"
      subtitle="Enterprise-grade data protection, multi-tenant isolation, cryptographic safeguards, and European privacy governance at ZellonAI."
      lastUpdated="September 1, 2026"
      version="v2.4"
      badgeText="Enterprise Security Architecture"
      toc={toc}
    >
      <div className="space-y-10 text-slate-700 leading-relaxed">

        {/* Security Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <Lock className="w-5 h-5 text-indigo-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">TLS 1.3 / AES-256</div>
            <div className="text-[10px] text-slate-500">End-to-End Cryptography</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <Server className="w-5 h-5 text-emerald-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">SOC 2 & ISO 27001</div>
            <div className="text-[10px] text-slate-500">Tier-4 Cloud Centers</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <FileCheck2 className="w-5 h-5 text-amber-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">GDPR & CCPA</div>
            <div className="text-[10px] text-slate-500">Complete DPA Available</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <Cpu className="w-5 h-5 text-purple-600 mx-auto" />
            <div className="font-bold text-xs text-slate-900">99.9% Uptime SLA</div>
            <div className="text-[10px] text-slate-500">Multi-Zone Redundancy</div>
          </div>
        </div>

        {/* Section 1 */}
        <section id="security-overview" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            1. Security Architecture & Trust
          </h2>
          <p>
            At ZellonAI, protecting business subscriber assets and end-customer privacy is embedded directly into our software design lifecycle. Local merchants trust ZellonAI to route customer sentiment, gather private feedback tickets, and generate hundreds of thousands of review interactions.
          </p>
          <p>
            We adhere to defense-in-depth principles across physical data centers, network boundaries, database architectures, and application code to ensure confidentiality, integrity, and availability.
          </p>
        </section>

        {/* Section 2 */}
        <section id="cloud-infrastructure" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            2. Cloud Infrastructure & Hosting
          </h2>
          <p>
            The ZellonAI platform is hosted entirely within Google Cloud Platform (GCP) and enterprise CDN networks. Our physical hosting infrastructure maintains the most rigorous compliance certifications in the cloud industry:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
            <li><strong>SOC 1, SOC 2 Type II, and SOC 3</strong> independent audit compliance</li>
            <li><strong>ISO/IEC 27001, 27017, and 27018</strong> certified information security management</li>
            <li><strong>PCI-DSS Level 1</strong> compliant payment tokenization and processing facilities</li>
            <li><strong>Multi-Zone Redundancy:</strong> Real-time replication across independent availability zones with automated failover and daily encrypted snapshots.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="encryption-standards" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            3. Data Encryption (In-Transit & At-Rest)
          </h2>
          <p>
            ZellonAI treats all customer feedback and business credentials as sensitive payloads:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <strong className="text-slate-900 flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-indigo-600" />
                Encryption in Transit
              </strong>
              <p className="text-xs text-slate-600">
                100% of network traffic between browsers, QR code scans, mobile devices, and ZellonAI servers is encrypted via <strong>TLS 1.3 / HTTPS</strong> with forward secrecy. HTTP Strict Transport Security (HSTS) is permanently enforced.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <strong className="text-slate-900 flex items-center gap-2 text-sm">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                Encryption at Rest
              </strong>
              <p className="text-xs text-slate-600">
                All customer feedback records, database collections, storage objects, and system logs are encrypted at rest using <strong>AES-256 bit encryption</strong> managed by Google Cloud Key Management Service (KMS).
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="tenant-isolation" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            4. Multi-Tenant Logical Isolation
          </h2>
          <p>
            ZellonAI utilizes a multi-tenant cloud architecture. Every business account is assigned a unique tenant identifier (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">businessId</code>). All database reads, writes, and analytics aggregations are scoped and validated at the application and security-rules layer.
          </p>
          <p className="text-sm">
            It is mathematically impossible for another subscriber or unauthorized party to query, access, or manipulate another tenant&apos;s customer feedback tickets or business metrics.
          </p>
        </section>

        {/* Section 5 */}
        <section id="access-control" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            5. Authentication & Access Control (RBAC)
          </h2>
          <p>
            Platform access is regulated via Role-Based Access Control (RBAC):
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
            <li><strong>Super Admin:</strong> Platform operators with audited emergency access for maintenance and customer support.</li>
            <li><strong>Business Owner:</strong> Full authority over subscription billing, Google Maps connection, member invites, and review threshold configurations.</li>
            <li><strong>Manager / Staff:</strong> Read-and-reply access to customer feedback tickets without access to subscription billing or credential management.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="gdpr-compliance" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            6. GDPR & UK Data Protection Framework
          </h2>
          <p>
            For organizations operating within the European Economic Area (EEA) and the United Kingdom, ZellonAI adheres to the principles of <strong>Regulation (EU) 2016/679 (GDPR)</strong> and the <strong>UK Data Protection Act 2018</strong>:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div>
                <strong>Data Minimization:</strong> On public review pages (<code className="text-xs bg-slate-200 px-1 py-0.5 rounded">/r/:slug</code>), we do not mandate user registration or track invasive personal cookies.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div>
                <strong>Purpose Limitation:</strong> Data gathered through constructive feedback forms is used solely for merchant issue remediation.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <div>
                <strong>Cross-Border Transfer Mechanisms:</strong> European Commission Standard Contractual Clauses (SCCs) are built into our standard agreements.
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="data-processing-addendum" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            7. Data Processing Addendum (DPA)
          </h2>
          <p>
            If your enterprise is required under GDPR Article 28 to execute a formal Data Processing Addendum, ZellonAI provides a pre-signed, compliant DPA incorporating the latest Standard Contractual Clauses.
          </p>
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <strong className="text-indigo-950 font-bold block text-sm">Request Your Pre-Signed DPA</strong>
              <span className="text-indigo-900/80">Available to all active ZellonAI Starter, Growth, and Enterprise subscribers.</span>
            </div>
            <a
              href="mailto:dpa@ZellonAI.com?subject=ZellonAI%20DPA%20Request"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shrink-0 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Email DPA Request</span>
            </a>
          </div>
        </section>

        {/* Section 8 */}
        <section id="data-subject-rights" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            8. Exercising Data Subject Rights
          </h2>
          <p>
            Under GDPR Articles 15 through 22, individuals retain fundamental rights over their personal data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs my-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="block text-slate-900 text-sm mb-1">Right to Erasure (Art. 17)</strong>
              Subscribers can delete individual feedback tickets or their entire business history instantly inside the dashboard.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="block text-slate-900 text-sm mb-1">Data Portability (Art. 20)</strong>
              Export complete historical feedback submissions and analytics as structured CSV or JSON records.
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section id="ccpa-cpra" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            9. California CCPA / CPRA Compliance
          </h2>
          <p>
            For California residents, ZellonAI guarantees that:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
            <li>We do not &quot;sell&quot; or &quot;share&quot; personal information as defined by California Civil Code § 1798.140.</li>
            <li>We do not collect sensitive personal information for inferring consumer characteristics.</li>
            <li>We honor consumer requests for deletion, access, and non-discrimination without financial penalties.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section id="incident-response" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            10. Incident Response & 72h Notification
          </h2>
          <p>
            ZellonAI maintains a documented Computer Security Incident Response Plan (CSIRP). In the event of a confirmed security incident affecting subscriber data, ZellonAI will notify affected business account holders and competent supervisory authorities within <strong>72 hours</strong> of confirmation, in compliance with GDPR Article 33.
          </p>
        </section>

        {/* Section 11 */}
        <section id="responsible-disclosure" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            11. Responsible Vulnerability Disclosure
          </h2>
          <p>
            We welcome reports from ethical security researchers. If you identify a potential security vulnerability within ZellonAI&apos;s infrastructure or portals, please notify our security team immediately at:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-900">ZellonAI Information Security Operations</div>
            <div>Email: <a href="mailto:security@ZellonAI.com" className="text-indigo-600 font-semibold hover:underline">security@ZellonAI.com</a></div>
            <div className="text-slate-500 pt-1">
              Please include detailed reproduction steps, HTTP requests, and proof of concept. We commit to acknowledging reports within 24 hours.
            </div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};
