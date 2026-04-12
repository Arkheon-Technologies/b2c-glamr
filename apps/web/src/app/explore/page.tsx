import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BEAUTY_VERTICALS } from "@glamr/shared-types";

/* ── SVG Cover Art ────────────────────────────────────────────────── */
// Each artist gets unique abstract art as their portfolio cover.
// These are static SVG compositions — no external images required.

function Cover1() {
  // Amara — flowing balayage waves in rose/gold
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#1e0d28" />
      <ellipse cx="60"  cy="180" rx="140" ry="90"  fill="#E91E8A" fillOpacity="0.18" />
      <ellipse cx="220" cy="40"  rx="100" ry="70"  fill="#D4A853" fillOpacity="0.12" />
      <path d="M0 100 Q70 40 140 100 Q210 160 280 100" stroke="#E91E8A" strokeOpacity="0.3" strokeWidth="2" fill="none" />
      <path d="M0 130 Q70 70 140 130 Q210 190 280 130" stroke="#D4A853" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
      <path d="M0 160 Q70 100 140 160 Q210 220 280 160" stroke="#FF4DA6" strokeOpacity="0.15" strokeWidth="1" fill="none" />
      <circle cx="200" cy="60" r="30" fill="#FF4DA6" fillOpacity="0.08" />
      <circle cx="80"  cy="150" r="50" fill="#D4A853" fillOpacity="0.06" />
    </svg>
  );
}

function Cover2() {
  // Sofia — lash extension geometry, deep blue
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#0a1428" />
      <circle cx="140" cy="108" r="80" fill="#6366F1" fillOpacity="0.1" />
      <circle cx="140" cy="108" r="55" fill="#6366F1" fillOpacity="0.08" />
      <circle cx="140" cy="108" r="30" fill="#6366F1" fillOpacity="0.06" />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
        <line
          key={i}
          x1="140" y1="108"
          x2={140 + 90 * Math.cos((deg * Math.PI) / 180)}
          y2={108 + 90 * Math.sin((deg * Math.PI) / 180)}
          stroke="#818CF8"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      ))}
      <ellipse cx="140" cy="108" rx="100" ry="40" fill="none" stroke="#E91E8A" strokeOpacity="0.2" strokeWidth="1" />
      <ellipse cx="140" cy="108" rx="70"  ry="25" fill="none" stroke="#D4A853" strokeOpacity="0.15" strokeWidth="1" />
    </svg>
  );
}

function Cover3() {
  // Jade — organic nail art blobs, emerald
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#051a10" />
      <path d="M30 180 Q80 120 150 140 Q220 160 260 100 Q280 60 250 20 Q320 -20 180 30 Q60 80 30 180Z"
        fill="#10B981" fillOpacity="0.12" />
      <path d="M0 120 Q60 60 120 90 Q180 120 240 80 Q280 50 280 90 Q280 150 200 170 Q100 200 0 170Z"
        fill="#059669" fillOpacity="0.1" />
      <circle cx="200" cy="60"  r="40" fill="#34D399" fillOpacity="0.08" />
      <circle cx="80"  cy="160" r="35" fill="#10B981" fillOpacity="0.1" />
      <path d="M40 50 Q100 20 160 60 Q220 100 200 160" stroke="#6EE7B7" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function Cover4() {
  // Priya — brow precision diagonal lines, purple
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#160d2a" />
      {Array.from({ length: 14 }, (_, i) => (
        <line
          key={i}
          x1={-40 + i * 26} y1="0"
          x2={-40 + i * 26 + 216} y2="216"
          stroke="#9B27AF"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      ))}
      <ellipse cx="100" cy="80"  rx="80" ry="40"  fill="#9B27AF" fillOpacity="0.14" />
      <ellipse cx="180" cy="140" rx="60" ry="35"  fill="#E91E8A" fillOpacity="0.1" />
      <path d="M20 108 Q140 50 260 108" stroke="#C084FC" strokeOpacity="0.3" strokeWidth="2" fill="none" />
      <circle cx="240" cy="40"  r="25" fill="#D4A853" fillOpacity="0.1" />
    </svg>
  );
}

