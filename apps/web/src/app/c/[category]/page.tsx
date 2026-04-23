import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

/* ─── Category data map ────────────────────────────────────────────── */
const CATEGORY_DATA: Record<string, { title: string; description: string; subspecialties: string[] }> = {
  hair: {
    title: "Hair",
    description: "From precision cuts to lived-in colour, find the stylist who gets your vision.",
    subspecialties: ["Balayage", "Highlights", "Afro hair", "Bridal styling", "Extensions", "Keratin", "Men's cuts", "Curly specialist"],
  },
  nails: {
    title: "Nails",
    description: "Gel, acrylic, nail art, and everything in between — curated nail professionals near you.",
    subspecialties: ["Gel manicure", "Acrylic", "Nail art", "Builder gel", "Pedicure", "Japanese gel", "Chrome nails", "Press-ons"],
  },
  skin: {
    title: "Skincare",
    description: "Clinical facials, peels, and bespoke treatments for every skin type and concern.",
    subspecialties: ["HydraFacial", "Chemical peel", "Microneedling", "LED therapy", "Acne treatment", "Anti-ageing", "Dermaplaning", "Extraction"],
  },
  makeup: {
    title: "Makeup",
    description: "Bridal, editorial, and everyday — verified makeup artists for any occasion.",
    subspecialties: ["Bridal", "Editorial", "Evening", "Lessons", "SFX", "Natural", "Contouring", "Airbrush"],
  },
  "brows-lashes": {
    title: "Brows & lashes",
    description: "From microblading to lash lifts, frame your features with certified specialists.",
    subspecialties: ["Microblading", "Lash extensions", "Lash lift", "Brow lamination", "Tinting", "Threading", "Volume lashes", "Hybrid lashes"],
  },
  barbering: {
    title: "Barbering",
    description: "Classic cuts, fades, and beard artistry from master barbers in your area.",
    subspecialties: ["Fade", "Classic cut", "Beard trim", "Hot towel shave", "Afro barber", "Beard artistry", "Kids cut", "Scissor cut"],
  },
  wellness: {
    title: "Wellness",
    description: "Massage, meditation, and holistic treatments for body and mind.",
    subspecialties: ["Deep tissue", "Swedish", "Hot stone", "Aromatherapy", "Sports massage", "Reflexology", "Thai massage", "Prenatal"],
  },
  aesthetics: {
    title: "Aesthetics",
    description: "Advanced aesthetic treatments from qualified, insured medical professionals.",
    subspecialties: ["Botox", "Dermal fillers", "Lip fillers", "PRP", "Thread lift", "Body contouring", "Laser hair removal", "Skin tightening"],
  },
};

/* ─── Mock top pros ────────────────────────────────────────────────── */
function generateMockPros(category: string) {
  const names = ["Ana Sala", "Iulia Marin", "Andrei Pop", "Elena D.", "Maria V.", "Cristina L.", "Alex R.", "Diana M.", "Stefan B.", "Laura T.", "Ioana P.", "Mihai S."];
  return names.slice(0, 12).map((name, i) => ({
    name, slug: `pro-${category}-${i}`, rating: (4.5 + Math.random() * 0.5).toFixed(1), reviews: 20 + Math.floor(Math.random() * 200),
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = CATEGORY_DATA[category];

  if (!data) {
    return (
      <>
        <Navbar />
        <main className="pt-14 page-container py-20 text-center">
          <h1 className="page-title text-[var(--ink)]">Category not found</h1>
          <Link href="/search" className="btn btn-primary mt-6">Browse all</Link>
        </main>
        <Footer />
      </>
    );
  }

  const pros = generateMockPros(category);

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <section className="page-container pt-16 pb-12 md:pt-24 md:pb-16">
          <p className="section-key mb-3">— {category.replace("-", " & ")}</p>
          <h1 className="page-title text-[var(--ink)] mb-4">
            {data.title}
          </h1>
          <p className="text-[var(--ink-3)] text-base md:text-lg max-w-xl leading-relaxed">
            {data.description}
          </p>
          <Link href={`/search?cat=${category}`} className="btn btn-primary mt-6">
            <GlamrIcon name="search" size={15} />
            Search {data.title.toLowerCase()} professionals
          </Link>
        </section>

        {/* Sub-specialties */}
        <section className="page-container pb-12">
          <p className="section-key mb-4">— sub-specialties</p>
          <div className="flex flex-wrap gap-2">
            {data.subspecialties.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}&cat=${category}`} className="chip">
                {s}
              </Link>
            ))}
          </div>
        </section>

        {/* Top 12 pros */}
        <section className="py-12 bg-[var(--paper-2)]">
          <div className="page-container">
            <div className="flex items-end justify-between mb-8">
              <h2 className="section-header text-[var(--ink)]">
                Top <em className="italic-plum">{data.title.toLowerCase()}</em> professionals
              </h2>
              <Link href={`/search?cat=${category}&sort=rating`} className="btn btn-ghost btn-sm hidden md:inline-flex">
                View all <GlamrIcon name="arrow" size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pros.map((pro) => (
                <Link key={pro.slug} href={`/b/${pro.slug}`} className="card card-hover p-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--paper-3)] placeholder" />
                  <div>
                    <h3 className="text-[14px] font-medium text-[var(--ink)]">{pro.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <GlamrIcon name="star" size={11} className="text-[var(--amber)]" />
                      <span className="tabular-num text-[12px] text-[var(--ink-2)]">{pro.rating}</span>
                      <span className="text-[11px] text-[var(--ink-4)]">({pro.reviews})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
