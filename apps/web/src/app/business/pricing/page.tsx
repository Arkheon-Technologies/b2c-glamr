import Link from "next/link";

export const metadata = { title: "Pricing — glamr for business" };

const PLANS = [
  {
    name: "Solo",
    price: "Free",
    sub: "forever",
    desc: "For independent freelancers and booth renters.",
    features: ["1 staff member", "Unlimited bookings", "Client CRM", "Basic analytics", "Booking link"],
    cta: "Get started",
    href: "/studio/onboarding",
    featured: false,
  },
  {
    name: "Studio",
    price: "149 lei",
    sub: "/ month",
    desc: "For multi-staff salons and studios.",
    features: ["Up to 10 staff", "Everything in Solo", "Team schedules", "Advanced analytics", "Booking widget", "Bulk messaging"],
    cta: "Start free trial",
    href: "/studio/onboarding",
    featured: true,
  },
  {
    name: "Chain",
    price: "Custom",
    sub: "",
    desc: "For multi-location groups and franchises.",
    features: ["Unlimited staff & locations", "Everything in Studio", "Multi-location calendar", "White-label widget", "Zapier & webhooks", "Dedicated support"],
    cta: "Contact sales",
    href: "mailto:sales@glamr.ro",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="text-center space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― pricing</p>
        <h1 className="page-title text-[var(--ink)]">Simple, transparent pricing</h1>
        <p className="text-[15px] text-[var(--ink-3)] max-w-md mx-auto">
          Start free. Upgrade when you grow. No hidden fees, no setup costs.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`card p-7 space-y-6 flex flex-col ${plan.featured ? "ring-2 ring-[var(--plum)] ring-offset-2" : ""}`}>
            <div className="space-y-1">
              {plan.featured && <span className="badge badge-plum text-[9px] mb-2 inline-block">Most popular</span>}
              <h2 className="text-[20px] font-medium text-[var(--ink)]">{plan.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-display text-[var(--ink)]">{plan.price}</span>
                {plan.sub && <span className="text-[13px] text-[var(--ink-3)]">{plan.sub}</span>}
              </div>
              <p className="text-[13px] text-[var(--ink-3)]">{plan.desc}</p>
            </div>
            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
                  <span className="w-4 h-4 rounded-full bg-[var(--sage)] text-white flex items-center justify-center text-[9px] shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href} className={`btn w-full text-center ${plan.featured ? "btn-primary" : "btn-ghost"}`}>{plan.cta}</Link>
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] text-[var(--ink-4)]">
        All plans include a 2% platform fee on each booking. <Link href="/terms" className="underline hover:text-[var(--ink-2)]">See full terms</Link>.
      </p>
    </main>
  );
}
