"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { fetchBusinessProfile, fetchBusinessReviews, fetchQa, askQuestion, type BusinessProfile, type ReviewItem, type ReviewsSummary, type QaThread } from "@/lib/mvp-api";

/* ─── Helpers ──────────────────────────────────────────────────────── */
function formatMoney(cents: number | null, maxCents: number | null, currency: string) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "RON",
      minimumFractionDigits: 0,
    }).format(v / 100);

  if (cents != null && maxCents != null && cents !== maxCents)
    return `${fmt(cents)} – ${fmt(maxCents)}`;
  if (cents != null) return fmt(cents);
  if (maxCents != null) return `From ${fmt(maxCents)}`;
  return "On consultation";
}

function formatDuration(a: number, p: number, f: number) {
  const total = a + p + f;
  if (total < 60) return `${total}min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

/* ─── Tab definitions ──────────────────────────────────────────────── */
type TabId = "services" | "team" | "reviews" | "about" | "qa";
const TABS: { id: TabId; label: string }[] = [
  { id: "services", label: "Services & prices" },
  { id: "team", label: "Team" },
  { id: "reviews", label: "Reviews" },
  { id: "about", label: "About" },
  { id: "qa", label: "Q&A" },
];

/* ─── Mock data for tabs without API ───────────────────────────────── */

const MOCK_QA = [
  { id: "1", question: "Do you accept walk-ins?", author: "Guest", answer: "We primarily work by appointment, but we do accept walk-ins when availability allows. Book online to guarantee your slot!", answeredBy: "Studio owner", date: "3 weeks ago" },
  { id: "2", question: "Is parking available nearby?", author: "Diana R.", answer: "Yes! There's a public parking garage just 50m from the studio, and street parking is usually available on weekday mornings.", answeredBy: "Studio owner", date: "1 month ago" },
];

const MOCK_HOURS = [
  { day: "Monday", hours: "09:00 – 19:00" },
  { day: "Tuesday", hours: "09:00 – 19:00" },
  { day: "Wednesday", hours: "09:00 – 20:00" },
  { day: "Thursday", hours: "09:00 – 20:00" },
  { day: "Friday", hours: "09:00 – 19:00" },
  { day: "Saturday", hours: "10:00 – 17:00" },
  { day: "Sunday", hours: "Closed" },
];

/* ─── Tab Content Components ───────────────────────────────────────── */

function ServicesTab({ business }: { business: BusinessProfile }) {
  // Group services by vertical
  const grouped = business.services.reduce<Record<string, typeof business.services>>(
    (acc, s) => {
      const cat = s.vertical?.name ?? "Other";
      (acc[cat] ??= []).push(s);
      return acc;
    }, {}
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, services]) => (
        <div key={category}>
          <h3 className="small-meta text-[var(--ink-3)] mb-3">— {category.toLowerCase()}</h3>
          <div className="space-y-1">
            {services.map((service) => (
              <div
                key={service.id}
                className="card p-5 flex items-center justify-between gap-4 hover:bg-[var(--paper-2)] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-[15px] font-medium text-[var(--ink)]">{service.name}</h4>
                  {service.description && (
                    <p className="text-[13px] text-[var(--ink-3)] mt-0.5 line-clamp-1">{service.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <p className="tabular-num text-[14px] font-medium text-[var(--ink)]">
                      {formatMoney(service.price_cents, service.price_max_cents, service.currency)}
                    </p>
                    <p className="text-[11px] text-[var(--ink-4)]">
                      {formatDuration(service.duration_active_min, service.duration_processing_min, service.duration_finish_min)}
                    </p>
                  </div>
                  <Link
                    href={`/book/${service.id}`}
                    className="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {business.services.length === 0 && (
        <p className="text-[var(--ink-3)] text-[14px]">No services listed yet.</p>
      )}
    </div>
  );
}

function TeamTab({ business }: { business: BusinessProfile }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {business.staff.map((member) => (
        <div key={member.id} className="card p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--paper-3)] placeholder flex items-center justify-center shrink-0">
            <span className="text-[14px] font-medium text-[var(--ink-3)]">
              {member.display_name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[15px] font-medium text-[var(--ink)]">{member.display_name}</h4>
            <p className="text-[12px] text-[var(--ink-3)] capitalize">{member.role.replace("_", " ")}</p>
            {member.avg_rating != null && (
              <div className="flex items-center gap-1 mt-2">
                <GlamrIcon name="star" size={12} className="text-[var(--amber)]" />
                <span className="tabular-num text-[12px] text-[var(--ink-2)]">
                  {member.avg_rating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-[var(--sage)]">
              <GlamrIcon name="clock" size={11} />
              <span className="text-[11px] font-medium">Next: Today, 15:30</span>
            </div>
          </div>
        </div>
      ))}
      {business.staff.length === 0 && (
        <p className="text-[var(--ink-3)] text-[14px]">No team members listed yet.</p>
      )}
    </div>
  );
}

function ReviewsTab({ data }: { data: { reviews: ReviewItem[]; summary: ReviewsSummary } | null }) {
  if (!data || data.reviews.length === 0) {
    return <p className="text-[var(--ink-3)] text-[14px]">No reviews yet.</p>;
  }

  const { summary, reviews } = data;
  const avgRating = summary.avg_overall.toFixed(1);

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="text-center">
          <p className="metric-number text-[var(--ink)] text-[48px]">{avgRating}</p>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <GlamrIcon key={s} name="star" size={14} className={s <= Math.round(Number(avgRating)) ? "text-[var(--amber)]" : "text-[var(--ink-4)]"} />
            ))}
          </div>
          <p className="text-[11px] text-[var(--ink-3)] mt-1">{summary.total_reviews} reviews</p>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["skill", "cleanliness", "value"] as const).map((cat) => {
            const avgKey = `avg_${cat}` as keyof ReviewsSummary;
            const avg = Number(summary[avgKey] ?? 0).toFixed(1);
            return (
              <div key={cat} className="text-center">
                <p className="tabular-num text-[16px] font-medium text-[var(--ink)]">{avg}</p>
                <p className="small-meta text-[var(--ink-4)] text-[8px] mt-0.5">{cat}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--paper-3)] flex items-center justify-center overflow-hidden">
                  {review.customer_avatar ? (
                    <img src={review.customer_avatar} alt={review.customer_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[12px] font-medium text-[var(--ink-3)]">{review.customer_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--ink)]">{review.customer_name}</p>
                  <p className="text-[11px] text-[var(--ink-4)]">
                    {new Date(review.created_at).toLocaleDateString()} · {review.service_name ?? 'Service'}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <GlamrIcon key={s} name="star" size={12} className={s <= review.rating_overall ? "text-[var(--amber)]" : "text-[var(--ink-4)]"} />
                ))}
              </div>
            </div>
            <p className="text-[14px] text-[var(--ink-2)] leading-relaxed">{review.text}</p>
            {review.business_response && (
              <div className="mt-3 pl-4 border-l-2 border-[var(--line)]">
                <p className="text-[12px] font-medium text-[var(--ink)] mb-1">Business owner</p>
                <p className="text-[13px] text-[var(--ink-3)]">{review.business_response}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutTab({ business }: { business: BusinessProfile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-[16px] font-medium text-[var(--ink)] mb-3">About</h3>
          <p className="text-[14px] text-[var(--ink-2)] leading-relaxed">
            {business.about || "This studio hasn't added a description yet."}
          </p>
        </div>
        {/* Amenities placeholder */}
        <div>
          <h3 className="text-[16px] font-medium text-[var(--ink)] mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {["Free Wi-Fi", "Accessible", "Card payments", "Air conditioned", "Complimentary drinks"].map((a) => (
              <span key={a} className="pill">{a}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Hours + Location sidebar */}
      <div className="space-y-6">
        <div className="card p-5">
          <h3 className="small-meta text-[var(--ink-3)] mb-3">— opening hours</h3>
          <div className="space-y-2">
            {MOCK_HOURS.map((h) => (
              <div key={h.day} className="flex justify-between text-[13px]">
                <span className="text-[var(--ink-2)]">{h.day}</span>
                <span className={`tabular-num ${h.hours === "Closed" ? "text-[var(--ink-4)]" : "text-[var(--ink)]"}`}>
                  {h.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="small-meta text-[var(--ink-3)] mb-3">— location</h3>
          {business.location && (
            <div className="space-y-2">
              <p className="text-[13px] text-[var(--ink)]">
                {business.location.neighborhood && `${business.location.neighborhood}, `}{business.location.city}
              </p>
              {/* Map placeholder */}
              <div className="aspect-[16/9] bg-[var(--paper-3)] rounded-lg placeholder flex items-center justify-center">
                <GlamrIcon name="pin" size={24} className="text-[var(--ink-4)]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QATab({ slug }: { slug: string }) {
  const [threads, setThreads] = useState<QaThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQa(slug)
      .then((res) => setThreads(res.threads))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAsk() {
    if (!question.trim() || submitting) return;
    setSubmitting(true);
    try {
      const thread = await askQuestion(slug, question.trim());
      setThreads((prev) => [thread, ...prev]);
      setQuestion("");
    } catch {
      // silently fail — user not logged in or question too short
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="small-meta text-[var(--ink-4)] animate-pulse py-8">Loading Q&A…</p>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {threads.length === 0 && (
        <p className="text-[13px] text-[var(--ink-3)] py-4">No questions yet — be the first to ask.</p>
      )}
      {threads.map((qa) => (
        <div key={qa.id} className="card p-5 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GlamrIcon name="message" size={14} className="text-[var(--plum)]" />
              <span className="text-[11px] text-[var(--ink-4)]">
                {new Date(qa.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p className="text-[15px] font-medium text-[var(--ink)]">{qa.question}</p>
          </div>
          {qa.answers.map((a) => (
            <div key={a.id} className="pl-5 border-l-2 border-[var(--plum-soft)]">
              <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">{a.answer}</p>
              <p className="text-[10px] text-[var(--ink-4)] mt-1.5 font-mono uppercase tracking-wider">Staff reply</p>
            </div>
          ))}
        </div>
      ))}

      {/* Ask a question */}
      <div className="card p-4 space-y-3 mt-4">
        <p className="text-[12px] font-mono uppercase tracking-wider text-[var(--ink-4)]">Ask a question</p>
        <textarea
          className="input w-full resize-none text-[14px]"
          rows={3}
          placeholder="What would you like to know?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleAsk}
          disabled={submitting || !question.trim()}
        >
          {submitting ? "Sending…" : "Send question"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function BusinessProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [reviewsData, setReviewsData] = useState<{ reviews: ReviewItem[]; summary: ReviewsSummary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("services");

  useEffect(() => {
    Promise.all([
      fetchBusinessProfile(slug),
      fetchBusinessReviews(slug)
    ])
      .then(([bizRes, revRes]) => {
        setBusiness(bizRes);
        setReviewsData(revRes);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Business not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Fallback data for demo
  const biz: BusinessProfile = business ?? {
    id: "demo", name: "Sala Studio", slug: slug, description: "Premium hair salon",
    about: "Sala Studio is a boutique hair salon in the heart of Bucharest, specializing in balayage, colour correction, and precision cutting. Founded in 2018, we've built a reputation for editorial-quality results in an intimate, welcoming setting. Every visit begins with a consultation so we can truly understand your hair goals.",
    logo_url: null, cover_image_url: null, is_verified: true, total_bookings: 1247,
    location: { city: "Bucharest", neighborhood: "Floreasca", countryCode: "RO" },
    services: [
      { id: "s1", name: "Balayage", description: "Hand-painted highlights for a natural, sun-kissed effect", price_cents: 92000, price_max_cents: null, currency: "RON", duration_active_min: 120, duration_processing_min: 45, duration_finish_min: 15, vertical: { slug: "hair", name: "Colour" } },
      { id: "s2", name: "Cut & blow-dry", description: "Precision cut with a professional blow-dry finish", price_cents: 18000, price_max_cents: null, currency: "RON", duration_active_min: 45, duration_processing_min: 0, duration_finish_min: 15, vertical: { slug: "hair", name: "Cut" } },
      { id: "s3", name: "Full colour", description: "Root-to-tip single process colour", price_cents: 35000, price_max_cents: 55000, currency: "RON", duration_active_min: 30, duration_processing_min: 30, duration_finish_min: 15, vertical: { slug: "hair", name: "Colour" } },
      { id: "s4", name: "Olaplex treatment", description: "Bond-building repair treatment for damaged hair", price_cents: 25000, price_max_cents: null, currency: "RON", duration_active_min: 30, duration_processing_min: 20, duration_finish_min: 10, vertical: { slug: "hair", name: "Treatments" } },
      { id: "s5", name: "Bridal styling", description: "Trial + day-of styling for your special day", price_cents: 120000, price_max_cents: null, currency: "RON", duration_active_min: 90, duration_processing_min: 0, duration_finish_min: 30, vertical: { slug: "hair", name: "Styling" } },
    ],
    staff: [
      { id: "t1", display_name: "Ana Sala", role: "senior_stylist", avg_rating: 4.9 },
      { id: "t2", display_name: "Mara Ionescu", role: "colour_specialist", avg_rating: 4.8 },
      { id: "t3", display_name: "Cristina Avram", role: "junior_stylist", avg_rating: 4.6 },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="small-meta text-[var(--ink-4)] animate-pulse">Loading…</p>
          </div>
        ) : (
          <>
            {/* ── Hero gallery placeholder ──────────────────────── */}
            <div className="page-container pt-6 pb-0">
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[340px] rounded-xl overflow-hidden">
                <div className="col-span-2 row-span-2 bg-[var(--paper-3)] placeholder relative group cursor-pointer">
                  <span className="absolute bottom-3 left-3 badge badge-ink">
                    <GlamrIcon name="camera" size={10} />
                    View all photos
                  </span>
                </div>
                <div className="bg-[var(--paper-3)] placeholder" />
                <div className="bg-[var(--paper-3)] placeholder" />
                <div className="bg-[var(--paper-3)] placeholder" />
                <div className="bg-[var(--paper-3)] placeholder" />
              </div>
            </div>

            {/* ── Header ────────────────────────────────────────── */}
            <div className="page-container pt-8 pb-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {biz.is_verified && (
                      <span className="badge badge-sage">
                        <GlamrIcon name="shield" size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <h1 className="page-title text-[var(--ink)] text-[40px] mt-2">
                    {biz.name.split(" ").map((w, i) =>
                      i === biz.name.split(" ").length - 1
                        ? <em key={i} className="italic-plum">{w}</em>
                        : <span key={i}>{w} </span>
                    )}
                  </h1>
                  {biz.location && (
                    <p className="flex items-center gap-1.5 text-[var(--ink-3)] text-[14px] mt-2">
                      <GlamrIcon name="pin" size={14} />
                      {biz.location.neighborhood && `${biz.location.neighborhood}, `}{biz.location.city}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <GlamrIcon name="star" size={14} className="text-[var(--amber)]" />
                      <span className="tabular-num text-[15px] font-medium text-[var(--ink)]">4.9</span>
                      <span className="text-[13px] text-[var(--ink-3)]">(142 reviews)</span>
                    </div>
                    <span className="text-[var(--line)]">·</span>
                    <span className="text-[13px] text-[var(--ink-3)]">{biz.services.length} services</span>
                    <span className="text-[var(--line)]">·</span>
                    <span className="text-[13px] text-[var(--ink-3)]">{biz.staff.length} team members</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="btn btn-ghost btn-sm">
                      <GlamrIcon name="heart" size={14} /> Save
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <GlamrIcon name="share" size={14} /> Share
                    </button>
                  </div>
                </div>

                {/* Right: sticky booking sidebar */}
                <div className="w-full lg:w-[320px] shrink-0">
                  <div className="card p-5 space-y-4 lg:sticky lg:top-20">
                    <p className="small-meta text-[var(--ink-3)]">— next available</p>
                    <div className="flex items-center gap-2">
                      <GlamrIcon name="clock" size={15} className="text-[var(--sage)]" />
                      <span className="text-[15px] font-medium text-[var(--ink)]">Today, 16:30</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {["16:30", "17:00", "17:30", "18:00"].map((time) => (
                        <button key={time} className="chip text-center justify-center py-2">
                          {time}
                        </button>
                      ))}
                    </div>
                    <Link href={`/book/${biz.services[0]?.id ?? biz.slug}`} className="btn btn-primary w-full">
                      Continue to booking
                    </Link>
                    {/* Mini map */}
                    <div className="aspect-[16/9] bg-[var(--paper-3)] rounded-lg placeholder flex items-center justify-center">
                      <GlamrIcon name="pin" size={20} className="text-[var(--ink-4)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────────── */}
            <div className="border-b border-[var(--line)] sticky top-14 z-10 bg-[var(--paper)]">
              <div className="page-container">
                <div className="tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tab content ───────────────────────────────────── */}
            <div className="page-container py-8">
              {activeTab === "services" && <ServicesTab business={biz} />}
              {activeTab === "team" && <TeamTab business={biz} />}
              {activeTab === "reviews" && <ReviewsTab data={reviewsData} />}
              {activeTab === "about" && <AboutTab business={biz} />}
              {activeTab === "qa" && <QATab slug={slug} />}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
