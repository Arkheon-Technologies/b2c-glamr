"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/studio-context";
import { getBusinessBookings, type BookingSummary } from "@/lib/mvp-api";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "text-green-600",
  pending: "text-yellow-600",
  completed: "text-primary/50",
  cancelled_by_customer: "text-error/70",
  cancelled_by_business: "text-error/70",
  no_show: "text-error/40",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { business, businessId, loading: ctxLoading } = useStudio();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (!ctxLoading && !businessId) {
      router.replace("/studio/onboarding");
      return;
    }

    if (businessId) {
      setBookingsLoading(true);
      getBusinessBookings(businessId, "upcoming")
        .then(setBookings)
        .catch(() => setBookings([]))
        .finally(() => setBookingsLoading(false));
    }
  }, [businessId, ctxLoading, router]);

  if (ctxLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
          Loading…
        </p>
      </div>
    );
  }

  const upcomingCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">Studio</p>
        <h1 className="font-headline font-black text-3xl tracking-tight text-primary">
          {business?.name ?? "Dashboard"}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Upcoming", value: upcomingCount },
          { label: "Pending", value: pendingCount },
          { label: "Total bookings", value: business?.total_bookings ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="border border-outline-variant/30 p-6 bg-surface-container-lowest">
            <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-2">
              {stat.label}
            </p>
            <p className="font-headline font-black text-4xl text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {[
          { href: "/studio/services", label: "Manage Services" },
          { href: "/studio/staff", label: "Manage Staff" },
          { href: "/studio/bookings", label: "View All Bookings" },
          { href: "/studio/settings", label: "Business Settings" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border border-outline-variant/40 px-6 py-4 font-headline font-bold uppercase tracking-widest text-xs text-primary/60 hover:text-primary hover:border-primary/40 transition-colors"
          >
            {link.label} →
          </Link>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div>
        <h2 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-4">
          Upcoming Bookings
        </h2>

        {bookingsLoading ? (
          <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
            Loading bookings…
          </p>
        ) : bookings.length === 0 ? (
          <p className="font-label text-[10px] uppercase tracking-widest text-primary/30">
            No upcoming bookings yet.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant/20 border border-outline-variant/30">
            {bookings.slice(0, 8).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-4 bg-surface-container-lowest hover:bg-surface-container transition-colors"
              >
                <div>
                  <p className="font-body text-sm text-primary font-medium">
                    {b.service?.name ?? "—"}
                  </p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                    {formatDate(b.start_at)}
                    {b.staff ? ` · ${b.staff.display_name}` : ""}
                  </p>
                </div>
                <span
                  className={`font-label text-[9px] uppercase tracking-widest ${STATUS_COLORS[b.status] ?? "text-primary/40"}`}
                >
                  {b.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
