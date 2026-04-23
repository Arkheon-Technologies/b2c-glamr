import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR — glamr.",
  description: "Your rights under GDPR and how glamr protects your personal data.",
};

const RIGHTS = [
  { right: "Right of access", desc: "You can request a copy of all personal data we hold about you at any time." },
  { right: "Right to rectification", desc: "If any data we hold is inaccurate or incomplete, you can ask us to correct it." },
  { right: "Right to erasure", desc: "You can ask us to delete your personal data. We will comply unless we have a legal obligation to retain it." },
  { right: "Right to restriction", desc: "You can ask us to pause processing your data while a complaint is being resolved." },
  { right: "Right to portability", desc: "You can receive your data in a structured, machine-readable format to transfer to another service." },
  { right: "Right to object", desc: "You can object to processing based on legitimate interests, including profiling." },
];

const SECTIONS = [
  {
    title: "1. Who we are",
    content: `glamr. SRL is the data controller for personal data collected through the glamr platform. We are registered in Romania and operate under Romanian and EU law. Our DPO can be reached at privacy@glamr.ro.`,
  },
  {
    title: "2. Legal bases for processing",
    content: `We process your personal data on the following legal bases: (a) Contract — to provide the booking service you request; (b) Legitimate interest — to prevent fraud, improve the platform, and send transactional messages; (c) Consent — for optional marketing communications, which you can withdraw at any time; (d) Legal obligation — for tax, financial reporting, and compliance requirements.`,
  },
  {
    title: "3. Data we collect",
    content: `We collect: contact information (name, email, phone) when you register; booking history and preferences; payment metadata (not full card numbers — these are handled by Stripe); device and usage data for security and analytics; and content you submit (reviews, profile photos, notes).`,
  },
  {
    title: "4. Data retention",
    content: `We retain your account data for as long as your account is active. Booking and payment records are kept for 5 years for tax and legal compliance. Analytics data is aggregated and anonymised after 13 months. You may request deletion of your account and associated data at any time.`,
  },
  {
    title: "5. International transfers",
    content: `Your data is stored on servers in the European Union (Frankfurt, Germany). We use Stripe for payment processing, which may transfer data to the United States under Standard Contractual Clauses approved by the European Commission.`,
  },
  {
    title: "6. Automated decision-making",
    content: `We use automated processing to generate booking recommendations and detect fraudulent activity. No automated decisions produce legal or similarly significant effects without human review. You may object to automated profiling at any time by contacting privacy@glamr.ro.`,
  },
  {
    title: "7. How to exercise your rights",
    content: `Email us at privacy@glamr.ro with your request. We will respond within 30 days. You may also file a complaint with the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP) at www.dataprotection.ro.`,
  },
];

export default function GdprPage() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-16 space-y-8">
      <header>
        <p className="small-meta text-[var(--ink-4)] mb-2">Legal · Last updated April 2026</p>
        <h1 className="text-[32px] font-display text-[var(--ink)]">GDPR — Your Data Rights</h1>
        <p className="text-[14px] text-[var(--ink-3)] leading-relaxed mt-3 max-w-xl">
          glamr is committed to protecting your personal data in line with the General Data Protection Regulation (EU) 2016/679. This page explains your rights and how we handle your data.
        </p>
      </header>

      {/* Rights grid */}
      <section className="space-y-3">
        <h2 className="text-[18px] font-medium text-[var(--ink)]">Your rights at a glance</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {RIGHTS.map((r) => (
            <div key={r.right} className="card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-[9px] shrink-0">✓</span>
                <p className="text-[13px] font-medium text-[var(--ink)]">{r.right}</p>
              </div>
              <p className="text-[12px] text-[var(--ink-3)] leading-relaxed pl-7">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-[18px] font-medium text-[var(--ink)] mb-2">{section.title}</h2>
          <p className="text-[14px] leading-relaxed text-[var(--ink-2)]">{section.content}</p>
        </section>
      ))}

      <section className="card p-6 bg-[var(--plum-soft)] space-y-2">
        <p className="text-[14px] font-medium text-[var(--plum)]">Exercise your rights</p>
        <p className="text-[13px] text-[var(--ink-2)]">
          Email <Link href="mailto:privacy@glamr.ro" className="underline">privacy@glamr.ro</Link> — we respond within 30 days.
          You can also manage your privacy settings directly in your <Link href="/me/privacy" className="underline">account</Link>.
        </p>
      </section>
    </article>
  );
}
