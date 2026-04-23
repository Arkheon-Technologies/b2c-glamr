import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

const FILTERS = ["For you", "Following", "Hair colour", "Nails", "Skincare", "Bridal", "Editorial", "Men's", "Minimal", "Bold"];

const MOCK_POSTS = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i}`,
  creator: ["Ana Sala", "Iulia Marin", "Andrei Pop", "Elena D.", "Maria V.", "Cristina L."][i % 6],
  handle: ["@anasala", "@iuliam", "@barberpop", "@elenad", "@mariav", "@cristinal"][i % 6],
  studio: ["Sala Studio", "Maison Lys", "The Barber Lab", "Glow Clinic", "Lash Atelier", "Zen Wellness"][i % 6],
  caption: [
    "Lived-in balayage for summer ☀️",
    "Chrome nail art – obsessed with this set 💅",
    "Clean fade, sharp lines ✂️",
    "Glass skin after 3 sessions ✨",
    "Natural volume lashes 🦋",
    "Sunday self-care ritual 🧖‍♀️",
  ][i % 6],
  likes: 42 + i * 17,
  comments: 3 + i * 2,
  aspect: [4/5, 1/1, 3/4, 4/5, 1/1, 4/3][i % 6],
}));

export default function InspirationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)]">
        <div className="page-container py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="section-key mb-2">— inspiration</p>
              <h1 className="page-title text-[var(--ink)]">
                Discover <em className="italic-plum">looks</em>
              </h1>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {FILTERS.map((f, i) => (
              <button key={f} className={`chip whitespace-nowrap ${i === 0 ? "on" : ""}`}>{f}</button>
            ))}
          </div>

          {/* Masonry grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {MOCK_POSTS.map((post) => (
              <div key={post.id} className="card card-hover overflow-hidden break-inside-avoid group">
                {/* Image placeholder */}
                <div className="bg-[var(--paper-3)] placeholder relative" style={{ aspectRatio: post.aspect }}>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Save">
                    <GlamrIcon name="heart" size={14} className="text-[var(--ink-3)]" />
                  </button>
                </div>
                {/* Footer */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--paper-3)] placeholder shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--ink)] truncate">{post.creator}</p>
                      <p className="text-[11px] text-[var(--ink-4)]">{post.handle} · {post.studio}</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">{post.caption}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-[11px] text-[var(--ink-4)]">
                      <span className="flex items-center gap-1">
                        <GlamrIcon name="heart" size={12} /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <GlamrIcon name="message" size={12} /> {post.comments}
                      </span>
                    </div>
                    <Link href={`/search?q=${encodeURIComponent(post.caption.split(" ").slice(0,2).join(" "))}`} className="btn btn-primary btn-sm text-[10px] py-1 px-2.5">
                      Book this look
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
