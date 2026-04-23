"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { getMyBookings, cancelBookingById, type BookingSummary } from "@/lib/mvp-api";
import { getStoredSession, isSessionExpired } from "@/lib/auth-client";

type TabId = "upcoming" | "past" | "waitlist" | "favorites";
const TABS: { id: TabId; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "waitlist", label: "Waitlist" },
  { id: "favorites", label: "Favorites" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(cents: number | null, currency: string) {
  if (cents == null) return null;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "RON",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

const MOCK_FAVORITES = [
  { slug: "sala-studio", name: "Sala Studio", type: "Hair salon", rating: 4.9, reviews: 142 },
  { slug: "the-barber-lab", name: "The Barber Lab", type: "Barbershop", rating: 4.9, reviews: 216 },
  { slug: "glow-clinic", name: "Glow Clinic", type: "Skincare", rating: 4.7, reviews: 67 },
];

export default function MyBookingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("upcoming");
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session || isSessionExpired()) {
      router.replace("/auth/login?next=/me/bookings");
      return;
    }
    
    if (tab === "upcoming" || tab === "past") {
      loadBookings(tab);
    }
  }, [tab, router]);

  async function loadBookings(f: "upcoming" | "past") {
    setLoading(true);
    try {
      const result = await getMyBookings(f);
      setBookings(result);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await cancelBookingById(id, "Customer cancelled via app");
      if (tab === "upcoming" || tab === "past") {
        await loadBookings(tab);
      }
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)]">
        <div className="page-container py-8">
          <h1 className="page-title text-[var(--ink)] mb-2">My <em className="italic-plum">bookings</em></h1>
          <p className="text-[var(--ink-3)] text-[14px] mb-8">Manage your appointments and saved studios.</p>

          {/* Tabs */}
          <div className="tabs mb-8">
            {TABS.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === "upcoming" && tab === "upcoming" && !loading && bookings.length > 0 && (
                  <span className="ml-1.5 w-5 h-5 rounded-full bg-[var(--plum)] text-white text-[10px] inline-flex items-center justify-center">
                    {bookings.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Upcoming */}
          {tab === "upcoming" && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-[var(--ink-3)] animate-pulse">Loading...</div>
              ) : bookings.length === 0 ? (
                <div className="py-10 text-center text-[var(--ink-3)]">No upcoming bookings.</div>
              ) : bookings.map((b) => (
                <div key={b.id} className="card p-5 flex flex-col sm:flex-row gap-5">
                  <div className="w-[100px] h-[80px] rounded-lg bg-[var(--paper-3)] placeholder shrink-0 overflow-hidden relative">
                    <span className="pill absolute top-1 left-1 text-[8px] capitalize">{b.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[16px] font-medium text-[var(--ink)]">{b.service?.name ?? "Service"}</h3>
                      <p className="text-[12px] text-[var(--ink-3)]">{b.business?.name ?? "Business"} · {b.staff?.display_name ?? "Stylist"}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-[13px]">
                        <span className="flex items-center gap-1 text-[var(--ink-2)]">
                          <GlamrIcon name="calendar" size={13} /> {formatDate(b.start_at)}
                        </span>
                        <span className="tabular-num font-medium text-[var(--ink)]">{formatMoney(b.service?.price_cents ?? null, b.service?.currency ?? "RON")}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button className="btn btn-ghost btn-sm">Reschedule</button>
                        <button 
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}
                          className="btn btn-ghost btn-sm text-red-600 disabled:opacity-50"
                        >
                          {cancelling === b.id ? "..." : "Cancel"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past */}
          {tab === "past" && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-[var(--ink-3)] animate-pulse">Loading...</div>
              ) : bookings.length === 0 ? (
                <div className="py-10 text-center text-[var(--ink-3)]">No past bookings.</div>
              ) : bookings.map((b) => (
                <div key={b.id} className="card p-5 flex flex-col sm:flex-row gap-5">
                  <div className="w-[100px] h-[80px] rounded-lg bg-[var(--paper-3)] placeholder shrink-0 overflow-hidden relative">
                    <span className="pill absolute top-1 left-1 text-[8px] capitalize">{b.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[16px] font-medium text-[var(--ink)]">{b.service?.name ?? "Service"}</h3>
                      <p className="text-[12px] text-[var(--ink-3)]">{b.business?.name ?? "Business"} · {b.staff?.display_name ?? "Stylist"} · {formatDate(b.start_at)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="tabular-num text-[13px] font-medium text-[var(--ink)]">{formatMoney(b.service?.price_cents ?? null, b.service?.currency ?? "RON")}</span>
                      <div className="flex gap-2">
                        {b.business && <Link href={`/b/${b.business.slug}`} className="btn btn-primary btn-sm">Rebook</Link>}
                        {b.status === "completed" && <button className="btn btn-ghost btn-sm">Leave review</button>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Waitlist */}
          {tab === "waitlist" && (
            <div className="card p-8 text-center space-y-3">
              <GlamrIcon name="clock" size={36} className="text-[var(--ink-4)] mx-auto" />
              <p className="text-[var(--ink-2)] text-[15px] font-medium">No active waitlists</p>
              <p className="text-[var(--ink-4)] text-[13px]">When a service is fully booked, you can join the waitlist and we&apos;ll notify you when a slot opens.</p>
              <Link href="/search" className="btn btn-primary btn-sm inline-flex">Browse professionals</Link>
            </div>
          )}

          {/* Favorites */}
          {tab === "favorites" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOCK_FAVORITES.map((fav) => (
                <Link key={fav.slug} href={`/b/${fav.slug}`} className="card card-hover p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--paper-3)] placeholder shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-medium text-[var(--ink)]">{fav.name}</h3>
                    <p className="text-[12px] text-[var(--ink-3)]">{fav.type}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <GlamrIcon name="star" size={11} className="text-[var(--amber)]" />
                      <span className="tabular-num text-[12px] text-[var(--ink-2)]">{fav.rating}</span>
                      <span className="text-[11px] text-[var(--ink-4)]">({fav.reviews})</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--paper-2)]" aria-label="Remove">
                    <GlamrIcon name="heart" size={16} className="text-[var(--plum)]" />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
