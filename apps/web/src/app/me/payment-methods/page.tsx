"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

type Card = { id: string; brand: string; last4: string; expiry: string; isDefault: boolean };

const DEMO_CARDS: Card[] = [
  { id: "pm1", brand: "Visa", last4: "4242", expiry: "08/27", isDefault: true },
  { id: "pm2", brand: "Mastercard", last4: "8888", expiry: "03/26", isDefault: false },
];

const BRAND_COLORS: Record<string, string> = {
  Visa: "oklch(0.55 0.15 250)",
  Mastercard: "oklch(0.60 0.18 30)",
};

export default function PaymentMethodsPage() {
  const [cards] = useState(DEMO_CARDS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Payment methods</h1>
        <button className="btn btn-primary btn-sm">
          <GlamrIcon name="plus" size={13} /> Add card
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="card p-5 relative overflow-hidden group">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
              style={{ background: BRAND_COLORS[card.brand] || "var(--plum)", filter: "blur(30px)" }} />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[14px] font-medium text-[var(--ink)]">{card.brand}</span>
                {card.isDefault && <span className="badge badge-sage text-[9px]">Default</span>}
              </div>

              <p className="tabular-num text-[20px] text-[var(--ink)] tracking-widest font-mono mb-4">
                •••• •••• •••• {card.last4}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-[var(--ink-4)] font-mono uppercase">Expires</p>
                  <p className="tabular-num text-[13px] text-[var(--ink-2)]">{card.expiry}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!card.isDefault && (
                    <button className="btn btn-ghost btn-sm text-[11px]">Set default</button>
                  )}
                  <button className="btn btn-ghost btn-sm text-[11px] text-red-500">Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gift card balance */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--plum-soft)] flex items-center justify-center">
              <GlamrIcon name="gift" size={18} className="text-[var(--plum)]" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[var(--ink)]">Gift card balance</p>
              <p className="text-[11px] text-[var(--ink-4)]">Automatically applied at checkout</p>
            </div>
          </div>
          <span className="tabular-num text-[20px] font-medium text-[var(--ink)]">250 lei</span>
        </div>
      </div>

      {/* Billing history */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Recent transactions</h2>
        <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
          {[
            { date: "Apr 12", desc: "Balayage — Sala Studio", amount: "-920 lei", method: "Visa •4242" },
            { date: "Apr 5", desc: "Cut & blow-dry — Sala Studio", amount: "-200 lei", method: "Visa •4242" },
            { date: "Mar 28", desc: "Gift card top-up", amount: "+500 lei", method: "Mastercard •8888" },
            { date: "Mar 22", desc: "Keratin treatment — Sala Studio", amount: "-650 lei", method: "Gift card" },
            { date: "Mar 15", desc: "Root touch-up — Sala Studio", amount: "-350 lei", method: "Visa •4242" },
          ].map((tx, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <span className="text-[12px] text-[var(--ink-4)] w-14 shrink-0">{tx.date}</span>
              <span className="text-[13px] text-[var(--ink)] flex-1">{tx.desc}</span>
              <span className="text-[12px] text-[var(--ink-3)]">{tx.method}</span>
              <span className={`tabular-num text-[13px] font-medium min-w-[80px] text-right ${tx.amount.startsWith("+") ? "text-green-600" : "text-[var(--ink)]"}`}>
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
