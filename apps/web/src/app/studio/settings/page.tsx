"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/studio-context";
import { updateBusiness } from "@/lib/mvp-api";

export default function SettingsPage() {
  const router = useRouter();
  const { businessId, business, loading: ctxLoading, reload } = useStudio();

  const [form, setForm] = useState({ name: "", about: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctxLoading && !businessId) {
      router.replace("/studio/onboarding");
      return;
    }
    if (business) {
      setForm({
        name: business.name,
        about: business.about ?? "",
      });
    }
  }, [businessId, business, ctxLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await updateBusiness(businessId!, {
        name: form.name,
        about: form.about || undefined,
      });
      await reload();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-outline-variant/60 px-4 py-3 font-body text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary-fixed transition-colors";
  const labelClass = "block font-label text-[9px] uppercase tracking-widest text-primary/50 mb-1.5";

  if (ctxLoading) return null;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">Studio</p>
        <h1 className="font-headline font-black text-3xl tracking-tight text-primary">
          Business Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>Business name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>About your business</label>
          <textarea
            rows={4}
            placeholder="Tell potential clients about your studio, specialties, and vibe…"
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            className={inputClass}
          />
        </div>

        {/* Business ID (read-only) */}
        {businessId && (
          <div>
            <label className={labelClass}>Business ID</label>
            <input
              type="text"
              readOnly
              value={businessId}
              className={`${inputClass} text-primary/30 cursor-default select-all`}
            />
          </div>
        )}

        {/* Slug */}
        {business?.slug && (
          <div>
            <label className={labelClass}>Public URL slug</label>
            <input
              type="text"
              readOnly
              value={`/b/${business.slug}`}
              className={`${inputClass} text-primary/30 cursor-default`}
            />
          </div>
        )}

        {error && (
          <p className="font-label text-[10px] uppercase tracking-widest text-error">{error}</p>
        )}

        {success && (
          <p className="font-label text-[10px] uppercase tracking-widest text-green-600">
            Settings saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs px-8 py-3.5 hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
