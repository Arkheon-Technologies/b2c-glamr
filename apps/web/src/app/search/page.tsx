"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { discoverBusinesses, type DiscoverBusiness } from "@/lib/mvp-api";
import { BusinessMap } from "@/components/ui/BusinessMap";

/* ─── Mock data ────────────────────────────────────────────────────── */
const FILTER_CATEGORIES = ["Hair", "Nails", "Skincare", "Makeup", "Brows & lashes", "Barbering", "Wellness", "Aesthetics"];
const SORT_OPTIONS = ["Best match", "Distance", "Rating", "Price: low → high", "Next available"];
const CREDENTIAL_FILTERS = ["Verified", "Licensed", "Insured", "English spoken"];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Best match");

  const [businesses, setBusinesses] = useState<DiscoverBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [bbox, setBbox] = useState<string | undefined>();

  const loadBusinesses = (bboxOverride?: string) => {
    setLoading(true);
    const vertical = selectedCategories.length > 0 ? selectedCategories[0].toLowerCase() : undefined;
    const verticalMapped =
      vertical === "brows & lashes" ? "lashes" :
      vertical === "hair" ? "hair" :
      vertical === "skincare" ? "skin" :
      vertical === "nails" ? "nails" :
      vertical === "barbering" ? "barber" :
      undefined;

    discoverBusinesses({
      query: query || undefined,
      vertical: verticalMapped,
      bbox: bboxOverride ?? bbox,
    })
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategories]);

  function handleViewportChange(newBbox: string) {
    setBbox(newBbox);
    loadBusinesses(newBbox);
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const activeFilterCount = selectedCategories.length;

  return (
    <div className="flex gap-0 min-h-[calc(100vh-56px)]">
      {/* ── Left filter sidebar ───────────────────────────────── */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-[var(--line)] bg-[var(--card)] p-5 space-y-6 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-medium text-[var(--ink)]">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-[12px] text-[var(--plum)] hover:underline"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Category */}
        <div className="space-y-3">
          <p className="small-meta text-[var(--ink-3)]">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`chip text-[11px] ${selectedCategories.includes(cat) ? "on" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" />

        {/* Price range */}
        <div className="space-y-3">
          <p className="small-meta text-[var(--ink-3)]">Price range</p>
          <div className="flex gap-2">
            <input type="number" placeholder="Min" className="input text-[12px] py-2" />
            <span className="text-[var(--ink-4)] self-center">–</span>
            <input type="number" placeholder="Max" className="input text-[12px] py-2" />
          </div>
        </div>

        <hr className="divider" />

        {/* Availability */}
        <div className="space-y-3">
          <p className="small-meta text-[var(--ink-3)]">Availability</p>
          <div className="flex flex-wrap gap-1.5">
            {["Today", "Tomorrow", "This week", "Weekend", "Evening"].map((a) => (
              <button key={a} className="chip text-[11px]">{a}</button>
            ))}
          </div>
        </div>

        <hr className="divider" />

        {/* Rating */}
        <div className="space-y-3">
          <p className="small-meta text-[var(--ink-3)]">Minimum rating</p>
          <div className="flex gap-1.5">
            {[3, 3.5, 4, 4.5].map((r) => (
              <button key={r} className="chip text-[11px]">
                {r}+ ★
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" />

        {/* Credentials */}
        <div className="space-y-3">
          <p className="small-meta text-[var(--ink-3)]">Credentials</p>
          <div className="space-y-2">
            {CREDENTIAL_FILTERS.map((c) => (
              <label key={c} className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[var(--line)] accent-[var(--plum)]" />
                {c}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main results area ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Results header */}
        <div className="sticky top-14 z-10 bg-[var(--paper)] border-b border-[var(--line)] px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-[15px] font-medium text-[var(--ink)] truncate">
              {query ? `Results for "${query}"` : "All professionals"}
            </h1>
            <span className="pill">{loading ? "..." : businesses.length} found</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-[12px] py-1.5 px-3 w-auto min-w-[150px]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {/* List / Map toggle */}
            <div className="flex border border-[var(--line)] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-[12px] flex items-center gap-1.5 transition-colors ${viewMode === "list" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-3)] hover:bg-[var(--paper-2)]"}`}
              >
                <GlamrIcon name="menu" size={13} />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 text-[12px] flex items-center gap-1.5 transition-colors ${viewMode === "map" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-3)] hover:bg-[var(--paper-2)]"}`}
              >
                <GlamrIcon name="map" size={13} />
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Results list */}
        {viewMode === "list" ? (
          <div className="p-6 space-y-3">
            {loading ? (
              <div className="py-20 text-center text-[var(--ink-3)] animate-pulse">Loading businesses...</div>
            ) : businesses.length === 0 ? (
              <div className="py-20 text-center text-[var(--ink-3)]">No businesses found matching your criteria.</div>
            ) : businesses.map((result) => (
              <Link
                key={result.slug}
                href={`/b/${result.slug}`}
                className="card card-hover p-5 flex gap-5 group"
              >
                {/* Photo */}
                <div className="w-[180px] h-[130px] rounded-lg bg-[var(--paper-3)] placeholder shrink-0 overflow-hidden relative">
                  {result.cover_image_url ? (
                    <img src={result.cover_image_url} alt={result.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="pill absolute top-2 left-2 text-[9px] capitalize">{result.verticals[0] ?? "Studio"}</span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          {result.is_verified && (
                            <span className="badge badge-sage text-[8px]">
                              <GlamrIcon name="shield" size={9} /> Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-[16px] font-medium text-[var(--ink)] group-hover:text-[var(--plum)] transition-colors">
                          {result.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <GlamrIcon name="star" size={13} className="text-[var(--amber)]" />
                        <span className="tabular-num text-[13px] text-[var(--ink)]">4.9</span>
                        <span className="text-[12px] text-[var(--ink-4)]">({result.total_bookings}+ bookings)</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-[var(--ink-3)] mt-0.5">
                      <GlamrIcon name="pin" size={11} className="inline mr-1" />
                      {result.location?.city ? `${result.location.neighborhood ? result.location.neighborhood + ', ' : ''}${result.location.city}` : "Location available"}
                    </p>
                  </div>
                  {/* Services */}
                  <div className="flex items-center justify-between gap-4 mt-3">
                    <div className="flex gap-2 overflow-hidden">
                      <span className="pill text-[9px] shrink-0">
                        {result.services_count} services available
                      </span>
                      <span className="pill text-[9px] shrink-0">
                        {result.staff_count} professionals
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1 text-[var(--sage)] text-[11px] font-medium">
                        <GlamrIcon name="clock" size={11} />
                        Check availability
                      </span>
                      <span className="btn btn-primary btn-sm text-[11px]">Book</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Map view */
          <div className="h-[calc(100vh-56px-52px)] relative">
            <BusinessMap
              businesses={businesses}
              onViewportChange={handleViewportChange}
              className="absolute inset-0"
            />
            {loading && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-4 py-1.5 text-[12px] text-[var(--ink-3)] shadow-sm">
                Updating map…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <Suspense fallback={<div className="page-container py-20 text-center text-[var(--ink-3)]">Loading…</div>}>
          <SearchPageContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
