"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  createBooking,
  fetchAvailability,
  fetchServiceById,
  type AvailableSlot,
  type BookingRecord,
  type ServiceDetails,
} from "@/lib/mvp-api";

function formatMoney(cents: number | null, currency: string) {
  if (cents == null) {
    return "On consultation";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatSlotTime(dateValue: string) {
  const date = new Date(dateValue);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayDateString() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${now.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookServicePage() {
  const params = useParams<{ serviceId: string }>();
  const serviceId = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadService() {
      setIsLoadingService(true);
      setErrorMessage("");

      try {
        const data = await fetchServiceById(serviceId);
        if (!isCancelled) {
          setService(data);
        }
      } catch (error) {
        if (!isCancelled) {
          const fallback = "Unable to load service details.";
          setErrorMessage(error instanceof Error ? error.message : fallback);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingService(false);
        }
      }
    }

    loadService();
    return () => {
      isCancelled = true;
    };
  }, [serviceId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadAvailability() {
      setIsLoadingSlots(true);
      setErrorMessage("");

      try {
        const data = await fetchAvailability(serviceId, selectedDate);
        if (!isCancelled) {
          setSlots(data);
        }
      } catch (error) {
        if (!isCancelled) {
          const fallback = "Unable to load live availability.";
          setErrorMessage(error instanceof Error ? error.message : fallback);
          setSlots([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadAvailability();
    return () => {
      isCancelled = true;
    };
  }, [selectedDate, serviceId]);

  async function handleBook(slot: AvailableSlot) {
    setIsSubmitting(slot.startAt);
    setErrorMessage("");

    try {
      const response = await createBooking({
        service_id: serviceId,
        staff_id: slot.staffId,
        start_at: slot.startAt,
      });

      setBooking(response);
      const refreshedSlots = await fetchAvailability(serviceId, selectedDate);
      setSlots(refreshedSlots);
    } catch (error) {
      const fallback = "Booking could not be completed.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsSubmitting(null);
    }
  }

  const totalDurationMin = useMemo(() => {
    if (!service) {
      return 0;
    }

    return (
      service.duration_active_min +
      service.duration_processing_min +
      service.duration_finish_min
    );
  }, [service]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link
              href="/book"
              className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-fixed"
            >
              ← Back to Services
            </Link>
          </div>

          {errorMessage && (
            <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error mb-6">
              {errorMessage}
            </div>
          )}

          {booking && (
            <div className="border border-primary-fixed/40 bg-primary-fixed/10 px-4 py-4 mb-6">
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-fixed font-bold mb-2">
                Booking Confirmed
              </p>
              <p className="font-body text-sm text-on-surface-variant">
                Booking ID: {booking.id} • Status: {booking.status}
              </p>
            </div>
          )}

          {isLoadingService ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Loading service details...
            </div>
          ) : !service ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Service not found.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-8">
              <aside className="bg-surface-container-lowest border border-outline-variant/20 p-6 md:p-8 h-fit">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-fixed font-bold mb-2">
                  {service.business.name}
                </p>
                <h1 className="font-headline text-3xl font-black uppercase tracking-tight text-primary leading-tight">
                  {service.name}
                </h1>
                <p className="font-body text-sm text-on-surface-variant mt-3">
                  {service.description || "This service is ready for booking with live slot validation."}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-4 text-xs font-label uppercase tracking-wider">
                  <div>
                    <dt className="text-on-surface-variant">Price</dt>
                    <dd className="text-primary font-bold mt-1">
                      {formatMoney(service.price_cents, service.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Duration</dt>
                    <dd className="text-primary font-bold mt-1">{totalDurationMin} min</dd>
                  </div>
                </dl>

                <div className="mt-6 pt-6 border-t border-outline-variant/20">
                  <label
                    htmlFor="selected-date"
                    className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold"
                  >
                    Select date
                  </label>
                  <input
                    id="selected-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="mt-2 w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-3 text-xs font-label uppercase tracking-widest"
                  />
                </div>
              </aside>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
                    Available Slots
                  </h2>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {slots.length} options
                  </span>
                </div>

                {isLoadingSlots ? (
                  <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                    Loading slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                    No slots currently available for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20">
                    {slots.map((slot) => (
                      <article
                        key={`${slot.staffId}-${slot.startAt}`}
                        className="bg-surface-container-lowest p-5 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-headline font-bold text-lg text-primary">
                              {formatSlotTime(slot.startAt)}
                            </p>
                            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                              with {slot.staffName}
                            </p>
                          </div>
                          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-fixed font-bold">
                            {slot.phases.length} phases
                          </span>
                        </div>

                        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {formatSlotTime(slot.startAt)} - {formatSlotTime(slot.endAt)}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleBook(slot)}
                          disabled={isSubmitting === slot.startAt}
                          className="mt-2 bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 hover:bg-primary transition-colors disabled:opacity-50"
                        >
                          {isSubmitting === slot.startAt ? "Booking..." : "Book Slot"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}