import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BEAUTY_VERTICALS } from "@glamr/shared-types";

/* ── Mock data ────────────────────────────────────────────────────── */

const ARTISTS = [
  { id: "1",  name: "Amara Cole",      specialty: "Balayage & Colour",    rating: 4.9, reviews: 218, priceFrom: 85,  gradient: "linear-gradient(135deg,#2d1b35 0%,#4a1535 100%)" },
  { id: "2",  name: "Sofia Reyes",     specialty: "Lash Extensions",       rating: 4.8, reviews: 341, priceFrom: 65,  gradient: "linear-gradient(135deg,#1a2035 0%,#1e3a5f 100%)" },
  { id: "3",  name: "Jade Mitchell",   specialty: "Nail Art & Gel",        rating: 5.0, reviews: 97,  priceFrom: 45,  gradient: "linear-gradient(135deg,#1a2d1a 0%,#0d3025 100%)" },
  { id: "4",  name: "Priya Sharma",    specialty: "Brow Lamination & Tint", rating: 4.9, reviews: 184, priceFrom: 55,  gradient: "linear-gradient(135deg,#2a1a35 0%,#3d1040 100%)" },
  { id: "5",  name: "Monique Laurent", specialty: "Bridal Makeup",         rating: 4.7, reviews: 76,  priceFrom: 120, gradient: "linear-gradient(135deg,#2d1a1a 0%,#4a1a20 100%)" },
  { id: "6",  name: "Zara Kim",        specialty: "Laser Hair Removal",    rating: 4.8, reviews: 129, priceFrom: 95,  gradient: "linear-gradient(135deg,#0d1a2d 0%,#152040 100%)" },
  { id: "7",  name: "Isabelle Dumont", specialty: "Classic Cut & Style",   rating: 4.6, reviews: 302, priceFrom: 55,  gradient: "linear-gradient(135deg,#1a1a2d 0%,#2a1a3d 100%)" },
  { id: "8",  name: "Kezia Obi",       specialty: "Micropigmentation",     rating: 5.0, reviews: 54,  priceFrom: 180, gradient: "linear-gradient(135deg,#1a2a1a 0%,#0d2510 100%)" },
  { id: "9",  name: "Talia Stone",     specialty: "Body Massage & Therapy", rating: 4.9, reviews: 167, priceFrom: 75,  gradient: "linear-gradient(135deg,#2d2a1a 0%,#3d3010 100%)" },
  { id: "10", name: "Carmen Vega",     specialty: "Cosmetology & Facials", rating: 4.7, reviews: 210, priceFrom: 80,  gradient: "linear-gradient(135deg,#1a0d2d 0%,#2a1040 100%)" },
  { id: "11", name: "Nadia Okafor",    specialty: "Natural Hair & Braids", rating: 4.8, reviews: 88,  priceFrom: 70,  gradient: "linear-gradient(135deg,#0d1a1a 0%,#0d2a25 100%)" },
  { id: "12", name: "Lily Chen",       specialty: "Semi-permanent Makeup", rating: 4.9, reviews: 143, priceFrom: 150, gradient: "linear-gradient(135deg,#2a1a2a 0%,#3d1540 100%)" },
];

const VERTICAL_LABELS: Record<string, string> = {
  hair:               "Hair",
  barbershop:         "Barbershop",
  nails:              "Nails",
  cosmetology:        "Cosmetology",
  brows:              "Brows",
  laser:              "Laser",
  body_treatments:    "Body Treatments",
  medical_aesthetics: "Medical Aesthetics",
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
          {ARTISTS.map((artist) => (
            <article key={artist.id} className="artist-card" tabIndex={0} role="button" aria-label={`Book ${artist.name}`}>
              {/* Cover image placeholder */}
              <div
                className="artist-cover"
                style={{ background: artist.gradient }}
                aria-hidden="true"
              >
                {/* Subtle initials watermark */}
                <span style={{
                  position: "absolute",
                  bottom: 12,
                  left: 16,
                  fontFamily: "var(--font-outfit)",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.12)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  userSelect: "none",
                }}>
                  {artist.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>

              <div className="artist-info">
                <p className="artist-name">{artist.name}</p>
                <p className="artist-specialty">{artist.specialty}</p>
                <div className="artist-meta">
                  <span className="artist-rating">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
