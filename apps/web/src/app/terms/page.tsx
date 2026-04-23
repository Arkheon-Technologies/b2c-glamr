import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — glamr.",
  description: "Terms of Service for the glamr. beauty marketplace platform.",
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-16 space-y-8">
      <header>
        <p className="small-meta text-[var(--ink-4)] mb-2">Legal · Last updated April 2026</p>
        <h1 className="text-[32px] font-display text-[var(--ink)]">Terms of Service</h1>
      </header>

      {[
        {
          title: "1. Introduction",
          content: `Welcome to glamr. ("we", "our", "us"). By accessing or using the glamr. platform — including our website, mobile applications, and related services (collectively, the "Platform") — you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform.`,
        },
        {
          title: "2. Eligibility",
          content: `You must be at least 18 years old to create an account and use the Platform. By registering, you represent that you are of legal age and have the authority to enter into these Terms.`,
        },
        {
          title: "3. Account Registration",
          content: `To access certain features, you must create an account. You agree to provide accurate, complete, and current information and to keep your credentials secure. You are responsible for all activity under your account.`,
        },
        {
          title: "4. Booking & Payments",
          content: `glamr. facilitates bookings between clients and beauty professionals. All payments are processed through our secure payment provider. Cancellation policies are set by each business and displayed at the time of booking. Service fees may apply.`,
        },
        {
          title: "5. Business Obligations",
          content: `Businesses listing services on glamr. are responsible for the accuracy of their profiles, pricing, and availability. All professionals must hold valid licenses where required by law. glamr. reserves the right to remove listings that violate these Terms.`,
        },
        {
          title: "6. Intellectual Property",
          content: `All content on the Platform — including text, graphics, logos, icons, and software — is the property of glamr. or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent.`,
        },
        {
          title: "7. Privacy",
          content: `Your use of the Platform is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data. By using the Platform, you consent to the practices described therein.`,
        },
        {
          title: "8. Limitation of Liability",
          content: `glamr. is a marketplace platform. We do not provide beauty services directly and are not liable for the quality, safety, or legality of services performed by listed businesses. To the fullest extent permitted by law, glamr. disclaims all warranties and limits liability.`,
        },
        {
          title: "9. Changes to Terms",
          content: `We may update these Terms from time to time. If we make material changes, we will notify you via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the updated Terms.`,
        },
        {
          title: "10. Contact",
          content: `If you have any questions about these Terms, please contact us at legal@glamr.ro or write to: glamr. SRL, Bucharest, Romania.`,
        },
      ].map((section) => (
        <section key={section.title}>
          <h2 className="text-[18px] font-medium text-[var(--ink)] mb-2">{section.title}</h2>
          <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">{section.content}</p>
        </section>
      ))}
    </article>
  );
}