function Cover5() {
  // Monique — bridal softness, warm rose circles
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#200a10" />
      <circle cx="140" cy="108" r="100" fill="#E91E8A" fillOpacity="0.06" />
      <circle cx="140" cy="108" r="75"  fill="#E91E8A" fillOpacity="0.06" />
      <circle cx="140" cy="108" r="50"  fill="#E91E8A" fillOpacity="0.07" />
      <circle cx="140" cy="108" r="28"  fill="#FF4DA6" fillOpacity="0.1" />
      <ellipse cx="70"  cy="60"  rx="50" ry="30" fill="#D4A853" fillOpacity="0.1" />
      <ellipse cx="210" cy="160" rx="50" ry="30" fill="#D4A853" fillOpacity="0.08" />
      <path d="M0 108 Q140 0 280 108" stroke="#FF4DA6" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
      <path d="M0 108 Q140 216 280 108" stroke="#D4A853" strokeOpacity="0.15" strokeWidth="1" fill="none" />
    </svg>
  );
}

function Cover6() {
  // Zara — laser precision grid, electric blue
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#05101e" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 32} x2="280" y2={i * 32}
          stroke="#0EA5E9" strokeOpacity="0.07" strokeWidth="1" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="216"
          stroke="#0EA5E9" strokeOpacity="0.07" strokeWidth="1" />
      ))}
      <circle cx="140" cy="108" r="60" fill="none" stroke="#0EA5E9" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="140" cy="108" r="30" fill="#0EA5E9" fillOpacity="0.08" />
      <line x1="140" y1="0"   x2="140" y2="216" stroke="#38BDF8" strokeOpacity="0.15" strokeWidth="1.5" />
      <line x1="0"   y1="108" x2="280" y2="108" stroke="#38BDF8" strokeOpacity="0.15" strokeWidth="1.5" />
      <ellipse cx="60" cy="30" rx="40" ry="20" fill="#6366F1" fillOpacity="0.12" />
    </svg>
  );
}

function Cover7() {
  // Isabelle — classic cut flowing shapes, indigo
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#0d0f1e" />
      <path d="M0 216 Q70 120 140 160 Q210 200 280 80 L280 216Z"
        fill="#4F46E5" fillOpacity="0.14" />
      <path d="M0 180 Q100 80 200 140 Q250 170 280 120 L280 216 L0 216Z"
        fill="#6366F1" fillOpacity="0.08" />
      <circle cx="220" cy="50"  r="55" fill="#818CF8" fillOpacity="0.08" />
      <circle cx="50"  cy="170" r="40" fill="#4F46E5" fillOpacity="0.1" />
      <path d="M0 60 Q90 20 180 60 Q240 90 280 50" stroke="#A5B4FC" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function Cover8() {
  // Kezia — micropigmentation dot matrix, dark forest
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#071210" />
      {Array.from({ length: 11 }, (_, row) =>
        Array.from({ length: 15 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={14 + col * 18}
            cy={12 + row * 18}
            r="1.5"
            fill="#10B981"
            fillOpacity={0.08 + ((row + col) % 4) * 0.04}
          />
        ))
      )}
      <ellipse cx="140" cy="108" rx="90" ry="65" fill="#10B981" fillOpacity="0.1" />
      <ellipse cx="140" cy="108" rx="55" ry="38" fill="#059669" fillOpacity="0.12" />
      <circle  cx="140" cy="108" r="20" fill="#34D399" fillOpacity="0.15" />
    </svg>
  );
}

function Cover9() {
  // Talia — massage warmth, amber waves
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#160e02" />
      <path d="M-20 80  Q60 20  140 80  Q220 140 300 80"  stroke="#D97706" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <path d="M-20 110 Q60 50  140 110 Q220 170 300 110" stroke="#F59E0B" strokeOpacity="0.2"  strokeWidth="1.5" fill="none" />
      <path d="M-20 140 Q60 80  140 140 Q220 200 300 140" stroke="#FBBF24" strokeOpacity="0.15" strokeWidth="1" fill="none" />
      <path d="M-20 170 Q60 110 140 170 Q220 230 300 170" stroke="#FCD34D" strokeOpacity="0.1"  strokeWidth="1" fill="none" />
      <ellipse cx="80"  cy="100" rx="60" ry="45" fill="#D4A853" fillOpacity="0.1" />
      <ellipse cx="200" cy="120" rx="55" ry="40" fill="#F59E0B" fillOpacity="0.08" />
      <circle  cx="230" cy="50"  r="35" fill="#D97706" fillOpacity="0.1" />
    </svg>
  );
}

