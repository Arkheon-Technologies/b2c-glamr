import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

const AMOUNTS = [100, 200, 300, 500];

export default function GiftCardsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-[var(--paper)]">
        {/* Hero */}
        <section className="page-container pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="section-key">— gift cards</p>
            <h1 className="page-title text-[var(--ink)]">
              Give the gift of <em className="italic-plum">beauty</em>
            </h1>
            <p className="text-[var(--ink-3)] text-base md:text-lg leading-relaxed max-w-md mx-auto">
              Send a glamr. gift card to someone special. They can use it at any studio on the platform.
            </p>
          </div>
        </section>

        {/* Amount selection */}
        <section className="page-container pb-16">
          <div className="max-w-lg mx-auto space-y-6">
            <p className="small-meta text-[var(--ink-3)]">— select amount</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AMOUNTS.map((a) => (
                <button key={a} className="card card-hover p-6 text-center">
                  <p className="metric-number text-[28px] text-[var(--ink)]">{a}</p>
                  <p className="text-[11px] text-[var(--ink-4)] mt-1">RON</p>
                </button>
              ))}
            </div>
            <div>
              <label className="small-meta text-[var(--ink-3)] block mb-1.5">Or enter custom amount</label>
              <div className="flex gap-2">
                <input className="input flex-1" type="number" placeholder="Enter amount" min="50" />
                <span className="self-center text-[var(--ink-3)] text-[13px]">RON</span>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery form */}
        <section className="py-16 bg-[var(--paper-2)]">
          <div className="page-container max-w-lg mx-auto space-y-6">
            <p className="small-meta text-[var(--ink-3)]">— delivery details</p>
            <div className="space-y-4">
              <div>
                <label className="small-meta text-[var(--ink-3)] block mb-1.5">Recipient&apos;s name</label>
                <input className="input" placeholder="Their name" />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-3)] block mb-1.5">Recipient&apos;s email</label>
                <input className="input" type="email" placeholder="their@email.com" />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-3)] block mb-1.5">Personal message <span className="text-[var(--ink-4)]">(optional)</span></label>
                <textarea className="input min-h-[80px] resize-none" placeholder="Happy birthday! Treat yourself to something lovely." />
              </div>
              <div>
                <label className="small-meta text-[var(--ink-3)] block mb-1.5">Send date</label>
                <div className="flex gap-3">
                  <button className="chip on">Now</button>
                  <button className="chip">Schedule</button>
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg w-full">
              <GlamrIcon name="gift" size={16} />
              Purchase gift card
            </button>
          </div>
        </section>

        {/* Check balance */}
        <section className="page-container py-16">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h2 className="section-header text-[var(--ink)]">Check your <em className="italic-plum">balance</em></h2>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="Enter gift card code" />
              <button className="btn btn-primary">Check</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
