"use client";

import { GlamrIcon } from "@/components/ui/GlamrIcon";

const TIERS = [
  { name: "Bronze", minPoints: 0, color: "oklch(0.60 0.08 60)" },
  { name: "Silver", minPoints: 500, color: "oklch(0.70 0.03 250)" },
  { name: "Gold", minPoints: 1500, color: "oklch(0.72 0.12 85)" },
  { name: "Platinum", minPoints: 5000, color: "oklch(0.50 0.05 280)" },
];

const REWARDS = [
  { id: "r1", name: "10% off next booking", cost: 200, icon: "percent" as const },
  { id: "r2", name: "Free blow-dry upgrade", cost: 350, icon: "spark" as const },
  { id: "r3", name: "Priority booking access", cost: 500, icon: "calendar" as const },
  { id: "r4", name: "50 lei gift card", cost: 800, icon: "gift" as const },
  { id: "r5", name: "VIP treatment package", cost: 1500, icon: "star" as const },
];

const HISTORY = [
  { date: "Apr 12", desc: "Balayage booking", points: "+92", type: "earned" },
  { date: "Apr 5", desc: "Cut & blow-dry booking", points: "+20", type: "earned" },
  { date: "Mar 28", desc: "Redeemed: 10% off", points: "-200", type: "spent" },
  { date: "Mar 22", desc: "Keratin booking", points: "+65", type: "earned" },
  { date: "Mar 15", desc: "Review bonus", points: "+25", type: "earned" },
  { date: "Mar 10", desc: "Referral bonus", points: "+100", type: "earned" },
];

const currentPoints = 742;
const currentTierIdx = TIERS.findIndex((t, i) => {
  const next = TIERS[i + 1];
  return !next || currentPoints < next.minPoints;
});
const currentTier = TIERS[currentTierIdx];
const nextTier = TIERS[currentTierIdx + 1];

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-display text-[var(--ink)]">Loyalty & rewards</h1>

      {/* Points banner */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: currentTier.color, filter: "blur(40px)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <GlamrIcon name="star" size={16} style={{ color: currentTier.color }} />
            <span className="text-[13px] font-medium" style={{ color: currentTier.color }}>{currentTier.name} member</span>
          </div>
          <p className="text-[40px] font-display text-[var(--ink)] tabular-num">{currentPoints}</p>
          <p className="text-[13px] text-[var(--ink-3)]">glamr points</p>

          {nextTier && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-[var(--ink-4)] mb-1">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} — {nextTier.minPoints - currentPoints} pts away</span>
              </div>
              <div className="w-full h-2 bg-[var(--paper-3)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100}%`,
                    background: currentTier.color,
                  }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tier progression */}
      <div className="flex gap-2">
        {TIERS.map((tier, i) => (
          <div key={tier.name}
            className={`flex-1 card p-3 text-center transition-colors ${i <= currentTierIdx ? "" : "opacity-40"}`}>
            <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
              style={{ background: `color-mix(in oklch, ${tier.color} 15%, var(--card))` }}>
              <GlamrIcon name="star" size={14} style={{ color: tier.color }} />
            </div>
            <p className="text-[12px] font-medium text-[var(--ink)]">{tier.name}</p>
            <p className="text-[10px] text-[var(--ink-4)] tabular-num">{tier.minPoints}+ pts</p>
          </div>
        ))}
      </div>

      {/* Rewards catalog */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Redeem rewards</h2>
        <div className="grid grid-cols-2 gap-3">
          {REWARDS.map((r) => {
            const canAfford = currentPoints >= r.cost;
            return (
              <div key={r.id} className={`card p-4 flex items-center gap-3 ${canAfford ? "" : "opacity-50"}`}>
                <div className="w-10 h-10 rounded-lg bg-[var(--plum-soft)] flex items-center justify-center shrink-0">
                  <GlamrIcon name={r.icon} size={18} className="text-[var(--plum)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--ink)]">{r.name}</p>
                  <p className="text-[11px] text-[var(--ink-4)] tabular-num">{r.cost} points</p>
                </div>
                <button className={`btn btn-sm ${canAfford ? "btn-primary" : "btn-ghost"}`} disabled={!canAfford}>
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points history */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Points history</h2>
        <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
          {HISTORY.map((h, i) => (
            <div key={i} className="flex items-center gap-4 p-3.5">
              <span className="text-[12px] text-[var(--ink-4)] w-14 shrink-0">{h.date}</span>
              <span className="text-[13px] text-[var(--ink)] flex-1">{h.desc}</span>
              <span className={`tabular-num text-[13px] font-medium ${h.type === "earned" ? "text-green-600" : "text-[var(--plum)]"}`}>
                {h.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
