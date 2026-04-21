"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  fetchServices,
  joinQueue,
  listQueueEntries,
  type QueueEntry,
  type ServiceListItem,
} from "@/lib/mvp-api";

function statusStyle(status: QueueEntry["status"]) {
  if (status === "waiting") return "text-primary-fixed";
  if (status === "notified") return "text-primary";
  if (status === "serving") return "text-on-primary bg-primary px-2 py-0.5";
  if (status === "served") return "text-on-surface-variant";
  return "text-error";
}

export default function QueuePage() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadServices() {
      setIsLoadingServices(true);
      try {
        const result = await fetchServices();
        if (!isCancelled) {
          setServices(result);
          if (result[0]?.business_id) {
            setBusinessId(result[0].business_id);
          }
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage("Unable to load services for queue setup.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingServices(false);
        }
      }
    }

    loadServices();
    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [serviceId, services],
  );

  async function refreshQueue() {
    if (!businessId.trim()) {
      setErrorMessage("Business ID is required to load queue entries.");
      return;
    }

    setIsLoadingQueue(true);
    setErrorMessage("");

    try {
      const result = await listQueueEntries({
        business_id: businessId.trim(),
        location_id: locationId.trim() || undefined,
      });
      setEntries(result);
    } catch (error) {
      const fallback = "Unable to load queue entries.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsLoadingQueue(false);
    }
  }

  async function handleJoin(event: React.FormEvent) {
    event.preventDefault();

    if (!businessId.trim()) {
      setErrorMessage("Business ID is required to join queue.");
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage("Customer name is required.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await joinQueue({
        business_id: businessId.trim(),
        location_id: locationId.trim() || undefined,
        customer_name: customerName.trim(),
        phone: phone.trim() || undefined,
        service_id: serviceId || undefined,
      });

      setCustomerName("");
      setPhone("");
      await refreshQueue();
    } catch (error) {
      const fallback = "Unable to join queue right now.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-fixed font-bold mb-3">
                Walk-in Operations
              </p>
              <h1 className="font-headline font-black uppercase tracking-tighter text-primary text-4xl md:text-6xl leading-[0.92]">
                Join Queue
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant mt-3 max-w-2xl">
                Create a live queue entry and track your position in real time.
              </p>
            </div>
            <Link
              href="/studio/queue"
              className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-primary-fixed hover:underline"
            >
              Open studio queue console →
            </Link>
          </div>

          {errorMessage && (
            <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error mb-6">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            <aside className="bg-surface-container-lowest border border-outline-variant/20 p-6 md:p-8 h-fit">
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    Business ID
                  </label>
                  <input
                    value={businessId}
                    onChange={(event) => setBusinessId(event.target.value)}
                    placeholder="uuid"
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    Location ID (optional)
                  </label>
                  <input
                    value={locationId}
                    onChange={(event) => setLocationId(event.target.value)}
                    placeholder="uuid"
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    Service
                  </label>
                  <select
                    value={serviceId}
                    onChange={(event) => {
                      const nextServiceId = event.target.value;
                      setServiceId(nextServiceId);
                      const service = services.find((item) => item.id === nextServiceId);
                      if (service?.business_id) {
                        setBusinessId(service.business_id);
                      }
                    }}
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                    disabled={isLoadingServices}
                  >
                    <option value="">No specific service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.business?.name || "Studio"} - {service.name}
                      </option>
                    ))}
                  </select>
                  {selectedService && (
                    <p className="mt-2 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Selected: {selectedService.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    Customer Name
                  </label>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Full name"
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    Phone (optional)
                  </label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+44..."
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Joining..." : "Join Queue"}
                  </button>
                  <button
                    type="button"
                    onClick={refreshQueue}
                    disabled={isLoadingQueue}
                    className="flex-1 border border-outline-variant font-label text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 hover:border-primary-fixed transition-colors"
                  >
                    {isLoadingQueue ? "Loading..." : "Refresh Queue"}
                  </button>
                </div>
              </form>
            </aside>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
                  Current Queue
                </h2>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {entries.length} active entries
                </span>
              </div>

              {entries.length === 0 ? (
                <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  No queue entries loaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20">
                  {entries.map((entry) => (
                    <article key={entry.id} className="bg-surface-container-lowest p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-headline text-xl font-black text-primary">#{entry.position}</p>
                          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                            {entry.customer_name}
                          </p>
                        </div>
                        <span className={`font-label text-[10px] uppercase tracking-[0.2em] font-bold ${statusStyle(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>

                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                        Wait: {entry.estimated_wait_min ?? 0} min
                      </p>

                      <p className="font-body text-xs text-on-surface-variant">
                        {entry.service_name || "General walk-in"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
