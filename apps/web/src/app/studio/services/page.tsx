"use client";

import { useState, useEffect, useCallback } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import {
  fetchServices,
  createService,
  updateService,
  listAddons,
  createAddon,
  updateAddon,
  deleteAddon,
  listPackages,
  createPackage,
  updatePackage,
  listDiscountRules,
  createDiscountRule,
  updateDiscountRule,
  listStaff,
  type ServiceAddon,
  type ServicePackage,
  type DiscountRule,
} from "@/lib/mvp-api";

/* ─── Types ──────────────────────────────────────────────────────── */
type ApiService = {
  id: string; name: string; price_cents?: number | null; duration_active_min: number;
  description?: string | null; price_type: string; currency: string; isActive?: boolean;
  is_active?: boolean; popular?: boolean; category?: string;
};

type Tab = "services" | "addons" | "packages" | "pricing";

/* ─── Demo fallback ──────────────────────────────────────────────── */
const DEMO_SERVICES: ApiService[] = [
  { id: "1", name: "Balayage", price_cents: 92000, duration_active_min: 180, price_type: "fixed", currency: "RON", is_active: true, category: "Colour" },
  { id: "2", name: "Root touch-up", price_cents: 35000, duration_active_min: 120, price_type: "fixed", currency: "RON", is_active: true, category: "Colour" },
  { id: "3", name: "Cut & style", price_cents: 18000, duration_active_min: 60, price_type: "fixed", currency: "RON", is_active: true, category: "Cut" },
  { id: "4", name: "Blow-dry", price_cents: 8000, duration_active_min: 45, price_type: "fixed", currency: "RON", is_active: true, category: "Styling" },
  { id: "5", name: "Keratin treatment", price_cents: 65000, duration_active_min: 120, price_type: "fixed", currency: "RON", is_active: false, category: "Treatment" },
];

const DEMO_ADDONS: ServiceAddon[] = [
  { id: "a1", serviceId: "1", name: "Toning gloss", priceCents: 8000, durationMin: 20, isActive: true, displayOrder: 0 },
  { id: "a2", serviceId: "1", name: "Olaplex treatment", priceCents: 12000, durationMin: 15, isActive: true, displayOrder: 1 },
  { id: "a3", serviceId: "3", name: "Scalp massage", priceCents: 5000, durationMin: 10, isActive: true, displayOrder: 0 },
];

const DEMO_PACKAGES: ServicePackage[] = [
  { id: "p1", businessId: "demo", serviceId: "1", name: "Balayage × 3", sessionCount: 3, priceCents: 240000, currency: "RON", validityDays: 180, shareable: false, isActive: true, createdAt: new Date().toISOString(), service: { id: "1", name: "Balayage" } },
  { id: "p2", businessId: "demo", serviceId: "3", name: "Cut & style × 5", sessionCount: 5, priceCents: 80000, currency: "RON", validityDays: 365, shareable: true, isActive: true, createdAt: new Date().toISOString(), service: { id: "3", name: "Cut & style" } },
];

