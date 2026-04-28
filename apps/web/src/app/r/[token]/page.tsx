"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { request } from "@/lib/mvp-api";

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error?.message ?? "Request failed");
  return json.data as T;
}

async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const raw = typeof window !== "undefined" ? localStorage.getItem("glamr.auth.session") : null;
  const jwt = raw ? (JSON.parse(raw) as { access_token?: string }).access_token : null;

  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error?.message ?? "Request failed");
  return json.data as T;
}

interface AppointmentInfo {
  appointment_id: string;
  start_at: string;
  end_at: string;
  service: { id: string; name: string } | null;
  staff: { id: string; displayName: string } | null;
  business: { id: string; name: string; slug: string };
}

export default function ReviewPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [info, setInfo] = useState<AppointmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    apiGet<AppointmentInfo>(`/reviews/token/${token}`)
      .then(setInfo)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    if (rating === 0 || !info) return;
    setSubmitting(true);
    try {
      await apiPost("/reviews", {
        appointmentId: info.appointment_id,
        rating,
        body: body.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)] flex items-center justify-center p-6">
        <div className="card max-w-lg w-full p-8 space-y-8">
          {loading ? (
            <p className="small-meta text-[var(--ink-4)] animate-pulse text-center">Loading…</p>
          ) : error ? (
            <div className="text-center space-y-3">
              <GlamrIcon name="x" size={32} className="text-[var(--ink-4)] mx-auto" />
              <p className="text-[var(--ink-3)]">{error}</p>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <GlamrIcon name="check" size={40} className="text-[var(--sage)] mx-auto" />
              <h2 className="text-xl font-medium text-[var(--ink)]">Thank you for your review!</h2>
              <p className="text-[var(--ink-3)] text-[14px]">Your feedback helps other customers find great professionals.</p>
              <button className="btn btn-primary" onClick={() => router.push(`/b/${info?.business.slug ?? ""}`)}>
                Back to {info?.business.name}
              </button>
            </div>
          ) : info ? (
            <>
              <div>
                <p className="small-meta text-[var(--ink-4)] mb-1">Leave a review for</p>
                <h2 className="text-xl font-medium text-[var(--ink)]">{info.business.name}</h2>
                {info.service && <p className="text-[13px] text-[var(--ink-3)] mt-1">{info.service.name}</p>}
              </div>

              {/* Star picker */}
              <div className="space-y-2">
                <p className="text-[12px] font-mono uppercase tracking-wider text-[var(--ink-4)]">Your rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(n)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`${n} star`}
                    >
                      <GlamrIcon
                        name="star"
                        size={28}
                        className={(hoverRating || rating) >= n ? "text-[var(--amber)]" : "text-[var(--line-2)]"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <p className="text-[12px] font-mono uppercase tracking-wider text-[var(--ink-4)]">Tell us more (optional)</p>
                <textarea
                  className="input w-full resize-none"
                  rows={4}
                  placeholder="What did you love? Anything to improve?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
