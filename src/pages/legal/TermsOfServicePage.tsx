import React from 'react';
import { LegalLayout } from './LegalLayout';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, Ban, Scale } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  const toc = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'subscription-services', title: '2. Subscription Services & License' },
    { id: 'account-responsibilities', title: '3. Accounts & Security' },
    { id: 'acceptable-use', title: '4. Acceptable Use & Prohibited Conduct' },
    { id: 'review-policies', title: '5. Review Integrity & Anti-Gating Rules' },
    { id: 'customer-data-ip', title: '6. Customer Data & Intellectual Property' },
    { id: 'billing-subscriptions', title: '7. Plans, Free Trials & Billing' },
    { id: 'google-disclaimer', title: '8. Google Platform Third-Party Disclaimer' },
    { id: 'sla-availability', title: '9. Service Availability & Maintenance' },
    { id: 'disclaimer-warranties', title: '10. Disclaimer of Warranties' },
    { id: 'limitation-liability', title: '11. Limitation of Liability' },
    { id: 'indemnification', title: '12. Indemnification' },
    { id: 'termination', title: '13. Term, Suspension & Termination' },
    { id: 'governing-law', title: '14. Governing Law & Dispute Resolution' },
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Standard Master Subscription Agreement governing the use of ZellonAI's customer feedback routing and review management platform."
      lastUpdated="September 1, 2026"
      version="v2.4"
      badgeText="Master Service Agreement"
      toc={toc}
    >
      <div className="space-y-10 text-slate-700 leading-relaxed">
        
        {/* Notice Card */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-sm">
          <div className="flex items-center gap-2 font-bold text-amber-900 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Crucial Compliance Notice for Business Subscribers</span>
          </div>
          <p className="text-amber-950/80 leading-relaxed">
            ZellonAI empowers businesses to elevate their online reputation through genuine customer engagement. Subscribers are strictly bound to comply with third-party platform guidelines, including the <strong>Google Business Profile Content Policies</strong> and the <strong>US Federal Trade Commission (FTC) Endorsement Guides</strong>. Under no circumstances may subscribers use ZellonAI to unlawfully suppress authentic negative customer reviews or incentivize reviews with financial consideration.
          </p>
        </div>

        {/* Section 1 */}
        <section id="acceptance" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding agreement entered into by and between ZellonAI (&quot;ZellonAI&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) and the legal entity or individual creating an account or subscribing to the Service (&quot;Subscriber&quot;, &quot;Business&quot;, &quot;you&quot;, or &quot;your&quot;).
          </p>
          <p>
            By creating an account, clicking &quot;Start Free Trial&quot;, submitting payment, or otherwise accessing or using the ZellonAI platform, you represent that you have the legal authority to bind the Subscriber to this Agreement. If you do not agree to these Terms, you must not access or use the Service.
          </p>
        </section>

        {/* Section 2 */}
        <section id="subscription-services" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            2. Subscription Services & License
          </h2>
          <p>
            ZellonAI provides a cloud-hosted software-as-a-service platform that enables commercial subscribers to create branded customer feedback landing pages (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/r/:businessSlug</code>), generate printable and digital QR codes, direct satisfied customers to third-party review platforms (such as Google Maps), and capture private customer feedback for internal dispute resolution.
          </p>
          <p>
            Subject to the terms and timely payment of subscription fees, ZellonAI grants Subscriber a non-exclusive, non-transferable, revocable, worldwide license to access and use the Service solely for Subscriber&apos;s internal business operations during the active subscription term.
          </p>
        </section>

        {/* Section 3 */}
        <section id="account-responsibilities" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            3. Accounts, Team Members & Security
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm pl-2">
            <li><strong>Accuracy of Registration:</strong> Subscriber agrees to provide accurate, current, and complete business information, including legal entity name, location address, and authorized contact email.</li>
            <li><strong>Credential Confidentiality:</strong> Subscriber is solely responsible for maintaining the confidentiality of administrative login credentials and multi-factor authentication tokens.</li>
            <li><strong>Authorized Personnel:</strong> Subscriber is liable for all activities, feedback resolutions, or administrative settings changes conducted through authorized team member seats.</li>
            <li><strong>Notification of Compromise:</strong> Subscriber must immediately notify ZellonAI at <a href="mailto:security@ZellonAI.com" className="text-indigo-600 hover:underline">security@ZellonAI.com</a> upon suspecting any unauthorized breach or access to their account.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="acceptable-use" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            4. Acceptable Use & Prohibited Conduct
          </h2>
          <p>
            Subscriber agrees not to misuse the Service or facilitate third-party abuse. The following activities are strictly prohibited and constitute grounds for immediate account suspension without refund:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs my-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950">
              <strong className="block font-bold mb-1 flex items-center gap-1.5 text-rose-800">
                <Ban className="w-4 h-4" /> Fake Reviews & Astroturfing
              </strong>
              Submitting fabricated reviews, employing automated bots, paying third parties to submit fake feedback, or posting reviews on competitor listings.
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950">
              <strong className="block font-bold mb-1 flex items-center gap-1.5 text-rose-800">
                <Ban className="w-4 h-4" /> Review Bribery & Incentives
              </strong>
              Conditioning discounts, gifts, cash, credits, or prize entries on the condition that the customer posts a 5-star rating on Google.
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950">
              <strong className="block font-bold mb-1 flex items-center gap-1.5 text-rose-800">
                <Ban className="w-4 h-4" /> Consumer Harassment
              </strong>
              Using customer contact details gathered through constructive feedback tickets to intimidate, threaten, or harass dissatisfied consumers.
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950">
              <strong className="block font-bold mb-1 flex items-center gap-1.5 text-rose-800">
                <Ban className="w-4 h-4" /> Reverse Engineering
              </strong>
              Attempting to decompile, reverse engineer, scrape, copy, or create derivative works from the ZellonAI software or API layer.
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="review-policies" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            5. Review Integrity & Anti-Gating Compliance
          </h2>
          <p>
            ZellonAI is designed to comply with Google&apos;s Maps User Contributed Content Policies regarding review solicitation. In accordance with these standards:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
            <li>Customers who indicate satisfaction are provided a convenient, frictionless shortcut to publish their review directly on Google Maps.</li>
            <li>Customers who indicate dissatisfaction are provided a direct channel to communicate private feedback to management for fast resolution.</li>
            <li><strong>No Prohibition on Public Reviews:</strong> ZellonAI customer portals do not prohibit, censor, or prevent any customer from choosing to leave a review directly on Google or any other public platform.</li>
            <li>Subscriber agrees to review and adhere to our dedicated <a href="/google-guidelines" className="text-indigo-600 font-semibold hover:underline">Google Policy Guidelines</a>.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="customer-data-ip" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            6. Customer Data & Intellectual Property
          </h2>
          <p>
            <strong>Subscriber Ownership:</strong> As between the parties, Subscriber owns all right, title, and interest in and to Subscriber&apos;s customer feedback records, logos, and business trademarks (&quot;Subscriber Data&quot;). Subscriber grants ZellonAI a limited, non-exclusive license to host, copy, process, and display Subscriber Data strictly as needed to deliver the Service.
          </p>
          <p>
            <strong>ZellonAI IP:</strong> ZellonAI retains all intellectual property rights, trademarks, patents, design systems, algorithms, source code, and analytics models associated with the platform. Subscriber may not copy or replicate the ZellonAI brand or interface without prior written consent.
          </p>
        </section>

        {/* Section 7 */}
        <section id="billing-subscriptions" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            7. Subscription Plans, Free Trials & Billing
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>14-Day Free Trial:</strong> New subscribers may test the platform with full feature access for 14 calendar days without advance charge. If not cancelled prior to trial expiration, the account transitions to the chosen billing plan.
            </p>
            <p>
              <strong>Tiered Pricing:</strong> Subscription fees are billed on a recurring monthly or annual basis based on selected tiers (e.g. <em>Starter at ₹99/mo</em>, <em>Growth at ₹499/mo</em>, <em>Enterprise at ₹1,499/mo</em>). All prices are in INR (Indian Rupees) unless stated otherwise.
            </p>
            <p>
              <strong>Cancellation & Renewals:</strong> Subscriptions renew automatically until cancelled via the Business Settings dashboard. Cancellation takes effect at the end of the current pre-paid billing cycle. We do not provide prorated refunds for partial months of service.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section id="google-disclaimer" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            8. Google Platform Third-Party Disclaimer
          </h2>
          <p>
            Google, Google Maps, Google Reviews, and Google Business Profile are registered trademarks of Google LLC. ZellonAI is an independent software-as-a-service vendor and is not affiliated with, sponsored by, or endorsed by Google LLC.
          </p>
          <p>
            ZellonAI facilitates links and standard web redirections to public Google endpoints via user consent. ZellonAI has no control over Google&apos;s algorithm, automated spam filters, or moderation policies, and cannot guarantee that any specific customer review will be published, retained, or ranked by Google.
          </p>
        </section>

        {/* Section 9 */}
        <section id="sla-availability" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            9. Service Availability & Maintenance
          </h2>
          <p>
            We target 99.9% application uptime for public review landing pages and customer portals. Scheduled maintenance windows are communicated in advance via dashboard notifications. We employ distributed redundant cloud infrastructure (Google Cloud & Netlify CDN) to ensure high availability and disaster recovery.
          </p>
        </section>

        {/* Section 10 */}
        <section id="disclaimer-warranties" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            10. Disclaimer of Warranties
          </h2>
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-600 bg-slate-100 p-3 rounded-xl">
            THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. ZellonAI DOES NOT GUARANTEE THAT USE OF THE SERVICE WILL RESULT IN ANY SPECIFIC INCREASE IN REVENUE, SALES, OR GOOGLE SEARCH RANKINGS.
          </p>
        </section>

        {/* Section 11 */}
        <section id="limitation-liability" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            11. Limitation of Liability
          </h2>
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-600 bg-slate-100 p-3 rounded-xl">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ZellonAI, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, OR GOODWILL. IN NO EVENT SHALL ZellonAI&apos;S TOTAL AGGREGATE LIABILITY EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY SUBSCRIBER TO ZellonAI IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        {/* Section 12 */}
        <section id="indemnification" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            12. Indemnification
          </h2>
          <p>
            Subscriber agrees to defend, indemnify, and hold harmless ZellonAI, its officers, and affiliates from and against any claims, damages, liabilities, and legal expenses arising out of: (a) Subscriber&apos;s violation of this Agreement; (b) Subscriber&apos;s violation of third-party platform terms (including Google Business Profile policies); (c) any false or deceptive advertising claims; or (d) Subscriber&apos;s misuse of customer contact information.
          </p>
        </section>

        {/* Section 13 */}
        <section id="termination" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            13. Term, Suspension & Termination
          </h2>
          <p>
            Either party may terminate this Agreement at any time by cancelling the account through the settings portal. ZellonAI reserves the right to immediately suspend or terminate Subscriber&apos;s access if Subscriber engages in review gating, submits fraudulent feedback, violates intellectual property rights, or fails to satisfy subscription payments.
          </p>
        </section>

        {/* Section 14 */}
        <section id="governing-law" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            14. Governing Law & Dispute Resolution
          </h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any dispute or controversy arising under this Agreement shall be resolved through confidential, binding arbitration conducted by the American Arbitration Association (AAA) in Wilmington, Delaware.
          </p>
        </section>

      </div>
    </LegalLayout>
  );
};
