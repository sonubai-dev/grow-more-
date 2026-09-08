import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Compass, CheckCircle2, AlertTriangle, ShieldCheck, Star, XCircle, Info, ExternalLink } from 'lucide-react';

export const GoogleGuidelinesPage: React.FC = () => {
  const toc = [
    { id: 'overview', title: '1. Review Integrity Overview' },
    { id: 'google-core-rules', title: '2. Google Core Review Policies' },
    { id: 'review-gating', title: '3. Understanding Review Gating' },
    { id: 'how-ZellonAI-complies', title: '4. How ZellonAI Stays Compliant' },
    { id: 'no-incentives', title: '5. Zero-Tolerance for Incentivized Reviews' },
    { id: 'conflict-of-interest', title: '6. Conflicts of Interest & Employee Reviews' },
    { id: 'ftc-compliance', title: '7. FTC Consumer Review Fairness Act' },
    { id: 'best-practices', title: '8. Best Practices for Merchants' },
    { id: 'handling-negative', title: '9. Turning Negative Feedback into Trust' },
    { id: 'disputing-reviews', title: '10. Disputing Illegitimate Google Reviews' },
  ];

  return (
    <LegalLayout
      title="Google Policy Guidelines"
      subtitle="Industry guidelines on Google Maps review policies, anti-gating compliance, and ethical reputation management for ZellonAI merchants."
      lastUpdated="September 1, 2026"
      version="v2.4"
      badgeText="Platform Compliance Standards"
      toc={toc}
    >
      <div className="space-y-10 text-slate-700 leading-relaxed">

        {/* Highlight Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 text-sm">
          <div className="flex items-center gap-2 font-bold text-emerald-900 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>ZellonAI 100% Policy-Safe Architectural Commitment</span>
          </div>
          <p className="text-emerald-950/80 leading-relaxed">
            ZellonAI is strictly engineered to abide by the <strong>Google Maps User Contributed Content Policies</strong> and the <strong>US Federal Trade Commission (FTC) Endorsement Guides</strong>. Our platform provides a transparent, lawful mechanism to encourage authentic customer feedback while helping merchants resolve customer dissatisfaction before it damages their public brand.
          </p>
        </div>

        {/* Section 1 */}
        <section id="overview" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            1. Review Integrity Overview
          </h2>
          <p>
            Online consumer reviews are among the most critical ranking signals in local search and the foundation of local consumer trust. Google processes billions of searches daily where the local map pack displays merchant star ratings and authentic commentary.
          </p>
          <p>
            Because review fraud, astroturfing, and manipulation erode public trust, Google actively enforces strict automated algorithms and human moderation to detect and penalize deceptive review behavior. As a ZellonAI subscriber, adhering to these rules protects your Google Business Profile from algorithmic suppression, review wipeouts, or listing suspensions.
          </p>
        </section>

        {/* Section 2 */}
        <section id="google-core-rules" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            2. Google Core Review Policies
          </h2>
          <p>
            Google&apos;s published policies prohibit any practice that misrepresents authentic customer experiences. Core prohibitions include:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Prohibited: Review Gating</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You may not selectively solicit reviews only from customers who are satisfied while discouraging or prohibiting dissatisfied customers from posting on Google.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Prohibited: Incentives & Bribes</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Offering money, discounts, gift vouchers, free desserts, raffle entries, or services in exchange for a customer posting a review on Google is strictly forbidden.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Prohibited: Conflicts of Interest</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Business owners, partners, and current employees may not post reviews of their own business, nor may they review competitors to manipulate rankings.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Prohibited: Bulk In-Store Kiosks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Having multiple customers sign into their Google accounts from a single business tablet or computer creates an IP cluster that Google flags as fraudulent.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="review-gating" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            3. Understanding &quot;Review Gating&quot;
          </h2>
          <p>
            In 2018, Google updated its terms to explicitly forbid &quot;review gating&quot;. Review gating occurs when a software tool asks: <em>&quot;Did you enjoy your visit?&quot;</em> and:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm pl-2">
            <li>If the user clicks &quot;Yes&quot; (4–5 stars), they are pushed to Google Reviews.</li>
            <li>If the user clicks &quot;No&quot; (1–3 stars), they are <strong>blocked or restricted</strong> from accessing the Google review link and forced into an internal form without any option to review publicly.</li>
          </ul>
          <p className="text-sm">
            Google considers this deceptive because it artificially inflates average ratings by suppressing negative voices.
          </p>
        </section>

        {/* Section 4 */}
        <section id="how-ZellonAI-complies" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            4. How ZellonAI Stays 100% Compliant
          </h2>
          <p>
            ZellonAI is built around customer service acceleration, not deceptive suppression:
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Universal Review Freedom:</strong> ZellonAI portals never censor, lock, or prevent any customer from visiting your Google Maps listing or posting a public review.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Empathetic Service Remediation:</strong> When a customer indicates a 1–3 star rating, ZellonAI offers them an immediate, dedicated channel to connect with a manager to fix their issue. This solves genuine consumer pain points without deception.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Own-Device QR Code Scanning:</strong> Because customers scan ZellonAI QR codes on their personal smartphones, reviews originate naturally from unique devices, distinct Google accounts, and mobile networks—ensuring authentic Google trust scores.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="no-incentives" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            5. Zero-Tolerance for Incentivized Reviews
          </h2>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-rose-800 text-sm">
              <AlertTriangle className="w-4 h-4" /> Warning: The FTC and Google Heavily Penalize Review Bribery
            </div>
            <p>
              Offering incentives in exchange for reviews is illegal under both Google&apos;s terms and Federal Trade Commission regulations. You may not advertise:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>&quot;Show your 5-star Google review for 10% off your bill!&quot;</li>
              <li>&quot;Leave a review to be entered into our monthly $250 gift card raffle.&quot;</li>
              <li>&quot;Free appetizer when you post a review on Google Maps.&quot;</li>
            </ul>
          </div>
          <p className="text-sm">
            ZellonAI merchants who configure custom message templates must ensure no language offers payment, discounts, or lottery entries in return for online reviews.
          </p>
        </section>

        {/* Section 6 */}
        <section id="conflict-of-interest" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            6. Conflicts of Interest & Employee Reviews
          </h2>
          <p>
            Reviews must reflect genuine customer experiences. You may not instruct staff, contractors, marketing agencies, or family members to leave reviews for your business. Google uses geolocation data, contact matching, and device graphs to detect employee reviews and will remove them systematically.
          </p>
        </section>

        {/* Section 7 */}
        <section id="ftc-compliance" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            7. FTC Consumer Review Fairness Act (CRFA)
          </h2>
          <p>
            In the United States, the <em>Consumer Review Fairness Act (15 U.S.C. § 45b)</em> makes it illegal for any business to include non-disparagement clauses, gag orders, or penalty clauses in form contracts that prohibit customers from writing truthful negative reviews. ZellonAI fully supports consumer protection and will not support any feature designed to threaten or legally penalize honest reviewers.
          </p>
        </section>

        {/* Section 8 */}
        <section id="best-practices" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            8. Best Practices for ZellonAI Merchants
          </h2>
          <p>
            To build a stellar 4.8+ star Google rating safely and sustainably, implement these proven practices:
          </p>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>1. Timing is Everything:</strong> Display your ZellonAI QR code stand prominently at your checkout counter, dental exit desk, or table tent. Invite reviews immediately after completing a great service.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>2. Use Neutral Invitation Language:</strong> Ask: <em>&quot;We strive to provide 5-star service. We&apos;d love your honest feedback!&quot;</em> rather than demanding high ratings.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <strong>3. Rapid Private Resolution:</strong> Monitor your ZellonAI Feedback Inbox daily. When a 2-star feedback ticket arrives, contact the customer immediately. 70% of dissatisfied customers return when their grievance is resolved quickly.
            </div>
          </div>
        </section>

        {/* Section 9 */}
        <section id="handling-negative" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            9. Turning Negative Feedback into Brand Trust
          </h2>
          <p>
            Every great business receives occasional negative reviews. Studies show that a business with a 4.7–4.9 star average actually converts better than a suspicious 5.0 with zero critical feedback.
          </p>
          <p className="text-sm">
            When replying to negative public reviews on Google:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
            <li>Acknowledge their concern with empathy and professional calm.</li>
            <li>Do not argue or blame the customer publicly.</li>
            <li>Provide a direct phone number or owner email to take the conversation offline.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section id="disputing-reviews" className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">
            10. Disputing Illegitimate Google Reviews
          </h2>
          <p>
            If your Google listing receives a review containing hate speech, obscenity, defamation, or a clear competitor attack, you can report it directly to Google:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm pl-2">
            <li>Log into your <strong>Google Business Profile</strong> manager.</li>
            <li>Locate the fraudulent review and click the three vertical dots icon (⋮).</li>
            <li>Select <strong>&quot;Report review&quot;</strong> and choose the appropriate violation category (e.g., &quot;Off-topic&quot;, &quot;Spam&quot;, &quot;Conflict of interest&quot;).</li>
            <li>Google typically investigates reported reviews within 3 to 5 business days.</li>
          </ol>
        </section>

      </div>
    </LegalLayout>
  );
};
