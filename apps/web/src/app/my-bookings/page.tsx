"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getMyBookings, cancelBookingById, type BookingSummary } from "@/lib/mvp-api";
import { getStoredSession, isSessionExpired } from "@/lib/auth-client";

type FilterStatus = "upcoming" | "past" | "all";

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled_by_customer: "Cancelled",
  cancelled_by_business: "Cancelled by Business",
  no_show: "No Show",
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: "text-green-600",
  pending: "text-yellow-600",
  completed: "text-primary/40",
  cancelled_by_customer: "text-error/60",
  cancelled_by_business: "text-error/60",
  no_show: "text-error/30",
};

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
    currency: currency || "GBP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function isCancellable(status: string) {
  return status === "confirmed" || status === "pending";
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session || isSessionExpired()) {
      router.replace("/auth/login?next=/my-bookings");
      return;
    }

    loadBookings(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadBookings(f: FilterStatus) {
    setLoading(true);
    try {
      const result = await getMyBookings(f === "all" ? undefined : f);
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
      await loadBookings(filter);
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
              Your Account
            </p>
            <h1 className="font-headline font-black text-4xl tracking-tight text-primary">
              My Bookings
            </h1>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-6 border-b border-outline-variant/30">
            {(["upcoming", "past", "all"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={[
                  "font-label text-[9px] uppercase tracking-widest px-4 py-2.5 transition-colors",
                  filter === f
                    ? "text-primary border-b-2 border-primary-fixed -mb-px"
                    : "text-primary/40 hover:text-primary",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
                Loading bookings…
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 mb-4">
                No {filter === "all" ? "" : filter} bookings found.
              </p>
              <Link
                href="/explore"
                className="inline-block bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-primary transition-colors"
              >
                Book a Service
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20 border border-outline-variant/30">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-surface-container-lowest hover:bg-surface-container transition-colors px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-primary">
                        {b.service?.name ?? "Service"}
                      </p>
                      {b.business && (
                        <p className="font-label text-[10px] uppercase tracking-widest text-primary/50 mt-0.5">
                          {b.business.name}
                        </p>
                      )}
                      <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-1">
                        {formatDate(b.start_at)}
                        {b.staff ? ` · ${b.staff.display_name}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {b.service?.price_cents != null && (
                        <p className="font-body text-sm text-primary mb-1">
                          {formatMoney(b.service.price_cents, b.service.currency)}
                        </p>
                      )}
                      <span
                        className={`font-label text-[9px] uppercase tracking-widest ${STATUS_COLOR[b.status] ?? "text-primary/40"}`}
                      >
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </div>
                  </div>

                  {isCancellable(b.status) && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                        className="font-label text-[9px] uppercase tracking-widest text-error/60 hover:text-error border border-error/20 hover:border-error/40 px-3 py-1.5 transition-colors disabled:opacity-40"
                      >
                        {cancelling === b.id ? "Cancelling…" : "Cancel Booking"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
