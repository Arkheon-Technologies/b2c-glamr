"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/studio-context";
import { getBusinessBookings, type BookingSummary } from "@/lib/mvp-api";

type FilterStatus = "all" | "upcoming" | "past";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "text-green-600",
  pending: "text-yellow-600",
  completed: "text-primary/50",
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

export default function StudioBookingsPage() {
  const router = useRouter();
  const { businessId, business, loading: ctxLoading } = useStudio();

  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!ctxLoading && !businessId) {
      router.replace("/studio/onboarding");
      return;
    }
    if (businessId) {
      load(filter);
    }
  }, [businessId, ctxLoading, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load(f: FilterStatus) {
    setLoading(true);
    try {
      const result = await getBusinessBookings(businessId!, f === "all" ? undefined : f);
      setBookings(result);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  if (ctxLoading) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
          {business?.name}
        </p>
        <h1 className="font-headline font-black text-3xl tracking-tight text-primary">Bookings</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-outline-variant/30">
        {(["all", "upcoming", "past"] as FilterStatus[]).map((f) => (
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
        <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
          Loading bookings…
        </p>
      ) : bookings.length === 0 ? (
        <div className="border border-outline-variant/30 p-12 text-center">
          <p className="font-label text-[10px] uppercase tracking-widest text-primary/30">
            No bookings found.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/20 border border-outline-variant/30">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between px-5 py-5 bg-surface-container-lowest hover:bg-surface-container transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-primary">
                  {b.service?.name ?? "—"}
                </p>
                <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                  {formatDate(b.start_at)}
                  {b.staff ? ` · ${b.staff.display_name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                {b.service?.price_cents != null && (
                  <span className="font-body text-sm text-primary">
                    {new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: b.service.currency || "GBP",
                      minimumFractionDigits: 0,
                    }).format(b.service.price_cents / 100)}
                  </span>
                )}
                <span
                  className={`font-label text-[9px] uppercase tracking-widest ${STATUS_COLORS[b.status] ?? "text-primary/40"}`}
                >
                  {b.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
