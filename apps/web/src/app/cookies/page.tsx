import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — glamr.",
  description: "How glamr uses cookies and similar technologies.",
};

const SECTIONS = [
  {
    title: "1. What are cookies?",
    content: `Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit — such as your preferred language or login status — so you don't have to re-enter it every time.`,
  },
  {
    title: "2. How we use cookies",
    content: `glamr uses cookies to: keep you logged in during a session, remember your search preferences and filters, measure how pages are used so we can improve them, and prevent fraudulent activity. We do not use cookies to serve advertising on third-party websites.`,
  },
  {
    title: "3. Types of cookies we use",
    content: `Strictly necessary cookies — required for the platform to function (login, booking flow, security). These cannot be disabled.\n\nFunctional cookies — remember your preferences such as locale (EN/RO) and display settings.\n\nAnalytical cookies — help us understand usage patterns via privacy-respecting analytics (no personal data leaves our servers).\n\nWe do not use third-party advertising or tracking cookies.`,
  },
  {
    title: "4. Third-party cookies",
    content: `We use Stripe for payment processing. Stripe may set cookies on your device to prevent fraud and comply with payment regulations. These are governed by Stripe's own cookie policy.`,
  },
  {
    title: "5. Cookie duration",
    content: `Session cookies are deleted when you close your browser. Persistent cookies remain for a defined period — typically 30 days for authentication and up to 1 year for preferences — after which they expire automatically.`,
  },
  {
    title: "6. Managing cookies",
    content: `You can control and delete cookies through your browser settings. Note that disabling strictly necessary cookies will break core platform functionality such as logging in and completing bookings. Most browsers allow you to see which cookies are set and delete them individually.`,
  },
  {
    title: "7. Changes to this policy",
    content: `We may update this Cookie Policy from time to time. If we make significant changes, we will notify you via the platform. The date at the top of this page reflects the most recent update.`,
  },
  {
    title: "8. Contact",
    content: `For questions about our use of cookies, contact us at privacy@glamr.ro or write to: glamr. SRL, Bucharest, Romania.`,
  },
];

export default function CookiesPage() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-16 space-y-8">
      <header>
        <p className="small-meta text-[var(--ink-4)] mb-2">Legal · Last updated April 2026</p>
        <h1 className="text-[32px] font-display text-[var(--ink)]">Cookie Policy</h1>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-[18px] font-medium text-[var(--ink)] mb-2">{section.title}</h2>
          {section.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-[14px] leading-relaxed text-[var(--ink-2)] mb-3">{para}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