function Cover10() {
  // Carmen — cosmetology facials, violet luxury
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#12051e" />
      <path d="M140 10 L260 80 L260 150 L140 210 L20 150 L20 80 Z"
        fill="none" stroke="#9B27AF" strokeOpacity="0.2" strokeWidth="1.5" />
      <path d="M140 40 L230 95 L230 135 L140 185 L50 135 L50 95 Z"
        fill="none" stroke="#A855F7" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M140 70 L200 108 L200 128 L140 163 L80 128 L80 108 Z"
        fill="#9B27AF" fillOpacity="0.1" />
      <circle cx="140" cy="108" r="22" fill="#C084FC" fillOpacity="0.15" />
      <ellipse cx="50"  cy="40" rx="40" ry="25" fill="#E91E8A" fillOpacity="0.1" />
    </svg>
  );
}

function Cover11() {
  // Nadia — natural hair braids, teal/ocean
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#041214" />
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          d={`M${20 + i * 36} 0 Q${20 + i * 36 + 18} 54 ${20 + i * 36} 108 Q${20 + i * 36 - 18} 162 ${20 + i * 36} 216`}
          stroke="#0D9488"
          strokeOpacity={0.12 + i * 0.02}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
      <ellipse cx="140" cy="108" rx="100" ry="60" fill="#0F766E" fillOpacity="0.1" />
      <circle  cx="200" cy="50"  r="40" fill="#14B8A6" fillOpacity="0.08" />
      <circle  cx="70"  cy="170" r="35" fill="#0D9488" fillOpacity="0.1" />
    </svg>
  );
}

function Cover12() {
  // Lily — semi-permanent makeup, pink precision
  return (
    <svg viewBox="0 0 280 216" xmlns="http://www.w3.org/2000/svg" className="artist-cover-svg">
      <rect width="280" height="216" fill="#1a0a1a" />
      <circle cx="140" cy="108" r="95" fill="none" stroke="#E91E8A" strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="140" cy="108" r="70" fill="none" stroke="#FF4DA6" strokeOpacity="0.1"  strokeWidth="1.5" />
      <circle cx="140" cy="108" r="45" fill="none" stroke="#D4A853" strokeOpacity="0.1"  strokeWidth="1" />
      <circle cx="140" cy="108" r="22" fill="#E91E8A" fillOpacity="0.12" />
      <path d="M45 108 L235 108"   stroke="#E91E8A" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M140 13  L140 203"  stroke="#E91E8A" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M67 35   L213 181"  stroke="#D4A853" strokeOpacity="0.1"  strokeWidth="1" />
      <path d="M213 35  L67 181"   stroke="#D4A853" strokeOpacity="0.1"  strokeWidth="1" />
      <ellipse cx="240" cy="40" rx="30" ry="20" fill="#FF4DA6" fillOpacity="0.1" />
    </svg>
  );
}

const COVER_COMPONENTS = [
  Cover1, Cover2, Cover3, Cover4,
  Cover5, Cover6, Cover7, Cover8,
  Cover9, Cover10, Cover11, Cover12,
];

/* ── Artist data ──────────────────────────────────────────────────── */

