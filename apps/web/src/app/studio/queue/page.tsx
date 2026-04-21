"use client";

import { useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  listQueueEntries,
  updateQueueEntryStatus,
  type QueueEntry,
  type QueueStatus,
} from "@/lib/mvp-api";

const STATUS_ACTIONS: Array<{ label: string; value: QueueStatus }> = [
  { label: "Notify", value: "notified" },
  { label: "Serve", value: "serving" },
  { label: "Complete", value: "served" },
  { label: "Cancel", value: "cancelled" },
  { label: "No-show", value: "no_show" },
];

export default function StudioQueuePage() {
  const [businessId, setBusinessId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function refreshQueue() {
    if (!businessId.trim()) {
      setErrorMessage("Business ID is required.");
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  }

  async function applyStatus(entryId: string, status: QueueStatus) {
    setActiveEntryId(entryId);
    setErrorMessage("");

    try {
      await updateQueueEntryStatus(entryId, status);
      await refreshQueue();
    } catch (error) {
      const fallback = "Unable to update queue status.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setActiveEntryId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-fixed font-bold mb-3">
                Studio Operations
              </p>
              <h1 className="font-headline font-black uppercase tracking-tighter text-primary text-4xl md:text-6xl leading-[0.92]">
                Queue Console
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant mt-3 max-w-2xl">
                Update queue states in real time for front-desk and staff workflows.
              </p>
            </div>

            <Link
              href="/studio/portfolio"
              className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-primary-fixed hover:underline"
            >
              Open portfolio console →
            </Link>
          </div>

          {errorMessage && (
            <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error mb-6">
              {errorMessage}
            </div>
          )}

          <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
              <input
                value={businessId}
                onChange={(event) => setBusinessId(event.target.value)}
                placeholder="Business ID"
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
              />
              <input
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                placeholder="Location ID (optional)"
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
              />
              <button
                type="button"
                onClick={refreshQueue}
                disabled={isLoading}
                className="bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 hover:bg-primary transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load Queue"}
              </button>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              No entries available.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-outline-variant/20 border border-outline-variant/20">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="bg-surface-container-lowest p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="font-headline text-lg font-black text-primary">
                      #{entry.position} {entry.customer_name}
                    </p>
                    <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                      {entry.service_name || "General walk-in"} • {entry.status}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS_ACTIONS.map((action) => (
                      <button
                        key={action.value}
                        type="button"
                        disabled={activeEntryId === entry.id}
                        onClick={() => applyStatus(entry.id, action.value)}
                        className="border border-outline-variant font-label text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:border-primary-fixed hover:text-primary-fixed transition-colors disabled:opacity-50"
                      >
                        {activeEntryId === entry.id ? "Saving..." : action.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
