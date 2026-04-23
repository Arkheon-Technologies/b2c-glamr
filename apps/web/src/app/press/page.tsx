import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press — glamr.",
  description: "Press kit and media resources for glamr.",
};

const COVERAGE = [
  { outlet: "Ziarul Financiar", title: "glamr atrage 2,400 de saloane în primul an de la lansare", date: "Mar 2026" },
  { outlet: "Startup.ro", title: "Startup-ul românesc care vrea să fie Fresha-ul Europei de Est", date: "Jan 2026" },
  { outlet: "Doingbusiness.ro", title: "Cum funcționează glamr, platforma de rezervări beauty care a crescut de 5x în 6 luni", date: "Nov 2025" },
];

const ASSETS = [
  { label: "Logo pack (SVG + PNG)", desc: "All variants — light, dark, plum on white, monochrome." },
  { label: "Brand guidelines", desc: "Colour palette, typography, usage rules, and what not to do." },
  { label: "Product screenshots", desc: "High-res screens of the booking flow, studio dashboard, and mobile app." },
  { label: "Founder photos", desc: "Press-quality portraits of the founding team." },
];

export default function PressPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="max-w-2xl space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― press & media</p>
        <h1 className="page-title text-[var(--ink)]">Press room</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
          For media enquiries, interview requests, or press kit access, reach us at{" "}
          <Link href="mailto:press@glamr.ro" className="text-[var(--plum)] underline">press@glamr.ro</Link>.
          We aim to respond within one business day.
        </p>
      </section>

      {/* Fast facts */}
      <section className="space-y-5">
        <h2 className="section-header text-[var(--ink)]">Key facts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "2023", label: "Founded" },
            { value: "2,400+", label: "Partner studios" },
            { value: "180k+", label: "Bookings processed" },
            { value: "Bucharest", label: "HQ" },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center space-y-1">
              <p className="metric-number text-[var(--ink)]">{s.value}</p>
              <p className="small-meta text-[var(--ink-3)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="space-y-5">
        <h2 className="section-header text-[var(--ink)]">In the press</h2>
        <div className="space-y-3">
          {COVERAGE.map((c) => (
            <div key={c.title} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--plum)]">{c.outlet}</span>
                <p className="text-[14px] text-[var(--ink)] mt-1">{c.title}</p>
              </div>
              <span className="text-[12px] text-[var(--ink-4)] shrink-0">{c.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Press kit */}
      <section className="space-y-5">
        <h2 className="section-header text-[var(--ink)]">Press kit</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ASSETS.map((a) => (
            <div key={a.label} className="card p-5 flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[var(--plum-soft)] flex items-center justify-center text-[var(--plum)] text-[14px] shrink-0">↓</span>
              <div>
                <p className="text-[14px] font-medium text-[var(--ink)]">{a.label}</p>
                <p className="text-[12px] text-[var(--ink-3)] mt-0.5">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-[var(--ink-3)]">
          Request the full press kit by emailing <Link href="mailto:press@glamr.ro" className="text-[var(--plum)] underline">press@glamr.ro</Link>.
        </p>
      </section>
    </main>
  );
}
