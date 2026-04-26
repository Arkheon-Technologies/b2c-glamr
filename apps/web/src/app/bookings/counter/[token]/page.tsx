"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

async function apiPost<T>(path: string): Promise<T> {
  const raw = typeof window !== "undefined" ? localStorage.getItem("glamr.auth.session") : null;
  const jwt = raw ? (JSON.parse(raw) as { access_token?: string }).access_token : null;

  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error?.message ?? "Request failed");
  return json.data as T;
}

export default function CounterProposalPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "accepted" | "declined" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAccept() {
    try {
      await apiPost(`/bookings/counter/${token}/accept`);
      setState("accepted");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setState("error");
    }
  }

  async function handleDecline() {
    try {
      await apiPost(`/bookings/counter/${token}/decline`);
      setState("declined");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setState("error");
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)] flex items-center justify-center p-6">
        <div className="card max-w-md w-full p-8 space-y-6 text-center">
          {state === "accepted" ? (
            <>
              <GlamrIcon name="check" size={40} className="text-[var(--sage)] mx-auto" />
              <h2 className="text-xl font-medium text-[var(--ink)]">Booking confirmed!</h2>
              <p className="text-[var(--ink-3)] text-[14px]">The new time has been accepted. Check your bookings for details.</p>
              <button className="btn btn-primary" onClick={() => router.push("/me/bookings")}>My bookings</button>
            </>
          ) : state === "declined" ? (
            <>
              <GlamrIcon name="x" size={40} className="text-[var(--ink-4)] mx-auto" />
              <h2 className="text-xl font-medium text-[var(--ink)]">Booking cancelled</h2>
              <p className="text-[var(--ink-3)] text-[14px]">The counter-proposal was declined and the booking has been cancelled.</p>
              <button className="btn btn-ghost" onClick={() => router.push("/search")}>Find another time</button>
            </>
          ) : state === "error" ? (
            <>
              <GlamrIcon name="x" size={40} className="text-[var(--ink-4)] mx-auto" />
              <p className="text-[var(--ink-3)]">{errorMsg ?? "Something went wrong."}</p>
            </>
          ) : (
            <>
              <GlamrIcon name="calendar" size={40} className="text-[var(--plum)] mx-auto" />
              <h2 className="text-xl font-medium text-[var(--ink)]">Counter-proposal</h2>
              <p className="text-[var(--ink-3)] text-[14px]">
                The business has proposed a new time for your appointment. Would you like to accept or decline?
              </p>
              <div className="flex gap-3 pt-2">
                <button className="btn btn-primary flex-1" onClick={handleAccept}>Accept new time</button>
                <button className="btn btn-ghost flex-1" onClick={handleDecline}>Decline</button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
