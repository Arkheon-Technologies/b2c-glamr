"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import {
  getBusinessBookings,
  listStaff,
  rescheduleBooking,
  type BookingSummary,
  type StaffMember,
} from "@/lib/mvp-api";

/* ─── Demo fallback data ─────────────────────────────────────────────── */
const DEMO_STAFF_LIST: StaffMember[] = [
  { id: "s1", displayName: "Ana S.", role: "Senior Stylist", isActive: true },
  { id: "s2", displayName: "Mara I.", role: "Stylist", isActive: true },
  { id: "s3", displayName: "Cristina A.", role: "Colorist", isActive: true },
];

const STAFF_COLORS = [
  "oklch(0.65 0.18 340)",
  "oklch(0.60 0.14 260)",
  "oklch(0.60 0.12 145)",
  "oklch(0.65 0.15 60)",
  "oklch(0.60 0.13 200)",
];

type CalEvent = {
  id: string;
  staffId: string;
  service: string;
  client: string;
  startHour: number;
  startMin: number;
  durationMin: number;
  status: "confirmed" | "pending" | "blocked";
};

function generateDemoEvents(): CalEvent[] {
  return [
    { id: "e1", staffId: "s1", service: "Balayage", client: "Elena M.", startHour: 9, startMin: 0, durationMin: 180, status: "confirmed" },
    { id: "e2", staffId: "s1", service: "Cut & style", client: "Ioana P.", startHour: 14, startMin: 0, durationMin: 60, status: "confirmed" },
    { id: "e3", staffId: "s2", service: "Root touch-up", client: "Ana D.", startHour: 10, startMin: 0, durationMin: 120, status: "confirmed" },
    { id: "e4", staffId: "s2", service: "Blow-dry", client: "Maria L.", startHour: 13, startMin: 30, durationMin: 45, status: "pending" },
    { id: "e5", staffId: "s3", service: "Cut & blow-dry", client: "Sofia R.", startHour: 11, startMin: 0, durationMin: 90, status: "confirmed" },
    { id: "e6", staffId: "s3", service: "Consultation", client: "—", startHour: 15, startMin: 0, durationMin: 30, status: "blocked" },
    { id: "e7", staffId: "s1", service: "Keratin treatment", client: "Diana V.", startHour: 16, startMin: 0, durationMin: 120, status: "confirmed" },
  ];
}

