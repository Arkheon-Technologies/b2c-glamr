"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import {
  createBooking, fetchAvailability, fetchServiceById,
  type AvailableSlot, type ServiceDetails,
} from "@/lib/mvp-api";
import { getStoredSession, isSessionExpired } from "@/lib/auth-client";

/* ─── Helpers ──────────────────────────────────────────────────────── */
function fmtMoney(c: number | null, cur: string) {
  if (c == null) return "On consultation";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, minimumFractionDigits: 0 }).format(c / 100);
}
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

/* ─── Steps ────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;
const STEP_LABELS = ["Service", "Staff", "Date & time", "Details", "Confirm"];

/* ─── Mock staff for demo ──────────────────────────────────────────── */
const DEMO_STAFF = [
  { id: "t1", name: "Ana Sala", role: "Senior stylist", rating: 4.9, img: null },
  { id: "t2", name: "Mara Ionescu", role: "Colour specialist", rating: 4.8, img: null },
  { id: "t3", name: "Cristina Avram", role: "Junior stylist", rating: 4.6, img: null },
];

const DEMO_SLOTS: AvailableSlot[] = [
  { staffId: "t1", staffName: "Ana Sala", startAt: `${today()}T09:00:00Z`, endAt: `${today()}T11:00:00Z`, phases: [], priceCents: 92000, currency: "RON", available: true },
  { staffId: "t1", staffName: "Ana Sala", startAt: `${today()}T11:30:00Z`, endAt: `${today()}T13:30:00Z`, phases: [], priceCents: 92000, currency: "RON", available: true },
  { staffId: "t2", staffName: "Mara Ionescu", startAt: `${today()}T14:00:00Z`, endAt: `${today()}T16:00:00Z`, phases: [], priceCents: 92000, currency: "RON", available: true },
  { staffId: "t3", staffName: "Cristina Avram", startAt: `${today()}T10:00:00Z`, endAt: `${today()}T12:00:00Z`, phases: [], priceCents: 92000, currency: "RON", available: true },
];

