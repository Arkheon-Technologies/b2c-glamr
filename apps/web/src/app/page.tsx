import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ─── SVG Placeholders ──────────────────────────────────────────────
   Grayscale abstract compositions — no external image deps.
────────────────────────────────────────────────────────────────────── */

function HeroPortrait() {
  return (
    <svg viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover" aria-hidden="true">
      <rect width="320" height="420" fill="#e8e8e8" />
      {/* body/torso silhouette */}
      <ellipse cx="160" cy="360" rx="120" ry="80" fill="#c0c0c0" />
      {/* neck */}
      <rect x="140" y="250" width="40" height="60" fill="#b8b8b8" rx="0" />
      {/* head */}
      <ellipse cx="160" cy="200" rx="70" ry="85" fill="#b0b0b0" />
      {/* hair */}
      <ellipse cx="160" cy="135" rx="72" ry="55" fill="#888888" />
      <ellipse cx="95"  cy="200" rx="20" ry="60" fill="#888888" />
      <ellipse cx="225" cy="200" rx="20" ry="60" fill="#888888" />
      {/* subtle feature lines */}
      <line x1="145" y1="195" x2="155" y2="195" stroke="#999" strokeWidth="1.5" />
      <line x1="165" y1="195" x2="175" y2="195" stroke="#999" strokeWidth="1.5" />
      <path d="M148 215 Q160 222 172 215" stroke="#999" strokeWidth="1.5" fill="none" />
      {/* background architectural lines */}
      <line x1="0"   y1="380" x2="320" y2="380" stroke="#d0d0d0" strokeWidth="0.5" />
      <line x1="0"   y1="360" x2="320" y2="360" stroke="#d0d0d0" strokeWidth="0.5" />
      <line x1="260" y1="0"   x2="260" y2="420" stroke="#d0d0d0" strokeWidth="0.5" />
      <line x1="280" y1="0"   x2="280" y2="420" stroke="#d0d0d0" strokeWidth="0.5" />
    </svg>
  );
}

function BusinessImage() {
  return (
    <svg viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover" aria-hidden="true">
      <rect width="480" height="320" fill="#f0f0f0" />
      {/* workstation */}
      <rect x="40"  y="180" width="400" height="8"  fill="#c8c8c8" />
      <rect x="60"  y="100" width="180" height="80" fill="#d8d8d8" />
      <rect x="260" y="120" width="160" height="60" fill="#d0d0d0" />
      {/* monitor bezel */}
      <rect x="70"  y="108" width="160" height="60" fill="#e8e8e8" />
      <rect x="270" y="128" width="140" height="40" fill="#e4e4e4" />
      {/* grid lines on screens */}
      {[120,136,152,168].map((y) => (
        <line key={y} x1="78" y1={y} x2="222" y2={y} stroke="#c0c0c0" strokeWidth="0.5" />
      ))}
      {[80,120,160,200].map((x) => (
        <line key={x} x1={x} y1="108" x2={x} y2="168" stroke="#c0c0c0" strokeWidth="0.5" />
      ))}
      {/* accent bar */}
      <rect x="270" y="128" width="28" height="40" fill="#c0c0c0" />
      {/* bottles/product */}
      <rect x="360" y="140" width="16" height="40" fill="#b8b8b8" />
      <rect x="382" y="150" width="12" height="30" fill="#c4c4c4" />
      <rect x="400" y="145" width="14" height="35" fill="#b4b4b4" />
      <line x1="0" y1="0" x2="0" y2="320" stroke="#e0e0e0" strokeWidth="0.5" />
      <line x1="0" y1="50" x2="480" y2="50" stroke="#e0e0e0" strokeWidth="0.5" />
    </svg>
  );
}

