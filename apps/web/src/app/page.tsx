"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { fetchFeatured, fetchTrending, type FeaturedBusiness, type TrendingQuery } from "@/lib/mvp-api";

/* ─── Category data ────────────────────────────────────────────────── */
const CATEGORIES = [
  { slug: "hair", label: "Hair", count: "4,280" },
  { slug: "nails", label: "Nails", count: "2,140" },
  { slug: "skin", label: "Skincare", count: "1,860" },
  { slug: "makeup", label: "Makeup", count: "1,320" },
  { slug: "brows-lashes", label: "Brows & lashes", count: "1,780" },
  { slug: "barbering", label: "Barbering", count: "960" },
  { slug: "wellness", label: "Wellness", count: "740" },
  { slug: "aesthetics", label: "Aesthetics", count: "520" },
];

const TRENDING_FALLBACK = [
  "Balayage", "Gel manicure", "Facial", "Bridal hair",
  "Lash extensions", "Beard trim", "Keratin treatment", "Microblading",
];

/* ─── Featured professionals (placeholder data) removed ───────────────────── */

/* ─── Trust items ──────────────────────────────────────────────────── */
const TRUST_ITEMS = [
  {
    icon: "shield" as const,
    title: "ID Verified",
    desc: "Every professional passes identity verification before going live on the platform.",
  },
  {
    icon: "check" as const,
    title: "Licensed",
    desc: "Qualifications and certifications are reviewed and verified by our trust team.",
  },
  {
    icon: "star" as const,
    title: "Insured",
    desc: "Professionals carry valid professional liability insurance for your peace of mind.",
  },
];

