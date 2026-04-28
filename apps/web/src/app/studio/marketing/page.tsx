"use client";

import { useState, useEffect } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { useStudio } from "@/lib/studio-context";
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listTemplates,
  upsertTemplate,
  listWebhooks,
  createWebhook,
  deleteWebhook,
  updateWebhook,
  listIntegrations,
  connectIntegration,
  disconnectIntegration,
  type Campaign,
  type MessageTemplate,
  type WebhookEndpoint,
  type IntegrationStatus,
} from "@/lib/mvp-api";

/* ─── Demo data ────────────────────────────────────────────────────── */
const DEMO_CAMPAIGNS: Campaign[] = [
  { id: "c1", businessId: "demo", name: "Spring Balayage Special", segment: {}, channels: ["email", "sms"], scheduledAt: null, sentAt: null, status: "sent", createdAt: new Date(Date.now() - 20 * 86_400_000).toISOString() },
  { id: "c2", businessId: "demo", name: "New Client 20% Off", segment: {}, channels: ["email"], scheduledAt: null, sentAt: null, status: "sending", createdAt: new Date(Date.now() - 10 * 86_400_000).toISOString() },
  { id: "c3", businessId: "demo", name: "Summer Hair Prep", segment: {}, channels: ["email", "sms"], scheduledAt: new Date(Date.now() + 7 * 86_400_000).toISOString(), sentAt: null, status: "scheduled", createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString() },
  { id: "c4", businessId: "demo", name: "Re-book Reminder", segment: {}, channels: ["sms"], scheduledAt: null, sentAt: null, status: "draft", createdAt: new Date(Date.now() - 1 * 86_400_000).toISOString() },
];

const DEMO_TEMPLATES: MessageTemplate[] = [
  { id: "t1", businessId: "demo", kind: "confirmation", subject: "Your appointment is confirmed ✓", bodyEmail: "Hi {{name}}, your booking for {{service}} on {{date}} at {{time}} is confirmed.", bodySms: "Your {{service}} appt on {{date}} at {{time}} is confirmed — Glamr", updatedAt: new Date().toISOString() },
  { id: "t2", businessId: "demo", kind: "reminder_24h", subject: "Your appointment is tomorrow", bodyEmail: "Hi {{name}}, just a reminder about your {{service}} appointment tomorrow at {{time}}.", bodySms: "Reminder: {{service}} tomorrow at {{time}} — reply CANCEL to cancel", updatedAt: new Date().toISOString() },
  { id: "t3", businessId: "demo", kind: "review_prompt", subject: "How was your experience?", bodyEmail: "Hi {{name}}, we hope you loved your {{service}} with {{staff}}. Leave a quick review:", bodySms: null, updatedAt: new Date().toISOString() },
];

const DEMO_WEBHOOKS: WebhookEndpoint[] = [
  { id: "wh1", url: "https://hooks.zapier.com/hooks/catch/xxx/yyy", events: ["booking.created", "booking.cancelled"], active: true, createdAt: new Date().toISOString() },
];

const DEMO_INTEGRATIONS: IntegrationStatus[] = [
  { provider: "google_calendar", connected: true, connectedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(), config: {} },
  { provider: "google_business", connected: false, connectedAt: null, config: null },
  { provider: "mailchimp", connected: false, connectedAt: null, config: null },
  { provider: "brevo", connected: false, connectedAt: null, config: null },
  { provider: "zapier", connected: true, connectedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), config: {} },
];

const ALL_EVENTS = ["booking.created", "booking.confirmed", "booking.cancelled", "booking.rescheduled", "payment.received", "review.created"];

const STATUS_COLOR: Record<string, string> = {
  sent: "text-green-600",
  sending: "text-[var(--plum)]",
  scheduled: "text-[var(--amber)]",
  failed: "text-red-500",
  draft: "text-[var(--ink-4)]",
};

const STATUS_DOT: Record<string, string> = {
  sent: "bg-green-500",
  sending: "bg-[var(--plum)]",
  scheduled: "bg-[var(--amber)]",
  failed: "bg-red-500",
  draft: "bg-[var(--ink-4)]",
};

