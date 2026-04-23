"use client";

import { useEffect, useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import { getBusinessBookings, updateBookingStatus, type BookingSummary } from "@/lib/mvp-api";

type TabId = "pending" | "today" | "declined" | "all";
const TABS: { id: TabId; label: string; count?: number }[] = [
  { id: "pending", label: "Pending", count: 3 },
  { id: "today", label: "Confirmed today", count: 5 },
  { id: "declined", label: "Declined" },
  { id: "all", label: "All" },
];

type Booking = {
  id: string; client: string; service: string; stylist: string; date: string;
  time: string; price: string; status: "pending" | "confirmed" | "declined";
  note?: string; isNew?: boolean;
};

const DEMO_BOOKINGS: Booking[] = [
  { id: "b1", client: "Elena M.", service: "Balayage", stylist: "Ana S.", date: "Today", time: "14:00 – 17:00", price: "920 lei", status: "pending", note: "First visit — wants warm honey tones, shoulder length", isNew: true },
  { id: "b2", client: "Sofia R.", service: "Cut & blow-dry", stylist: "Cristina A.", date: "Today", time: "11:00 – 12:30", price: "180 lei", status: "pending" },
  { id: "b3", client: "Diana V.", service: "Keratin treatment", stylist: "Ana S.", date: "Tomorrow", time: "10:00 – 12:00", price: "650 lei", status: "pending", note: "Has had keratin before, prefers formaldehyde-free" },
  { id: "b4", client: "Ioana P.", service: "Cut & style", stylist: "Ana S.", date: "Today", time: "09:00 – 10:00", price: "180 lei", status: "confirmed" },
  { id: "b5", client: "Ana D.", service: "Root touch-up", stylist: "Mara I.", date: "Today", time: "10:00 – 12:00", price: "350 lei", status: "confirmed" },
  { id: "b6", client: "Maria L.", service: "Blow-dry", stylist: "Mara I.", date: "Today", time: "13:30 – 14:15", price: "80 lei", status: "confirmed" },
  { id: "b7", client: "Laura S.", service: "Highlights", stylist: "Ana S.", date: "Today", time: "15:00 – 17:30", price: "480 lei", status: "confirmed" },
  { id: "b8", client: "Andra M.", service: "Consultation", stylist: "Cristina A.", date: "Today", time: "15:00 – 15:30", price: "Free", status: "confirmed" },
  { id: "b9", client: "Mihaela T.", service: "Balayage", stylist: "Mara I.", date: "Yesterday", time: "14:00 – 17:00", price: "920 lei", status: "declined" },
];

export default function InboxPage() {
  const [tab, setTab] = useState<TabId>("pending");
  const { businessId, loading: ctxLoading } = useStudio();
  const [apiBookings, setApiBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (ctxLoading || !businessId) return;
    setLoading(true); setFetchError(false);
    getBusinessBookings(businessId)
      .then(setApiBookings)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [businessId, ctxLoading]);

  const displayBookings = (apiBookings.length === 0 && (fetchError || businessId === "demo"))
    ? DEMO_BOOKINGS
    : apiBookings;

  const normalized = displayBookings.map((b: any) => {
    if ('client' in b) return b as Booking; // already demo format

    const start = new Date(b.start_at);
    const end = new Date(b.end_at);
    
    let status = "pending";
    if (b.status === "confirmed" || b.status === "completed") status = "confirmed";
    if (b.status === "cancelled_by_business" || b.status === "cancelled_by_customer" || b.status === "no_show") status = "declined";

    return {
      id: b.id,
      client: b.customer_name,
      service: b.service?.name ?? "Service",
      stylist: b.staff?.display_name ?? "Stylist",
      date: start.toDateString() === new Date().toDateString() ? "Today" : start.toLocaleDateString(),
      time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      price: b.service?.price_cents ? new Intl.NumberFormat("en-GB", { style: "currency", currency: b.service.currency || "GBP", minimumFractionDigits: 0 }).format(b.service.price_cents / 100) : "—",
      status: status as "pending" | "confirmed" | "declined",
      rawStatus: b.status,
      isNew: undefined as boolean | undefined,
      note: undefined as string | undefined,
    };
  });

  const filtered = normalized.filter((b) => {
    if (tab === "pending") return b.status === "pending";
    if (tab === "today") return b.status === "confirmed" && b.date === "Today";
    if (tab === "declined") return b.status === "declined";
    return true;
  });

  async function handleStatus(id: string, newStatus: string) {
    // Optimistic update for demo data or fast UI
    setApiBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } as BookingSummary : b));
    try {
      await updateBookingStatus(id, newStatus);
    } catch {
      // Revert could go here
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Bookings</h1>
        <button className="btn btn-ghost btn-sm">
          <GlamrIcon name="check" size={13} /> Bulk confirm
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.count && tab === "pending" && (
              <span className={`ml-1.5 w-5 h-5 rounded-full text-[10px] inline-flex items-center justify-center ${t.id === "pending" ? "bg-[var(--amber)] text-white" : "bg-[var(--paper-3)] text-[var(--ink-3)]"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking rows */}
      <div className="space-y-2">
        {loading ? (
          <div className="card p-8 text-center">
            <p className="text-[var(--ink-3)] text-[14px] animate-pulse">Loading inbox…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[var(--ink-3)] text-[14px]">No bookings in this view</p>
          </div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="card p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[var(--paper-3)] placeholder flex items-center justify-center shrink-0">
                <span className="text-[13px] font-medium text-[var(--ink-3)]">{b.client.charAt(0)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {b.isNew && <span className="badge badge-plum text-[8px]">New client</span>}
                  <span className="text-[14px] font-medium text-[var(--ink)]">{b.client}</span>
                </div>
                <p className="text-[13px] text-[var(--ink-2)]">
                  {b.service} <span className="text-[var(--ink-4)]">with</span> {b.stylist}
                </p>
                {b.note && (
                  <p className="text-[12px] text-[var(--ink-3)] mt-1 flex items-start gap-1.5 max-w-md">
                    <GlamrIcon name="message" size={11} className="text-[var(--ink-4)] mt-0.5 shrink-0" />
                    {b.note}
                  </p>
                )}
              </div>

              {/* Date/time */}
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-[13px] text-[var(--ink-2)]">{b.date}</p>
                <p className="tabular-num text-[12px] text-[var(--ink-3)] font-mono">{b.time}</p>
                <p className="tabular-num text-[13px] font-medium text-[var(--ink)]">{b.price}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 shrink-0 ml-2">
                {b.status === "pending" && (
                  <>
                    <button onClick={() => handleStatus(b.id, 'confirmed')} className="btn btn-primary btn-sm py-1.5">Accept</button>
                    <button className="btn btn-ghost btn-sm py-1.5 opacity-50 cursor-not-allowed">Counter</button>
                    <button onClick={() => handleStatus(b.id, 'cancelled_by_business')} className="btn btn-ghost btn-sm py-1.5 text-red-600">Decline</button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <span className="badge badge-sage">Confirmed</span>
                )}
                {b.status === "declined" && (
                  <span className="badge text-[var(--ink-4)]">Declined</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