/* ─── Business metrics ─────────────────────────────────────────────── */
const BIZ_METRICS = [
  { value: "2,400+", label: "Studios onboard" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 30s", label: "Avg booking time" },
  { value: "4.8★", label: "App store rating" },
];

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [featured, setFeatured] = useState<FeaturedBusiness[]>([]);
  const [trending, setTrending] = useState<TrendingQuery[]>([]);

  useEffect(() => {
    fetchFeatured().then(setFeatured).catch(console.error);
    fetchTrending().then(setTrending).catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-14">

        {/* ── 1. Hero ─────────────────────────────────────────────── */}
        <section className="page-container pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Live counter */}
            <p className="small-meta text-[var(--ink-3)]">
              14,280 professionals bookable today
            </p>

            {/* Display headline with italic plum flourish */}
            <h1 className="hero-display text-[var(--ink)]">
              Find your next{" "}
              <br className="hidden sm:block" />
              good <em className="italic-plum">hair</em> day
            </h1>

            <p className="text-[var(--ink-3)] text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Browse verified beauty professionals, book instantly, and
              discover looks that inspire you — all in one place.
            </p>

            {/* Search pill */}
            <div className="card max-w-2xl mx-auto p-2 flex flex-col sm:flex-row gap-2 items-stretch shadow-sm">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--paper-2)] transition-colors cursor-pointer">
                <GlamrIcon name="scissors" size={16} className="text-[var(--ink-4)] shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-4)]">Service</p>
                  <p className="text-[13px] text-[var(--ink-3)]">What are you looking for?</p>
                </div>
              </div>
              <div className="hidden sm:block w-px bg-[var(--line-2)]" />
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--paper-2)] transition-colors cursor-pointer">
                <GlamrIcon name="pin" size={16} className="text-[var(--ink-4)] shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-4)]">Where</p>
                  <p className="text-[13px] text-[var(--ink-3)]">Bucharest</p>
                </div>
              </div>
              <div className="hidden sm:block w-px bg-[var(--line-2)]" />
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--paper-2)] transition-colors cursor-pointer">
                <GlamrIcon name="calendar" size={16} className="text-[var(--ink-4)] shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-4)]">When</p>
                  <p className="text-[13px] text-[var(--ink-3)]">Any time</p>
                </div>
              </div>
              <Link
                href="/search"
                className="btn btn-primary px-6 flex items-center gap-2 self-center sm:self-stretch"
              >
                <GlamrIcon name="search" size={16} />
                Search
              </Link>
            </div>

            {/* Trending chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="small-meta text-[var(--ink-4)] self-center mr-1">Trending</span>
              {(trending.length > 0 ? trending.map((t) => t.label) : TRENDING_FALLBACK).map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="chip"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Browse by specialty ──────────────────────────────── */}
        <section className="page-container py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-key mb-2">— browse by specialty</p>
              <h2 className="section-header text-[var(--ink)]">
                Every kind of <em className="italic-plum">beauty</em>
              </h2>
            </div>
            <Link href="/search" className="btn btn-ghost btn-sm hidden md:inline-flex">
              View all
              <GlamrIcon name="arrow" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/c/${cat.slug}`}
                className="card card-hover p-5 flex flex-col justify-between min-h-[120px] group"
              >
                <h3 className="card-serif text-[var(--ink)] text-[20px] group-hover:text-[var(--plum)] transition-colors">
                  {cat.label}
                </h3>
                <p className="tabular-num text-[var(--ink-4)] text-[12px]">
                  {cat.count} pros
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 3. Featured this week ──────────────────────────────── */}
        <section className="py-16 md:py-20 bg-[var(--paper-2)]">
          <div className="page-container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="section-key mb-2">— editor's pick</p>
                <h2 className="section-header text-[var(--ink)]">
                  Featured this <em className="italic-plum">week</em>
                </h2>
              </div>
              <Link href="/search?sort=featured" className="btn btn-ghost btn-sm hidden md:inline-flex">
                See more
                <GlamrIcon name="arrow" size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.length === 0 ? (
                <div className="col-span-full py-10 text-center text-[var(--ink-3)] animate-pulse">
                  Loading featured professionals...
                </div>
              ) : featured.map((pro) => (
                <Link
                  key={pro.slug}
                  href={`/b/${pro.slug}`}
                  className="card card-hover overflow-hidden group"
                >
                  {/* Photo placeholder */}
                  <div className="aspect-[4/3] bg-[var(--paper-3)] relative overflow-hidden placeholder">
                    {pro.cover_image_url ? (
                      <img src={pro.cover_image_url} alt={pro.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="pill absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] capitalize z-10">{pro.verticals[0] ?? "Studio"}</span>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
                      {pro.is_verified && (
                        <span className="badge badge-sage">
                          <GlamrIcon name="shield" size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                    {/* Heart button */}
                    <button
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label={`Save ${pro.name}`}
                    >
                      <GlamrIcon name="heart" size={14} className="text-[var(--ink-3)]" />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[15px] font-medium text-[var(--ink)]">{pro.name}</h3>
                        <p className="text-[12px] text-[var(--ink-3)]">{pro.location?.city ?? "City"}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <GlamrIcon name="star" size={12} className="text-[var(--amber)] fill-[var(--amber)]" />
                        <span className="tabular-num text-[12px] text-[var(--ink-2)]">4.9</span>
                        <span className="text-[11px] text-[var(--ink-4)]">({pro.total_bookings}+)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-[var(--sage)]">
                        <GlamrIcon name="clock" size={12} />
                        <span className="text-[11px] font-medium">Check availability</span>
                      </div>
                      <span className="btn btn-primary btn-sm text-[11px] py-1 px-3">Book</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. For business — editorial strip ──────────────────── */}
        <section className="py-20 md:py-28 bg-[var(--ink)]">
          <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <p className="section-key text-[var(--ink-4)]">— for professionals</p>
                <h2 className="page-title text-[var(--paper)]">
                  Run your chair,{" "}
                  <br className="hidden md:block" />
                  not your <em className="font-display italic text-[var(--plum-soft)]">inbox</em>
                </h2>
                <p className="text-[var(--ink-4)] text-base md:text-lg leading-relaxed max-w-md">
                  Calendar, bookings, clients, payments, and analytics —
                  everything you need to grow your beauty business, in one dashboard.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/business" className="btn btn-plum">
                    List your business
                  </Link>
                  <Link href="/business/pricing" className="btn border border-[var(--ink-3)] text-[var(--paper)] hover:bg-[var(--ink-2)]">
                    View pricing
                  </Link>
                </div>
              </div>
              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-px bg-[var(--ink-2)] rounded-2xl overflow-hidden">
                {BIZ_METRICS.map((m) => (
                  <div key={m.label} className="bg-[var(--ink)] p-8 flex flex-col items-center text-center">
                    <span className="metric-number text-[var(--paper)] text-[36px]">{m.value}</span>
                    <span className="small-meta text-[var(--ink-4)] mt-2">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Trust module ────────────────────────────────────── */}
        <section className="page-container py-16 md:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-key mb-2">— trust & safety</p>
              <h2 className="section-header text-[var(--ink)]">
                Verified <em className="italic-plum">professionals</em>
              </h2>
            </div>
            <Link href="/trust" className="btn btn-ghost btn-sm hidden md:inline-flex">
              Learn more
              <GlamrIcon name="arrow" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="card p-8 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--plum-soft)] flex items-center justify-center">
                  <GlamrIcon name={item.icon} size={18} className="text-[var(--plum)]" />
                </div>
                <h3 className="card-serif text-[20px] text-[var(--ink)]">{item.title}</h3>
                <p className="text-[var(--ink-3)] text-[14px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Final CTA ───────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-[var(--paper-2)]">
          <div className="page-container text-center space-y-8">
            <h2 className="page-title text-[var(--ink)]">
              Ready to book your <em className="italic-plum">look</em>?
            </h2>
            <p className="text-[var(--ink-3)] text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Join thousands of clients who have already found their perfect match.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/search" className="btn btn-primary btn-lg">
                Browse professionals
              </Link>
              <Link href="/auth/register" className="btn btn-ghost btn-lg">
                Create account
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
