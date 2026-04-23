import Link from "next/link";

export const metadata = { title: "Academy — glamr for business" };

const TOPICS = [
  { tag: "Pricing", title: "How to set prices that clients love and that keep you profitable", mins: "8 min read" },
  { tag: "Retention", title: "The rebooking script that converts 60% of first-time clients", mins: "5 min read" },
  { tag: "Marketing", title: "Growing your Instagram to 10k followers as a solo stylist", mins: "12 min read" },
  { tag: "Operations", title: "Setting up your first automated reminder flow", mins: "6 min read" },
  { tag: "Finance", title: "Understanding your numbers: revenue vs. take-home for booth renters", mins: "10 min read" },
  { tag: "Growth", title: "When to hire your first staff member — and how to do it right", mins: "9 min read" },
];

export default function AcademyPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="max-w-2xl space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― glamr academy</p>
        <h1 className="page-title text-[var(--ink)]">Grow your business, not just your bookings</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
          Free guides, playbooks, and videos for beauty and wellness professionals — from pricing your services to building a team.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="section-header text-[var(--ink)]">Latest guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {TOPICS.map((t) => (
            <div key={t.title} className="card p-6 space-y-3 cursor-pointer hover:border-[var(--plum)] transition-colors">
              <div className="flex items-center justify-between">
                <span className="badge badge-plum text-[9px]">{t.tag}</span>
                <span className="text-[11px] text-[var(--ink-4)]">{t.mins}</span>
              </div>
              <p className="text-[15px] font-medium text-[var(--ink)] leading-snug">{t.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 bg-[var(--plum-soft)] text-center space-y-4">
        <h2 className="card-serif text-[var(--plum)]">Coming soon</h2>
        <p className="text-[14px] text-[var(--ink-2)] max-w-md mx-auto">
          The full Academy — with video courses, live workshops, and a community forum — is launching later this year. Leave your email and we'll let you know first.
        </p>
        <Link href="mailto:academy@glamr.ro" className="btn btn-primary inline-flex">Get early access</Link>
      </section>
    </main>
  );
}
