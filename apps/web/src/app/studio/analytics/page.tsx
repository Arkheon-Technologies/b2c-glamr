"use client";

import { useState, useEffect } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import {
  getAnalyticsSummary,
  getAnalyticsRevenueSeries,
  getAnalyticsTopServices,
  getAnalyticsPeakHours,
  type AnalyticsPeriod,
  type AnalyticsSummary,
} from "@/lib/mvp-api";

/* ─── Demo data ──────────────────────────────────────────────────── */
const DEMO_SUMMARY: AnalyticsSummary = {
  revenue_cents: 4820000,
  revenue_change_pct: 18,
  bookings: 186,
  bookings_change_pct: 12,
  new_clients: 34,
  retention_pct: 72,
  unique_clients: 142,
  period: { from: new Date(Date.now() - 30 * 86_400_000).toISOString(), to: new Date().toISOString() },
};

const DEMO_SERIES = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86_400_000).toISOString().split("T")[0],
  value: Math.round(120000 + Math.sin(i * 0.5) * 40000 + Math.random() * 30000),
}));

const DEMO_TOP_SERVICES = [
  { name: "Balayage", bookings: 42, revenue_cents: 3864000 },
  { name: "Cut & style", bookings: 38, revenue_cents: 684000 },
  { name: "Root touch-up", bookings: 24, revenue_cents: 840000 },
  { name: "Blow-dry", bookings: 22, revenue_cents: 176000 },
  { name: "Keratin treatment", bookings: 18, revenue_cents: 1170000 },
];

const DEMO_HEATMAP = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  hours: ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
  heatmap: [
    [5, 20, 45, 60, 40, 35, 50, 55, 60, 40, 30, 10],
    [10, 25, 50, 70, 55, 45, 60, 65, 50, 35, 20, 5],
    [5, 20, 40, 55, 45, 40, 55, 60, 55, 45, 25, 10],
    [10, 30, 60, 75, 65, 55, 70, 80, 65, 50, 30, 15],
    [20, 40, 70, 85, 75, 65, 80, 90, 75, 60, 40, 20],
    [30, 60, 90, 100, 95, 90, 95, 100, 90, 75, 55, 35],
    [15, 30, 45, 50, 45, 35, 40, 45, 35, 25, 15, 5],
  ],
};

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtLei(cents: number) {
  if (cents >= 100000) return `${(cents / 100000).toFixed(1)}k lei`;
  return `${Math.round(cents / 100)} lei`;
}

function changeBadge(pct: number | null, positive?: boolean) {
  if (pct === null) return null;
  const isUp = pct >= 0;
  const color = positive !== undefined ? (positive ? "text-green-600" : "text-red-500") : (isUp ? "text-green-600" : "text-red-500");
  return <span className={`text-[12px] tabular-num ${color}`}>{isUp ? "+" : ""}{pct}% vs prev</span>;
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "month": "This month",
  "last_month": "Last month",
};

