"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

type TeamMember = {
  id: string; name: string; role: string; level: string; rating: number;
  bookingsToday: number; utilisation: number; revenue: string; commission: string;
  status: "active" | "away" | "offline";
};

const DEMO_TEAM: TeamMember[] = [
  { id: "t1", name: "Ana Sala", role: "Owner · Senior stylist", level: "Senior", rating: 4.9, bookingsToday: 3, utilisation: 82, revenue: "48,200 lei", commission: "—", status: "active" },
  { id: "t2", name: "Mara Ionescu", role: "Colour specialist", level: "Senior", rating: 4.8, bookingsToday: 2, utilisation: 71, revenue: "32,600 lei", commission: "40%", status: "active" },
  { id: "t3", name: "Cristina Avram", role: "Junior stylist", level: "Junior", rating: 4.6, bookingsToday: 1, utilisation: 58, revenue: "12,400 lei", commission: "35%", status: "away" },
];

export default function TeamPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Team</h1>
        <button className="btn btn-primary btn-sm">
          <GlamrIcon name="plus" size={13} /> Invite member
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">Team size</p>
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">{DEMO_TEAM.length}</p>
        </div>
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">Avg utilisation</p>
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">
            {Math.round(DEMO_TEAM.reduce((a, t) => a + t.utilisation, 0) / DEMO_TEAM.length)}%
          </p>
        </div>
        <div className="card p-4">
          <p className="small-meta text-[var(--ink-4)] mb-1">Avg rating</p>
          <div className="flex items-center gap-2">
            <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">
              {(DEMO_TEAM.reduce((a, t) => a + t.rating, 0) / DEMO_TEAM.length).toFixed(1)}
            </p>
            <GlamrIcon name="star" size={16} className="text-[var(--amber)]" />
          </div>
        </div>
      </div>

      {/* Team table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--line-2)]">
              {["Member", "Level", "Today", "Rating", "Utilisation", "Revenue (30d)", "Commission", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 small-meta text-[var(--ink-4)] font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line-2)]">
            {DEMO_TEAM.map((m) => (
              <tr key={m.id} className="hover:bg-[var(--paper-2)] transition-colors cursor-pointer"
                onClick={() => setSelected(selected === m.id ? null : m.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[var(--paper-3)] placeholder flex items-center justify-center">
                        <span className="text-[12px] font-medium text-[var(--ink-3)]">{m.name.charAt(0)}</span>
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--card)] ${m.status === "active" ? "bg-green-500" : m.status === "away" ? "bg-[var(--amber)]" : "bg-[var(--ink-4)]"}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--ink)]">{m.name}</p>
                      <p className="text-[11px] text-[var(--ink-4)]">{m.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge text-[9px] ${m.level === "Senior" ? "badge-plum" : "badge-sage"}`}>{m.level}</span>
                </td>
                <td className="px-4 py-3 tabular-num text-[13px] text-[var(--ink)]">{m.bookingsToday}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <GlamrIcon name="star" size={11} className="text-[var(--amber)]" />
                    <span className="tabular-num text-[13px] text-[var(--ink)]">{m.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[var(--paper-3)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.utilisation}%`, background: m.utilisation >= 70 ? "var(--sage)" : "var(--amber)" }} />
                    </div>
                    <span className="tabular-num text-[12px] text-[var(--ink-3)]">{m.utilisation}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-num text-[13px] font-medium text-[var(--ink)]">{m.revenue}</td>
                <td className="px-4 py-3 tabular-num text-[13px] text-[var(--ink-3)]">{m.commission}</td>
                <td className="px-4 py-3">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-3)]">
                    <GlamrIcon name="settings" size={13} className="text-[var(--ink-4)]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
