"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

type Service = {
  id: string; name: string; category: string; price: number; duration: number;
  active: boolean; popular?: boolean;
};

const DEMO_SERVICES: Service[] = [
  { id: "1", name: "Balayage", category: "Colour", price: 920, duration: 180, active: true, popular: true },
  { id: "2", name: "Root touch-up", category: "Colour", price: 350, duration: 120, active: true },
  { id: "3", name: "Full highlights", category: "Colour", price: 480, duration: 150, active: true },
  { id: "4", name: "Colour correction", category: "Colour", price: 1200, duration: 240, active: true },
  { id: "5", name: "Cut & style", category: "Cut", price: 180, duration: 60, active: true, popular: true },
  { id: "6", name: "Cut & blow-dry", category: "Cut", price: 200, duration: 75, active: true },
  { id: "7", name: "Trim", category: "Cut", price: 80, duration: 30, active: true },
  { id: "8", name: "Kids cut", category: "Cut", price: 60, duration: 30, active: false },
  { id: "9", name: "Keratin treatment", category: "Treatment", price: 650, duration: 120, active: true },
  { id: "10", name: "Deep conditioning", category: "Treatment", price: 120, duration: 45, active: true },
  { id: "11", name: "Blow-dry", category: "Styling", price: 80, duration: 45, active: true },
  { id: "12", name: "Updo / bridal", category: "Styling", price: 350, duration: 90, active: true },
  { id: "13", name: "Consultation", category: "Other", price: 0, duration: 30, active: true },
];

const CATEGORIES = [...new Set(DEMO_SERVICES.map((s) => s.category))];

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = DEMO_SERVICES.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === "active" && !s.active) return false;
    if (activeFilter === "inactive" && s.active) return false;
    return true;
  });

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    services: filtered.filter((s) => s.category === cat),
  })).filter((g) => g.services.length > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Services & pricing</h1>
        <button className="btn btn-primary btn-sm">
          <GlamrIcon name="plus" size={13} /> Add service
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <GlamrIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]" />
          <input className="input pl-9 text-[13px]" placeholder="Search services…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 bg-[var(--paper-2)] rounded-lg p-0.5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-[12px] rounded-md transition-colors capitalize ${activeFilter === f ? "bg-[var(--card)] text-[var(--ink)] shadow-sm" : "text-[var(--ink-3)]"}`}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-[var(--ink-4)] tabular-num">{filtered.length} services</span>
      </div>

      {/* Service groups */}
      {grouped.map((g) => (
        <div key={g.category}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[14px] font-medium text-[var(--ink)]">{g.category}</h2>
            <span className="text-[11px] text-[var(--ink-4)]">{g.services.length}</span>
          </div>
          <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
            {g.services.map((svc) => (
              <div key={svc.id} className="flex items-center gap-4 p-4 hover:bg-[var(--paper-2)] transition-colors cursor-pointer group">
                {/* Toggle */}
                <button className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${svc.active ? "bg-[var(--sage)]" : "bg-[var(--paper-3)]"}`}>
                  <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${svc.active ? "translate-x-4" : "translate-x-0"}`} />
                </button>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[14px] ${svc.active ? "text-[var(--ink)]" : "text-[var(--ink-4)]"}`}>{svc.name}</span>
                    {svc.popular && <span className="badge badge-plum text-[8px]">Popular</span>}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1 text-[12px] text-[var(--ink-3)]">
                  <GlamrIcon name="clock" size={12} />
                  <span className="tabular-num">{svc.duration} min</span>
                </div>

                {/* Price */}
                <span className="tabular-num text-[14px] font-medium text-[var(--ink)] min-w-[80px] text-right">
                  {svc.price === 0 ? "Free" : `${svc.price} lei`}
                </span>

                {/* Edit */}
                <button className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--paper-3)] transition-all">
                  <GlamrIcon name="settings" size={13} className="text-[var(--ink-3)]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
