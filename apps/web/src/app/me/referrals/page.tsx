"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

const REFERRAL_CODE = "ELENA-GLAMR";
const REFERRALS = [
  { name: "Ana D.", status: "completed", reward: "50 lei", date: "Mar 20" },
  { name: "Diana V.", status: "completed", reward: "50 lei", date: "Feb 14" },
  { name: "Sofia R.", status: "pending", reward: "—", date: "Apr 10" },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://glamr.ro/r/${REFERRAL_CODE}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-display text-[var(--ink)]">Referrals</h1>

      {/* Hero card */}
      <div className="card p-6 bg-gradient-to-br from-[var(--card)] to-[var(--plum-soft)] relative overflow-hidden">
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-[var(--plum)] opacity-5" />
        <div className="relative">
          <h2 className="text-[18px] font-display text-[var(--ink)] mb-1">
            Give 50 lei, get <span className="italic text-[var(--plum)]">50 lei</span>
          </h2>
          <p className="text-[13px] text-[var(--ink-3)] mb-5 max-w-sm">
            Share your referral link with friends. When they complete their first booking, you both earn 50 lei credit.
          </p>

          {/* Referral link */}
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-sm bg-[var(--paper)] border border-[var(--line-2)] rounded-lg px-4 py-2.5 flex items-center gap-2">
              <GlamrIcon name="share" size={14} className="text-[var(--ink-4)] shrink-0" />
              <span className="text-[13px] text-[var(--ink)] font-mono truncate">glamr.ro/r/{REFERRAL_CODE}</span>
            </div>
            <button onClick={handleCopy} className="btn btn-primary btn-sm">
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">3</p>
          <p className="text-[11px] text-[var(--ink-4)]">Friends invited</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[24px] font-medium text-[var(--plum)] tabular-num">100 lei</p>
          <p className="text-[11px] text-[var(--ink-4)]">Earned so far</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[24px] font-medium text-[var(--ink)] tabular-num">1</p>
          <p className="text-[11px] text-[var(--ink-4)]">Pending</p>
        </div>
      </div>

      {/* Referral list */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Your referrals</h2>
        <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
          {REFERRALS.map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-full bg-[var(--paper-3)] flex items-center justify-center shrink-0">
                <span className="text-[12px] font-medium text-[var(--ink-3)]">{r.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[var(--ink)]">{r.name}</p>
                <p className="text-[11px] text-[var(--ink-4)]">Invited {r.date}</p>
              </div>
              <span className={`badge text-[9px] ${r.status === "completed" ? "badge-sage" : "badge-amber"}`}>
                {r.status === "completed" ? "Completed" : "Pending"}
              </span>
              <span className="tabular-num text-[13px] font-medium text-[var(--ink)] min-w-[60px] text-right">
                {r.reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Share options */}
      <div className="card p-5">
        <h3 className="text-[13px] font-medium text-[var(--ink)] mb-3">Share via</h3>
        <div className="flex gap-2">
          {["WhatsApp", "Instagram", "Email", "SMS"].map((ch) => (
            <button key={ch} className="chip text-[12px]">
              {ch}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