const DEMO_RULES: DiscountRule[] = [
  { id: "r1", businessId: "demo", ruleType: "seasonal", name: "Summer colour week", isActive: true, priority: 10, conditions: {}, discountType: "pct", discountValue: 15, validFrom: "2025-07-01T00:00:00Z", validTo: "2025-07-07T23:59:59Z", usedCount: 0, appliesTo: { all_services: false, categories: ["Colour"] }, createdAt: new Date().toISOString() },
  { id: "r2", businessId: "demo", ruleType: "off_peak", name: "Monday off-peak", isActive: true, priority: 5, conditions: { days_of_week: [1] }, discountType: "flat", discountValue: 3000, usedCount: 12, appliesTo: { all_services: true }, createdAt: new Date().toISOString() },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function fmtPrice(cents: number, currency = "RON") {
  return `${(cents / 100).toFixed(0)} ${currency}`;
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Toggle button ──────────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${on ? "bg-[var(--sage)]" : "bg-[var(--paper-3)]"}`}
    >
      <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function ServicesPage() {
  const { businessId } = useStudio();
  const isDemo = !businessId || businessId.startsWith("demo");

  const [tab, setTab] = useState<Tab>("services");
  const [services, setServices] = useState<ApiService[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; displayName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Service edit slide-out
  const [editService, setEditService] = useState<ApiService | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; priceCents: string; durationMin: string; description: string }>({ name: "", priceCents: "", durationMin: "", description: "" });
  const [editSaving, setEditSaving] = useState(false);

  // New service drawer
  const [showNewService, setShowNewService] = useState(false);
  const [newSvcForm, setNewSvcForm] = useState({ name: "", priceCents: "", durationMin: "60", description: "" });
  const [newSvcSaving, setNewSvcSaving] = useState(false);

  // New add-on inline form state per service
  const [addonForm, setAddonForm] = useState<Record<string, { name: string; priceCents: string; durationMin: string } | null>>({});

  // New package form
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [pkgForm, setPkgForm] = useState({ serviceId: "", name: "", sessionCount: "3", priceCents: "", validityDays: "180", shareable: false, description: "" });
  const [pkgSaving, setPkgSaving] = useState(false);

  // New pricing rule form
  const [showNewRule, setShowNewRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: "", discountType: "pct" as "pct" | "flat", discountValue: "10", validFrom: "", validTo: "", ruleType: "seasonal" });
  const [ruleSaving, setRuleSaving] = useState(false);

  const [search, setSearch] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    if (isDemo) {
      setServices(DEMO_SERVICES);
      setAddons(DEMO_ADDONS);
      setPackages(DEMO_PACKAGES);
      setRules(DEMO_RULES);
      setLoading(false);
      return;
    }
    try {
      const [svcRes, pkgRes, ruleRes, staffRes] = await Promise.allSettled([
        fetchServices(undefined, businessId!),
        listPackages(businessId!),
        listDiscountRules(businessId!),
        listStaff(businessId!),
      ]);
      if (svcRes.status === "fulfilled") setServices((svcRes.value as any)?.services ?? svcRes.value);
      if (pkgRes.status === "fulfilled") setPackages(pkgRes.value);
      if (ruleRes.status === "fulfilled") setRules(ruleRes.value);
      if (staffRes.status === "fulfilled") setStaffList(staffRes.value as any);
    } catch { /* ignore */ }
    setLoading(false);
  }, [businessId, isDemo]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Load addons when switching to that tab
  useEffect(() => {
    if (tab !== "addons" || isDemo) return;
    Promise.all(services.map((s) => listAddons(s.id).then((a) => a))).then((results) => {
      setAddons(results.flat());
    });
  }, [tab, services, isDemo]);

  /* ─── Services tab handlers ──────────────────────────────────── */
  const openEdit = (svc: ApiService) => {
    setEditService(svc);
    setEditForm({
      name: svc.name,
      priceCents: svc.price_cents ? String(svc.price_cents / 100) : "",
      durationMin: String(svc.duration_active_min),
      description: svc.description ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editService) return;
    setEditSaving(true);
    const payload = {
      name: editForm.name,
      priceCents: editForm.priceCents ? Math.round(parseFloat(editForm.priceCents) * 100) : undefined,
      durationActiveMin: parseInt(editForm.durationMin) || 60,
      description: editForm.description || undefined,
    };
    if (!isDemo) {
      await updateService(editService.id, payload).catch(() => null);
    }
    setServices((prev) =>
      prev.map((s) => s.id === editService.id ? { ...s, ...{ name: payload.name, price_cents: payload.priceCents, duration_active_min: payload.durationActiveMin } } : s),
    );
    setEditService(null);
    setEditSaving(false);
  };

  const toggleServiceActive = async (svc: ApiService) => {
    const newActive = !(svc.is_active ?? svc.isActive);
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, is_active: newActive, isActive: newActive } : s));
    if (!isDemo) await updateService(svc.id, { isActive: newActive }).catch(() => null);
  };

  const saveNewService = async () => {
    if (!newSvcForm.name) return;
    setNewSvcSaving(true);
    if (!isDemo && businessId) {
      const result = await createService({
        businessId,
        name: newSvcForm.name,
        priceCents: newSvcForm.priceCents ? Math.round(parseFloat(newSvcForm.priceCents) * 100) : undefined,
        durationActiveMin: parseInt(newSvcForm.durationMin) || 60,
        description: newSvcForm.description || undefined,
        currency: "RON",
      }).catch(() => null);
      if (result) await loadAll();
    } else {
      setServices((prev) => [...prev, {
        id: `demo-${Date.now()}`, name: newSvcForm.name,
        price_cents: newSvcForm.priceCents ? Math.round(parseFloat(newSvcForm.priceCents) * 100) : null,
        duration_active_min: parseInt(newSvcForm.durationMin) || 60,
        price_type: "fixed", currency: "RON", is_active: true,
      }]);
    }
    setShowNewService(false);
    setNewSvcForm({ name: "", priceCents: "", durationMin: "60", description: "" });
    setNewSvcSaving(false);
  };

  /* ─── Add-ons tab handlers ───────────────────────────────────── */
  const saveAddon = async (serviceId: string) => {
    const form = addonForm[serviceId];
    if (!form?.name) return;
    const payload = { name: form.name, priceCents: Math.round(parseFloat(form.priceCents || "0") * 100), durationMin: parseInt(form.durationMin || "0") };
    let newAddon: ServiceAddon;
    if (!isDemo) {
      newAddon = await createAddon(serviceId, payload).catch(() => null) as ServiceAddon;
    } else {
      newAddon = { id: `a-${Date.now()}`, serviceId, ...payload, isActive: true, displayOrder: 0 };
    }
    if (newAddon) setAddons((prev) => [...prev, newAddon]);
    setAddonForm((prev) => ({ ...prev, [serviceId]: null }));
  };

  const toggleAddon = async (addon: ServiceAddon) => {
    const updated = { ...addon, isActive: !addon.isActive };
    setAddons((prev) => prev.map((a) => a.id === addon.id ? updated : a));
    if (!isDemo) await updateAddon(addon.id, { isActive: updated.isActive }).catch(() => null);
  };

  const removeAddon = async (addon: ServiceAddon) => {
    setAddons((prev) => prev.filter((a) => a.id !== addon.id));
    if (!isDemo) await deleteAddon(addon.id).catch(() => null);
  };

  /* ─── Package tab handlers ───────────────────────────────────── */
  const savePkg = async () => {
    if (!pkgForm.serviceId || !pkgForm.name) return;
    setPkgSaving(true);
    const payload = {
      serviceId: pkgForm.serviceId,
      name: pkgForm.name,
      sessionCount: parseInt(pkgForm.sessionCount) || 3,
      priceCents: Math.round(parseFloat(pkgForm.priceCents || "0") * 100),
      validityDays: pkgForm.validityDays ? parseInt(pkgForm.validityDays) : undefined,
      description: pkgForm.description || undefined,
      shareable: pkgForm.shareable,
      currency: "RON",
    };
    if (!isDemo && businessId) {
      const result = await createPackage(businessId, payload).catch(() => null);
      if (result) setPackages((prev) => [...prev, result]);
    } else {
      const svc = services.find((s) => s.id === payload.serviceId);
      setPackages((prev) => [...prev, { id: `p-${Date.now()}`, businessId: "demo", ...payload, isActive: true, createdAt: new Date().toISOString(), service: svc ? { id: svc.id, name: svc.name } : null }]);
    }
    setShowNewPackage(false);
    setPkgForm({ serviceId: "", name: "", sessionCount: "3", priceCents: "", validityDays: "180", shareable: false, description: "" });
    setPkgSaving(false);
  };

  const togglePackage = async (pkg: ServicePackage) => {
    const updated = { ...pkg, isActive: !pkg.isActive };
    setPackages((prev) => prev.map((p) => p.id === pkg.id ? updated : p));
    if (!isDemo) await updatePackage(pkg.id, { isActive: updated.isActive }).catch(() => null);
  };

  /* ─── Pricing rule handlers ──────────────────────────────────── */
  const saveRule = async () => {
    if (!ruleForm.name) return;
    setRuleSaving(true);
    const payload = {
      name: ruleForm.name,
      ruleType: ruleForm.ruleType,
      discountType: ruleForm.discountType,
      discountValue: Math.round(parseFloat(ruleForm.discountValue || "0") * (ruleForm.discountType === "flat" ? 100 : 1)),
      validFrom: ruleForm.validFrom || undefined,
      validTo: ruleForm.validTo || undefined,
    };
    if (!isDemo && businessId) {
      const result = await createDiscountRule(businessId, payload).catch(() => null);
      if (result) setRules((prev) => [...prev, result]);
    } else {
      setRules((prev) => [...prev, { id: `r-${Date.now()}`, businessId: "demo", priority: 10, conditions: {}, appliesTo: { all_services: true }, usedCount: 0, isActive: true, createdAt: new Date().toISOString(), ...payload }]);
    }
    setShowNewRule(false);
    setRuleForm({ name: "", discountType: "pct", discountValue: "10", validFrom: "", validTo: "", ruleType: "seasonal" });
    setRuleSaving(false);
  };

  const toggleRule = async (rule: DiscountRule) => {
    const updated = { ...rule, isActive: !rule.isActive };
    setRules((prev) => prev.map((r) => r.id === rule.id ? updated : r));
    if (!isDemo) await updateDiscountRule(rule.id, { isActive: updated.isActive }).catch(() => null);
  };

  /* ─── Filtered services ──────────────────────────────────────── */
  const filtered = services.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = Array.from(new Set(services.map((s) => s.category ?? "General"))).map((cat) => ({
    category: cat,
    items: filtered.filter((s) => (s.category ?? "General") === cat),
  })).filter((g) => g.items.length > 0);

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Services & pricing</h1>
        {tab === "services" && (
          <button onClick={() => setShowNewService(true)} className="btn btn-primary btn-sm">
            <GlamrIcon name="plus" size={13} /> Add service
          </button>
        )}
        {tab === "packages" && (
          <button onClick={() => setShowNewPackage(true)} className="btn btn-primary btn-sm">
            <GlamrIcon name="plus" size={13} /> New package
          </button>
        )}
        {tab === "pricing" && (
          <button onClick={() => setShowNewRule(true)} className="btn btn-primary btn-sm">
            <GlamrIcon name="plus" size={13} /> New rule
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-[var(--paper-2)] rounded-lg p-0.5 w-fit">
        {(["services", "addons", "packages", "pricing"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-[12px] rounded-md transition-colors capitalize ${tab === t ? "bg-[var(--card)] text-[var(--ink)] shadow-sm" : "text-[var(--ink-3)]"}`}
          >
            {t === "addons" ? "Add-ons" : t === "pricing" ? "Seasonal pricing" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Services tab ──────────────────────────────────────────── */}
      {tab === "services" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <GlamrIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]" />
              <input className="input pl-9 text-[13px]" placeholder="Search services…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="text-[12px] text-[var(--ink-4)] tabular-num">{filtered.length} services</span>
          </div>

          {loading ? (
            <div className="card p-12 text-center text-[13px] text-[var(--ink-4)]">Loading…</div>
          ) : grouped.length === 0 ? (
            <div className="card p-12 text-center text-[13px] text-[var(--ink-4)]">No services yet</div>
          ) : grouped.map((g) => (
            <div key={g.category}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[14px] font-medium text-[var(--ink)]">{g.category}</h2>
                <span className="text-[11px] text-[var(--ink-4)]">{g.items.length}</span>
              </div>
              <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
                {g.items.map((svc) => {
                  const active = svc.is_active ?? svc.isActive ?? true;
                  return (
                    <div key={svc.id} className="flex items-center gap-4 p-4 hover:bg-[var(--paper-2)] transition-colors group">
                      <Toggle on={active} onChange={() => toggleServiceActive(svc)} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[14px] ${active ? "text-[var(--ink)]" : "text-[var(--ink-4)]"}`}>{svc.name}</span>
                        {svc.description && <p className="text-[11px] text-[var(--ink-4)] truncate mt-0.5">{svc.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-[var(--ink-3)]">
                        <GlamrIcon name="clock" size={12} />
                        <span className="tabular-num">{svc.duration_active_min} min</span>
                      </div>
                      <span className="tabular-num text-[14px] font-medium text-[var(--ink)] min-w-[90px] text-right">
                        {svc.price_cents ? fmtPrice(svc.price_cents, svc.currency) : "By quote"}
                      </span>
                      <button
                        onClick={() => openEdit(svc)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--paper-3)] transition-all"
                      >
                        <GlamrIcon name="settings" size={13} className="text-[var(--ink-3)]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Add-ons tab ───────────────────────────────────────────── */}
      {tab === "addons" && (
        <div className="space-y-4">
          {services.map((svc) => {
            const svcAddons = addons.filter((a) => a.serviceId === svc.id);
            const form = addonForm[svc.id];
            return (
              <div key={svc.id}>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-[14px] font-medium text-[var(--ink)]">{svc.name}</h2>
                  <span className="text-[11px] text-[var(--ink-4)]">{svcAddons.length} add-on{svcAddons.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="card overflow-hidden">
                  {svcAddons.length > 0 && (
                    <div className="divide-y divide-[var(--line-2)]">
                      {svcAddons.map((addon) => (
                        <div key={addon.id} className="flex items-center gap-4 px-4 py-3 group">
                          <Toggle on={addon.isActive} onChange={() => toggleAddon(addon)} />
                          <div className="flex-1 min-w-0">
                            <span className={`text-[13px] ${addon.isActive ? "text-[var(--ink)]" : "text-[var(--ink-4)]"}`}>{addon.name}</span>
                          </div>
                          {addon.durationMin > 0 && (
                            <span className="text-[12px] text-[var(--ink-3)] tabular-num">+{addon.durationMin} min</span>
                          )}
                          <span className="tabular-num text-[13px] font-medium text-[var(--ink)] min-w-[70px] text-right">
                            +{fmtPrice(addon.priceCents, svc.currency)}
                          </span>
                          <button
                            onClick={() => removeAddon(addon)}
                            className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-[var(--ink-4)]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline add form */}
                  {form ? (
                    <div className="flex items-center gap-2 p-3 border-t border-[var(--line-2)] bg-[var(--paper-2)]">
                      <input
                        autoFocus
                        className="input text-[12px] flex-1"
                        placeholder="Add-on name"
                        value={form.name}
                        onChange={(e) => setAddonForm((prev) => ({ ...prev, [svc.id]: { ...form, name: e.target.value } }))}
                      />
                      <input
                        className="input text-[12px] w-24"
                        placeholder="Price lei"
                        type="number"
                        value={form.priceCents}
                        onChange={(e) => setAddonForm((prev) => ({ ...prev, [svc.id]: { ...form, priceCents: e.target.value } }))}
                      />
                      <input
                        className="input text-[12px] w-20"
                        placeholder="+min"
                        type="number"
                        value={form.durationMin}
                        onChange={(e) => setAddonForm((prev) => ({ ...prev, [svc.id]: { ...form, durationMin: e.target.value } }))}
                      />
                      <button onClick={() => saveAddon(svc.id)} className="btn btn-primary btn-sm">Save</button>
                      <button onClick={() => setAddonForm((prev) => ({ ...prev, [svc.id]: null }))} className="btn btn-ghost btn-sm">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddonForm((prev) => ({ ...prev, [svc.id]: { name: "", priceCents: "", durationMin: "" } }))}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[12px] text-[var(--ink-4)] hover:text-[var(--plum)] hover:bg-[var(--paper-2)] transition-colors border-t border-[var(--line-2)] first:border-t-0"
                    >
                      <GlamrIcon name="plus" size={12} /> Add add-on
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Packages tab ─────────────────────────────────────────── */}
      {tab === "packages" && (
        <div className="space-y-3">
          {packages.length === 0 ? (
            <div className="card p-12 text-center text-[13px] text-[var(--ink-4)]">No packages yet — create one to offer multi-session deals.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`card p-5 space-y-3 ${!pkg.isActive ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-medium text-[var(--ink)]">{pkg.name}</p>
                      <p className="text-[11px] text-[var(--ink-4)] mt-0.5">{pkg.service?.name ?? "—"}</p>
                    </div>
                    <Toggle on={pkg.isActive} onChange={() => togglePackage(pkg)} />
                  </div>

                  <div className="flex items-end gap-3">
                    <div>
                      <span className="text-[22px] font-medium text-[var(--ink)] tabular-num">
                        {fmtPrice(pkg.priceCents, pkg.currency)}
                      </span>
                      <span className="text-[12px] text-[var(--ink-3)] ml-1">/ {pkg.sessionCount} sessions</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip text-[10px]">{pkg.sessionCount}× sessions</span>
                    {pkg.validityDays && (
                      <span className="chip text-[10px]">{pkg.validityDays}d validity</span>
                    )}
                    {pkg.shareable && (
                      <span className="chip text-[10px]">Shareable</span>
                    )}
                  </div>

                  {pkg.description && (
                    <p className="text-[11px] text-[var(--ink-4)]">{pkg.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Seasonal pricing tab ─────────────────────────────────── */}
      {tab === "pricing" && (
        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="card p-12 text-center text-[13px] text-[var(--ink-4)]">No pricing rules yet — add seasonal discounts or off-peak deals.</div>
          ) : (
            <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
              {rules.map((rule) => (
                <div key={rule.id} className={`flex items-center gap-4 p-4 ${!rule.isActive ? "opacity-60" : ""}`}>
                  <Toggle on={rule.isActive} onChange={() => toggleRule(rule)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--ink)]">{rule.name}</p>
                    <p className="text-[11px] text-[var(--ink-4)] mt-0.5 font-mono">
                      {fmtDate(rule.validFrom)} – {fmtDate(rule.validTo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`chip text-[10px] ${rule.ruleType === "seasonal" ? "chip-plum" : ""}`}>
                      {rule.ruleType}
                    </span>
                    <span className="tabular-num text-[14px] font-medium text-[var(--ink)]">
                      {rule.discountType === "pct"
                        ? `${rule.discountValue}% off`
                        : `${fmtPrice(rule.discountValue, "RON")} off`}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--ink-4)] tabular-num">{rule.usedCount} uses</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit service drawer ───────────────────────────────────── */}
      {editService && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setEditService(null)} />
          <div className="relative w-[420px] h-full bg-[var(--card)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--line-2)]">
              <h2 className="text-[16px] font-display text-[var(--ink)]">Edit service</h2>
              <button onClick={() => setEditService(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-4)]">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Name</span>
                <input className="input w-full" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-[12px] text-[var(--ink-3)] font-medium">Price (lei)</span>
                  <input className="input w-full" type="number" placeholder="0" value={editForm.priceCents} onChange={(e) => setEditForm((f) => ({ ...f, priceCents: e.target.value }))} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[12px] text-[var(--ink-3)] font-medium">Duration (min)</span>
                  <input className="input w-full" type="number" value={editForm.durationMin} onChange={(e) => setEditForm((f) => ({ ...f, durationMin: e.target.value }))} />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Description</span>
                <textarea rows={3} className="input w-full resize-none" placeholder="Brief description…" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
              </label>
            </div>
            <div className="flex gap-2 p-5 border-t border-[var(--line-2)]">
              <button onClick={() => setEditService(null)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={saveEdit} disabled={editSaving} className="btn btn-primary flex-1">{editSaving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New service drawer ────────────────────────────────────── */}
      {showNewService && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowNewService(false)} />
          <div className="relative w-[420px] h-full bg-[var(--card)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--line-2)]">
              <h2 className="text-[16px] font-display text-[var(--ink)]">New service</h2>
              <button onClick={() => setShowNewService(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-4)]">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Name *</span>
                <input className="input w-full" placeholder="e.g. Balayage" value={newSvcForm.name} onChange={(e) => setNewSvcForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-[12px] text-[var(--ink-3)] font-medium">Price (lei)</span>
                  <input className="input w-full" type="number" placeholder="0" value={newSvcForm.priceCents} onChange={(e) => setNewSvcForm((f) => ({ ...f, priceCents: e.target.value }))} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[12px] text-[var(--ink-3)] font-medium">Duration (min)</span>
                  <input className="input w-full" type="number" value={newSvcForm.durationMin} onChange={(e) => setNewSvcForm((f) => ({ ...f, durationMin: e.target.value }))} />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Description</span>
                <textarea rows={3} className="input w-full resize-none" placeholder="Brief description…" value={newSvcForm.description} onChange={(e) => setNewSvcForm((f) => ({ ...f, description: e.target.value }))} />
              </label>
            </div>
            <div className="flex gap-2 p-5 border-t border-[var(--line-2)]">
              <button onClick={() => setShowNewService(false)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={saveNewService} disabled={newSvcSaving || !newSvcForm.name} className="btn btn-primary flex-1">{newSvcSaving ? "Saving…" : "Create service"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New package modal ─────────────────────────────────────── */}
      {showNewPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewPackage(false); }}>
          <div className="card p-6 w-[460px] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-display text-[var(--ink)]">New package</h2>
              <button onClick={() => setShowNewPackage(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-4)]">✕</button>
            </div>
            <label className="block space-y-1.5">
              <span className="text-[12px] text-[var(--ink-3)] font-medium">Service *</span>
              <select className="input w-full" value={pkgForm.serviceId} onChange={(e) => setPkgForm((f) => ({ ...f, serviceId: e.target.value }))}>
                <option value="">Select a service…</option>
                {services.filter((s) => s.is_active ?? s.isActive).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] text-[var(--ink-3)] font-medium">Package name *</span>
              <input className="input w-full" placeholder="e.g. Balayage × 3" value={pkgForm.name} onChange={(e) => setPkgForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Sessions</span>
                <input className="input w-full" type="number" min="2" value={pkgForm.sessionCount} onChange={(e) => setPkgForm((f) => ({ ...f, sessionCount: e.target.value }))} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Total price (lei)</span>
                <input className="input w-full" type="number" placeholder="0" value={pkgForm.priceCents} onChange={(e) => setPkgForm((f) => ({ ...f, priceCents: e.target.value }))} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Valid (days)</span>
                <input className="input w-full" type="number" value={pkgForm.validityDays} onChange={(e) => setPkgForm((f) => ({ ...f, validityDays: e.target.value }))} />
              </label>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={pkgForm.shareable} onChange={(e) => setPkgForm((f) => ({ ...f, shareable: e.target.checked }))} className="w-4 h-4 rounded accent-[var(--plum)]" />
              <span className="text-[13px] text-[var(--ink-2)]">Shareable between clients</span>
            </label>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowNewPackage(false)} className="btn btn-ghost btn-sm">Cancel</button>
              <button onClick={savePkg} disabled={pkgSaving || !pkgForm.serviceId || !pkgForm.name} className="btn btn-primary btn-sm">{pkgSaving ? "Saving…" : "Create package"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New pricing rule modal ────────────────────────────────── */}
      {showNewRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewRule(false); }}>
          <div className="card p-6 w-[460px] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-display text-[var(--ink)]">New pricing rule</h2>
              <button onClick={() => setShowNewRule(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-4)]">✕</button>
            </div>
            <label className="block space-y-1.5">
              <span className="text-[12px] text-[var(--ink-3)] font-medium">Name *</span>
              <input className="input w-full" placeholder="e.g. Summer week discount" value={ruleForm.name} onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Type</span>
                <select className="input w-full" value={ruleForm.ruleType} onChange={(e) => setRuleForm((f) => ({ ...f, ruleType: e.target.value }))}>
                  <option value="seasonal">Seasonal</option>
                  <option value="off_peak">Off-peak</option>
                  <option value="last_minute">Last minute</option>
                  <option value="promo">Promo code</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Discount</span>
                <div className="flex gap-1">
                  <select className="input w-20" value={ruleForm.discountType} onChange={(e) => setRuleForm((f) => ({ ...f, discountType: e.target.value as any }))}>
                    <option value="pct">%</option>
                    <option value="flat">lei</option>
                  </select>
                  <input className="input flex-1" type="number" placeholder="10" value={ruleForm.discountValue} onChange={(e) => setRuleForm((f) => ({ ...f, discountValue: e.target.value }))} />
                </div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Valid from</span>
                <input className="input w-full" type="date" value={ruleForm.validFrom} onChange={(e) => setRuleForm((f) => ({ ...f, validFrom: e.target.value }))} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[12px] text-[var(--ink-3)] font-medium">Valid to</span>
                <input className="input w-full" type="date" value={ruleForm.validTo} onChange={(e) => setRuleForm((f) => ({ ...f, validTo: e.target.value }))} />
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowNewRule(false)} className="btn btn-ghost btn-sm">Cancel</button>
              <button onClick={saveRule} disabled={ruleSaving || !ruleForm.name} className="btn btn-primary btn-sm">{ruleSaving ? "Saving…" : "Create rule"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
