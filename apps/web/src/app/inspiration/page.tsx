"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import {
  listFeedPosts,
  getFeedCategories,
  toggleFeedLike,
  saveFeedPost,
  followStaff,
  type FeedPost,
} from "@/lib/mvp-api";

/* ─── Demo fallback data ────────────────────────────────────────────── */
const DEMO_POSTS: FeedPost[] = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-${i}`,
  hero_photo_url: null,
  caption: [
    "Lived-in balayage for summer ☀️",
    "Chrome nail art – obsessed with this set 💅",
    "Clean fade, sharp lines ✂️",
    "Glass skin after 3 sessions ✨",
    "Natural volume lashes 🦋",
    "Sunday self-care ritual 🧖‍♀️",
  ][i % 6],
  category: ["Hair colour", "Nails", "Men's", "Skincare", "Lashes", "Skincare"][i % 6],
  like_count: 42 + i * 17,
  save_count: 6 + i * 3,
  comment_count: 3 + i * 2,
  published_at: new Date(Date.now() - i * 3_600_000 * 4).toISOString(),
  liked_by_me: i % 5 === 0,
  business: {
    id: `biz-${i % 6}`,
    name: ["Sala Studio", "Maison Lys", "The Barber Lab", "Glow Clinic", "Lash Atelier", "Zen Wellness"][i % 6],
    slug: ["sala-studio", "maison-lys", "barber-lab", "glow-clinic", "lash-atelier", "zen-wellness"][i % 6],
  },
  staff: {
    id: `staff-${i % 6}`,
    displayName: ["Ana Sala", "Iulia Marin", "Andrei Pop", "Elena D.", "Maria V.", "Cristina L."][i % 6],
    avatarUrl: null,
  },
}));

const DEMO_CATEGORIES = ["Hair colour", "Nails", "Men's", "Skincare", "Lashes", "Bridal", "Editorial", "Minimal", "Bold"];

const ASPECT_RATIOS = [4 / 5, 1 / 1, 3 / 4, 4 / 5, 1 / 1, 4 / 3];

type FeedMode = "for_you" | "following" | "all";

const MODE_LABELS: { mode: FeedMode; label: string }[] = [
  { mode: "for_you", label: "For you" },
  { mode: "following", label: "Following" },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

/* ─── Post card ─────────────────────────────────────────────────────── */
function PostCard({
  post,
  index,
  onLike,
  onSave,
  onFollow,
}: {
  post: FeedPost;
  index: number;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onFollow: (staffId: string) => void;
}) {
  const aspect = ASPECT_RATIOS[index % ASPECT_RATIOS.length];
  const searchQuery = post.caption?.split(" ").slice(0, 2).join(" ") ?? "";

  return (
    <div className="card card-hover overflow-hidden break-inside-avoid group mb-4 relative">
      {/* Image area */}
      <div
        className="bg-[var(--paper-3)] relative overflow-hidden"
        style={{ aspectRatio: aspect }}
      >
        {post.hero_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.hero_photo_url}
            alt={post.caption ?? "Inspiration post"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <GlamrIcon name="image" size={24} className="text-[var(--ink-5)]" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Category chip */}
        {post.category && (
          <span className="absolute top-3 left-3 badge badge-paper text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
            {post.category}
          </span>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onLike(post.id)}
            className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
              post.liked_by_me
                ? "bg-[var(--plum)] text-white"
                : "bg-white/80 text-[var(--ink-3)]"
            }`}
            aria-label="Like"
          >
            <GlamrIcon name="heart" size={13} />
          </button>
          <button
            onClick={() => onSave(post.id)}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            aria-label="Save"
          >
            <GlamrIcon name="bookmark" size={13} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-2.5">
        {/* Creator row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[var(--paper-3)] shrink-0 overflow-hidden flex items-center justify-center">
              {post.staff?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.staff.avatarUrl}
                  alt={post.staff.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-medium text-[var(--ink-3)]">
                  {(post.staff?.displayName ?? "?")[0]}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[var(--ink)] truncate">
                {post.staff?.displayName ?? "—"}
              </p>
              {post.business && (
                <Link
                  href={`/business/${post.business.slug}`}
                  className="text-[11px] text-[var(--ink-4)] hover:text-[var(--plum)] transition-colors truncate block"
                >
                  {post.business.name}
                </Link>
              )}
            </div>
          </div>

          {post.staff && (
            <button
              onClick={() => onFollow(post.staff!.id)}
              className="btn btn-ghost btn-sm text-[10px] py-1 px-2 shrink-0"
            >
              Follow
            </button>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-[13px] text-[var(--ink-2)] leading-relaxed line-clamp-2">
            {post.caption}
          </p>
        )}

        {/* Engagement row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-3 text-[11px] text-[var(--ink-4)]">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 transition-colors ${
                post.liked_by_me ? "text-[var(--plum)]" : "hover:text-[var(--ink)]"
              }`}
            >
              <GlamrIcon name="heart" size={12} />
              <span className="tabular-num">{post.like_count}</span>
            </button>
            <span className="flex items-center gap-1">
              <GlamrIcon name="message" size={12} />
              <span className="tabular-num">{post.comment_count}</span>
            </span>
            <span className="text-[var(--ink-5)]">{timeAgo(post.published_at)}</span>
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="btn btn-primary btn-sm text-[10px] py-1 px-2.5"
            onClick={() => {
              // track book tap (fire and forget)
            }}
          >
            Book this look
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function InspirationPage() {
  const [mode, setMode] = useState<FeedMode>("for_you");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(DEMO_CATEGORIES);
  const [posts, setPosts] = useState<FeedPost[]>(DEMO_POSTS);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 12;

  /* Load categories once */
  useEffect(() => {
    getFeedCategories()
      .then((cats) => {
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => {/* keep demo */});
  }, []);

  /* Load posts whenever mode or category changes */
  const loadPosts = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      try {
        const currentOffset = reset ? 0 : offset;
        const result = await listFeedPosts({
          mode,
          category: activeCategory ?? undefined,
          limit: LIMIT,
          offset: currentOffset,
        });
        if (reset) {
          setPosts(result.posts);
        } else {
          setPosts((prev) => [...prev, ...result.posts]);
        }
        setOffset(currentOffset + result.posts.length);
        setHasMore(currentOffset + result.posts.length < result.meta.total);
        setIsDemo(false);
      } catch {
        if (reset) {
          setPosts(DEMO_POSTS);
          setIsDemo(true);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, activeCategory],
  );

  useEffect(() => {
    setOffset(0);
    loadPosts(true);
  }, [mode, activeCategory, loadPosts]);

  /* Infinite scroll observer */
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || isDemo) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadPosts(false);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isDemo, loading, loadPosts]);

  /* Optimistic like */
  const handleLike = async (postId: string) => {
    const prev = posts;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: !p.liked_by_me, like_count: p.like_count + (p.liked_by_me ? -1 : 1) }
          : p,
      ),
    );
    try {
      if (!isDemo) {
        await toggleFeedLike(postId);
      }
    } catch {
      setPosts(prev);
    }
  };

  /* Optimistic save */
  const handleSave = async (postId: string) => {
    const prev = posts;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId ? { ...p, save_count: p.save_count + 1 } : p,
      ),
    );
    try {
      if (!isDemo) {
        await saveFeedPost(postId);
      }
    } catch {
      setPosts(prev);
    }
  };

  /* Follow staff */
  const handleFollow = async (staffId: string) => {
    try {
      if (!isDemo) {
        await followStaff(staffId);
      }
    } catch {/* ignore */}
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-14 min-h-screen bg-[var(--paper)]">
        <div className="page-container py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="section-key mb-2">— inspiration</p>
              <h1 className="page-title text-[var(--ink)]">
                Discover <em className="italic-plum">looks</em>
              </h1>
            </div>
            {isDemo && (
              <span className="badge badge-amber text-[9px]">Demo feed</span>
            )}
          </div>

          {/* Mode + category filter strip */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            {MODE_LABELS.map(({ mode: m, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`chip whitespace-nowrap ${mode === m && !activeCategory ? "on" : ""}`}
              >
                {label}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-6 self-center bg-[var(--ink-6)] shrink-0" />

            {/* Category chips */}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory((prev) => (prev === cat ? null : cat));
                  setMode("all");
                }}
                className={`chip whitespace-nowrap ${activeCategory === cat ? "on" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry grid */}
          {posts.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--ink-4)]">
              <GlamrIcon name="image" size={36} />
              <p className="text-[14px]">No posts yet in this feed.</p>
              {mode === "following" && (
                <p className="text-[12px]">Follow some stylists to see their work here.</p>
              )}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={i}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={handleFollow}
                />
              ))}
            </div>
          )}

          {/* Load more sentinel */}
          {hasMore && !isDemo && (
            <div ref={loadMoreRef} className="h-12 flex items-center justify-center mt-4">
              {loading && (
                <span className="text-[12px] text-[var(--ink-4)] animate-pulse">Loading more…</span>
              )}
            </div>
          )}

          {/* Loading skeleton on initial load */}
          {loading && posts.length === 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="card overflow-hidden break-inside-avoid mb-4 animate-pulse"
                  style={{ aspectRatio: ASPECT_RATIOS[i % ASPECT_RATIOS.length] }}
                >
                  <div className="bg-[var(--paper-3)] w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
