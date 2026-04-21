"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchBusinessProfile, type BusinessProfile } from "@/lib/mvp-api";

function formatMoney(cents: number | null, maxCents: number | null, currency: string) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      minimumFractionDigits: 0,
    }).format(v / 100);

  if (cents != null && maxCents != null && cents !== maxCents) {
    return `${fmt(cents)} – ${fmt(maxCents)}`;
  }
  if (cents != null) return fmt(cents);
  if (maxCents != null) return `From ${fmt(maxCents)}`;
  return "On consultation";
}

function formatDuration(a: number, p: number, f: number) {
  const total = a + p + f;
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export default function BusinessProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessProfile(slug)
      .then(setBusiness)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Business not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-24 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
              Loading…
            </p>
          </div>
        ) : error || !business ? (
          <div className="max-w-lg mx-auto px-6 pt-20 text-center">
            <p className="font-label text-[10px] uppercase tracking-widest text-error mb-4">
              {error ?? "Business not found"}
            </p>
            <Link href="/explore" className="font-label text-[10px] uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
              ← Explore
            </Link>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="bg-surface-container-lowest border-b border-outline-variant/20">
              <div className="max-w-5xl mx-auto px-8 py-12">
                <div className="flex items-start gap-6">
                  {business.logo_url ? (
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="w-20 h-20 object-cover border border-outline-variant/20 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-surface-container flex items-center justify-center border border-outline-variant/20 shrink-0">
                      <span className="font-headline font-black text-2xl text-primary/30">
                        {business.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="font-headline font-black text-4xl tracking-tight text-primary">
                        {business.name}
                      </h1>
                      {business.is_verified && (
                        <span className="font-label text-[8px] uppercase tracking-widest text-primary-fixed border border-primary-fixed/30 px-2 py-0.5">
                          Verified
                        </span>
                      )}
                    </div>
                    {business.location && (
                      <p className="font-label text-[10px] uppercase tracking-widest text-primary/40">
                        {business.location.neighborhood
                          ? `${business.location.neighborhood}, `
                          : ""}
                        {business.location.city}
                      </p>
                    )}
                    {business.about && (
                      <p className="font-body text-sm text-primary/60 mt-3 max-w-xl">
                        {business.about}
                      </p>
                    )}
                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="font-label text-[9px] uppercase tracking-widest text-primary/30">
                          Total bookings
                        </p>
                        <p className="font-headline font-black text-xl text-primary">
                          {business.total_bookings}
                        </p>
                      </div>
                      <div>
                        <p className="font-label text-[9px] uppercase tracking-widest text-primary/30">
                          Team members
                        </p>
                        <p className="font-headline font-black text-xl text-primary">
                          {business.staff.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="max-w-5xl mx-auto px-8 py-10">
              <h2 className="font-headline font-black text-xl tracking-tight text-primary mb-6 uppercase">
                Services
              </h2>

              {business.services.length === 0 ? (
                <p className="font-label text-[10px] uppercase tracking-widest text-primary/30">
                  No services listed yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-surface-container-lowest p-6 flex flex-col gap-3 hover:bg-surface-container transition-colors"
                    >
                      <div>
                        <h3 className="font-body text-sm font-medium text-primary">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="font-body text-xs text-primary/50 mt-1 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/20">
                        <div>
                          <p className="font-label text-[10px] uppercase tracking-widest text-primary/60">
                            {formatMoney(service.price_cents, service.price_max_cents, service.currency)}
                          </p>
                          <p className="font-label text-[9px] uppercase tracking-widest text-primary/30 mt-0.5">
                            {formatDuration(
                              service.duration_active_min,
                              service.duration_processing_min,
                              service.duration_finish_min,
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/book/${service.id}`}
                          className="bg-primary-fixed text-white font-label text-[9px] uppercase tracking-widest font-bold px-4 py-2 hover:bg-primary transition-colors"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff */}
            {business.staff.length > 0 && (
              <div className="max-w-5xl mx-auto px-8 pb-10">
                <h2 className="font-headline font-black text-xl tracking-tight text-primary mb-6 uppercase">
                  Team
                </h2>
                <div className="flex flex-wrap gap-3">
                  {business.staff.map((member) => (
                    <div
                      key={member.id}
                      className="border border-outline-variant/30 bg-surface-container-lowest px-5 py-4 min-w-32"
                    >
                      <p className="font-body text-sm font-medium text-primary">{member.display_name}</p>
                      <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mt-0.5">
                        {member.role}
                      </p>
                      {member.avg_rating != null && (
                        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mt-0.5">
                          ★ {member.avg_rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