function bookingToEvent(b: BookingSummary): CalEvent {
  const start = new Date(b.start_at);
  const end = new Date(b.end_at);
  const durationMin = Math.max(Math.round((end.getTime() - start.getTime()) / 60_000), 15);

  let status: CalEvent["status"] = "pending";
  if (b.status === "confirmed" || b.status === "completed") status = "confirmed";
  if (
    b.status === "cancelled_by_business" ||
    b.status === "cancelled_by_customer" ||
    b.status === "no_show"
  ) status = "blocked";

  return {
    id: b.id,
    staffId: b.staff?.id ?? "unknown",
    service: b.service?.name ?? "Service",
    client: (b as any).customer_name ?? "Client",
    startHour: start.getHours(),
    startMin: start.getMinutes(),
    durationMin,
    status,
  };
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 – 20:00
type View = "day" | "week" | "month" | "timeline";

/* ─── Pending reschedule shape ──────────────────────────────────────── */
type PendingReschedule = {
  eventId: string;
  service: string;
  client: string;
  newStaffId: string;
  newHour: number;
  newMin: number;
};

/* ─── Toast ─────────────────────────────────────────────────────────── */
type Toast = { kind: "ok" | "err"; message: string };

export default function CalendarPage() {
  const [view, setView] = useState<View>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { businessId, loading: ctxLoading } = useStudio();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [apiBookings, setApiBookings] = useState<BookingSummary[]>([]);
  const [fetchError, setFetchError] = useState(false);

  // Drag-drop state
  const [dragEventId, setDragEventId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null); // "staffId-hour"
  const [pending, setPending] = useState<PendingReschedule | null>(null);
  const [notifyClient, setNotifyClient] = useState(true);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (ctxLoading || !businessId) return;
    setFetchError(false);
    Promise.all([
      listStaff(businessId).catch(() => [] as StaffMember[]),
      getBusinessBookings(businessId).catch(() => {
        setFetchError(true);
        return [] as BookingSummary[];
      }),
    ]).then(([staff, bookings]) => {
      setStaffList(staff);
      setApiBookings(bookings);
    });
  }, [businessId, ctxLoading]);

  const isDemo =
    !businessId ||
    businessId.startsWith("demo") ||
    (staffList.length === 0 && apiBookings.length === 0 && fetchError);

  const activeStaff = useMemo(() => {
    const base = isDemo || staffList.length === 0 ? DEMO_STAFF_LIST : staffList;
    return base.map((s, i) => ({ ...s, color: STAFF_COLORS[i % STAFF_COLORS.length] }));
  }, [staffList, isDemo]);

  const dateStr = useMemo(
    () =>
      currentDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [currentDate],
  );

  const [localEvents, setLocalEvents] = useState<CalEvent[]>([]);
  const eventsFromApi = useMemo(() => {
    if (isDemo || apiBookings.length === 0) return generateDemoEvents();
    return apiBookings
      .filter((b) => new Date(b.start_at).toDateString() === currentDate.toDateString())
      .map(bookingToEvent);
  }, [apiBookings, currentDate, isDemo]);

  // Sync local events from API when source changes
  useEffect(() => {
    setLocalEvents(eventsFromApi);
  }, [eventsFromApi]);

  const todayStats = useMemo(() => {
    if (isDemo) {
      return { count: 7, revenue: "3,460 lei", utilisation: "74%", nextAvailable: "15:30" };
    }
    const today = apiBookings.filter(
      (b) =>
        new Date(b.start_at).toDateString() === new Date().toDateString() &&
        b.status !== "cancelled_by_business" &&
        b.status !== "cancelled_by_customer" &&
        b.status !== "no_show",
    );
    const totalMins = today.reduce((sum, b) => {
      return sum + Math.round((new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / 60_000);
    }, 0);
    const workdayMins = 12 * 60 * Math.max(activeStaff.length, 1);
    const util = Math.round((totalMins / workdayMins) * 100);
    return { count: today.length, revenue: "—", utilisation: `${util}%`, nextAvailable: "—" };
  }, [apiBookings, isDemo, activeStaff]);

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === "week" ? dir * 7 : view === "month" ? dir * 30 : dir));
    setCurrentDate(d);
  };

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    const dow = start.getDay();
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  /* ─── Drag handlers ──────────────────────────────────────────── */
  const handleDragStart = (e: React.DragEvent, ev: CalEvent) => {
    if (ev.status === "blocked") { e.preventDefault(); return; }
    setDragEventId(ev.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ev.id);
  };

  const handleDragEnd = () => {
    setDragEventId(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(key);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, staffId: string, hour: number, min = 0) => {
    e.preventDefault();
    setDropTarget(null);
    const evId = e.dataTransfer.getData("text/plain") || dragEventId;
    if (!evId) return;

    const ev = localEvents.find((x) => x.id === evId);
    if (!ev) return;

    // No-op if same slot
    if (ev.staffId === staffId && ev.startHour === hour && ev.startMin === min) return;

    setPending({
      eventId: ev.id,
      service: ev.service,
      client: ev.client,
      newStaffId: staffId,
      newHour: hour,
      newMin: min,
    });
    setNotifyClient(true);
    setReason("");
    setDragEventId(null);
  };

  /* ─── Confirm reschedule ─────────────────────────────────────── */
  const confirmReschedule = async () => {
    if (!pending) return;
    setSaving(true);

    // Optimistically update local state
    const prev = localEvents.map((e) => ({ ...e }));
    setLocalEvents((es) =>
      es.map((e) =>
        e.id === pending.eventId
          ? { ...e, staffId: pending.newStaffId, startHour: pending.newHour, startMin: pending.newMin }
          : e,
      ),
    );
    setPending(null);

    if (!isDemo) {
      try {
        const newStartAt = new Date(currentDate);
        newStartAt.setHours(pending.newHour, pending.newMin, 0, 0);
        await rescheduleBooking(pending.eventId, newStartAt.toISOString(), notifyClient, reason || undefined);
        showToast({ kind: "ok", message: "Booking rescheduled" });
      } catch (err: any) {
        // Snap back on conflict
        setLocalEvents(prev);
        const code = err?.body?.error?.code ?? "";
        showToast({
          kind: "err",
          message: code === "BOOKING_SLOT_UNAVAILABLE"
            ? "That slot is already taken — booking moved back."
            : "Couldn't reschedule. Please try again.",
        });
      }
    } else {
      showToast({ kind: "ok", message: "Demo: booking moved (not persisted)" });
    }

    setSaving(false);
  };

  const cancelReschedule = () => {
    setPending(null);
    setDragEventId(null);
  };

  /* ─── Render helpers ─────────────────────────────────────────── */
  const renderEventCard = (ev: CalEvent, staff: (typeof activeStaff)[number]) => {
    const isDragging = dragEventId === ev.id;
    return (
      <div
        key={ev.id}
        draggable={ev.status !== "blocked"}
        onDragStart={(e) => handleDragStart(e, ev)}
        onDragEnd={handleDragEnd}
        className={`absolute rounded-md px-2 py-1.5 overflow-hidden transition-all select-none ${
          ev.status !== "blocked" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        } ${isDragging ? "opacity-40 shadow-none" : "hover:shadow-md"}`}
        style={{
          top: `${(ev.startHour - 8) * 60 + ev.startMin}px`,
          left: `calc(60px + ${activeStaff.findIndex((s) => s.id === ev.staffId)} * ((100% - 60px) / ${activeStaff.length}) + 2px)`,
          width: `calc((100% - 60px) / ${activeStaff.length} - 4px)`,
          height: `${ev.durationMin}px`,
          background:
            ev.status === "blocked"
              ? "var(--paper-3)"
              : `color-mix(in oklch, ${staff.color} 15%, var(--card))`,
          borderLeft: `3px solid ${ev.status === "blocked" ? "var(--ink-4)" : staff.color}`,
          zIndex: isDragging ? 1 : 2,
        }}
      >
        <p className="text-[11px] font-medium text-[var(--ink)] truncate">{ev.service}</p>
        {ev.status !== "blocked" && (
          <p className="text-[10px] text-[var(--ink-3)] truncate">{ev.client}</p>
        )}
        {ev.status === "pending" && (
          <span className="badge badge-amber text-[7px] mt-0.5">Pending</span>
        )}
        {ev.durationMin >= 60 && (
          <p className="text-[9px] text-[var(--ink-4)] mt-0.5 font-mono">
            {String(ev.startHour).padStart(2, "0")}:{String(ev.startMin).padStart(2, "0")} –{" "}
            {String(Math.floor((ev.startHour * 60 + ev.startMin + ev.durationMin) / 60)).padStart(2, "0")}
            :{String((ev.startMin + ev.durationMin) % 60).padStart(2, "0")}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-display text-[var(--ink)]">Calendar</h1>
          <div className="flex items-center gap-1 bg-[var(--paper-2)] rounded-lg p-0.5">
            {(["day", "week", "month", "timeline"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[12px] rounded-md transition-colors ${view === v ? "bg-[var(--card)] text-[var(--ink)] shadow-sm" : "text-[var(--ink-3)]"}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date())} className="btn btn-ghost btn-sm">
            Today
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)]"
          >
            <GlamrIcon name="arrow" size={14} className="text-[var(--ink-3)] rotate-180" />
          </button>
          <span className="text-[14px] text-[var(--ink)] font-medium min-w-[200px] text-center">
            {dateStr}
          </span>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)]"
          >
            <GlamrIcon name="arrow" size={14} className="text-[var(--ink-3)]" />
          </button>
          <button className="btn btn-primary btn-sm ml-3">
            <GlamrIcon name="plus" size={13} /> New booking
          </button>
        </div>
      </div>

      {/* Staff filter pills */}
      <div className="flex gap-2">
        {activeStaff.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card)] rounded-full border border-[var(--line-2)]"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[12px] text-[var(--ink-2)]">{s.displayName}</span>
          </div>
        ))}
      </div>

      {/* Day view */}
      {view === "day" && (
        <div className="card overflow-hidden">
          {/* Staff column headers */}
          <div
            className="grid border-b border-[var(--line-2)]"
            style={{ gridTemplateColumns: `60px repeat(${activeStaff.length}, 1fr)` }}
          >
            <div className="p-3 border-r border-[var(--line-2)]" />
            {activeStaff.map((s) => (
              <div key={s.id} className="p-3 text-center border-r border-[var(--line-2)] last:border-r-0">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[13px] font-medium text-[var(--ink)]">{s.displayName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Time grid with drop zones */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-[var(--line-2)] last:border-b-0"
                style={{ gridTemplateColumns: `60px repeat(${activeStaff.length}, 1fr)`, height: "60px" }}
              >
                <div className="p-2 border-r border-[var(--line-2)] flex items-start">
                  <span className="tabular-num text-[11px] text-[var(--ink-4)] font-mono">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
                {activeStaff.map((s) => {
                  const key = `${s.id}-${hour}`;
                  const isTarget = dropTarget === key;
                  return (
                    <div
                      key={s.id}
                      className={`border-r border-[var(--line-2)] last:border-r-0 relative transition-colors ${
                        isTarget ? "bg-[color-mix(in_oklch,var(--plum)_8%,transparent)]" : ""
                      }`}
                      onDragOver={(e) => handleDragOver(e, key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, s.id, hour, 0)}
                    >
                      {isTarget && dragEventId && (
                        <div
                          className="absolute inset-x-0.5 top-0.5 rounded border-2 border-dashed border-[var(--plum)] pointer-events-none"
                          style={{ height: "56px" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Event blocks */}
            {localEvents.map((ev) => {
              const staffIdx = activeStaff.findIndex((s) => s.id === ev.staffId);
              if (staffIdx < 0) return null;
              const staff = activeStaff[staffIdx];
              return renderEventCard(ev, staff);
            })}

            {/* Current time indicator */}
            {(() => {
              const now = new Date();
              const mins = (now.getHours() - 8) * 60 + now.getMinutes();
              if (mins < 0 || mins > 12 * 60) return null;
              return (
                <div
                  className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                  style={{ top: `${mins}px` }}
                >
                  <div className="w-[60px] flex justify-end pr-1">
                    <span className="text-[9px] font-mono text-[var(--plum)] tabular-num">
                      {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 h-[2px] bg-[var(--plum)] relative">
                    <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-[var(--plum)]" />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === "week" && (
        <div className="card overflow-hidden">
          <div
            className="grid border-b border-[var(--line-2)]"
            style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}
          >
            <div className="p-3 border-r border-[var(--line-2)]" />
            {weekDates.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={`p-3 text-center border-r border-[var(--line-2)] last:border-r-0 ${isToday ? "bg-[var(--plum-soft)]" : ""}`}
                >
                  <span className="text-[10px] text-[var(--ink-4)] font-mono uppercase">
                    {d.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span
                    className={`block text-[16px] mt-0.5 ${isToday ? "text-[var(--plum)] font-medium" : "text-[var(--ink)]"}`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid border-b border-[var(--line-2)] last:border-b-0"
              style={{ gridTemplateColumns: `60px repeat(7, 1fr)`, height: "48px" }}
            >
              <div className="p-1.5 border-r border-[var(--line-2)] flex items-start">
                <span className="tabular-num text-[10px] text-[var(--ink-4)] font-mono">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
              {weekDates.map((d, i) => {
                const key = `week-${i}-${hour}`;
                const isTarget = dropTarget === key;
                return (
                  <div
                    key={i}
                    className={`border-r border-[var(--line-2)] last:border-r-0 relative transition-colors ${
                      isTarget ? "bg-[color-mix(in_oklch,var(--plum)_8%,transparent)]" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      // In week view we move to the corresponding day + hour using first staff member
                      e.preventDefault();
                      setDropTarget(null);
                      const evId = e.dataTransfer.getData("text/plain") || dragEventId;
                      if (!evId || activeStaff.length === 0) return;
                      const ev = localEvents.find((x) => x.id === evId);
                      if (!ev) return;
                      setPending({
                        eventId: ev.id,
                        service: ev.service,
                        client: ev.client,
                        newStaffId: ev.staffId,
                        newHour: hour,
                        newMin: 0,
                      });
                      setNotifyClient(true);
                      setReason("");
                      setDragEventId(null);
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Bookings today", value: String(todayStats.count), trend: isDemo ? "+2 from yesterday" : "Live from API" },
          { label: "Revenue today", value: todayStats.revenue, trend: isDemo ? "+18% vs avg" : "Confirmed bookings" },
          { label: "Utilisation", value: todayStats.utilisation, trend: "Target: 80%" },
          { label: "Next available", value: todayStats.nextAvailable, trend: isDemo ? "Ana S." : "Across all staff" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="small-meta text-[var(--ink-4)] mb-1">{s.label}</p>
            <p className="text-[20px] font-medium text-[var(--ink)] tabular-num">{s.value}</p>
            <p className="text-[11px] text-[var(--ink-4)] mt-0.5">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Month view */}
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          events={localEvents}
          staffColors={Object.fromEntries(activeStaff.map((s) => [s.id, s.color]))}
          onDayClick={(date) => { setCurrentDate(date); setView("day"); }}
        />
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <TimelineView events={localEvents} staff={activeStaff} />
      )}

      {/* Reschedule confirmation modal */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) cancelReschedule(); }}
        >
          <div className="card p-6 w-[420px] shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-display text-[var(--ink)]">Move booking</h2>
                <p className="text-[13px] text-[var(--ink-3)] mt-0.5">
                  {pending.service} · {pending.client}
                </p>
              </div>
              <button
                onClick={cancelReschedule}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-4)]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg bg-[var(--paper-2)] px-4 py-3 text-[13px] text-[var(--ink-2)]">
              New time:{" "}
              <span className="font-medium text-[var(--ink)]">
                {String(pending.newHour).padStart(2, "0")}:{String(pending.newMin).padStart(2, "0")}
              </span>
              {" "}on{" "}
              <span className="font-medium text-[var(--ink)]">
                {currentDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyClient}
                onChange={(e) => setNotifyClient(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--plum)]"
              />
              <span className="text-[13px] text-[var(--ink-2)]">Notify client by email</span>
            </label>

            {notifyClient && (
              <textarea
                rows={3}
                placeholder="Add a message to the client (optional)…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:outline-none focus:ring-1 focus:ring-[var(--plum)] resize-none"
              />
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button onClick={cancelReschedule} className="btn btn-ghost btn-sm">
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={saving}
                className="btn btn-primary btn-sm"
              >
                {saving ? "Saving…" : "Move booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium transition-all ${
            toast.kind === "ok"
              ? "bg-[oklch(0.30_0.06_145)] text-[oklch(0.90_0.06_145)]"
              : "bg-[oklch(0.30_0.08_30)] text-[oklch(0.90_0.08_30)]"
          }`}
        >
          <span>{toast.kind === "ok" ? "✓" : "⚠"}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ─── Month view ──────────────────────────────────────────────────── */

function MonthView({
  currentDate,
  events,
  staffColors,
  onDayClick,
}: {
  currentDate: Date;
  events: CalEvent[];
  staffColors: Record<string, string>;
  onDayClick: (d: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDow = (firstDay.getDay() + 6) % 7;
  const cells: Array<Date | null> = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[var(--line)]">
        {DOW.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-mono uppercase tracking-wider text-[var(--ink-4)]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          const dayEvents = date
            ? events.filter((e) => {
                const today = new Date();
                return date.toDateString() === today.toDateString();
              })
            : [];
          const isToday = date ? date.toDateString() === new Date().toDateString() : false;
          return (
            <div
              key={i}
              className={`min-h-[80px] p-2 border-b border-r border-[var(--line)] ${date ? "cursor-pointer hover:bg-[var(--paper-2)] transition-colors" : "bg-[var(--paper-3)]"}`}
              onClick={() => date && onDayClick(date)}
            >
              {date && (
                <>
                  <p className={`text-[12px] font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-[var(--plum)] text-white" : "text-[var(--ink-3)]"}`}>
                    {date.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="w-2 h-2 rounded-full inline-block mr-0.5"
                        style={{ background: staffColors[e.staffId] ?? "var(--plum)" }}
                        title={e.service}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-[var(--ink-4)]">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Timeline (Gantt) view ───────────────────────────────────────── */

function TimelineView({
  events,
  staff,
}: {
  events: CalEvent[];
  staff: Array<{ id: string; displayName: string; color: string }>;
}) {
  const START_HOUR = 8;
  const END_HOUR = 21;
  const TOTAL_MINS = (END_HOUR - START_HOUR) * 60;

  const pct = (hour: number, min: number) =>
    (((hour - START_HOUR) * 60 + min) / TOTAL_MINS) * 100;

  return (
    <div className="card overflow-hidden">
      {/* Hour ruler */}
      <div className="relative h-6 border-b border-[var(--line)] ml-32">
        {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
          <span
            key={i}
            className="absolute top-1 text-[10px] font-mono text-[var(--ink-4)] -translate-x-1/2"
            style={{ left: `${(i / (END_HOUR - START_HOUR)) * 100}%` }}
          >
            {String(START_HOUR + i).padStart(2, "0")}:00
          </span>
        ))}
      </div>

      {/* Staff rows */}
      {staff.map((member) => {
        const memberEvents = events.filter((e) => e.staffId === member.id);
        return (
          <div key={member.id} className="flex border-b border-[var(--line)] h-14 items-center">
            <div className="w-32 shrink-0 px-3 text-[12px] font-medium text-[var(--ink-2)] truncate border-r border-[var(--line)]">
              {member.displayName}
            </div>
            <div className="flex-1 relative h-full bg-[var(--paper-2)]">
              {memberEvents.map((e) => {
                const leftPct = pct(e.startHour, e.startMin);
                const widthPct = (e.durationMin / TOTAL_MINS) * 100;
                return (
                  <div
                    key={e.id}
                    className="absolute top-1.5 bottom-1.5 rounded-md flex items-center px-2 overflow-hidden"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      background: member.color,
                      opacity: e.status === "blocked" ? 0.4 : 0.85,
                    }}
                    title={`${e.service} — ${e.client}`}
                  >
                    <span className="text-white text-[10px] truncate">{e.service}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
