"use client";

import { useEffect, useState, useCallback } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import { getBusinessBookings, updateBookingStatus, type BookingSummary } from "@/lib/mvp-api";

type TabId = "pending" | "today" | "declined" | "all";

type Booking = {
  id: string; client: string; service: string; stylist: string; date: string;
  time: string; price: string; status: "pending" | "confirmed" | "declined";
  note?: string; isNew?: boolean; startAt?: string;
};

const DEMO_BOOKINGS: Booking[] = [
  { id: "b1", client: "Elena M.", service: "Balayage", stylist: "Ana S.", date: "Today", time: "14:00 – 17:00", price: "920 lei", status: "pending", note: "First visit — wants warm honey tones, shoulder length", isNew: true, startAt: new Date().toISOString() },
  { id: "b2", client: "Sofia R.", service: "Cut & blow-dry", stylist: "Cristina A.", date: "Today", time: "11:00 – 12:30", price: "180 lei", status: "pending", startAt: new Date().toISOString() },
  { id: "b3", client: "Diana V.", service: "Keratin treatment", stylist: "Ana S.", date: "Tomorrow", time: "10:00 – 12:00", price: "650 lei", status: "pending", note: "Has had keratin before, prefers formaldehyde-free" },
  { id: "b4", client: "Ioana P.", service: "Cut & style", stylist: "Ana S.", date: "Today", time: "09:00 – 10:00", price: "180 lei", status: "confirmed" },
  { id: "b5", client: "Ana D.", service: "Root touch-up", stylist: "Mara I.", date: "Today", time: "10:00 – 12:00", price: "350 lei", status: "confirmed" },
  { id: "b6", client: "Maria L.", service: "Blow-dry", stylist: "Mara I.", date: "Today", time: "13:30 – 14:15", price: "80 lei", status: "confirmed" },
  { id: "b7", client: "Laura S.", service: "Highlights", stylist: "Ana S.", date: "Today", time: "15:00 – 17:30", price: "480 lei", status: "confirmed" },
  { id: "b8", client: "Andra M.", service: "Consultation", stylist: "Cristina A.", date: "Today", time: "15:00 – 15:30", price: "Free", status: "confirmed" },
  { id: "b9", client: "Mihaela T.", service: "Balayage", stylist: "Mara I.", date: "Yesterday", time: "14:00 – 17:00", price: "920 lei", status: "declined" },
];

