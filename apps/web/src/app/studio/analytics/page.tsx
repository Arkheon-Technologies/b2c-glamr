"use client";

import { GlamrIcon } from "@/components/ui/GlamrIcon";

/* ─── KPI data ──────────────────────────────────────────────────────── */
const KPIS = [
  { label: "Revenue", value: "48,200 lei", change: "+18%", positive: true },
  { label: "Bookings", value: "186", change: "+12%", positive: true },
  { label: "New clients", value: "34", change: "+8%", positive: true },
  { label: "Retention", value: "72%", change: "-3%", positive: false },
];

/* ─── Revenue sparkline (30 days) ───────────────────────────────────── */
const REVENUE_DAYS = Array.from({ length: 30 }, (_, i) => {
  const base = 1200 + Math.sin(i * 0.5) * 400 + Math.random() * 300;
  return Math.round(base);
});
const maxRev = Math.max(...REVENUE_DAYS);
const minRev = Math.min(...REVENUE_DAYS);

/* ─── Peak hours heatmap data (7 days × 12 hours) ──────────────────── */
const DAYS_LABEL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS_LABEL = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
const HEATMAP = DAYS_LABEL.map(() => HOURS_LABEL.map(() => Math.floor(Math.random() * 100)));

/* ─── Top services ──────────────────────────────────────────────────── */
const TOP_SERVICES = [
  { name: "Balayage", bookings: 42, revenue: "38,640 lei" },
  { name: "Cut & style", bookings: 38, revenue: "6,840 lei" },
  { name: "Root touch-up", bookings: 24, revenue: "8,400 lei" },
  { name: "Blow-dry", bookings: 22, revenue: "1,760 lei" },
  { name: "Keratin treatment", bookings: 18, revenue: "11,700 lei" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Analytics</h1>
        <div className="flex items-center gap-2">
          <select className="input text-[12px] py-1.5 w-auto pr-8">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>This month</option>
            <option>Last month</option>
          </select>
          <button className="btn btn-ghost btn-sm">
            <GlamrIcon name="arrow" size={13} className="rotate-90" /> Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <p className="small-meta text-[var(--ink-4)] mb-1">{kpi.label}</p>
            <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">{kpi.value}</p>
            <p className={`text-[12px] tabular-num mt-0.5 ${kpi.positive ? "text-green-600" : "text-red-500"}`}>
              {kpi.change} vs prev 30d
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Revenue chart */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Revenue (30 days)</p>
          <div className="flex items-end gap-[2px] h-[140px]">
            {REVENUE_DAYS.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group relative">
                <div className="bg-[var(--plum)] rounded-sm transition-all group-hover:bg-[var(--ink)]"
                  style={{ height: `${15 + ((v - minRev) / (maxRev - minRev)) * 85}%`, minHeight: "2px" }} />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none tabular-num">
                  {v} lei
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours heatmap */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Peak hours</p>
          <div className="space-y-1">
            {/* Hour labels */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(${HOURS_LABEL.length}, 1fr)` }}>
              <span />
              {HOURS_LABEL.map((h) => (
                <span key={h} className="text-[9px] text-[var(--ink-4)] font-mono text-center">{h}</span>
              ))}
            </div>
            {DAYS_LABEL.map((day, di) => (
              <div key={day} className="grid gap-1" style={{ gridTemplateColumns: `40px repeat(${HOURS_LABEL.length}, 1fr)` }}>
                <span className="text-[10px] text-[var(--ink-4)] font-mono self-center">{day}</span>
                {HEATMAP[di].map((val, hi) => (
                  <div key={hi}
                    className="aspect-square rounded-sm"
                    style={{ background: `oklch(${0.95 - val * 0.004} ${val * 0.002} 340)` }}
                    title={`${val}% utilisation`} />
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
          <div className="space-y-3">
            {TOP_SERVICES.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="tabular-num text-[12px] text-[var(--ink-4)] w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-[var(--ink)]">{s.name}</span>
                    <span className="tabular-num text-[var(--ink-3)]">{s.bookings} bookings</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--paper-3)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--plum)] rounded-full"
                      style={{ width: `${(s.bookings / TOP_SERVICES[0].bookings) * 100}%` }} />
                  </div>
                </div>
                <span className="tabular-num text-[13px] font-medium text-[var(--ink)] min-w-[80px] text-right">{s.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client breakdown */}
        <div className="card p-5">
          <p className="small-meta text-[var(--ink-4)] mb-3">— Client base</p>
          <div className="flex items-center gap-6">
            {/* Donut chart (CSS) */}
            <div className="relative w-[120px] h-[120px] shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" stroke="var(--paper-3)" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" stroke="var(--plum)"
                  strokeDasharray="62 100" strokeDashoffset="0" className="transition-all" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" stroke="var(--sage)"
                  strokeDasharray="26 100" strokeDashoffset="-62" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" stroke="var(--ink-4)"
                  strokeDasharray="12 100" strokeDashoffset="-88" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="tabular-num text-[16px] font-medium text-[var(--ink)]">234</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Returning", pct: 62, color: "var(--plum)" },
                { label: "New (30d)", pct: 26, color: "var(--sage)" },
                { label: "Dormant", pct: 12, color: "var(--ink-4)" },
              ].map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                  <span className="text-[13px] text-[var(--ink)] flex-1">{seg.label}</span>
                  <span className="tabular-num text-[13px] text-[var(--ink-3)]">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
