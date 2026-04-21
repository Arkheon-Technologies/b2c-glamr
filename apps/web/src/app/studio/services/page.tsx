"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/studio-context";
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  type ServiceListItem,
} from "@/lib/mvp-api";

function formatPrice(priceCents: number | null, currency: string) {
  if (priceCents == null) return "Price on request";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    minimumFractionDigits: 0,
  }).format(priceCents / 100);
}

function formatDuration(activeMin: number, processingMin: number, finishMin: number) {
  const total = activeMin + processingMin + finishMin;
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const defaultForm = {
  name: "",
  description: "",
  durationActiveMin: 30,
  durationProcessingMin: 0,
  durationFinishMin: 0,
  priceCents: 0,
  currency: "GBP",
};

export default function ServicesPage() {
  const router = useRouter();
  const { businessId, business, loading: ctxLoading } = useStudio();

  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctxLoading && !businessId) {
      router.replace("/studio/onboarding");
      return;
    }

    if (businessId) {
      loadServices();
    }
  }, [businessId, ctxLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadServices() {
    setLoading(true);
    try {
      const all = await fetchServices();
      setServices(all.filter((s) => s.business_id === businessId));
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(defaultForm);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(s: ServiceListItem) {
    setForm({
      name: s.name,
      description: s.description ?? "",
      durationActiveMin: s.duration_active_min,
      durationProcessingMin: s.duration_processing_min,
      durationFinishMin: s.duration_finish_min,
      priceCents: s.price_cents ?? 0,
      currency: s.currency ?? "GBP",
    });
    setEditingId(s.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (editingId) {
        await updateService(editingId, {
          name: form.name,
          description: form.description || undefined,
          durationActiveMin: form.durationActiveMin,
          priceCents: form.priceCents,
        });
      } else {
        await createService({
          businessId: businessId!,
          name: form.name,
          description: form.description || undefined,
          durationActiveMin: form.durationActiveMin,
          durationProcessingMin: form.durationProcessingMin,
          durationFinishMin: form.durationFinishMin,
          priceCents: form.priceCents,
          currency: form.currency,
        });
      }
      setShowForm(false);
      await loadServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Archive this service? It will no longer appear in bookings.")) return;
    try {
      await deleteService(id);
      await loadServices();
    } catch {
      alert("Failed to delete service");
    }
  }

  const inputClass =
    "w-full bg-transparent border border-outline-variant/60 px-4 py-3 font-body text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary-fixed transition-colors";
  const labelClass = "block font-label text-[9px] uppercase tracking-widest text-primary/50 mb-1.5";

  if (ctxLoading) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
            {business?.name}
          </p>
          <h1 className="font-headline font-black text-3xl tracking-tight text-primary">Services</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-primary transition-colors"
        >
          + Add Service
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 w-full max-w-md p-8">
            <h2 className="font-headline font-black text-xl tracking-tight text-primary mb-6">
              {editingId ? "Edit Service" : "New Service"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Active (min)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.durationActiveMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, durationActiveMin: Number(e.target.value) }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Processing (min)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.durationProcessingMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, durationProcessingMin: Number(e.target.value) }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Finish (min)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.durationFinishMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, durationFinishMin: Number(e.target.value) }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Price (pence/cents)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.priceCents}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="font-label text-[10px] uppercase tracking-widest text-error">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-outline-variant/60 text-primary font-headline font-bold uppercase tracking-widest text-xs py-3 hover:border-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs py-3 hover:bg-primary transition-colors disabled:opacity-40"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services list */}
      {loading ? (
        <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
          Loading services…
        </p>
      ) : services.length === 0 ? (
        <div className="border border-outline-variant/30 p-12 text-center">
          <p className="font-label text-[10px] uppercase tracking-widest text-primary/30">
            No services yet. Add your first service.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/20 border border-outline-variant/30">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-5 py-5 bg-surface-container-lowest hover:bg-surface-container transition-colors"
            >
              <div>
                <p className="font-body text-sm font-medium text-primary">{s.name}</p>
                <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                  {formatDuration(s.duration_active_min, s.duration_processing_min, s.duration_finish_min)}
                  {" · "}
                  {formatPrice(s.price_cents, s.currency)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="font-label text-[9px] uppercase tracking-widest text-primary/50 hover:text-primary border border-outline-variant/30 hover:border-primary/40 px-3 py-1.5 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="font-label text-[9px] uppercase tracking-widest text-error/60 hover:text-error border border-error/20 hover:border-error/40 px-3 py-1.5 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