const PROVIDER_META: Record<string, { label: string; icon: string; desc: string }> = {
  google_calendar: { label: "Google Calendar", icon: "calendar", desc: "Sync bookings to Google Calendar" },
  google_business: { label: "Google Business", icon: "map", desc: "Manage your Google profile" },
  mailchimp: { label: "Mailchimp", icon: "message", desc: "Sync clients to email lists" },
  brevo: { label: "Brevo", icon: "message", desc: "Email & SMS marketing platform" },
  zapier: { label: "Zapier", icon: "share", desc: "Connect to 5,000+ apps" },
};

const TEMPLATE_KIND_LABELS: Record<string, string> = {
  confirmation: "Booking confirmed",
  reminder_24h: "24h reminder",
  reschedule: "Reschedule notice",
  cancel: "Cancellation",
  review_prompt: "Review request",
  reengagement: "Re-engagement",
};

type Tab = "campaigns" | "templates" | "webhooks" | "integrations";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function MarketingPage() {
  const { businessId } = useStudio();
  const isDemo = !businessId || businessId.startsWith("demo");

  const [tab, setTab] = useState<Tab>("campaigns");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", channels: ["email"] as string[], scheduledAt: "" });
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEMO_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(DEMO_WEBHOOKS);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: "", events: [] as string[] });
  const [savingWebhook, setSavingWebhook] = useState(false);

  // Integrations
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(DEMO_INTEGRATIONS);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    setLoading(true);
    const biz = businessId!;
    Promise.allSettled([
      listCampaigns(biz),
      listTemplates(biz),
      listWebhooks(biz),
      listIntegrations(biz),
    ]).then(([cRes, tRes, wRes, iRes]) => {
      if (cRes.status === "fulfilled") setCampaigns(cRes.value);
      if (tRes.status === "fulfilled") setTemplates(tRes.value);
      if (wRes.status === "fulfilled") setWebhooks(wRes.value);
      if (iRes.status === "fulfilled") setIntegrations(iRes.value);
    }).finally(() => setLoading(false));
  }, [businessId, isDemo]);

  /* ─── Campaign actions ─────────────────────────────────────────── */
  async function handleCreateCampaign() {
    if (!newCampaign.name.trim()) return;
    setSavingCampaign(true);
    try {
      if (!isDemo) {
        const c = await createCampaign(businessId!, {
          name: newCampaign.name,
          channels: newCampaign.channels,
          scheduled_at: newCampaign.scheduledAt || undefined,
        });
        setCampaigns((prev) => [c, ...prev]);
      } else {
        const demo: Campaign = {
          id: `c-${Date.now()}`,
          businessId: "demo",
          name: newCampaign.name,
          segment: {},
          channels: newCampaign.channels,
          scheduledAt: newCampaign.scheduledAt || null,
          sentAt: null,
          status: newCampaign.scheduledAt ? "scheduled" : "draft",
          createdAt: new Date().toISOString(),
        };
        setCampaigns((prev) => [demo, ...prev]);
      }
      setShowNewCampaign(false);
      setNewCampaign({ name: "", channels: ["email"], scheduledAt: "" });
    } finally {
      setSavingCampaign(false);
    }
  }

  async function handleDeleteCampaign(id: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (!isDemo) {
      await deleteCampaign(id).catch(() => {});
    }
  }

  /* ─── Template actions ─────────────────────────────────────────── */
  async function handleSaveTemplate() {
    if (!editingTemplate) return;
    setSavingTemplate(true);
    try {
      if (!isDemo) {
        const updated = await upsertTemplate(businessId!, editingTemplate.kind, {
          subject: editingTemplate.subject ?? undefined,
          body_email: editingTemplate.bodyEmail ?? undefined,
          body_sms: editingTemplate.bodySms ?? undefined,
        });
        setTemplates((prev) => prev.map((t) => t.kind === updated.kind ? updated : t));
      } else {
        setTemplates((prev) => prev.map((t) => t.kind === editingTemplate.kind ? { ...editingTemplate } : t));
      }
      setEditingTemplate(null);
    } finally {
      setSavingTemplate(false);
    }
  }

  /* ─── Webhook actions ──────────────────────────────────────────── */
  async function handleCreateWebhook() {
    if (!newWebhook.url.trim() || newWebhook.events.length === 0) return;
    setSavingWebhook(true);
    try {
      if (!isDemo) {
        const wh = await createWebhook(businessId!, newWebhook);
        setWebhooks((prev) => [wh, ...prev]);
      } else {
        setWebhooks((prev) => [
          { id: `wh-${Date.now()}`, url: newWebhook.url, events: newWebhook.events, active: true, createdAt: new Date().toISOString() },
          ...prev,
        ]);
      }
      setShowNewWebhook(false);
      setNewWebhook({ url: "", events: [] });
    } finally {
      setSavingWebhook(false);
    }
  }

  async function handleToggleWebhook(wh: WebhookEndpoint) {
    const prev = webhooks;
    setWebhooks((ws) => ws.map((w) => w.id === wh.id ? { ...w, active: !w.active } : w));
    if (!isDemo) {
      await updateWebhook(wh.id, { active: !wh.active }).catch(() => setWebhooks(prev));
    }
  }

  async function handleDeleteWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    if (!isDemo) {
      await deleteWebhook(id).catch(() => {});
    }
  }

  /* ─── Integration actions ──────────────────────────────────────── */
  async function handleToggleIntegration(provider: string, connected: boolean) {
    const prev = integrations;
    setIntegrations((is) => is.map((i) => i.provider === provider ? { ...i, connected: !connected, connectedAt: !connected ? new Date().toISOString() : null } : i));
    try {
      if (!isDemo) {
        if (connected) {
          await disconnectIntegration(businessId!, provider);
        } else {
          await connectIntegration(businessId!, provider);
        }
      }
    } catch {
      setIntegrations(prev);
    }
  }

  const filteredCampaigns = campaigns.filter((c) => statusFilter === "all" || c.status === statusFilter);
  const activeCampaigns = campaigns.filter((c) => ["sending", "scheduled"].includes(c.status)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-display text-[var(--ink)]">Marketing</h1>
          {isDemo && <span className="badge badge-amber text-[8px]">Demo data</span>}
          {loading && <span className="text-[11px] text-[var(--ink-4)] animate-pulse">Loading…</span>}
        </div>
        {tab === "campaigns" && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewCampaign(true)}>
            <GlamrIcon name="plus" size={13} /> New campaign
          </button>
        )}
        {tab === "webhooks" && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewWebhook(true)}>
            <GlamrIcon name="plus" size={13} /> Add endpoint
          </button>
        )}
      </div>

      {/* KPI strip (campaigns tab only) */}
      {tab === "campaigns" && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active campaigns", value: String(activeCampaigns) },
            { label: "Total campaigns", value: String(campaigns.length) },
            { label: "Scheduled", value: String(campaigns.filter((c) => c.status === "scheduled").length) },
            { label: "Sent", value: String(campaigns.filter((c) => c.status === "sent").length) },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="small-meta text-[var(--ink-4)] mb-1">{s.label}</p>
              <p className="text-[20px] font-medium text-[var(--ink)] tabular-num">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {(["campaigns", "templates", "webhooks", "integrations"] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Campaigns tab ─────────────────────────────────────────── */}
      {tab === "campaigns" && (
        <>
          {/* Status filter */}
          <div className="flex gap-2">
            {["all", "draft", "scheduled", "sending", "sent", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`chip whitespace-nowrap text-[11px] ${statusFilter === s ? "on" : ""}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Quick launch */}
          <div>
            <p className="small-meta text-[var(--ink-4)] mb-2">— Quick launch</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "percent" as const, label: "Discount offer", desc: "Create a time-limited promotion" },
                { icon: "bell" as const, label: "Re-engagement", desc: "Reach dormant clients automatically" },
                { icon: "gift" as const, label: "Loyalty reward", desc: "Reward your best clients" },
              ].map((q) => (
                <button key={q.label} onClick={() => { setNewCampaign({ name: q.label, channels: ["email"], scheduledAt: "" }); setShowNewCampaign(true); }} className="card p-4 text-left hover:shadow-sm transition-shadow group">
                  <div className="w-9 h-9 rounded-lg bg-[var(--plum-soft)] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <GlamrIcon name={q.icon} size={16} className="text-[var(--plum)]" />
                  </div>
                  <p className="text-[13px] font-medium text-[var(--ink)]">{q.label}</p>
                  <p className="text-[11px] text-[var(--ink-4)]">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="card p-10 text-center text-[13px] text-[var(--ink-4)]">No campaigns in this filter.</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--line-2)]">
                    {["Campaign", "Channels", "Status", "Scheduled", "Created", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 small-meta text-[var(--ink-4)] font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line-2)]">
                  {filteredCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-[var(--paper-2)] transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink)]">{c.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {c.channels.map((ch) => (
                            <span key={ch} className="badge badge-ink text-[9px]">{ch}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-[12px] ${STATUS_COLOR[c.status] ?? "text-[var(--ink-4)]"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status] ?? "bg-[var(--ink-4)]"}`} />
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--ink-3)]">
                        {c.scheduledAt ? fmtDate(c.scheduledAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--ink-4)]">{fmtDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="btn btn-ghost btn-sm text-[11px] text-[var(--ink-4)] hover:text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Templates tab ─────────────────────────────────────────── */}
      {tab === "templates" && (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--ink-3)]">Customise the automated messages sent to clients at key moments.</p>
          {Object.entries(TEMPLATE_KIND_LABELS).map(([kind, label]) => {
            const t = templates.find((x) => x.kind === kind);
            return (
              <div key={kind} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--ink)]">{label}</p>
                    {t ? (
                      <p className="text-[12px] text-[var(--ink-3)] mt-1 truncate max-w-xl">{t.bodyEmail ?? t.bodySms ?? "—"}</p>
                    ) : (
                      <p className="text-[12px] text-[var(--ink-4)] mt-1">Not customised — using default</p>
                    )}
                  </div>
                  <button
                    className="btn btn-ghost btn-sm text-[11px] shrink-0"
                    onClick={() => setEditingTemplate(t ?? { id: "", businessId: businessId ?? "demo", kind, subject: null, bodyEmail: null, bodySms: null, updatedAt: new Date().toISOString() })}
                  >
                    {t ? "Edit" : "Customise"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Webhooks tab ──────────────────────────────────────────── */}
      {tab === "webhooks" && (
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--ink-3)]">
            Receive real-time POST requests when events happen in your business. Sign each payload with HMAC-SHA256.
          </p>

          {webhooks.length === 0 ? (
            <div className="card p-10 text-center text-[13px] text-[var(--ink-4)]">No webhook endpoints yet.</div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${wh.active ? "bg-green-500" : "bg-[var(--ink-4)]"}`} />
                        <p className="text-[13px] font-mono text-[var(--ink)] truncate">{wh.url}</p>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {wh.events.map((ev) => (
                          <span key={ev} className="badge badge-ink text-[9px]">{ev}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleWebhook(wh)}
                        className={`btn btn-ghost btn-sm text-[11px] ${wh.active ? "text-[var(--ink-3)]" : "text-green-600"}`}
                      >
                        {wh.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="btn btn-ghost btn-sm text-[11px] text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--ink-4)] mt-2">Added {fmtDate(wh.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Integrations tab ──────────────────────────────────────── */}
      {tab === "integrations" && (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--ink-3)]">Connect your business tools to sync data and automate workflows.</p>
          <div className="grid grid-cols-2 gap-3">
            {integrations.map((int) => {
              const meta = PROVIDER_META[int.provider] ?? { label: int.provider, icon: "share", desc: "" };
              return (
                <div key={int.provider} className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--paper-3)] flex items-center justify-center shrink-0">
                    <GlamrIcon name={meta.icon as any} size={18} className="text-[var(--ink-3)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-medium text-[var(--ink)]">{meta.label}</p>
                      {int.connected && (
                        <span className="badge badge-sage text-[8px]">Connected</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--ink-4)]">{meta.desc}</p>
                    {int.connected && int.connectedAt && (
                      <p className="text-[10px] text-[var(--ink-4)] mt-1">Since {fmtDate(int.connectedAt)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleIntegration(int.provider, int.connected)}
                    className={`btn btn-sm shrink-0 ${int.connected ? "btn-ghost text-red-500" : "btn-primary"}`}
                  >
                    {int.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── New campaign modal ─────────────────────────────────────── */}
      {showNewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card w-[440px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-[var(--ink)]">New campaign</h3>
              <button onClick={() => setShowNewCampaign(false)} className="btn btn-ghost btn-sm text-[var(--ink-4)]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">Campaign name</label>
                <input className="input w-full" placeholder="e.g. Summer Promo" value={newCampaign.name} onChange={(e) => setNewCampaign((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">Channels</label>
                <div className="flex gap-2">
                  {["email", "sms", "push"].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setNewCampaign((p) => ({
                        ...p,
                        channels: p.channels.includes(ch) ? p.channels.filter((c) => c !== ch) : [...p.channels, ch],
                      }))}
                      className={`chip text-[11px] ${newCampaign.channels.includes(ch) ? "on" : ""}`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">Schedule (optional)</label>
                <input type="datetime-local" className="input w-full" value={newCampaign.scheduledAt} onChange={(e) => setNewCampaign((p) => ({ ...p, scheduledAt: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewCampaign(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleCreateCampaign} disabled={savingCampaign || !newCampaign.name.trim()}>
                {savingCampaign ? "Creating…" : "Create campaign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit template modal ────────────────────────────────────── */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card w-[520px] p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-[var(--ink)]">{TEMPLATE_KIND_LABELS[editingTemplate.kind] ?? editingTemplate.kind}</h3>
              <button onClick={() => setEditingTemplate(null)} className="btn btn-ghost btn-sm text-[var(--ink-4)]">✕</button>
            </div>
            <p className="text-[11px] text-[var(--ink-4)]">Available variables: {"{{name}}"}, {"{{service}}"}, {"{{date}}"}, {"{{time}}"}, {"{{staff}}"}, {"{{business}}"}</p>
            <div className="space-y-3">
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">Email subject</label>
                <input className="input w-full" value={editingTemplate.subject ?? ""} onChange={(e) => setEditingTemplate((p) => p ? { ...p, subject: e.target.value } : p)} />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">Email body</label>
                <textarea className="input w-full" rows={4} value={editingTemplate.bodyEmail ?? ""} onChange={(e) => setEditingTemplate((p) => p ? { ...p, bodyEmail: e.target.value } : p)} />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">SMS body <span className="text-[var(--ink-5)]">(max 160 chars)</span></label>
                <textarea className="input w-full" rows={2} maxLength={160} value={editingTemplate.bodySms ?? ""} onChange={(e) => setEditingTemplate((p) => p ? { ...p, bodySms: e.target.value } : p)} />
                <p className="text-[10px] text-[var(--ink-4)] mt-1 text-right">{(editingTemplate.bodySms ?? "").length}/160</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingTemplate(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveTemplate} disabled={savingTemplate}>
                {savingTemplate ? "Saving…" : "Save template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New webhook modal ──────────────────────────────────────── */}
      {showNewWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="card w-[480px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-[var(--ink)]">Add webhook endpoint</h3>
              <button onClick={() => setShowNewWebhook(false)} className="btn btn-ghost btn-sm text-[var(--ink-4)]">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-1 block">Endpoint URL</label>
                <input className="input w-full font-mono text-[12px]" placeholder="https://hooks.example.com/..." value={newWebhook.url} onChange={(e) => setNewWebhook((p) => ({ ...p, url: e.target.value }))} />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-4)] mb-2 block">Events to subscribe</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_EVENTS.map((ev) => (
                    <button
                      key={ev}
                      onClick={() => setNewWebhook((p) => ({
                        ...p,
                        events: p.events.includes(ev) ? p.events.filter((e) => e !== ev) : [...p.events, ev],
                      }))}
                      className={`chip text-[10px] font-mono ${newWebhook.events.includes(ev) ? "on" : ""}`}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewWebhook(false)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreateWebhook}
                disabled={savingWebhook || !newWebhook.url.trim() || newWebhook.events.length === 0}
              >
                {savingWebhook ? "Adding…" : "Add endpoint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
