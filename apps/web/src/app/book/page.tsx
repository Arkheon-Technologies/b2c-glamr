"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { fetchServices, type ServiceListItem } from "@/lib/mvp-api";

function formatMoney(cents: number | null, currency: string) {
  if (cents == null) {
    return "On consultation";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function totalDuration(service: ServiceListItem) {
  return (
    service.duration_active_min +
    service.duration_processing_min +
    service.duration_finish_min
  );
}

export default function BookCatalogPage() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [search, setSearch] = useState("");
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
          const fallback = "Unable to load services right now.";
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
    if (!term) {
      return services;
    }

    return services.filter((service) => {
      const inName = service.name.toLowerCase().includes(term);
      const inDescription = service.description?.toLowerCase().includes(term);
      const inBusiness = service.business?.name.toLowerCase().includes(term);
      return inName || inDescription || inBusiness;
    });
  }, [search, services]);

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-fixed font-bold mb-3">
                Live Booking
              </p>
              <h1 className="font-headline font-black uppercase tracking-tighter text-primary text-4xl md:text-6xl leading-[0.92]">
                Select Service
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant mt-3 max-w-2xl">
                Choose a service, check live availability, and lock your slot in one flow.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">
                search
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="text"
                placeholder="Search services or studios"
                className="w-full bg-transparent border border-outline-variant pl-10 pr-4 py-3 text-xs font-label uppercase tracking-widest placeholder:text-outline/50 focus:border-primary-fixed focus:outline-none transition-colors"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error mb-6">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              Loading services...
            </div>
          ) : (
            <>
              <div className="mb-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {filteredServices.length} services available
              </div>

              {filteredServices.length === 0 ? (
                <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  No services match this search yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-outline-variant/20 border border-outline-variant/20">
                  {filteredServices.map((service) => (
                    <article
                      key={service.id}
                      className="bg-surface-container-lowest p-6 md:p-7 flex flex-col gap-4 hover:bg-surface transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-label text-[9px] uppercase tracking-[0.2em] text-primary-fixed font-bold mb-2">
                            {service.business?.name || "Studio"}
                          </p>
                          <h2 className="font-headline text-xl font-black tracking-tight uppercase text-primary">
                            {service.name}
                          </h2>
                        </div>
                        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {totalDuration(service)} min
                        </span>
                      </div>

                      <p className="font-body text-sm text-on-surface-variant min-h-12">
                        {service.description || "Tailored service delivered with a split-phase precision flow."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                        <span className="font-headline font-bold tracking-tight text-primary">
                          {formatMoney(service.price_cents, service.currency)}
                        </span>
                        <Link
                          href={`/book/${service.id}`}
                          className="bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-primary transition-colors"
                        >
                          View Slots
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}