export default function AnalyticsPage() {
  const { businessId } = useStudio();
  const isDemo = !businessId || businessId.startsWith("demo");

  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [summary, setSummary] = useState<AnalyticsSummary>(DEMO_SUMMARY);
  const [series, setSeries] = useState(DEMO_SERIES);
  const [topServices, setTopServices] = useState(DEMO_TOP_SERVICES);
  const [heatmap, setHeatmap] = useState(DEMO_HEATMAP);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    setLoading(true);
    Promise.allSettled([
      getAnalyticsSummary(businessId!, period),
      getAnalyticsRevenueSeries(businessId!, period),
      getAnalyticsTopServices(businessId!, period),
      getAnalyticsPeakHours(businessId!, period),
    ]).then(([sumRes, serRes, svcRes, heatRes]) => {
      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (serRes.status === "fulfilled") setSeries(serRes.value);
      if (svcRes.status === "fulfilled") setTopServices(svcRes.value);
      if (heatRes.status === "fulfilled") setHeatmap(heatRes.value);
    }).finally(() => setLoading(false));
  }, [businessId, isDemo, period]);

  const maxRev = Math.max(...series.map((s) => s.value), 1);
  const minRev = Math.min(...series.map((s) => s.value), 0);
  const maxBookings = Math.max(...topServices.map((s) => s.bookings), 1);

  // Client base segments (derived from summary)
  const returningPct = summary.retention_pct;
  const newPct = summary.unique_clients > 0
    ? Math.round((summary.new_clients / summary.unique_clients) * 100)
    : 0;
  const dormantPct = Math.max(0, 100 - returningPct - newPct);

  // Donut SVG segments
  const donutCircumference = 2 * Math.PI * 14; // r=14
  const segments = [
    { label: "Returning", pct: returningPct, color: "var(--plum)", offset: 0 },
    { label: "New", pct: newPct, color: "var(--sage)", offset: returningPct },
    { label: "Dormant", pct: dormantPct, color: "var(--ink-4)", offset: returningPct + newPct },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-display text-[var(--ink)]">Analytics</h1>
          {isDemo && <span className="badge badge-amber text-[8px]">Demo data</span>}
          {loading && <span className="text-[11px] text-[var(--ink-4)] animate-pulse">Updating…</span>}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input text-[12px] py-1.5 w-auto pr-8"
            value={period}
            onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
          >
            {(Object.entries(PERIOD_LABELS) as [AnalyticsPeriod, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button className="btn btn-ghost btn-sm">
            <GlamrIcon name="arrow" size={13} className="rotate-90" /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">Revenue</p>
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">{fmtLei(summary.revenue_cents)}</p>
          {changeBadge(summary.revenue_change_pct, true)}
        </div>
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">Bookings</p>
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">{summary.bookings}</p>
          {changeBadge(summary.bookings_change_pct, true)}
        </div>
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">New clients</p>
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">{summary.new_clients}</p>
          <span className="text-[12px] text-[var(--ink-4)]">of {summary.unique_clients} total</span>
        </div>
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">Retention</p>
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">{summary.retention_pct}%</p>
          <span className="text-[12px] text-[var(--ink-4)]">returning clients</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Revenue ({PERIOD_LABELS[period].toLowerCase()})</p>
          <div className="flex items-end gap-[2px] h-[140px]">
            {series.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group relative">
                <div
                  className="bg-[var(--plum)] rounded-sm transition-all group-hover:bg-[var(--ink)]"
                  style={{
                    height: `${maxRev === minRev ? 50 : 15 + ((day.value - minRev) / (maxRev - minRev)) * 85}%`,
                    minHeight: "2px",
                  }}
                />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none tabular-num z-10">
                  {fmtLei(day.value)}
                  <br />
                  <span className="text-[8px] opacity-70">{day.date.slice(5)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours heatmap */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Peak hours</p>
          <div className="space-y-1">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `32px repeat(${heatmap.hours.length}, 1fr)` }}>
              <span />
              {heatmap.hours.map((h) => (
                <span key={h} className="text-[8px] text-[var(--ink-4)] font-mono text-center">{h}</span>
              ))}
            </div>
            {heatmap.days.map((day, di) => (
              <div key={day} className="grid gap-0.5" style={{ gridTemplateColumns: `32px repeat(${heatmap.hours.length}, 1fr)` }}>
                <span className="text-[9px] text-[var(--ink-4)] font-mono self-center">{day}</span>
                {(heatmap.heatmap[di] ?? []).map((val, hi) => (
                  <div
                    key={hi}
                    className="aspect-square rounded-[2px]"
                    style={{ background: val === 0 ? "var(--paper-3)" : `oklch(${0.90 - val * 0.003} ${0.04 + val * 0.002} 340)` }}
                    title={`${val}% busy`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Top services */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Top services</p>
          {topServices.length === 0 ? (
            <p className="text-[13px] text-[var(--ink-4)] py-4 text-center">No bookings in this period</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="tabular-num text-[12px] text-[var(--ink-4)] w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-[13px] mb-1">
                      <span className="text-[var(--ink)]">{s.name}</span>
                      <span className="tabular-num text-[var(--ink-3)]">{s.bookings} bookings</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--paper-3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--plum)] rounded-full transition-all"
                        style={{ width: `${(s.bookings / maxBookings) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="tabular-num text-[13px] font-medium text-[var(--ink)] min-w-[80px] text-right">
                    {fmtLei(s.revenue_cents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client breakdown */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Client base</p>
          <div className="flex items-center gap-6">
            {/* Donut chart */}
            <div className="relative w-[120px] h-[120px] shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" stroke="var(--paper-3)" />
                {segments.map((seg) => {
                  const dash = (seg.pct / 100) * donutCircumference;
                  const dashOffset = -(seg.offset / 100) * donutCircumference;
                  return (
                    <circle
                      key={seg.label}
                      cx="18" cy="18" r="14"
                      fill="none"
                      strokeWidth="4"
                      stroke={seg.color}
                      strokeDasharray={`${dash} ${donutCircumference}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="tabular-num text-[16px] font-medium text-[var(--ink)]">{summary.unique_clients}</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {segments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                  <span className="text-[13px] text-[var(--ink)] flex-1">{seg.label}</span>
                  <span className="tabular-num text-[13px] text-[var(--ink-3)]">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-[var(--ink-4)] mt-4">
            Total unique clients in period: <span className="font-medium text-[var(--ink)]">{summary.unique_clients}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
