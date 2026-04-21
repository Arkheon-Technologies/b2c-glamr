"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStudio } from "@/lib/studio-context";
import { getStaffSchedule, setStaffScheduleDay, type ScheduleDay } from "@/lib/mvp-api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StaffSchedulePage() {
  const { id: staffId } = useParams<{ id: string }>();
  const router = useRouter();
  const { businessId, business, loading: ctxLoading } = useStudio();

  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null); // dayOfWeek being saved
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctxLoading && !businessId) {
      router.replace("/studio/onboarding");
      return;
    }
    if (businessId && staffId) {
      loadSchedule();
    }
  }, [businessId, ctxLoading, staffId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSchedule() {
    setLoading(true);
    try {
      const days = await getStaffSchedule(staffId);
      setSchedule(days);
    } catch {
      setError("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

  function updateDay(dayOfWeek: number, field: keyof ScheduleDay, value: string | boolean) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)),
    );
  }

  async function saveDay(day: ScheduleDay) {
    setSaving(day.dayOfWeek);
    setError(null);
    try {
      await setStaffScheduleDay({
        staffId,
        businessId: day.businessId,
        dayOfWeek: day.dayOfWeek,
        openTime: day.openTime,
        closeTime: day.closeTime,
        isOpen: day.isOpen,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  const inputClass =
    "bg-transparent border border-outline-variant/60 px-3 py-2 font-body text-sm text-primary focus:outline-none focus:border-primary-fixed transition-colors w-24";

  if (ctxLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="font-label text-[9px] uppercase tracking-widest text-primary/30 hover:text-primary/60 mb-4 block transition-colors"
        >
          ← Back to staff
        </button>
        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
          {business?.name}
        </p>
        <h1 className="font-headline font-black text-3xl tracking-tight text-primary">
          Weekly Schedule
        </h1>
        <p className="font-body text-sm text-primary/50 mt-1">
          Set working hours for each day of the week.
        </p>
      </div>

      {error && (
        <p className="font-label text-[10px] uppercase tracking-widest text-error mb-4">{error}</p>
      )}

      <div className="divide-y divide-outline-variant/20 border border-outline-variant/30">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className="flex items-center gap-4 px-5 py-4 bg-surface-container-lowest hover:bg-surface-container transition-colors"
          >
            {/* Day label */}
            <div className="w-24 shrink-0">
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-primary">
                {DAYS[day.dayOfWeek]}
              </p>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => updateDay(day.dayOfWeek, "isOpen", !day.isOpen)}
              className={[
                "font-label text-[9px] uppercase tracking-widest border px-3 py-1.5 transition-colors w-16 text-center shrink-0",
                day.isOpen
                  ? "text-green-600 border-green-300 hover:border-green-500"
                  : "text-primary/30 border-outline-variant/30 hover:border-primary/30",
              ].join(" ")}
            >
              {day.isOpen ? "Open" : "Closed"}
            </button>

            {/* Time inputs */}
            {day.isOpen ? (
              <>
                <input
                  type="time"
                  value={day.openTime}
                  onChange={(e) => updateDay(day.dayOfWeek, "openTime", e.target.value)}
                  className={inputClass}
                />
                <span className="font-label text-[9px] uppercase tracking-widest text-primary/30">
                  to
                </span>
                <input
                  type="time"
                  value={day.closeTime}
                  onChange={(e) => updateDay(day.dayOfWeek, "closeTime", e.target.value)}
                  className={inputClass}
                />
              </>
            ) : (
              <p className="font-label text-[9px] uppercase tracking-widest text-primary/20 flex-1">
                Not working
              </p>
            )}

            {/* Save button */}
            <button
              type="button"
              onClick={() => saveDay(day)}
              disabled={saving === day.dayOfWeek}
              className="ml-auto font-label text-[9px] uppercase tracking-widest border border-outline-variant/30 hover:border-primary-fixed text-primary/50 hover:text-primary-fixed px-3 py-1.5 transition-colors disabled:opacity-40 shrink-0"
            >
              {saving === day.dayOfWeek ? "Saving…" : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
