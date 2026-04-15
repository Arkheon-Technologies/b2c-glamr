import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BEAUTY_VERTICALS } from "@glamr/shared-types";

/* ─── Grayscale portrait placeholders ───────────────────────────── */
function Portrait({ seed }: { seed: number }) {
  const shades = ["#c0c0c0","#b0b0b0","#a0a0a0","#909090","#808080","#989898","#aaaaaa","#bcbcbc"];
  const bg     = ["#e8e8e8","#e0e0e0","#d8d8d8","#ebebeb","#e4e4e4","#dddddd","#f0f0f0","#e6e6e6"];
  const hair   = ["#888","#777","#666","#999","#6a6a6a","#858585","#707070","#7a7a7a"];
  const b = bg[seed % bg.length];
  const s = shades[seed % shades.length];
  const h = hair[seed % hair.length];
  const torsoW = 100 + (seed % 3) * 10;
  return (
    <svg viewBox="0 0 280 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover" aria-hidden="true">
      <rect width="280" height="320" fill={b} />
      {/* torso */}
      <ellipse cx="140" cy="310" rx={torsoW} ry="70" fill={s} />
      {/* neck */}
      <rect x="124" y="220" width="32" height="55" fill={shades[(seed+2)%shades.length]} />
      {/* head */}
      <ellipse cx="140" cy="175" rx="62" ry="72" fill={s} />
      {/* hair */}
      <ellipse cx="140" cy="118" rx="64" ry="48" fill={h} />
      {seed % 2 === 0 && <ellipse cx="82"  cy="170" rx="16" ry="55" fill={h} />}
      {seed % 2 === 0 && <ellipse cx="198" cy="170" rx="16" ry="55" fill={h} />}
      {/* grid overlay */}
      <line x1="0" y1="280" x2="280" y2="280" stroke="#d0d0d0" strokeWidth="0.5" />
      <line x1="240" y1="0" x2="240" y2="320" stroke="#d0d0d0" strokeWidth="0.5" />
      <line x1="260" y1="0" x2="260" y2="320" stroke="#d0d0d0" strokeWidth="0.5" />
    </svg>
  );
}

/* ─── Placeholder artist data ────────────────────────────────────── */
const ARTISTS = [
  { name: "ELARA VANCE",  specialty: "SKIN ARCHITECT & PEELS",   rating: 4.9, price: 340, badge: "SENIOR ARTIST", badgeBlue: false },
  { name: "JULIAN MARX",  specialty: "FACIAL RECONSTRUCTION",    rating: 5.0, price: 450, badge: "TOP RATED",    badgeBlue: true  },
  { name: "SOPHIA CHEN",  specialty: "LASER & PIGMENTATION",     rating: 4.8, price: 290, badge: null,           badgeBlue: false },
  { name: "MARCUS RAE",   specialty: "INJECTABLES & VOLUME",     rating: 4.7, price: 520, badge: null,           badgeBlue: false },
  { name: "AMARA DIALLO", specialty: "BALAYAGE & COLOUR",        rating: 4.9, price: 195, badge: "TOP RATED",    badgeBlue: true  },
  { name: "JADE OKAFOR",  specialty: "STRUCTURAL GEL & NAILS",   rating: 4.8, price: 95,  badge: "SENIOR ARTIST",badgeBlue: false },
  { name: "NADIA BLANC",  specialty: "BROW ARCHITECTURE",        rating: 4.9, price: 140, badge: null,           badgeBlue: false },
  { name: "THEO WEST",    specialty: "BARBERING & FADE DESIGN",  rating: 4.7, price: 80,  badge: null,           badgeBlue: false },
];

const VERTICAL_LABELS: Record<string, string> = {
  hair: "Hair",
  barbershop: "Barbershop",
  nails: "Nails",
  cosmetology: "Cosmetology",
  brows: "Brows",
  laser: "Laser",
  body_treatments: "Body",
  medical_aesthetics: "Medical",
  massage: "Massage",
  micropigmentation: "Micropig.",
  lashes: "Lashes",
  makeup: "Makeup",
  other: "Other",
};

export default function ExplorePage() {
  return (
    <>
      <Navbar />

      {/* ── Search Header ─────────────────────────────────────────── */}
      <div className="pt-20 bg-surface-container-lowest border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-8 pt-16 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-fixed font-bold mb-3">
                Artist Discovery
              </p>
              <h1 className="font-headline font-black tracking-tighter text-primary uppercase"
                style={{ fontSize: "clamp(2.5rem,6vw,5rem)", lineHeight: 1 }}>
                Select Artist
              </h1>
            </div>
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">search</span>
              <input
                type="text"
                placeholder="Search by name or specialty…"
                className="w-full bg-transparent border border-outline-variant pl-10 pr-4 py-3 text-xs font-label uppercase tracking-widest placeholder:text-outline/50 focus:border-primary-fixed focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Vertical filter pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button className="flex-shrink-0 font-label text-[10px] tracking-[0.2em] font-bold uppercase py-2 px-5 bg-primary text-white">
              All
            </button>
            {BEAUTY_VERTICALS.map((v) => (
              <button
                key={v}
                className="flex-shrink-0 font-label text-[10px] tracking-[0.2em] font-medium uppercase py-2 px-5 border border-outline-variant hover:border-primary-fixed hover:text-primary-fixed transition-colors"
              >
                {VERTICAL_LABELS[v] ?? v}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="max-w-7xl mx-auto px-8 pb-4 flex justify-between items-center">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            {ARTISTS.length} Professionals Matched
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            Sort: Top Rated
          </span>
        </div>
      </div>

      {/* ── Artist Grid ───────────────────────────────────────────── */}
      <main className="bg-surface-container-low min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/20 border border-outline-variant/20">
            {ARTISTS.map((artist, i) => (
              <div
                key={artist.name}
                className={`bg-surface group transition-all duration-300 hover:bg-surface-container-lowest flex flex-col ${artist.badge && artist.badgeBlue ? "border-2 border-primary-fixed relative" : ""}`}
              >
                {/* selected indicator */}
                {artist.badge && artist.badgeBlue && (
                  <div className="absolute -top-px -left-px bg-primary-fixed text-white p-1.5">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}

                {/* Portrait */}
                <div className="relative aspect-square overflow-hidden bg-surface-dim">
                  <Portrait seed={i} />
                  <div className="absolute inset-0 group-hover:bg-primary/5 transition-colors duration-500" />
                  {artist.badge && (
                    <div className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 ${artist.badgeBlue ? "bg-primary-fixed text-white" : "bg-primary text-white"}`}>
                      {artist.badge}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline text-lg font-bold tracking-tight">{artist.name}</h3>
                      <p className={`font-label text-[10px] uppercase tracking-[0.2em] font-semibold mt-0.5 ${artist.badgeBlue ? "text-primary-fixed" : "text-on-surface-variant"}`}>
                        {artist.specialty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-primary-fixed flex-shrink-0">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-label text-xs font-black">{artist.rating}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20 mt-auto">
                    <span className="font-label text-xs font-bold uppercase tracking-widest">
                      £{artist.price} / SESSION
                    </span>
                    <Link
                      href="/auth/register"
                      className={`font-label text-[10px] font-black uppercase tracking-widest px-6 py-2.5 transition-all ${artist.badgeBlue ? "bg-primary-fixed text-white" : "bg-primary text-white hover:bg-primary-fixed group-hover:px-8"}`}
                    >
                      {artist.badgeBlue ? "Selected" : "Select"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
