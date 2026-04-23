import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — glamr.",
  description: "Privacy Policy for the glamr. beauty marketplace platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-16 space-y-8">
      <header>
        <p className="small-meta text-[var(--ink-4)] mb-2">Legal · Last updated April 2026</p>
        <h1 className="text-[32px] font-display text-[var(--ink)]">Privacy Policy</h1>
        <p className="text-[14px] text-[var(--ink-2)] mt-3 leading-relaxed">
          glamr. SRL ("glamr.", "we", "us") is committed to protecting your personal data. 
          This Privacy Policy explains what information we collect, how we use it, and your rights 
          under the General Data Protection Regulation (GDPR) and Romanian data protection law.
        </p>
      </header>

      {[
        {
          title: "1. Data We Collect",
          content: `We collect information you provide when creating an account (name, email, phone number), booking services (appointment details, preferences), and using the Platform (usage analytics, device information). We may also receive data from third-party sign-in providers (Google, Apple, Facebook).`,
        },
        {
          title: "2. How We Use Your Data",
          content: `We use your data to: provide and improve our services, process bookings and payments, send booking confirmations and reminders, personalise your experience, communicate about promotions (with your consent), ensure platform security, and comply with legal obligations.`,
        },
        {
          title: "3. Data Sharing",
          content: `We share your information with beauty professionals when you book a service, with payment processors to handle transactions, and with service providers who assist our operations (hosting, analytics, email delivery). We never sell your personal data to third parties.`,
        },
        {
          title: "4. Data Retention",
          content: `We retain your personal data for as long as your account is active or as needed to provide services. Transaction records are kept for 5 years as required by Romanian fiscal law. You may request deletion of your account and data at any time.`,
        },
        {
          title: "5. Your Rights (GDPR)",
          content: `Under the GDPR, you have the right to: access your personal data, rectify inaccurate data, erase your data ("right to be forgotten"), restrict processing, data portability, object to processing, and withdraw consent. To exercise these rights, contact us at privacy@glamr.ro.`,
        },
        {
          title: "6. Cookies & Tracking",
          content: `We use essential cookies for Platform functionality, analytics cookies to understand usage patterns (with your consent), and preference cookies to remember your settings. You can manage cookie preferences through your browser settings or our cookie consent banner.`,
        },
        {
          title: "7. Data Security",
          content: `We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest, access controls, regular security audits, and incident response procedures. In the unlikely event of a data breach, we will notify affected users and the Romanian Data Protection Authority (ANSPDCP) within 72 hours.`,
        },
        {
          title: "8. International Transfers",
          content: `Your data is primarily stored within the European Economic Area (EEA). If data is transferred outside the EEA, we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.`,
        },
        {
          title: "9. Children's Privacy",
          content: `The Platform is not intended for users under 18 years of age. We do not knowingly collect personal data from minors. If we become aware that we have collected data from a child, we will promptly delete it.`,
        },
        {
          title: "10. Contact & DPO",
          content: `For privacy-related inquiries, contact our Data Protection Officer at dpo@glamr.ro. You may also file a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP) at anspdcp.ro.`,
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
