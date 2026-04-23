import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers — glamr.",
  description: "Join the team building Romania's beauty & wellness booking platform.",
};

const ROLES = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Bucharest / Remote", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Bucharest", type: "Full-time" },
  { title: "Growth Marketer", team: "Marketing", location: "Bucharest", type: "Full-time" },
  { title: "Business Development Manager", team: "Sales", location: "Bucharest", type: "Full-time" },
  { title: "Customer Success Specialist", team: "Operations", location: "Bucharest / Remote", type: "Full-time" },
];

const PERKS = [
  { title: "Competitive salary", body: "Above-market packages benchmarked against Western European tech companies." },
  { title: "Remote-friendly", body: "Engineering and design roles can work remotely. We value output, not office hours." },
  { title: "Equity", body: "Every full-time employee gets meaningful equity. We're building this together." },
  { title: "Learning budget", body: "500 EUR/year for courses, conferences, and books — no approval required." },
  { title: "Health insurance", body: "Full private medical coverage for you and your family." },
  { title: "Free glamr credits", body: "Because you should experience what you're building." },
];

export default function CareersPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="max-w-2xl space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― careers</p>
        <h1 className="page-title text-[var(--ink)]">Help us rewire beauty bookings in Romania</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
          We're a small team with a big market. If you want your work to matter — and to move fast — come build glamr with us.
        </p>
      </section>

      {/* Open roles */}
      <section className="space-y-5">
        <h2 className="section-header text-[var(--ink)]">Open roles</h2>
        <div className="space-y-3">
          {ROLES.map((role) => (
            <div key={role.title} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[15px] font-medium text-[var(--ink)]">{role.title}</p>
                <div className="flex items-center gap-3">
                  <span className="badge badge-plum text-[9px]">{role.team}</span>
                  <span className="text-[12px] text-[var(--ink-3)]">{role.location}</span>
                  <span className="text-[12px] text-[var(--ink-3)]">{role.type}</span>
                </div>
              </div>
              <Link href={`mailto:jobs@glamr.ro?subject=Application: ${role.title}`} className="btn btn-ghost shrink-0">
                Apply
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="space-y-6">
        <h2 className="section-header text-[var(--ink)]">What we offer</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PERKS.map((p) => (
            <div key={p.title} className="card p-5 space-y-2">
              <h3 className="text-[14px] font-medium text-[var(--ink)]">{p.title}</h3>
              <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 bg-[var(--plum-soft)] text-center space-y-4">
        <h2 className="card-serif text-[var(--plum)]">Don't see the right role?</h2>
        <p className="text-[14px] text-[var(--ink-2)]">We always want to meet exceptional people. Send us a note and tell us what you'd build.</p>
        <Link href="mailto:jobs@glamr.ro" className="btn btn-primary inline-flex">Say hello</Link>
      </section>
    </main>
  );
}