export default function BookServicePage() {
  const params = useParams<{ serviceId: string }>();
  const router = useRouter();
  const serviceId = Array.isArray(params.serviceId) ? params.serviceId[0] : params.serviceId;

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(today());
  const [loadingService, setLoadingService] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [fetchSlotsError, setFetchSlotsError] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Wizard state
  const [step, setStep] = useState<Step>(1);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Demo service fallback
  const svc: ServiceDetails = service ?? {
    id: serviceId, business_id: "demo", location_id: null, name: "Balayage",
    description: "Hand-painted highlights for a natural, sun-kissed effect. Includes wash, treatment, and blow-dry.",
    currency: "RON", price_type: "fixed", price_cents: 92000, price_max_cents: null,
    duration_active_min: 120, duration_processing_min: 45, duration_finish_min: 15,
    patch_test_required: false, consultation_required: false, booking_notice_hours: 2,
    rebooking_interval_days: null, photo_urls: [],
    business: { id: "demo", name: "Sala Studio", slug: "sala-studio", isVerified: true },
    staff: DEMO_STAFF.map(s => ({ id: s.id, displayName: s.name, isActive: true })),
  };

  const totalMin = useMemo(() => svc.duration_active_min + svc.duration_processing_min + svc.duration_finish_min, [svc]);

  useEffect(() => {
    fetchServiceById(serviceId).then(setService).catch(() => {}).finally(() => setLoadingService(false));
  }, [serviceId]);

  useEffect(() => {
    setLoadingSlots(true);
    setFetchSlotsError(false);
    fetchAvailability(serviceId, selectedDate)
      .then(setSlots)
      .catch(() => { setSlots([]); setFetchSlotsError(true); })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, serviceId]);

  const displaySlots = (slots.length === 0 && (serviceId === "demo" || fetchSlotsError)) 
    ? DEMO_SLOTS.filter(s => s.startAt.startsWith(selectedDate)) 
    : slots;

  async function handleConfirm() {
    const session = getStoredSession();
    if (!session || isSessionExpired()) { router.push(`/auth/login?next=/book/${serviceId}`); return; }
    if (!selectedSlot) return;
    setSubmitting(selectedSlot.startAt); setError("");
    try {
      const res = await createBooking({ service_id: serviceId, staff_id: selectedSlot.staffId, start_at: selectedSlot.startAt });
      router.push(`/book/confirmation/${res.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Booking failed"); } finally { setSubmitting(null); }
  }

  // Generate 7-day strip
  const weekDates = useMemo(() => {
    const dates: { date: string; label: string; day: string }[] = [];
    const base = new Date(); base.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base); d.setDate(d.getDate() + i);
      dates.push({
        date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
        label: d.toLocaleDateString("en-GB", { weekday: "short" }),
        day: String(d.getDate()),
      });
    }
    return dates;
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)]">
        <div className="page-container py-8">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as Step;
              const active = s === step;
              const done = s < step;
              return (
                <button key={label} onClick={() => s < step && setStep(s)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${active ? "bg-[var(--ink)] text-[var(--paper)]" : done ? "bg-[var(--paper-2)] text-[var(--ink)]" : "text-[var(--ink-4)]"}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${active ? "bg-[var(--paper)] text-[var(--ink)]" : done ? "bg-[var(--sage)] text-white" : "bg-[var(--paper-3)] text-[var(--ink-4)]"}`}>
                    {done ? "✓" : s}
                  </span>
                  {label}
                  {i < STEP_LABELS.length - 1 && <span className="text-[var(--ink-4)] ml-2">→</span>}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="card border-[var(--error)] bg-red-50 p-4 text-[13px] text-red-700 mb-6">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* ── Left: step content ────────────────────────────── */}
            <div>
              {/* Step 1: Service confirmation */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="section-header text-[var(--ink)]">Confirm <em className="italic-plum">service</em></h2>
                  <div className="card p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="small-meta text-[var(--ink-3)] mb-1">{svc.business.name}</p>
                        <h3 className="text-[20px] font-medium text-[var(--ink)]">{svc.name}</h3>
                        <p className="text-[13px] text-[var(--ink-3)] mt-1 max-w-md">{svc.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="metric-number text-[24px] text-[var(--ink)]">{fmtMoney(svc.price_cents, svc.currency)}</p>
                        <p className="text-[12px] text-[var(--ink-4)]">{totalMin} min</p>
                      </div>
                    </div>
                    {(svc.patch_test_required || svc.consultation_required) && (
                      <div className="flex gap-2">
                        {svc.patch_test_required && <span className="badge badge-amber">Patch test required</span>}
                        {svc.consultation_required && <span className="badge badge-plum">Consultation required</span>}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>
                    Choose staff <GlamrIcon name="arrow" size={14} />
                  </button>
                </div>
              )}

              {/* Step 2: Staff selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="section-header text-[var(--ink)]">Choose your <em className="italic-plum">stylist</em></h2>
                  <div className="space-y-2">
                    <button onClick={() => { setSelectedStaff(null); setStep(3); }}
                      className={`card card-hover p-5 w-full text-left flex items-center gap-4 ${!selectedStaff ? "ring-2 ring-[var(--plum)]" : ""}`}>
                      <div className="w-12 h-12 rounded-full bg-[var(--paper-3)] flex items-center justify-center">
                        <GlamrIcon name="user" size={18} className="text-[var(--ink-3)]" />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-[var(--ink)]">Any available</p>
                        <p className="text-[12px] text-[var(--ink-3)]">We'll match you with the first available professional</p>
                      </div>
                    </button>
                    {svc.staff.map((s) => {
                      const demoS = DEMO_STAFF.find(d => d.id === s.id);
                      return (
                      <button key={s.id} onClick={() => { setSelectedStaff(s.id); setStep(3); }}
                        className={`card card-hover p-5 w-full text-left flex items-center gap-4 ${selectedStaff === s.id ? "ring-2 ring-[var(--plum)]" : ""}`}>
                        <div className="w-12 h-12 rounded-full bg-[var(--paper-3)] placeholder flex items-center justify-center shrink-0">
                          <span className="text-[14px] font-medium text-[var(--ink-3)]">{s.displayName.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] font-medium text-[var(--ink)]">{s.displayName}</p>
                          <p className="text-[12px] text-[var(--ink-3)]">{demoS?.role ?? "Stylist"}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <GlamrIcon name="star" size={12} className="text-[var(--amber)]" />
                          <span className="tabular-num text-[13px] text-[var(--ink-2)]">{demoS?.rating ?? "5.0"}</span>
                        </div>
                      </button>
                    )})}
                  </div>
                </div>
              )}

              {/* Step 3: Date & time */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="section-header text-[var(--ink)]">Pick a <em className="italic-plum">time</em></h2>
                  {/* Week strip */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {weekDates.map((d) => (
                      <button key={d.date} onClick={() => setSelectedDate(d.date)}
                        className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[60px] transition-colors ${d.date === selectedDate ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper-2)] text-[var(--ink-2)] hover:bg-[var(--paper-3)]"}`}>
                        <span className="text-[10px] font-mono uppercase">{d.label}</span>
                        <span className="text-[18px] font-medium mt-0.5">{d.day}</span>
                      </button>
                    ))}
                  </div>
                  {/* Slots grid */}
                  {loadingSlots ? (
                    <p className="small-meta text-[var(--ink-4)] animate-pulse py-8 text-center">Loading slots…</p>
                  ) : displaySlots.length === 0 ? (
                    <div className="card p-8 text-center">
                      <p className="text-[var(--ink-3)] text-[14px]">No slots available on this date</p>
                      <p className="text-[var(--ink-4)] text-[12px] mt-1">Try another day or check back later</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {displaySlots.map((slot) => (
                        <button key={`${slot.staffId}-${slot.startAt}`}
                          onClick={() => { setSelectedSlot(slot); setStep(4); }}
                          className={`chip justify-center py-3 ${selectedSlot?.startAt === slot.startAt && selectedSlot?.staffId === slot.staffId ? "on" : ""}`}>
                          <span className="tabular-num text-[13px]">{fmtTime(slot.startAt)}</span>
                          <span className="text-[9px] text-[var(--ink-4)] block">{slot.staffName.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Details */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="section-header text-[var(--ink)]">Your <em className="italic-plum">details</em></h2>
                  <div className="card p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="small-meta text-[var(--ink-3)] block mb-1.5">Full name</label>
                        <input className="input" placeholder="Jane Smith" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                      </div>
                      <div>
                        <label className="small-meta text-[var(--ink-3)] block mb-1.5">Email</label>
                        <input className="input" type="email" placeholder="jane@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="small-meta text-[var(--ink-3)] block mb-1.5">Phone</label>
                      <input className="input" type="tel" placeholder="+40 7XX XXX XXX" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="small-meta text-[var(--ink-3)] block mb-1.5">Notes for your stylist <span className="text-[var(--ink-4)]">(optional)</span></label>
                      <textarea className="input min-h-[80px] resize-none" placeholder="Anything you'd like us to know…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => setStep(5)}>
                    Review booking <GlamrIcon name="arrow" size={14} />
                  </button>
                </div>
              )}

              {/* Step 5: Confirm */}
              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="section-header text-[var(--ink)]">Confirm <em className="italic-plum">booking</em></h2>
                  <div className="card p-6 space-y-4">
                    <div className="space-y-3">
                      {[
                        ["Service", svc.name],
                        ["Studio", svc.business.name],
                        ["Stylist", selectedStaff ? svc.staff.find(s => s.id === selectedStaff)?.displayName ?? "Any available" : "Any available"],
                        ["Date", selectedSlot ? new Date(selectedSlot.startAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "—"],
                        ["Time", selectedSlot ? `${fmtTime(selectedSlot.startAt)} – ${fmtTime(selectedSlot.endAt)}` : "—"],
                        ["Duration", `${totalMin} min`],
                        ["Price", fmtMoney(svc.price_cents, svc.currency)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[14px]">
                          <span className="text-[var(--ink-3)]">{k}</span>
                          <span className="text-[var(--ink)] font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                    {notes && (
                      <div className="pt-3 border-t border-[var(--line-2)]">
                        <p className="small-meta text-[var(--ink-4)] mb-1">Notes</p>
                        <p className="text-[13px] text-[var(--ink-2)]">{notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="card p-5 space-y-3 bg-[var(--paper-2)]">
                    <p className="text-[12px] text-[var(--ink-3)]">
                      By confirming, you agree to the <Link href="/terms" className="underline">terms of service</Link> and
                      the studio&apos;s <span className="font-medium">cancellation policy</span> (free cancellation up to 24h before).
                    </p>
                  </div>
                  <button className="btn btn-primary btn-lg w-full" onClick={handleConfirm} disabled={!!submitting}>
                    {submitting ? "Booking…" : "Confirm & book"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: persistent summary sidebar ─────────────── */}
            <aside className="hidden lg:block">
              <div className="card p-5 space-y-4 sticky top-20">
                <p className="small-meta text-[var(--ink-3)]">— booking summary</p>
                <div className="space-y-2">
                  <h3 className="text-[16px] font-medium text-[var(--ink)]">{svc.name}</h3>
                  <p className="text-[12px] text-[var(--ink-3)]">{svc.business.name}</p>
                </div>
                <hr className="divider" />
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--ink-3)]">Duration</span>
                    <span className="text-[var(--ink)]">{totalMin} min</span>
                  </div>
                  {selectedStaff && (
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-3)]">Stylist</span>
                      <span className="text-[var(--ink)]">{svc.staff.find(s => s.id === selectedStaff)?.displayName}</span>
                    </div>
                  )}
                  {selectedSlot && (
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-3)]">Time</span>
                      <span className="text-[var(--ink)]">{fmtTime(selectedSlot.startAt)}</span>
                    </div>
                  )}
                </div>
                <hr className="divider" />
                <div className="flex justify-between text-[15px] font-medium">
                  <span className="text-[var(--ink)]">Total</span>
                  <span className="text-[var(--ink)]">{fmtMoney(svc.price_cents, svc.currency)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}