"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBusiness } from "@/lib/mvp-api";
import { useStudio } from "@/lib/studio-context";

const BUSINESS_TYPES = [
  "salon",
  "barbershop",
  "spa",
  "nail_studio",
  "lash_studio",
  "brow_studio",
  "tattoo_studio",
  "freelancer",
  "other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setBusinessId } = useStudio();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    businessType: "",
    about: "",
    line1: "",
    city: "",
    countryCode: "GB",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const biz = await createBusiness({
        name: form.name,
        businessType: form.businessType,
        about: form.about || undefined,
        address: {
          line1: form.line1,
          city: form.city,
          countryCode: form.countryCode,
          timezone: form.timezone,
        },
      });

      setBusinessId(biz.id);
      router.push("/studio/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-transparent border border-outline-variant/60 px-4 py-3 font-body text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary-fixed transition-colors";

  const labelClass = "block font-label text-[9px] uppercase tracking-widest text-primary/50 mb-1.5";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-10">
        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-2">
          Step {step} of 2
        </p>
        <h1 className="font-headline font-black text-3xl tracking-tight text-primary">
          Set up your studio
        </h1>
        <p className="font-body text-sm text-primary/50 mt-2">
          Tell us about your business to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className={labelClass}>Business name</label>
              <input
                type="text"
                required
                placeholder="e.g. Studio Noir"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Business type</label>
              <select
                required
                value={form.businessType}
                onChange={(e) => update("businessType", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a type…</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>About (optional)</label>
              <textarea
                rows={3}
                placeholder="A short description of your business…"
                value={form.about}
                onChange={(e) => update("about", e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.name || !form.businessType}
              className="w-full bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs py-3.5 hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className={labelClass}>Street address</label>
              <input
                type="text"
                required
                placeholder="123 High Street"
                value={form.line1}
                onChange={(e) => update("line1", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                required
                placeholder="London"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Country code</label>
              <input
                type="text"
                required
                maxLength={2}
                placeholder="GB"
                value={form.countryCode}
                onChange={(e) => update("countryCode", e.target.value.toUpperCase())}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="font-label text-[10px] uppercase tracking-widest text-error">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-outline-variant/60 text-primary font-headline font-bold uppercase tracking-widest text-xs py-3.5 hover:border-primary transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !form.line1 || !form.city}
                className="flex-1 bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs py-3.5 hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Creating…" : "Launch Studio"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
