"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

async function claimSlot(token: string): Promise<{ appointment_id: string; redirect_url?: string }> {
  const raw = typeof window !== "undefined" ? localStorage.getItem("glamr.auth.session") : null;
  const jwt = raw ? (JSON.parse(raw) as { access_token?: string }).access_token : null;

  const res = await fetch(`${apiBase}/waitlist/${token}/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({ token }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error?.message ?? "Offer unavailable");
  return json.data as { appointment_id: string; redirect_url?: string };
}

export default function WaitlistClaimPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    claimSlot(token)
      .then((data) => {
        setState("success");
        // Redirect to booking confirmation or pre-filled booking step
        const dest = data.redirect_url ?? "/me/bookings";
        setTimeout(() => router.push(dest), 1800);
      })
      .catch((err: Error) => {
        setState("error");
        setErrorMsg(err.message);
      });
  }, [token, router]);

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)] flex items-center justify-center p-6">
        <div className="card max-w-sm w-full p-8 space-y-5 text-center">
          {state === "loading" && (
            <>
              <p className="small-meta text-[var(--ink-4)] animate-pulse">Claiming your slot…</p>
            </>
          )}
          {state === "success" && (
            <>
              <GlamrIcon name="check" size={40} className="text-[var(--sage)] mx-auto" />
              <h2 className="text-xl font-medium text-[var(--ink)]">Slot claimed!</h2>
              <p className="text-[13px] text-[var(--ink-3)]">Redirecting to complete your booking…</p>
            </>
          )}
          {state === "error" && (
            <>
              <GlamrIcon name="x" size={40} className="text-[var(--ink-4)] mx-auto" />
              <h2 className="text-lg font-medium text-[var(--ink)]">Offer expired</h2>
              <p className="text-[13px] text-[var(--ink-3)]">{errorMsg ?? "This waitlist offer is no longer available."}</p>
              <button className="btn btn-ghost" onClick={() => router.push("/search")}>
                Find another time
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
