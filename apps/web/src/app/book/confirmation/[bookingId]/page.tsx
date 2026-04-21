"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getBookingById, type BookingDetail } from "@/lib/mvp-api";
import { getStoredSession, isSessionExpired } from "@/lib/auth-client";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(cents: number | null, currency: string) {
  if (cents == null) return "On consultation";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session || isSessionExpired()) {
      router.replace("/auth/login");
      return;
    }

    getBookingById(bookingId)
      .then(setBooking)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Booking not found");
      })
      .finally(() => setLoading(false));
  }, [bookingId, router]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-lg mx-auto">
          {loading ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
                Loading confirmation…
              </p>
            </div>
          ) : error || !booking ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-12 text-center">
              <p className="font-label text-[10px] uppercase tracking-widest text-error mb-4">
                {error ?? "Booking not found"}
              </p>
              <Link
                href="/explore"
                className="font-label text-[10px] uppercase tracking-widest text-primary/50 hover:text-primary transition-colors"
              >
                ← Explore services
              </Link>
            </div>
          ) : (
            <>
              {/* Confirmed header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary-fixed mb-6">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-fixed"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h1 className="font-headline font-black text-3xl tracking-tight text-primary mb-2">
                  Booking Confirmed
                </h1>
                <p className="font-label text-[9px] uppercase tracking-widest text-primary/40">
                  {booking.status.replace(/_/g, " ")}
                </p>
              </div>

              {/* Booking details */}
              <div className="border border-outline-variant/30 bg-surface-container-lowest divide-y divide-outline-variant/20">
                {booking.service && (
                  <div className="px-6 py-5">
                    <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
                      Service
                    </p>
                    <p className="font-body text-sm font-medium text-primary">
                      {booking.service.name}
                    </p>
                    <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                      {formatMoney(booking.service.price_cents, booking.service.currency)}
                    </p>
                  </div>
                )}

                <div className="px-6 py-5">
                  <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
                    Date & Time
                  </p>
                  <p className="font-body text-sm font-medium text-primary">
                    {formatDate(booking.start_at)}
                  </p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                    {formatTime(booking.start_at)} – {formatTime(booking.end_at)}
                  </p>
                </div>

                {booking.staff && (
                  <div className="px-6 py-5">
                    <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
                      Staff
                    </p>
                    <p className="font-body text-sm font-medium text-primary">
                      {booking.staff.display_name}
                    </p>
                  </div>
                )}

                {booking.business && (
                  <div className="px-6 py-5">
                    <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
                      Business
                    </p>
                    <p className="font-body text-sm font-medium text-primary">
                      {booking.business.name}
                    </p>
                    {booking.location && (
                      <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                        {booking.location.city}
                      </p>
                    )}
                  </div>
                )}

                <div className="px-6 py-5">
                  <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
                    Booking ID
                  </p>
                  <p className="font-body text-xs text-primary/50 font-mono">{booking.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Link
                  href="/my-bookings"
                  className="flex-1 text-center border border-outline-variant/60 text-primary font-headline font-bold uppercase tracking-widest text-xs py-3.5 hover:border-primary transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  href="/explore"
                  className="flex-1 text-center bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs py-3.5 hover:bg-primary transition-colors"
                >
                  Explore More
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