function PortalMockup() {
  return (
    <svg viewBox="0 0 560 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="560" height="360" fill="#f9f9f9" />
      {/* browser chrome */}
      <rect width="560" height="28" fill="#e8e8e8" />
      <circle cx="16" cy="14" r="5" fill="#d0d0d0" />
      <circle cx="30" cy="14" r="5" fill="#d0d0d0" />
      <circle cx="44" cy="14" r="5" fill="#d0d0d0" />
      <rect x="60" y="6" width="440" height="16" fill="#f0f0f0" />
      {/* sidebar */}
      <rect x="0" y="28" width="140" height="332" fill="#f3f3f3" />
      <rect x="0" y="28" width="3"   height="332" fill="#124af0" />
      {[50,80,110,140].map((y, i) => (
        <g key={y}>
          <rect x="12" y={y} width="18" height="18" fill="#d0d0d0" />
          <rect x="38" y={y+4} width={60 - i*8} height="3" fill="#c8c8c8" />
          <rect x="38" y={y+10} width={45 - i*5} height="2" fill="#ddd" />
        </g>
      ))}
      {/* main area cards */}
      <rect x="156" y="44" width="380" height="60" fill="#ffffff" />
      <rect x="156" y="44" width="380" height="60" fill="none" stroke="#e8e8e8" strokeWidth="1" />
      <rect x="168" y="56" width="36" height="36" fill="#e0e0e0" />
      <rect x="214" y="60" width="80" height="6" fill="#c8c8c8" />
      <rect x="214" y="72" width="55" height="4" fill="#e0e0e0" />
      <rect x="470" y="62" width="54" height="24" fill="#124af0" />
      {/* second card */}
      <rect x="156" y="116" width="380" height="60" fill="#ffffff" />
      <rect x="156" y="116" width="380" height="60" fill="none" stroke="#e8e8e8" strokeWidth="1" />
      <rect x="168" y="128" width="36" height="36" fill="#e8e8e8" />
      <rect x="214" y="132" width="90" height="6" fill="#d0d0d0" />
      <rect x="214" y="144" width="60" height="4" fill="#e8e8e8" />
      <rect x="470" y="134" width="54" height="24" fill="#e0e0e0" />
      {/* chart area */}
      <rect x="156" y="188" width="182" height="140" fill="#ffffff" />
      <rect x="156" y="188" width="182" height="140" fill="none" stroke="#e8e8e8" strokeWidth="1" />
      {[0,1,2,3,4].map((i) => (
        <rect key={i} x={168 + i*30} y={280 - i*18 - 20} width="22" height={i*18 + 20} fill={i===3?"#124af0":"#d8d8d8"} />
      ))}
      <rect x="350" y="188" width="186" height="140" fill="#ffffff" />
      <rect x="350" y="188" width="186" height="140" fill="none" stroke="#e8e8e8" strokeWidth="1" />
      <circle cx="443" cy="258" r="44" fill="none" stroke="#e0e0e0" strokeWidth="20" />
      <circle cx="443" cy="258" r="44" fill="none" stroke="#124af0" strokeWidth="20" strokeDasharray="100 180" strokeDashoffset="0" />
    </svg>
  );
}

/* ─── Departments data ──────────────────────────────────────────────── */
const DEPARTMENTS = [
  { icon: "face",           label: "Aesthetics"    },
  { icon: "content_cut",    label: "Hair Design"   },
  { icon: "spa",            label: "Dermacare"     },
  { icon: "brush",          label: "Visage"        },
  { icon: "health_and_safety", label: "Wellness"   },
  { icon: "clean_hands",    label: "Manicure"      },
  { icon: "visibility",     label: "Ocular Art"    },
  { icon: "medication",     label: "Clinical"      },
  { icon: "self_improvement", label: "Sculpting"   },
  { icon: "bolt",           label: "Laser Tech"    },
  { icon: "timer",          label: "Speed Triage"  },
  { icon: "diversity_2",    label: "Holistic"      },
  { icon: "architecture",   label: "Structural"    },
];

/* ─── Business features ─────────────────────────────────────────────── */
const BUSINESS_FEATURES = [
  {
    icon: "schedule",
    title: "Algorithmic Scheduling",
    desc: "Optimise practitioner time with split-phase booking buffers and gap-filling logic. A colourist can take another client during a 45-min processing window.",
  },
  {
    icon: "credit_card",
    title: "Financial Blueprinting",
    desc: "Real-time revenue architecture with integrated payment flows, automatic deposits, and recurring subscription logic.",
  },
  {
    icon: "manage_accounts",
    title: "Client Archetyping",
    desc: "Detailed client history and treatment mapping with high-resolution digital charting and no-show protection.",
  },
];

