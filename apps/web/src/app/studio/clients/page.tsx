"use client";

import { useState, useEffect } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import { getBusinessClients, type ClientSummary } from "@/lib/mvp-api";

type Client = {
  id: string;
  name: string;
  visits: number;
  lastVisit: string;
  lifetime: string;
  tags: string[];
  preferred: string;
  email: string;
  phone: string;
};

const DEMO_CLIENTS: Client[] = [
  { id: "c1", name: "Elena M.", visits: 12, lastVisit: "Apr 10", lifetime: "4,820 lei", tags: ["VIP", "Loyal"], preferred: "Ana S.", email: "elena@mail.com", phone: "+40 7XX XXX 001" },
  { id: "c2", name: "Sofia R.", visits: 8, lastVisit: "Apr 5", lifetime: "2,340 lei", tags: ["Loyal"], preferred: "Cristina A.", email: "sofia@mail.com", phone: "+40 7XX XXX 002" },
  { id: "c3", name: "Diana V.", visits: 3, lastVisit: "Mar 22", lifetime: "1,950 lei", tags: ["High spender"], preferred: "Ana S.", email: "diana@mail.com", phone: "+40 7XX XXX 003" },
  { id: "c4", name: "Ioana P.", visits: 18, lastVisit: "Apr 12", lifetime: "6,120 lei", tags: ["VIP", "Loyal", "High spender"], preferred: "Ana S.", email: "ioana@mail.com", phone: "+40 7XX XXX 004" },
  { id: "c5", name: "Ana D.", visits: 5, lastVisit: "Apr 8", lifetime: "1,400 lei", tags: [], preferred: "Mara I.", email: "ana.d@mail.com", phone: "+40 7XX XXX 005" },
  { id: "c6", name: "Maria L.", visits: 2, lastVisit: "Mar 15", lifetime: "260 lei", tags: ["New"], preferred: "Mara I.", email: "maria@mail.com", phone: "+40 7XX XXX 006" },
  { id: "c7", name: "Laura S.", visits: 1, lastVisit: "Jan 20", lifetime: "480 lei", tags: ["Dormant"], preferred: "Ana S.", email: "laura@mail.com", phone: "+40 7XX XXX 007" },
];

const FILTERS = ["All", "VIP", "New", "Dormant", "Loyal", "High spender"];

function formatLifetime(cents: number): string {
  return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 0 }).format(Math.round(cents / 100)) + " lei";
}