function normaliseBooking(b: BookingSummary): Booking {
  const start = new Date(b.start_at);
  const end = new Date(b.end_at);
  let status: Booking["status"] = "pending";
  if (b.status === "confirmed" || b.status === "completed") status = "confirmed";
  if (["cancelled_by_business", "cancelled_by_customer", "no_show"].includes(b.status)) status = "declined";
  return {
    id: b.id,
    client: (b as any).customer_name ?? "Client",
    service: b.service?.name ?? "Service",
    stylist: b.staff?.display_name ?? "Stylist",
    date: start.toDateString() === new Date().toDateString() ? "Today" : start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    time: `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    price: b.service?.price_cents
      ? `${Math.round(b.service.price_cents / 100)} ${b.service.currency ?? "RON"}`
      : "—",
    status,
    startAt: b.start_at,
  };
}

/* ─── Counter-proposal modal ─────────────────────────────────────── */
type CounterState = { bookingId: string; client: string; service: string; currentTime: string };

export default function InboxPage() {
  const [tab, setTab] = useState<TabId>("pending");
  const { businessId, loading: ctxLoading } = useStudio();
  const [apiBookings, setApiBookings] = useState<BookingSummary[]>([]);
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Counter-proposal modal state
  const [counter, setCounter] = useState<CounterState | null>(null);
  const [counterDate, setCounterDate] = useState("");
  const [counterTime, setCounterTime] = useState("");
  const [counterSaving, setCounterSaving] = useState(false);
  const [counterSent, setCounterSent] = useState<string | null>(null); // bookingId that got a counter

  // Bulk confirm
  const [bulkConfirming, setBulkConfirming] = useState(false);

  const isDemo = !businessId || businessId.startsWith("demo") || fetchError;

  useEffect(() => {
    if (ctxLoading || !businessId) return;
    setLoading(true); setFetchError(false);
    getBusinessBookings(businessId)
      .then((bookings) => { setApiBookings(bookings); setLocalBookings(bookings.map(normaliseBooking)); })
      .catch(() => { setFetchError(true); setLocalBookings(DEMO_BOOKINGS); })
      .finally(() => setLoading(false));
  }, [businessId, ctxLoading]);

  // Seed demo data when no API access
  useEffect(() => {
    if (!ctxLoading && (!businessId || businessId.startsWith("demo"))) {
      setLocalBookings(DEMO_BOOKINGS);
      setLoading(false);
    }
  }, [businessId, ctxLoading]);

  const pendingCount = localBookings.filter((b) => b.status === "pending").length;

  const TABS: { id: TabId; label: string }[] = [
    { id: "pending", label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
    { id: "today", label: "Confirmed today" },
    { id: "declined", label: "Declined" },
    { id: "all", label: "All" },
  ];

  const filtered = localBookings.filter((b) => {
    if (tab === "pending") return b.status === "pending";
    if (tab === "today") return b.status === "confirmed" && b.date === "Today";
    if (tab === "declined") return b.status === "declined";
    return true;
  });

  const handleStatus = useCallback(async (id: string, newStatus: string) => {
    // Optimistic update
    setLocalBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: (newStatus === "confirmed" ? "confirmed" : "declined") as Booking["status"] } : b));
    if (!isDemo) {
      try { await updateBookingStatus(id, newStatus); } catch { /* ignore */ }
    }
  }, [isDemo]);

  const handleBulkConfirm = useCallback(async () => {
    const pendingIds = filtered.filter((b) => b.status === "pending").map((b) => b.id);
    if (pendingIds.length === 0) return;
    setBulkConfirming(true);
    setLocalBookings((prev) =>
      prev.map((b) => pendingIds.includes(b.id) ? { ...b, status: "confirmed" as const } : b),
    );
    if (!isDemo) {
      await Promise.allSettled(pendingIds.map((id) => updateBookingStatus(id, "confirmed")));
    }
    setBulkConfirming(false);
    setTab("today");
  }, [filtered, isDemo]);

  const openCounter = (b: Booking) => {
    const today = new Date().toISOString().split("T")[0];
    const currentHour = String(new Date().getHours() + 1).padStart(2, "0");
    setCounter({ bookingId: b.id, client: b.client, service: b.service, currentTime: b.time });
    setCounterDate(today);
    setCounterTime(`${currentHour}:00`);
  };

  const submitCounter = async () => {
    if (!counter || !counterDate || !counterTime) return;
    setCounterSaving(true);
    const proposedStart = new Date(`${counterDate}T${counterTime}:00`).toISOString();
    if (!isDemo) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/v1/bookings/studio/${counter.bookingId}/counter`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(typeof window !== "undefined" && localStorage.getItem("glamr.auth.session")
                ? { Authorization: `Bearer ${JSON.parse(localStorage.getItem("glamr.auth.session")!).access_token}` }
                : {}),
            },
            body: JSON.stringify({ startAt: proposedStart }),
          },
        );
        if (!res.ok) throw new Error("Failed");
      } catch { /* ignore in demo */ }
    }
    setCounterSent(counter.bookingId);
    setCounter(null);
    setCounterSaving(false);
    // Update local status to reflect counter-proposed state
    setLocalBookings((prev) =>
      prev.map((b) => b.id === counter.bookingId ? { ...b, status: "pending" as const, note: `Counter proposed: ${counterDate} ${counterTime}` } : b),
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Bookings</h1>
        <div className="flex items-center gap-2">
          {tab === "pending" && pendingCount > 0 && (
            <button
              onClick={handleBulkConfirm}
              disabled={bulkConfirming}
              className="btn btn-ghost btn-sm"
            >
              <GlamrIcon name="check" size={13} />
              {bulkConfirming ? "Confirming…" : `Confirm all ${pendingCount}`}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Counter-sent confirmation banner */}
      {counterSent && (
        <div className="card px-4 py-3 flex items-center gap-3 bg-[oklch(0.96_0.04_145)] border border-[oklch(0.80_0.08_145)]">
          <GlamrIcon name="check" size={14} className="text-[oklch(0.45_0.10_145)]" />
          <p className="text-[13px] text-[oklch(0.35_0.08_145)]">
            Counter-proposal sent — the client will receive an email to accept or decline.
          </p>
          <button onClick={() => setCounterSent(null)} className="ml-auto text-[var(--ink-4)] hover:text-[var(--ink)]">✕</button>
        </div>
      )}

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
        ) : filtered.map((b) => (
          <div key={b.id} className="card p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[var(--paper-3)] flex items-center justify-center shrink-0">
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
            <div className="flex gap-1.5 shrink-0 ml-2 items-center">
              {b.status === "pending" && (
                <>
                  <button
                    onClick={() => handleStatus(b.id, "confirmed")}
                    className="btn btn-primary btn-sm py-1.5"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => openCounter(b)}
                    className="btn btn-ghost btn-sm py-1.5"
                  >
                    Counter
                  </button>
                  <button
                    onClick={() => handleStatus(b.id, "cancelled_by_business")}
                    className="btn btn-ghost btn-sm py-1.5 text-red-600 hover:bg-red-50"
                  >
                    Decline
                  </button>
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
        ))}
      </div>

      {/* ── Counter-proposal modal ──────────────────────────────── */}
      {counter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) setCounter(null); }}
        >
          <div className="card p-6 w-[400px] space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-display text-[var(--ink)]">Propose new time</h2>
                <p className="text-[13px] text-[var(--ink-3)] mt-0.5">
                  {counter.service} · {counter.client}
                </p>
              </div>
              <button
                onClick={() => setCounter(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-4)]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg bg-[var(--paper-2)] px-4 py-2.5 text-[12px] text-[var(--ink-3)]">
              Original: <span className="font-medium text-[var(--ink)]">{counter.currentTime}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-[12px] font-medium text-[var(--ink-3)]">New date</span>
                <input
                  type="date"
                  className="input w-full"
                  value={counterDate}
                  onChange={(e) => setCounterDate(e.target.value)}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[12px] font-medium text-[var(--ink-3)]">New time</span>
                <input
                  type="time"
                  className="input w-full"
                  value={counterTime}
                  onChange={(e) => setCounterTime(e.target.value)}
                  step="900"
                />
              </label>
            </div>

            <p className="text-[11px] text-[var(--ink-4)]">
              The client will receive an email with the proposed time and can accept or decline within 24 hours.
            </p>

            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setCounter(null)} className="btn btn-ghost btn-sm">Cancel</button>
              <button
                onClick={submitCounter}
                disabled={counterSaving || !counterDate || !counterTime}
                className="btn btn-primary btn-sm"
              >
                {counterSaving ? "Sending…" : "Send proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