/* ─── Client features ────────────────────────────────────────────────── */
const CLIENT_FEATURES = [
  {
    icon: "search",
    title: "Portfolio Discovery",
    desc: "Browse by work, not by name. Every photo is tagged to a service and becomes a direct booking entry point.",
  },
  {
    icon: "flash_on",
    title: "Instant Booking",
    desc: "Reserve in under 30 seconds. Real-time availability, upfront pricing, and instant confirmation.",
  },
  {
    icon: "inventory_2",
    title: "Packages & Bundles",
    desc: "Book multi-session treatment plans and packages with a single checkout.",
  },
  {
    icon: "star",
    title: "Verified Reviews",
    desc: "Authenticated post-appointment reviews with photo-matched evidence of outcomes.",
  },
];

/* ─── Testimonials ──────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "THE SYSTEM IS SURGICAL IN ITS PRECISION. IT REDEFINED OUR ENTIRE BOOKING WORKFLOW.",
    author: "ELARA VANCE",
    role: "FOUNDER @ VANCE DERMA",
  },
  {
    quote: "WE SCALED FROM ONE TO FIVE LOCATIONS IN TWELVE MONTHS. GLAMR MADE IT POSSIBLE.",
    author: "MARCUS REED",
    role: "COO @ PRISTINE LABS",
  },
  {
    quote: "SPLIT-PHASE SCHEDULING ALONE INCREASED MY REVENUE BY 40%. THIS IS THE FUTURE.",
    author: "JASMINE OKORO",
    role: "MASTER COLOURIST @ STUDIO 01",
  },
];

/* ─── Pricing tiers ─────────────────────────────────────────────────── */
const PRICING = [
  {
    tier: "Solo Practitioner",
    price: "£49",
    period: "/MO",
    features: [
      "Single Station License",
      "Smart Booking Engine",
      "Client Portal Lite",
      "Core Analytics",
    ],
    cta: "Select Foundation",
    featured: false,
  },
  {
    tier: "Clinic Studio",
    price: "£149",
    period: "/MO",
    features: [
      "Up to 10 Stations",
      "Full Portfolio Engine",
      "Client CRM + Automation",
      "Marketing Suite",
    ],
    cta: "Scale Operation",
    featured: true,
  },
  {
    tier: "Network / Franchise",
    price: "CUSTOM",
    period: "",
    features: [
      "Unlimited Locations",
      "Centralised Data Lab",
      "Custom Branding Layer",
      "API Access Architecture",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── 1. Hero ─────────────────────────────────────────────────── */}
        <section className="relative min-h-screen pt-32 pb-20 px-8 bg-surface overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-3">
                <span className="w-2 h-2 bg-primary-fixed" />
                <span className="font-label font-bold uppercase tracking-[0.3em] text-[10px] text-primary-fixed">
                  The Operating System for Modern Beauty
                </span>
              </div>
              <h1 className="font-headline font-black tracking-tighter leading-[0.88] text-primary"
                style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
                Precision scheduling.<br />
                <span className="text-primary-fixed">Flawless</span> execution.
              </h1>
              <p className="text-xl font-light max-w-xl text-on-surface-variant leading-relaxed">
                The booking marketplace built for beauty professionals.
                Split-phase calendars, portfolio-driven discovery, and
                walk-in queue management — all in one architecture.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/explore"
                  className="bg-primary text-white font-headline font-bold uppercase tracking-tighter text-lg px-10 py-4 hover:bg-primary-fixed transition-colors"
                >
                  Start Engineering
                </Link>
                <Link
                  href="/explore"
                  className="border border-outline/20 font-headline font-bold uppercase tracking-tighter text-lg px-10 py-4 text-primary hover:bg-surface-container transition-colors"
                >
                  View Demo
                </Link>
              </div>
            </div>

            {/* Right — editorial image card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-container-lowest border border-outline-variant/20 p-3 shadow-2xl" style={{ transform: "rotate(2deg)" }}>
                <div className="aspect-[3/4] bg-surface-container overflow-hidden relative">
                  <HeroPortrait />
                  <div className="absolute inset-0 bg-primary-fixed/5 mix-blend-multiply" />
                </div>
              </div>
              {/* stat callout */}
              <div className="absolute -bottom-6 -left-6 bg-primary-fixed text-white p-8 shadow-2xl">
                <p className="font-headline font-black text-3xl tracking-tighter">+42%</p>
                <p className="uppercase text-[9px] tracking-[0.2em] font-bold opacity-80 pt-1">Revenue Increase</p>
              </div>
            </div>
          </div>

          {/* Social proof marquee */}
          <div className="mt-24 border-t border-b border-outline-variant/10 py-7 overflow-hidden">
            <div className="flex whitespace-nowrap gap-16 animate-marquee items-center opacity-30 grayscale">
              {["ESTHÉTIQUE PRO","GLO CLINIC","SKIN ARCHITECTS","DERMA CORE","NOIR BEAUTY","STUDIO 01","PRISTINE LAB","ESTHÉTIQUE PRO","GLO CLINIC","SKIN ARCHITECTS","DERMA CORE","NOIR BEAUTY","STUDIO 01","PRISTINE LAB"].map((name, i) => (
                <span key={i} className="font-headline font-black text-xl tracking-widest flex-shrink-0">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Departments grid ──────────────────────────────────────── */}
        <section id="services" className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <h2 className="font-headline font-black uppercase tracking-tighter text-4xl text-primary leading-none">Departments</h2>
              <Link href="/explore" className="font-headline font-bold uppercase tracking-widest text-xs text-primary-fixed hover:underline">
                Select Specialty →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px bg-outline-variant/20 border border-outline-variant/20">
              {DEPARTMENTS.map((dept) => (
                <Link
                  key={dept.label}
                  href={`/explore?vertical=${encodeURIComponent(dept.label)}`}
                  className="bg-surface p-6 aspect-square flex flex-col justify-between hover:bg-primary hover:text-white transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined text-4xl group-hover:text-white">
                    {dept.icon}
                  </span>
                  <span className="font-headline font-bold uppercase tracking-tight text-xs">
                    {dept.label}
                  </span>
                </Link>
              ))}
              {/* "More" cell */}
              <div className="bg-surface-container aspect-square flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed text-3xl">add</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. For Businesses ───────────────────────────────────────── */}
        <section id="business" className="py-32 px-8 bg-surface-container-lowest border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                <div className="inline-block px-4 py-1 bg-primary text-white font-headline text-[10px] font-bold tracking-[0.2em] uppercase">
                  Enterprise Grade
                </div>
                <h2 className="font-headline font-black tracking-tighter leading-[0.85] uppercase text-primary"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
                  The Core of Your <span className="text-primary-fixed">Studio</span>
                </h2>
                <div className="grid grid-cols-1 gap-8 pt-4">
                  {BUSINESS_FEATURES.map((f) => (
                    <div key={f.title} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary-fixed">{f.icon}</span>
                        <h3 className="font-headline font-bold text-lg uppercase tracking-tight">{f.title}</h3>
                      </div>
                      <p className="text-on-surface-variant font-light leading-relaxed text-sm pl-8">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Image */}
              <div className="relative">
                <div className="bg-surface-container p-1 border border-outline-variant/20">
                  <div className="aspect-video overflow-hidden">
                    <BusinessImage />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Patient Portal / For Clients ─────────────────────────── */}
        <section id="features" className="py-32 px-8 bg-surface">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <h2 className="font-headline font-black uppercase tracking-tighter text-5xl text-primary mb-16">
              Client Portal Architecture
            </h2>
            <div className="w-full max-w-5xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm overflow-hidden">
              {/* App mockup top bar */}
              <div className="flex border-b border-outline-variant/10">
                <div className="p-6 border-r border-outline-variant/10 w-1/3 text-left">
                  <p className="text-[9px] uppercase font-black tracking-widest text-primary-fixed mb-3">Discovery</p>
                  <h4 className="font-headline font-bold text-base leading-tight uppercase mb-4">Advanced Filters</h4>
                  <div className="space-y-2">
                    <div className="h-1 bg-primary w-full" />
                    <div className="h-1 bg-surface-container-high w-3/4" />
                    <div className="h-1 bg-surface-container-high w-1/2" />
                  </div>
                </div>
                <div className="p-6 w-2/3 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-surface-container-high" />
                    <div className="text-left">
                      <p className="font-headline font-bold uppercase text-sm">Dr. Aris Thorne</p>
                      <p className="text-[9px] uppercase opacity-60 mt-0.5">Dermal Specialist</p>
                    </div>
                  </div>
                  <Link href="/explore" className="bg-primary text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary-fixed transition-colors">
                    Select
                  </Link>
                </div>
              </div>
              {/* Mockup preview image */}
              <div className="aspect-video relative overflow-hidden bg-surface-container">
                <PortalMockup />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white text-left">
                  <p className="font-headline font-black uppercase tracking-tighter text-2xl">Instant Clinical Matching</p>
                  <p className="font-light text-xs uppercase tracking-widest opacity-80 mt-1">Powered by proximity &amp; skill</p>
                </div>
              </div>
            </div>
            {/* Client feature chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/20 border border-outline-variant/20 w-full max-w-5xl mt-px">
              {CLIENT_FEATURES.map((f) => (
                <div key={f.title} className="bg-surface-container-lowest p-8 text-left">
                  <span className="material-symbols-outlined text-primary-fixed mb-4 block">{f.icon}</span>
                  <h4 className="font-headline font-bold uppercase tracking-tight text-sm mb-2">{f.title}</h4>
                  <p className="text-on-surface-variant font-light text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Before / After ──────────────────────────────────────── */}
        <section className="bg-black py-32 px-8 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-4 space-y-8">
                <h2 className="font-headline font-black uppercase tracking-tighter leading-none text-white"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
                  The<br /><span className="text-primary-fixed">Engine</span><br />of Result
                </h2>
                <p className="font-light text-lg leading-relaxed opacity-70">
                  Document transformations with clinical precision.
                  Standardised lighting, angle detection, and
                  before/after proof of efficacy.
                </p>
                <div className="space-y-4 pt-4">
                  {["Standardised Grids","Colour Corrected Export","Anonymised Processing"].map((item) => (
                    <div key={item} className="flex items-center gap-4">
                      <span className="w-2 h-2 bg-primary-fixed flex-shrink-0" />
                      <p className="uppercase font-bold tracking-widest text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Static before/after pair */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 gap-px bg-outline-variant/20">
                  <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
                      <rect width="400" height="250" fill="#2a2a2a" />
                      <ellipse cx="200" cy="125" rx="80" ry="100" fill="#3a3a3a" />
                      <ellipse cx="200" cy="80"  rx="60" ry="55"  fill="#444" />
                      <rect x="0" y="225" width="400" height="25" fill="#222" />
                    </svg>
                    <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 font-label text-[9px] font-black uppercase tracking-[0.3em] text-white">
                      Phase 01
                    </div>
                  </div>
                  <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                    <svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
                      <rect width="400" height="250" fill="#1a1a1a" />
                      <ellipse cx="200" cy="125" rx="80" ry="100" fill="#555" />
                      <ellipse cx="200" cy="80"  rx="60" ry="55"  fill="#666" />
                      <ellipse cx="200" cy="125" rx="70" ry="90"  fill="none" stroke="#888" strokeWidth="1" />
                      <rect x="0" y="225" width="400" height="25" fill="#111" />
                    </svg>
                    <div className="absolute top-3 right-3 bg-primary-fixed px-3 py-1 font-label text-[9px] font-black uppercase tracking-[0.3em] text-white">
                      Final Stage
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Terminal / Metrics ───────────────────────────────────── */}
        <section className="py-24 px-8 bg-surface-container-low font-mono text-sm">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black text-on-tertiary p-8 border border-outline-variant/10">
              <div className="flex justify-between border-b border-zinc-800 pb-4 mb-8">
                <p className="uppercase tracking-widest text-primary-fixed font-bold text-xs">SYSTEM_LOG: MARKET_PRICING_V2.1</p>
                <p className="opacity-50 text-xs">STABLE_CONNECTION // GLAMR_CORE</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  {
                    key: "ANALYSIS_BOT_01",
                    stat: "18.4%",
                    text: "Dynamic slot optimisation increases net margin across all high-density bookings.",
                    pct: "80%",
                  },
                  {
                    key: "CAPACITY_ENGINE",
                    stat: "0.00%",
                    text: "Predictive workload balancing ensures zero technician burnout risk during peak seasons.",
                    pct: "66%",
                  },
                  {
                    key: "RETENTION_FLUID",
                    stat: "3×",
                    text: "Automated re-booking architecture generates 3× higher lifetime value per client.",
                    pct: "100%",
                  },
                ].map((item) => (
                  <div key={item.key} className="space-y-4">
                    <p className="text-zinc-500 uppercase text-[9px] tracking-widest">&gt; {item.key}</p>
                    <p className="text-primary-fixed font-bold text-2xl font-headline">{item.stat}</p>
                    <p className="text-white text-sm leading-relaxed">{item.text}</p>
                    <div className="w-full bg-zinc-900 h-1">
                      <div className="bg-primary-fixed h-full" style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Social Proof ─────────────────────────────────────────── */}
        <section className="py-32 px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <h2 className="font-headline font-black tracking-tighter text-primary" style={{ fontSize: "clamp(4rem, 8vw, 8rem)", lineHeight: 1 }}>001</h2>
                <p className="uppercase font-headline font-bold text-primary-fixed tracking-widest text-xs pt-4">Global Leader</p>
                <p className="text-on-surface-variant pt-6 text-lg font-light leading-relaxed">
                  The standard for premium beauty architecture. Rated #1 by the Aesthetic Technology Council.
                </p>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-px bg-outline-variant/20">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className={`bg-surface-container-lowest p-10 ${i === 2 ? "md:col-span-2" : ""}`}>
                    <div className="flex gap-0.5 mb-6">
                      {[...Array(5)].map((_, s) => (
                        <span key={s} className="material-symbols-outlined text-sm text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="font-headline font-bold text-xl tracking-tight mb-6">&ldquo;{t.quote}&rdquo;</p>
                    <p className="font-label font-bold uppercase text-[9px] tracking-widest opacity-60">
                      {t.author} / {t.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Pricing ──────────────────────────────────────────────── */}
        <section id="pricing" className="py-32 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-24 text-center">
              <h2 className="font-headline font-black uppercase tracking-tighter text-6xl text-primary mb-4">
                Architecture <span className="text-primary-fixed">Tiers</span>
              </h2>
              <p className="font-headline uppercase tracking-widest text-[10px] text-on-surface-variant">Investment levels for clinical growth</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/20">
              {PRICING.map((plan) => (
                <div
                  key={plan.tier}
                  className={`p-12 flex flex-col justify-between ${plan.featured ? "bg-primary text-white relative" : "bg-surface-container-lowest hover:bg-surface-container"} transition-colors`}
                >
                  {plan.featured && (
                    <div className="absolute top-0 right-0 bg-primary-fixed text-white px-4 py-1 text-[9px] font-black uppercase tracking-widest">
                      Recommended
                    </div>
                  )}
                  <div>
                    <p className={`font-headline font-bold uppercase text-[10px] tracking-widest mb-10 ${plan.featured ? "text-primary-fixed" : "text-primary-fixed"}`}>
                      {plan.tier}
                    </p>
                    <p className="font-headline font-black tracking-tighter text-5xl mb-6">
                      {plan.price}
                      {plan.period && <span className="text-sm opacity-40">{plan.period}</span>}
                    </p>
                    <ul className="space-y-4 pt-4">
                      {plan.features.map((f) => (
                        <li key={f} className={`flex items-center gap-3 text-sm ${plan.featured ? "opacity-80" : "opacity-70"}`}>
                          <span className={`w-1.5 h-1.5 flex-shrink-0 ${plan.featured ? "bg-primary-fixed" : "bg-primary"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className={`mt-14 w-full py-4 font-headline font-bold uppercase tracking-widest text-xs transition-all ${
                      plan.featured
                        ? "bg-white text-primary hover:bg-primary-fixed hover:text-white"
                        : "border border-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. Final CTA ─────────────────────────────────────────────── */}
        <section className="py-48 px-8 bg-black text-white relative overflow-hidden">
          {/* dot pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2
              className="font-headline font-black tracking-tighter leading-none mb-12 uppercase text-white"
              style={{ fontSize: "clamp(4rem, 12vw, 9rem)" }}
            >
              Build Your<br /><span className="text-primary-fixed">Legacy.</span>
            </h2>
            <Link
              href="/auth/register"
              className="inline-block bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xl px-16 py-6 hover:scale-105 active:scale-95 transition-all"
            >
              Initialize Platform
            </Link>
            <p className="mt-12 uppercase text-[9px] tracking-[0.4em] opacity-40">
              glamr v4.0 // all rights reserved
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
