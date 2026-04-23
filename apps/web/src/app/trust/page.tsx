import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust & Safety — glamr.",
  description: "How glamr keeps clients and professionals safe on the platform.",
};

const PILLARS = [
  {
    title: "Verified businesses",
    body: "Every business that lists on glamr goes through an identity and licence check. We verify business registration, professional certifications where required, and physical location. A verified badge means we've done the legwork.",
  },
  {
    title: "Real reviews only",
    body: "Reviews on glamr can only be left by clients who completed a booking. We do not allow businesses to delete or hide reviews. Suspicious review activity is flagged by our moderation team.",
  },
  {
    title: "Secure payments",
    body: "Payments are processed via Stripe, a PCI-DSS Level 1 certified provider. We never store full card numbers. Deposits are held in escrow until after the appointment.",
  },
  {
    title: "Privacy by design",
    body: "Your contact details are never shared with a business until after a booking is confirmed. Businesses only see what they need to serve you well.",
  },
  {
    title: "Content moderation",
    body: "Profile photos, service descriptions, and portfolio images are reviewed before going live. We remove content that violates our community standards within 24 hours of a report.",
  },
  {
    title: "Dispute resolution",
    body: "If something goes wrong, our support team mediates between clients and businesses. Refund decisions are made based on evidence — not whoever shouts loudest.",
  },
];

export default function TrustPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="max-w-2xl space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― trust & safety</p>
        <h1 className="page-title text-[var(--ink)]">Safety isn't a feature — it's the foundation</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
          glamr connects real people with real businesses. That trust is earned through clear standards, consistent enforcement, and a team that takes complaints seriously.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        {PILLARS.map((p) => (
          <div key={p.title} className="card p-6 space-y-3">
            <div className="w-6 h-6 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-[10px]">✓</div>
            <h3 className="text-[15px] font-medium text-[var(--ink)]">{p.title}</h3>
            <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      {/* Report section */}
      <section className="card p-8 space-y-4">
        <h2 className="section-header text-[var(--ink)]">Report a concern</h2>
        <p className="text-[14px] text-[var(--ink-2)] leading-relaxed max-w-xl">
          If you've experienced something that felt unsafe, dishonest, or that violates our community standards, please tell us. Reports are reviewed within 24 hours.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="mailto:safety@glamr.ro" className="btn btn-primary">Report via email</Link>
          <Link href="/help" className="btn btn-ghost">Visit Help Centre</Link>
        </div>
      </section>
    </main>
  );
}
