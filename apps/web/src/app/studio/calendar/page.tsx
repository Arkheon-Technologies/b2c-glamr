"use client";

import { useState, useMemo, useEffect } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import { getBusinessBookings, listStaff, type BookingSummary, type StaffMember } from "@/lib/mvp-api";

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
type View = "day" | "week";

export default function CalendarPage() {
  const [view, setView] = useState<View>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { businessId, loading: ctxLoading } = useStudio();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [apiBookings, setApiBookings] = useState<BookingSummary[]>([]);
  const [fetchError, setFetchError] = useState(false);

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

  // Assign colors to each staff member
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

  // Events filtered to the current day
  const events = useMemo(() => {
    if (isDemo || apiBookings.length === 0) return generateDemoEvents();
    return apiBookings
      .filter((b) => new Date(b.start_at).toDateString() === currentDate.toDateString())
      .map(bookingToEvent);
  }, [apiBookings, currentDate, isDemo]);

  // Stats computed from today's live bookings
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
    return {
      count: today.length,
      revenue: "—",
      utilisation: `${util}%`,
      nextAvailable: "—",
    };
  }, [apiBookings, isDemo, activeStaff]);

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === "week" ? dir * 7 : dir));
    setCurrentDate(d);
  };

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    const dow = start.getDay();
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1)); // Monday-first
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[22px] font-display text-[var(--ink)]">Calendar</h1>
          <div className="flex items-center gap-1 bg-[var(--paper-2)] rounded-lg p-0.5">
            {(["day", "week"] as View[]).map((v) => (
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

          {/* Time grid */}
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
                {activeStaff.map((s) => (
                  <div key={s.id} className="border-r border-[var(--line-2)] last:border-r-0 relative" />
                ))}
              </div>
            ))}

            {/* Event blocks */}
            {events.map((ev) => {
              const staffIdx = activeStaff.findIndex((s) => s.id === ev.staffId);
              if (staffIdx < 0) return null;
              const staff = activeStaff[staffIdx];
              const top = (ev.startHour - 8) * 60 + ev.startMin;
              const colW = `calc((100% - 60px) / ${activeStaff.length})`;
              const left = `calc(60px + ${staffIdx} * ${colW} + 2px)`;
              const width = `calc(${colW} - 4px)`;
              return (
                <div
                  key={ev.id}
                  className="absolute rounded-md px-2 py-1.5 overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                  style={{
                    top: `${top}px`,
                    left,
                    width,
                    height: `${ev.durationMin}px`,
                    background:
                      ev.status === "blocked"
                        ? "var(--paper-3)"
                        : `color-mix(in oklch, ${staff.color} 15%, var(--card))`,
                    borderLeft: `3px solid ${ev.status === "blocked" ? "var(--ink-4)" : staff.color}`,
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
                      {String(
                        Math.floor((ev.startHour * 60 + ev.startMin + ev.durationMin) / 60),
                      ).padStart(2, "0")}
                      :{String((ev.startMin + ev.durationMin) % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>
              );
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
              {weekDates.map((_, i) => (
                <div key={i} className="border-r border-[var(--line-2)] last:border-r-0" />
              ))}
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
    </div>
  );
}
