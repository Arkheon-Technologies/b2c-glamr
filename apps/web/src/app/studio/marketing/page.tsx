"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

type Campaign = {
  id: string; name: string; type: "promo" | "seasonal" | "re-engagement" | "launch";
  status: "active" | "scheduled" | "ended"; reach: string; conversions: number; revenue: string;
  startDate: string; endDate: string;
};

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Spring Balayage Special", type: "seasonal", status: "active", reach: "2,340", conversions: 42, revenue: "12,600 lei", startDate: "Apr 1", endDate: "Apr 30" },
  { id: "c2", name: "New Client 20% Off", type: "promo", status: "active", reach: "1,820", conversions: 28, revenue: "4,200 lei", startDate: "Mar 15", endDate: "May 15" },
  { id: "c3", name: "Re-book Reminder", type: "re-engagement", status: "active", reach: "340", conversions: 18, revenue: "3,240 lei", startDate: "Ongoing", endDate: "—" },
  { id: "c4", name: "Summer Hair Prep", type: "seasonal", status: "scheduled", reach: "—", conversions: 0, revenue: "—", startDate: "May 1", endDate: "May 31" },
  { id: "c5", name: "Valentine's Package", type: "seasonal", status: "ended", reach: "1,100", conversions: 34, revenue: "8,500 lei", startDate: "Feb 1", endDate: "Feb 14" },
];

const TYPE_BADGE: Record<Campaign["type"], string> = {
  promo: "badge-plum",
  seasonal: "badge-sage",
  "re-engagement": "badge-amber",
  launch: "badge-ink",
};

export default function MarketingPage() {
  const [tab, setTab] = useState<"all" | "active" | "scheduled" | "ended">("all");

  const filtered = DEMO_CAMPAIGNS.filter((c) => tab === "all" || c.status === tab);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Marketing</h1>
        <button className="btn btn-primary btn-sm">
          <GlamrIcon name="plus" size={13} /> New campaign
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active campaigns", value: "3" },
          { label: "Total reach", value: "4,500" },
          { label: "Conversions (30d)", value: "88" },
          { label: "Campaign revenue", value: "20,040 lei" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="small-meta text-[var(--ink-4)] mb-1">{s.label}</p>
            <p className="text-[20px] font-medium text-[var(--ink)] tabular-num">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="small-meta text-[var(--ink-4)] mb-2">— Quick launch</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "percent" as const, label: "Discount offer", desc: "Create a time-limited promotion" },
            { icon: "bell" as const, label: "Re-engagement", desc: "Reach dormant clients automatically" },
            { icon: "gift" as const, label: "Loyalty reward", desc: "Reward your best clients" },
          ].map((q) => (
            <button key={q.label} className="card p-4 text-left hover:shadow-sm transition-shadow group">
              <div className="w-9 h-9 rounded-lg bg-[var(--plum-soft)] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <GlamrIcon name={q.icon} size={16} className="text-[var(--plum)]" />
              </div>
              <p className="text-[13px] font-medium text-[var(--ink)]">{q.label}</p>
              <p className="text-[11px] text-[var(--ink-4)]">{q.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Campaign tabs */}
      <div className="tabs">
        {(["all", "active", "scheduled", "ended"] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaign table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--line-2)]">
              {["Campaign", "Type", "Status", "Reach", "Conversions", "Revenue", "Period"].map((h) => (
                <th key={h} className="text-left px-4 py-3 small-meta text-[var(--ink-4)] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line-2)]">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--paper-2)] transition-colors cursor-pointer">
                <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink)]">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={`badge text-[9px] ${TYPE_BADGE[c.type]}`}>{c.type.replace("-", " ")}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-[12px] ${c.status === "active" ? "text-green-600" : c.status === "scheduled" ? "text-[var(--amber)]" : "text-[var(--ink-4)]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-green-500" : c.status === "scheduled" ? "bg-[var(--amber)]" : "bg-[var(--ink-4)]"}`} />
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-num text-[13px] text-[var(--ink-2)]">{c.reach}</td>
                <td className="px-4 py-3 tabular-num text-[13px] text-[var(--ink)]">{c.conversions}</td>
                <td className="px-4 py-3 tabular-num text-[13px] font-medium text-[var(--ink)]">{c.revenue}</td>
                <td className="px-4 py-3 text-[12px] text-[var(--ink-3)]">{c.startDate} – {c.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
