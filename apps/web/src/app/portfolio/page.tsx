"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  fetchPortfolio,
  trackPortfolioBookTap,
  type PortfolioListItem,
} from "@/lib/mvp-api";

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function safeVerticalLabel(vertical: string | null) {
  if (!vertical) {
    return "General";
  }

  return vertical
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVertical, setSelectedVertical] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingItemId, setIsTrackingItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleBookTap(itemId: string) {
    setIsTrackingItemId(itemId);

    try {
      await trackPortfolioBookTap(itemId);
    } catch {
      // Navigation should not be blocked by analytics failures.
    } finally {
      setIsTrackingItemId(null);
      router.push("/book");
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadPortfolio() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await fetchPortfolio({
          search: search.trim() || undefined,
          vertical: selectedVertical === "all" ? undefined : selectedVertical,
          limit: 60,
        });

        if (!isCancelled) {
          setItems(result);
        }
      } catch (error) {
        if (!isCancelled) {
          const fallback = "Unable to load portfolio gallery right now.";
          setErrorMessage(error instanceof Error ? error.message : fallback);
          setItems([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPortfolio();
    return () => {
      isCancelled = true;
    };
  }, [search, selectedVertical]);

  const verticalOptions = useMemo(() => {
    const values = new Set<string>();

    for (const item of items) {
      if (item.service_vertical) {
        values.add(item.service_vertical);
      }
    }

    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-fixed font-bold mb-3">
                Portfolio Discovery
              </p>
              <h1 className="font-headline font-black uppercase tracking-tighter text-primary text-4xl md:text-6xl leading-[0.92]">
                Results Gallery
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant mt-3 max-w-2xl">
                Browse published work samples and jump into booking from proven outcomes.
              </p>
            </div>

            <div className="w-full lg:w-[34rem] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by service, studio, or technician"
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
              />
              <select
                value={selectedVertical}
                onChange={(event) => setSelectedVertical(event.target.value)}
                className="w-full md:w-44 bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
              >
                {verticalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Verticals" : safeVerticalLabel(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error mb-6">
              {errorMessage}
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {items.length} published results
            </p>
            <Link
              href="/book"
              className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-primary-fixed hover:underline"
            >
              Go to booking catalog →
            </Link>
          </div>

          {isLoading ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Loading portfolio gallery...
            </div>
          ) : items.length === 0 ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center">
              <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                No published items match this filter yet.
              </p>
              <Link
                href="/explore"
                className="inline-block mt-4 bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-primary transition-colors"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-outline-variant/20 border border-outline-variant/20">
              {items.map((item) => (
                <article key={item.id} className="bg-surface-container-lowest p-5 flex flex-col gap-4">
                  <div
                    className="aspect-[4/3] border border-outline-variant/20 bg-surface-container relative overflow-hidden"
                    style={
                      item.image_urls.primary
                        ? {
                            backgroundImage: `url(${item.image_urls.primary})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            backgroundImage:
                              "linear-gradient(135deg, color-mix(in oklab, var(--color-primary-fixed) 18%, transparent), color-mix(in oklab, var(--color-primary) 18%, transparent))",
                          }
                    }
                  >
                    {!item.image_urls.primary && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                          No Preview
                        </p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/65 text-white font-label text-[9px] uppercase tracking-[0.2em]">
                      {safeVerticalLabel(item.service_vertical)}
                    </div>
                    {item.is_watermarked && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary-fixed text-white font-label text-[9px] uppercase tracking-[0.2em]">
                        Watermarked
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-headline text-xl font-black tracking-tight uppercase text-primary">
                      {item.service_name || "Portfolio Result"}
                    </h2>
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                      {item.technician.display_name} • {item.business.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-7">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={`${item.id}-${tag}`}
                        className="text-[10px] font-label uppercase tracking-wider border border-outline-variant px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {formatDate(item.created_at)}
                      </p>
                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
                        {item.view_count} views • {item.book_tap_count} taps
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBookTap(item.id)}
                      disabled={isTrackingItemId === item.id}
                      className="bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 hover:bg-primary transition-colors"
                    >
                      {isTrackingItemId === item.id ? "Opening..." : "Book Studio"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
