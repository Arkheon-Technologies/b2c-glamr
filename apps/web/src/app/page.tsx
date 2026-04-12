import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ── Static Data ──────────────────────────────────────────────────── */

const features = [
  {
    title: "Split-Phase Scheduling",
    description:
      "Book the active phase, processing window, and finish separately. Your calendar fills intelligently — a hair colorist can take another client during the 45-min processing gap.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Portfolio-Driven Booking",
    description:
      "Clients discover you through your work. Every photo you upload is tagged to a service and becomes a direct entry point into your booking funnel.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    title: "Walk-In Queue",
    description:
      "Built for barbershops and nail studios. Manage live queues in real time, notify clients when they're up next, and track service duration per technician.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "No-Show Protection",
    description:
      "Collect deposits automatically at booking. Charge no-show fees with one click. Protect your revenue without the awkward conversation.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Packages & Memberships",
    description:
      "Sell 6-session laser packages, monthly lash memberships, or prepaid treatment bundles. Clients track their remaining sessions from their own profile.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: "Business Analytics",
    description:
      "Revenue per service, technician performance, no-show rates, rebooking trends, and loyalty analytics. The numbers that actually move the needle.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
      </svg>
    ),
  },
];

const steps = [
  {
    n: "01",
    title: "Create your profile",
    desc: "Set up your services, pricing, availability and upload portfolio photos. Takes less than 10 minutes.",
  },
  {
    n: "02",
    title: "Get discovered",
    desc: "Clients find you through portfolio searches, beauty vertical browsing, and location-based discovery.",
  },
  {
    n: "03",
    title: "Get booked & paid",
    desc: "Deposits collected instantly. Calendar updated automatically. Reminders sent without you lifting a finger.",
  },
];

const proPoints = [
  "Manage your calendar, clients, and payments in one place",
  "Collect deposits upfront — protect against no-shows",
  "Sell packages and memberships directly from your profile",
  "Portfolio photos link directly into your booking flow",
];

const clientPoints = [
  "Find artists by their actual work, not just their name",
  "Book instantly or browse by style, location, or vertical",
  "Track your package sessions and upcoming appointments",
  "Book a bridal party across hair, makeup, lashes and nails in one flow",
];

const stats = [
  { n: "10K+",    label: "Beauty professionals" },
  { n: "250K+",   label: "Bookings managed" },
  { n: "18",      label: "Beauty verticals" },
  { n: "£0",      label: "Setup cost" },
];

/* ── Page ─────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex flex-col flex-1">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-gradient" aria-hidden="true" />
          <div className="hero-grid"     aria-hidden="true" />

          <div className="hero-content animate-fadeUp">
            <span className="hero-eyebrow">
              <span className="hero-dot" aria-hidden="true" />
              Now in open beta · Free for solo artists
            </span>

            <h1 className="hero-h1">
              Book the artist.<br />
              <span className="gradient-text-bright">Not the time slot.</span>
            </h1>

            <p className="hero-sub">
              The only booking platform engineered for the complexity of beauty —
              split-phase scheduling, portfolio-first discovery, and no-show
              protection built in from day one.
            </p>

            <div className="hero-ctas">
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                Start for free
              </Link>
              <Link href="/explore" className="btn btn-secondary-dark btn-lg">
                Explore artists
              </Link>
            </div>

            <p className="hero-proof">No credit card required · Free forever for independent artists</p>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────── */}
        <section id="features" className="section">
          <div className="section-header">
            <span className="section-eyebrow">Why GLAMR</span>
            <h2 className="section-h2">Built for how beauty actually works</h2>
            <p className="section-sub">
              Not another calendar app. Every feature is designed around the operational
              reality of running a modern beauty business.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="card card-interactive">
                <div className="feature-icon-wrap" aria-hidden="true">
                  {f.icon}
                </div>
                <p className="feature-title">{f.title}</p>
                <p className="feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <section id="how-it-works" className="section-alt">
          <div className="section-header">
            <span className="section-eyebrow">How it works</span>
            <h2 className="section-h2">Up and running in minutes</h2>
          </div>

          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="step-number">{s.n}</span>
                <p className="step-title">{s.title}</p>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── For Who ───────────────────────────────────────────── */}
        <section id="for-business" className="section-dark">
          <div className="section-header">
            <span className="section-eyebrow">Built for both sides</span>
            <h2 className="section-h2-white">Two experiences. One platform.</h2>
            <p className="section-sub-white">
              GLAMR serves beauty professionals and their clients with
              purpose-built workflows for each.
            </p>
          </div>

          <div className="for-who-grid">
            {/* Professionals */}
            <div className="for-who-card for-who-card-pro">
              <span className="for-who-tag for-who-tag-pro">For Professionals</span>
              <h3 className="for-who-headline">
                Run your business.<br />Not your calendar.
              </h3>
              <p className="for-who-sub">
                Tools that match the real complexity of beauty bookings — from solo
                lash artists to multi-location salon chains.
              </p>
              <ul className="for-who-list">
                {proPoints.map((p) => (
                  <li key={p}>
                    <span className="check-rose" aria-hidden="true">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn btn-primary">
                Join as a professional
              </Link>
            </div>

            {/* Clients */}
            <div className="for-who-card for-who-card-client">
              <span className="for-who-tag for-who-tag-client">For Clients</span>
              <h3 className="for-who-headline">
                Find the artist<br />behind the work.
              </h3>
              <p className="for-who-sub">
                Discover beauty professionals through their portfolio, not just their
                availability. Book in seconds.
              </p>
              <ul className="for-who-list">
                {clientPoints.map((p) => (
                  <li key={p}>
                    <span className="check-gold" aria-hidden="true">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link href="/explore" className="btn btn-secondary-dark">
                Explore artists
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <div className="stats-bar" aria-label="Platform statistics">
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="stat-number">{s.n}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="cta-section">
          <div className="cta-glow" aria-hidden="true" />
          <div className="cta-content">
            <h2 className="cta-h2">
              Your clients are searching<br />for you. Right now.
            </h2>
            <p className="cta-sub">
              Create your GLAMR profile in minutes. Free forever for independent artists.
            </p>
            <div className="hero-ctas" style={{ justifyContent: "center" }}>
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                Get started free
              </Link>
              <Link href="/auth/login" className="btn btn-ghost-dark btn-lg">
                Log in
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
