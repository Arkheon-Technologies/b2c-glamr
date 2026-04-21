"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchServices, type ServiceListItem } from "@/lib/mvp-api";
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

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatServicePrice(service: ServiceListItem) {
  if (service.price_type === "range" && service.price_cents != null && service.price_max_cents != null) {
    return `${formatMoney(service.price_cents, service.currency)} - ${formatMoney(service.price_max_cents, service.currency)}`;
  }

  if (service.price_cents != null) {
    return formatMoney(service.price_cents, service.currency);
  }

  if (service.price_max_cents != null) {
    return `From ${formatMoney(service.price_max_cents, service.currency)}`;
  }

  return "On consultation";
}

function totalDuration(service: ServiceListItem) {
  return (
    service.duration_active_min +
    service.duration_processing_min +
    service.duration_finish_min
  );
}

export default function ExplorePage() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVertical, setSelectedVertical] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadServices() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await fetchServices();
        if (!isCancelled) {
          setServices(result);
        }
      } catch (error) {
        if (!isCancelled) {
          const fallback = "Unable to load live discovery right now.";
          setErrorMessage(error instanceof Error ? error.message : fallback);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadServices();
    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return services.filter((service) => {
      if (selectedVertical !== "all") {
        if (service.vertical?.slug !== selectedVertical) {
          return false;
        }
      }

      if (!term) {
        return true;
      }

      const inService = service.name.toLowerCase().includes(term);
      const inDescription = service.description?.toLowerCase().includes(term);
      const inBusiness = service.business?.name.toLowerCase().includes(term);
      return inService || inDescription || inBusiness;
    });
  }, [search, selectedVertical, services]);

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent border border-outline-variant pl-10 pr-4 py-3 text-xs font-label uppercase tracking-widest placeholder:text-outline/50 focus:border-primary-fixed focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Vertical filter pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              type="button"
              onClick={() => setSelectedVertical("all")}
              className={`flex-shrink-0 font-label text-[10px] tracking-[0.2em] uppercase py-2 px-5 transition-colors ${selectedVertical === "all" ? "font-bold bg-primary text-white" : "font-medium border border-outline-variant hover:border-primary-fixed hover:text-primary-fixed"}`}
            >
              All
            </button>
            {BEAUTY_VERTICALS.map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setSelectedVertical(v)}
                className={`flex-shrink-0 font-label text-[10px] tracking-[0.2em] uppercase py-2 px-5 transition-colors ${selectedVertical === v ? "font-bold bg-primary text-white" : "font-medium border border-outline-variant hover:border-primary-fixed hover:text-primary-fixed"}`}
              >
                {VERTICAL_LABELS[v] ?? v}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="max-w-7xl mx-auto px-8 pb-4 flex justify-between items-center">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            {filteredServices.length} Services Matched
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            Source: Live API
          </span>
        </div>
      </div>

      {/* ── Artist Grid ───────────────────────────────────────────── */}
      <main className="bg-surface-container-low min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {errorMessage && (
            <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error mb-6">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Loading live discovery...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center">
              <p className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                No services match your filters yet.
              </p>
              <Link
                href="/book"
                className="inline-block mt-4 bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-primary transition-colors"
              >
                View Booking Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/20 border border-outline-variant/20">
              {filteredServices.map((service, i) => (
                <article
                  key={service.id}
                  className="bg-surface group transition-all duration-300 hover:bg-surface-container-lowest flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface-dim">
                    <Portrait seed={i} />
                    <div className="absolute inset-0 group-hover:bg-primary/5 transition-colors duration-500" />
                    {service.vertical?.name && (
                      <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-primary text-white">
                        {service.vertical.name}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-headline text-lg font-bold tracking-tight">
                          {service.business?.name || "Independent Studio"}
                        </h3>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] font-semibold mt-0.5 text-on-surface-variant">
                          {service.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-primary-fixed flex-shrink-0">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span className="font-label text-xs font-black">{totalDuration(service)}m</span>
                      </div>
                    </div>

                    <p className="font-body text-xs text-on-surface-variant line-clamp-2 min-h-8">
                      {service.description || "Precision service delivered with split-phase scheduling support."}
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20 mt-auto gap-2">
                      <span className="font-label text-xs font-bold uppercase tracking-widest">
                        {formatServicePrice(service)}
                      </span>
                      <Link
                        href={`/book/${service.id}`}
                        className="font-label text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-primary text-white hover:bg-primary-fixed transition-colors"
                      >
                        Select
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
