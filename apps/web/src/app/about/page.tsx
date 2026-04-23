import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — glamr.",
  description: "The story behind glamr — Romania's beauty & wellness booking platform.",
};

const TEAM = [
  { name: "Andrei Popescu", role: "Co-founder & CEO", bio: "Former product lead at eMAG. Obsessed with service businesses and the people who run them." },
  { name: "Maria Ionescu", role: "Co-founder & CPO", bio: "10 years in UX. Built booking flows for millions of users across three continents." },
  { name: "Radu Georgescu", role: "CTO", bio: "Ex-Google engineer. Loves elegant systems and hates slow calendars." },
];

const VALUES = [
  { title: "For the professional first", body: "Every decision starts with the person behind the chair. If a feature doesn't make their day easier, we don't ship it." },
  { title: "Radical transparency", body: "No hidden fees. No dark patterns. Prices, terms, and platform fees are always visible — to both sides of a booking." },
  { title: "Built for Romania", body: "We're local. Our support team speaks Romanian, our pricing is in lei, and we show up at industry events in Bucharest." },
];

export default function AboutPage() {
  return (
    <main className="page-container py-20 space-y-20">
      {/* Hero */}
      <section className="max-w-2xl space-y-5">
        <p className="small-meta text-[var(--ink-4)]">― our story</p>
        <h1 className="page-title text-[var(--ink)]">We built the booking tool we wished existed.</h1>
        <p className="text-[16px] text-[var(--ink-2)] leading-relaxed">
          glamr started in 2023 when two friends couldn't find a hair appointment in Bucharest without calling five salons. We built a fix — and 2,400 studios later, it turns out we weren't alone.
        </p>
      </section>

      {/* Mission */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="section-header text-[var(--ink)]">Our mission</h2>
          <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
            To make beauty and wellness bookings effortless — for every client, in every city — while giving independent professionals the tools they need to build real businesses.
          </p>
          <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
            We believe the best salon in your neighbourhood shouldn't need a marketing team. It just needs glamr.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "2023", label: "Founded" },
            { value: "2,400+", label: "Studios" },
            { value: "180k+", label: "Bookings made" },
            { value: "Bucharest", label: "Headquarters" },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center space-y-1">
              <p className="metric-number text-[var(--ink)]">{s.value}</p>
              <p className="small-meta text-[var(--ink-3)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="space-y-8">
        <h2 className="section-header text-[var(--ink)]">What we believe</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="card p-6 space-y-3">
              <h3 className="text-[15px] font-medium text-[var(--ink)]">{v.title}</h3>
              <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="space-y-8">
        <h2 className="section-header text-[var(--ink)]">The team</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {TEAM.map((t) => (
            <div key={t.name} className="card p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[var(--plum-soft)] flex items-center justify-center text-[var(--plum)] font-semibold text-[16px] mb-3">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <p className="text-[15px] font-medium text-[var(--ink)]">{t.name}</p>
              <p className="text-[12px] text-[var(--plum)] font-mono uppercase tracking-wider">{t.role}</p>
              <p className="text-[13px] text-[var(--ink-3)] leading-relaxed pt-1">{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card p-10 bg-[var(--plum-soft)] text-center space-y-4">
        <h2 className="card-serif text-[var(--plum)]">Join us</h2>
        <p className="text-[14px] text-[var(--ink-2)]">We're hiring across engineering, design, and operations.</p>
        <Link href="/careers" className="btn btn-primary inline-flex">See open roles</Link>
      </section>
    </main>
  );
}
