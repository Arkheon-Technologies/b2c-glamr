import Link from "next/link";

export const metadata = { title: "Booking widget — glamr for business" };

const STEPS = [
  { step: "1", title: "Copy the snippet", body: "Grab your personalised embed code from your glamr dashboard in under a minute." },
  { step: "2", title: "Paste it on your site", body: "Drop one <script> tag anywhere in your website HTML — works with WordPress, Wix, Webflow, and custom sites." },
  { step: "3", title: "Go live instantly", body: "Clients see a branded booking flow without ever leaving your website. No redirects." },
];

export default function WidgetPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="max-w-2xl space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― booking widget</p>
        <h1 className="page-title text-[var(--ink)]">Your booking flow, on your website</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
          Embed a fully branded booking experience on any website with a single snippet. Clients book without leaving your page — conversions stay with you.
        </p>
        <Link href="/studio/onboarding" className="btn btn-primary btn-lg inline-flex">Get your widget</Link>
      </section>

      <section className="space-y-6">
        <h2 className="section-header text-[var(--ink)]">Up in three steps</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((s) => (
            <div key={s.step} className="card p-6 space-y-3">
              <span className="w-8 h-8 rounded-full bg-[var(--plum-soft)] text-[var(--plum)] flex items-center justify-center text-[13px] font-semibold">{s.step}</span>
              <h3 className="text-[15px] font-medium text-[var(--ink)]">{s.title}</h3>
              <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 bg-[var(--plum-soft)] text-center space-y-4">
        <h2 className="card-serif text-[var(--plum)]">Available on Studio & Chain plans</h2>
        <p className="text-[14px] text-[var(--ink-2)]">The booking widget is included in Studio (149 lei/mo) and Chain plans.</p>
        <Link href="/business/pricing" className="btn btn-primary inline-flex">See pricing</Link>
      </section>
    </main>
  );
}