function formatLastVisit(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function deriveClientTags(c: ClientSummary): string[] {
  const tags: string[] = [];
  const daysSince = Math.floor((Date.now() - new Date(c.last_visit).getTime()) / 86_400_000);
  if (c.visits >= 10) tags.push("VIP");
  if (c.lifetime_cents >= 300_000) tags.push("High spender");
  if (c.visits >= 5 && !tags.includes("VIP")) tags.push("Loyal");
  if (c.visits === 1) tags.push("New");
  if (daysSince > 60 && c.visits > 1) tags.push("Dormant");
  return tags;
}

function apiClientToDisplay(c: ClientSummary): Client {
  return {
    id: c.id,
    name: c.name,
    visits: c.visits,
    lastVisit: formatLastVisit(c.last_visit),
    lifetime: formatLifetime(c.lifetime_cents),
    tags: deriveClientTags(c),
    preferred: "—",
    email: c.email ?? "—",
    phone: c.phone ?? "—",
  };
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [drawer, setDrawer] = useState<string | null>(null);
  const { businessId, loading: ctxLoading } = useStudio();
  const [apiClients, setApiClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (ctxLoading || !businessId) return;
    setLoading(true);
    setFetchError(false);
    getBusinessClients(businessId)
      .then((clients) => setApiClients(clients.map(apiClientToDisplay)))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [businessId, ctxLoading]);

  const displayClients =
    apiClients.length === 0 && (fetchError || !businessId || businessId.startsWith("demo"))
      ? DEMO_CLIENTS
      : apiClients;

  const filtered = displayClients.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "All" && !c.tags.includes(filter)) return false;
    return true;
  });

  const drawerClient = drawer ? displayClients.find((c) => c.id === drawer) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Clients</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm">
            <GlamrIcon name="arrow" size={13} className="rotate-90" /> Export CSV
          </button>
          <button className="btn btn-primary btn-sm">
            <GlamrIcon name="plus" size={13} /> Add client
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <GlamrIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]" />
          <input
            className="input pl-9 text-[13px]"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip text-[11px] ${filter === f ? "on" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-[var(--ink-4)] tabular-num ml-auto">
          {filtered.length} clients
        </span>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--ink-3)] text-[14px] animate-pulse">Loading clients…</p>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Table */}
          <div className={`card overflow-hidden flex-1 transition-all ${drawer ? "max-w-[calc(100%-340px)]" : ""}`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line-2)]">
                  {["Client", "Visits", "Last visit", "Lifetime", "Tags", "Preferred pro"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 small-meta text-[var(--ink-4)] font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line-2)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[var(--ink-4)]">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.id}
                      className={`cursor-pointer transition-colors ${drawer === c.id ? "bg-[var(--plum-soft)]" : "hover:bg-[var(--paper-2)]"}`}
                      onClick={() => setDrawer(drawer === c.id ? null : c.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--paper-3)] placeholder flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-medium text-[var(--ink-3)]">
                              {c.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-[13px] font-medium text-[var(--ink)]">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-num text-[13px] text-[var(--ink)]">{c.visits}</td>
                      <td className="px-4 py-3 text-[13px] text-[var(--ink-3)]">{c.lastVisit}</td>
                      <td className="px-4 py-3 tabular-num text-[13px] font-medium text-[var(--ink)]">
                        {c.lifetime}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {c.tags.map((t) => (
                            <span
                              key={t}
                              className={`badge text-[8px] ${t === "VIP" ? "badge-plum" : t === "Dormant" ? "badge-ink" : "badge-sage"}`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[var(--ink-3)]">{c.preferred}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detail drawer */}
          {drawerClient && (
            <div className="w-[320px] card p-5 shrink-0 space-y-4 sticky top-0 h-fit">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-[var(--ink)]">{drawerClient.name}</h3>
                <button
                  onClick={() => setDrawer(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)]"
                >
                  <GlamrIcon name="x" size={14} className="text-[var(--ink-3)]" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--paper-2)] rounded-lg">
                  <p className="text-[10px] text-[var(--ink-4)] font-mono uppercase">Visits</p>
                  <p className="text-[18px] font-medium text-[var(--ink)] tabular-num">{drawerClient.visits}</p>
                </div>
                <div className="p-3 bg-[var(--paper-2)] rounded-lg">
                  <p className="text-[10px] text-[var(--ink-4)] font-mono uppercase">Lifetime</p>
                  <p className="text-[18px] font-medium text-[var(--ink)] tabular-num">{drawerClient.lifetime}</p>
                </div>
              </div>
              <hr className="divider" />
              <div className="space-y-2 text-[13px]">
                <div className="flex items-center gap-2 text-[var(--ink-3)]">
                  <GlamrIcon name="message" size={13} /> {drawerClient.email}
                </div>
                <div className="flex items-center gap-2 text-[var(--ink-3)]">
                  <GlamrIcon name="bell" size={13} /> {drawerClient.phone}
                </div>
              </div>
              <hr className="divider" />
              <div>
                <p className="small-meta text-[var(--ink-4)] mb-2">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {drawerClient.tags.map((t) => (
                    <span key={t} className="chip text-[11px]">{t}</span>
                  ))}
                  <button className="chip text-[11px]">
                    <GlamrIcon name="plus" size={10} /> Add
                  </button>
                </div>
              </div>
              <hr className="divider" />
              <div>
                <p className="small-meta text-[var(--ink-4)] mb-2">Private notes</p>
                <textarea
                  className="input min-h-[60px] resize-none text-[12px]"
                  placeholder="Add a note about this client…"
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1">Book for client</button>
                <button className="btn btn-ghost btn-sm flex-1">Send message</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