const ARTISTS = [
  { id: "1",  name: "Amara Cole",       specialty: "Balayage & Colour",      vertical: "hair",              rating: 4.9, reviews: 218, priceFrom: 85  },
  { id: "2",  name: "Sofia Reyes",      specialty: "Lash Extensions",        vertical: "lashes",            rating: 4.8, reviews: 341, priceFrom: 65  },
  { id: "3",  name: "Jade Mitchell",    specialty: "Nail Art & Gel",         vertical: "nails",             rating: 5.0, reviews: 97,  priceFrom: 45  },
  { id: "4",  name: "Priya Sharma",     specialty: "Brow Lamination & Tint", vertical: "brows",             rating: 4.9, reviews: 184, priceFrom: 55  },
  { id: "5",  name: "Monique Laurent",  specialty: "Bridal Makeup",          vertical: "makeup",            rating: 4.7, reviews: 76,  priceFrom: 120 },
  { id: "6",  name: "Zara Kim",         specialty: "Laser Hair Removal",     vertical: "laser",             rating: 4.8, reviews: 129, priceFrom: 95  },
  { id: "7",  name: "Isabelle Dumont",  specialty: "Classic Cut & Style",    vertical: "hair",              rating: 4.6, reviews: 302, priceFrom: 55  },
  { id: "8",  name: "Kezia Obi",        specialty: "Micropigmentation",      vertical: "micropigmentation", rating: 5.0, reviews: 54,  priceFrom: 180 },
  { id: "9",  name: "Talia Stone",      specialty: "Body Massage & Therapy", vertical: "massage",           rating: 4.9, reviews: 167, priceFrom: 75  },
  { id: "10", name: "Carmen Vega",      specialty: "Cosmetology & Facials",  vertical: "cosmetology",       rating: 4.7, reviews: 210, priceFrom: 80  },
  { id: "11", name: "Nadia Okafor",     specialty: "Natural Hair & Braids",  vertical: "hair",              rating: 4.8, reviews: 88,  priceFrom: 70  },
  { id: "12", name: "Lily Chen",        specialty: "Semi-permanent Makeup",  vertical: "makeup",            rating: 4.9, reviews: 143, priceFrom: 150 },
];

const VERTICAL_LABELS: Record<string, string> = {
  hair:               "Hair",
  barbershop:         "Barbershop",
  nails:              "Nails",
  cosmetology:        "Cosmetology",
  brows:              "Brows",
  laser:              "Laser",
  body_treatments:    "Body",
  medical_aesthetics: "Medical",
  massage:            "Massage",
  micropigmentation:  "Micropigmentation",
  lashes:             "Lashes",
  makeup:             "Makeup",
};

/* ── Page ─────────────────────────────────────────────────────────── */

export default function ExplorePage() {
  return (
    <>
      <Navbar />

      <main className="flex flex-col flex-1">
        {/* Header */}
        <div className="explore-header">
          <h1 className="explore-title">
            Find your{" "}
            <span className="gradient-text-bright">perfect artist</span>
          </h1>
          <p className="explore-sub">
            Browse 10,000+ beauty professionals by portfolio, vertical, and location.
          </p>

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon-wrap" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              className="search-input"
              placeholder="Search by name, style, or location…"
              aria-label="Search artists"
            />
          </div>

          {/* Vertical filter pills */}
          <div className="vertical-pills" role="list" aria-label="Filter by category">
            <span className="vertical-pill vertical-pill-active" role="listitem">All</span>
            {BEAUTY_VERTICALS.filter((v) => v !== "other").map((v) => (
              <span key={v} className="vertical-pill" role="listitem">
                {VERTICAL_LABELS[v] ?? v}
              </span>
            ))}
          </div>
        </div>

        {/* Artist Grid */}
        <div className="artist-grid">
          {ARTISTS.map((artist, i) => {
            const CoverArt = COVER_COMPONENTS[i % COVER_COMPONENTS.length];
            return (
              <article
                key={artist.id}
                className="artist-card"
                tabIndex={0}
                role="button"
                aria-label={`View ${artist.name} — ${artist.specialty}`}
              >
                {/* Cover with abstract SVG art */}
                <div className="artist-cover">
                  <CoverArt />
                  {/* Specialty tag */}
                  <span className="artist-cover-tag">{artist.vertical.replace("_", " ")}</span>
                  {/* Available indicator */}
                  <span className="artist-available-dot" aria-label="Available to book" />
                </div>

                <div className="artist-info">
                  <p className="artist-name">{artist.name}</p>
                  <p className="artist-specialty">{artist.specialty}</p>
                  <div className="artist-meta">
                    <span className="artist-rating">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {artist.rating}
                      <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>
                        ({artist.reviews})
                      </span>
                    </span>
                    <span className="artist-price">From £{artist.priceFrom}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}
