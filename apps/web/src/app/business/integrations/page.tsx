import Link from "next/link";

export const metadata = { title: "Integrations — glamr for business" };

const INTEGRATIONS = [
  { name: "Zapier", category: "Automation", desc: "Connect glamr to 6,000+ apps. Trigger workflows on new bookings, cancellations, or new clients." },
  { name: "Webhooks", category: "Developer", desc: "Receive real-time HTTP POST events for every booking action. Build your own integrations." },
  { name: "Google Calendar", category: "Calendar", desc: "Two-way sync keeps your personal calendar and glamr schedule perfectly aligned." },
  { name: "WhatsApp", category: "Messaging", desc: "Send automated booking confirmations and reminders via WhatsApp Business." },
  { name: "Instagram", category: "Social", desc: "Add a Book Now button to your Instagram profile that links directly to your glamr page." },
  { name: "Stripe", category: "Payments", desc: "Collect deposits or full prepayments at the time of booking. Reduce no-shows." },
];

export default function IntegrationsPage() {
  return (
    <main className="page-container py-20 space-y-16">
      <section className="max-w-2xl space-y-4">
        <p className="small-meta text-[var(--ink-4)]">― integrations</p>
        <h1 className="page-title text-[var(--ink)]">Connect the tools you already use</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed">
          glamr plays nicely with your existing stack. Automate follow-ups, sync calendars, and collect payments — all without switching tabs.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-5">
        {INTEGRATIONS.map((item) => (
          <div key={item.name} className="card p-6 space-y-2">
            <span className="badge badge-plum text-[9px]">{item.category}</span>
            <h3 className="text-[16px] font-medium text-[var(--ink)]">{item.name}</h3>
            <p className="text-[13px] text-[var(--ink-3)] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="card p-8 bg-[var(--plum-soft)] text-center space-y-4">
        <h2 className="card-serif text-[var(--plum)]">Need a custom integration?</h2>
        <p className="text-[14px] text-[var(--ink-2)]">Chain plan customers get access to our full webhook API and dedicated integration support.</p>
        <Link href="mailto:sales@glamr.ro" className="btn btn-primary inline-flex">Talk to us</Link>
      </section>
    </main>
  );
}
