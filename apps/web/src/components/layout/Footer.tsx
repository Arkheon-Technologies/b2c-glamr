import Link from "next/link";

/* ─── Customer Footer (§3.3) ──────────────────────────────────────────
   5-col grid: Brand + socials · Customers · For business · Company · Legal
   EN/RO locale switch, Bucharest badge.
────────────────────────────────────────────────────────────────────── */

const FOOTER_COLS = [
  {
    title: "Customers",
    links: [
      { label: "Search professionals", href: "/search" },
      { label: "Browse specialties", href: "/c/hair" },
      { label: "Inspiration", href: "/inspiration" },
      { label: "Gift cards", href: "/gift-cards" },
      { label: "How it works", href: "/help" },
    ],
  },
  {
    title: "For business",
    links: [
      { label: "List your business", href: "/business" },
      { label: "Pricing", href: "/business/pricing" },
      { label: "Booking widget", href: "/business/widget" },
      { label: "Integrations", href: "/business/integrations" },
      { label: "Academy", href: "/business/academy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Trust & safety", href: "/trust" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
      { label: "Accessibility", href: "/help" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--paper-2)] border-t border-[var(--line)]">
      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link href="/" className="flex items-baseline gap-0">
              <span className="font-display text-2xl tracking-tight text-[var(--ink)]">
                glamr
              </span>
              <span className="text-[var(--plum)] text-2xl font-display">.</span>
            </Link>
            <p className="text-[var(--ink-3)] text-[13px] leading-relaxed max-w-[200px]">
              Find your next good hair day. Beauty & wellness appointments,
              all in one place.
            </p>
            {/* Social links */}
            <div className="flex gap-4 pt-1">
              {["Instagram", "TikTok", "Facebook"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-[var(--ink-4)] hover:text-[var(--ink-2)] transition-colors text-[11px] font-mono uppercase tracking-wider"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title} className="space-y-4">
              <p className="small-meta text-[var(--ink-2)]">{col.title}</p>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[var(--ink-3)] text-[13px] hover:text-[var(--ink)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[var(--line)] py-5">
        <div className="page-container flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[var(--ink-4)] text-[11px] font-mono tracking-wide">
            © {new Date().getFullYear()} glamr. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Locale switch */}
            <button className="pill" type="button">EN</button>
            <button className="pill" type="button">RO</button>
            {/* City badge */}
            <span className="pill pill-plum">Bucharest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
