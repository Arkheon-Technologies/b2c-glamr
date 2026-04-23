import Link from "next/link";

export const metadata = { title: "For business — glamr." };

const STATS = [
  { value: "2,400+", label: "Studios onboarded" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "< 90s", label: "Avg booking time" },
  { value: "4.9★", label: "Business rating" },
];

const FEATURES = [
  { title: "Smart calendar", body: "Day, week, and month views with colour-coded staff lanes. Drag to reschedule; buffer rules enforced automatically." },
  { title: "Bookings inbox", body: "Accept, counter, or decline requests in one place. Badge updates in real time so nothing slips through." },
  { title: "Client CRM", body: "Every customer's visit history, lifetime spend, and private notes — at a glance when you need them." },
  { title: "Services & pricing", body: "Manage your full catalogue with add-ons, packages, per-level pricing, and seasonal promotions." },
  { title: "Team management", body: "Roster, individual schedules, commission tracking, and performance analytics per staff member." },
  { title: "Analytics", body: "Revenue trends, peak-hour heatmap, top services, and client retention — all in one dashboard." },
];

export default function BusinessPage() {
  return (
    <main className="page-container py-20 space-y-24">
      {/* Hero */}
      <section className="max-w-3xl space-y-6">
        <p className="small-meta text-[var(--ink-4)]">― for professionals</p>
        <h1 className="page-title text-[var(--ink)]">
          Run your chair, not your inbox.
        </h1>
        <p className="text-[16px] text-[var(--ink-2)] leading-relaxed max-w-xl">
          glamr gives beauty and wellness businesses the tools to fill their books, manage their team, and grow their revenue — without the admin overhead.
        </p>
        <div className="flex gap-3 pt-2">
          <Link href="/studio/onboarding" className="btn btn-primary btn-lg">List your business</Link>
          <Link href="/business/pricing" className="btn btn-ghost btn-lg">See pricing</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="card p-6 text-center space-y-1">
            <p className="metric-number text-[var(--ink)]">{s.value}</p>
            <p className="small-meta text-[var(--ink-3)]">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="section-header text-[var(--ink)]">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 space-y-3">
              <h3 className="text-[16px] font-medium text-[var(--ink)]">{f.title}</h3>
              <p className="text-[14px] text-[var(--ink-3)] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card p-10 text-center space-y-4 bg-[var(--plum-soft)]">
        <h2 className="card-serif text-[var(--plum)]">Ready to get started?</h2>
        <p className="text-[14px] text-[var(--ink-2)]">Join 2,400+ studios already on glamr. Free to list — no card required.</p>
        <Link href="/studio/onboarding" className="btn btn-primary btn-lg inline-flex">Create your profile</Link>
      </section>
    </main>
  );
}
