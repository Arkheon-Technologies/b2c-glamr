"use client";

import { GlamrIcon } from "@/components/ui/GlamrIcon";

const TRANSACTIONS = [
  { id: "t1", date: "Apr 12", client: "Elena M.", service: "Balayage", gross: "920 lei", fee: "-46 lei", net: "874 lei", method: "Card", status: "settled" },
  { id: "t2", date: "Apr 12", client: "Ioana P.", service: "Cut & style", gross: "180 lei", fee: "-9 lei", net: "171 lei", method: "Card", status: "settled" },
  { id: "t3", date: "Apr 11", client: "Ana D.", service: "Root touch-up", gross: "350 lei", fee: "-17.50 lei", net: "332.50 lei", method: "Card", status: "settled" },
  { id: "t4", date: "Apr 11", client: "Maria L.", service: "Blow-dry", gross: "80 lei", fee: "—", net: "80 lei", method: "Cash", status: "settled" },
  { id: "t5", date: "Apr 10", client: "Sofia R.", service: "Cut & blow-dry", gross: "200 lei", fee: "-10 lei", net: "190 lei", method: "Card", status: "settled" },
  { id: "t6", date: "Apr 10", client: "Diana V.", service: "Keratin treatment", gross: "650 lei", fee: "-32.50 lei", net: "617.50 lei", method: "Gift card", status: "settled" },
];

const PAYOUTS = [
  { date: "Apr 14", amount: "8,420 lei", period: "Apr 1 – Apr 7", status: "paid" },
  { date: "Apr 7", amount: "7,890 lei", period: "Mar 25 – Mar 31", status: "paid" },
  { date: "Apr 21", amount: "6,240 lei", period: "Apr 8 – Apr 14", status: "pending" },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Payments</h1>
        <div className="flex gap-2">
          <select className="input text-[12px] py-1.5 w-auto pr-8">
            <option>This month</option>
            <option>Last month</option>
            <option>Last 3 months</option>
          </select>
          <button className="btn btn-ghost btn-sm">
            <GlamrIcon name="arrow" size={13} className="rotate-90" /> Export
          </button>
        </div>
      </div>

      {/* Finance overview */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Gross revenue", value: "48,200 lei", sub: "This month" },
          { label: "Platform fees", value: "2,410 lei", sub: "5% commission" },
          { label: "Net revenue", value: "45,790 lei", sub: "After fees" },
          { label: "Next payout", value: "6,240 lei", sub: "Apr 21" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="small-meta text-[var(--ink-4)] mb-1">{s.label}</p>
            <p className="text-[20px] font-medium text-[var(--ink)] tabular-num">{s.value}</p>
            <p className="text-[11px] text-[var(--ink-4)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Payment methods breakdown */}
      <div className="card p-5">
        <p className="small-meta text-[var(--ink-4)] mb-3">— Revenue by payment method</p>
        <div className="flex items-center gap-6">
          <div className="flex-1 space-y-2">
            {[
              { method: "Card payments", amount: "38,200 lei", pct: 79, color: "var(--plum)" },
              { method: "Gift cards", amount: "6,400 lei", pct: 13, color: "var(--sage)" },
              { method: "Cash", amount: "3,600 lei", pct: 8, color: "var(--ink-4)" },
            ].map((m) => (
              <div key={m.method} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                <span className="text-[13px] text-[var(--ink)] flex-1">{m.method}</span>
                <div className="w-32 h-1.5 bg-[var(--paper-3)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
                <span className="tabular-num text-[13px] text-[var(--ink-3)] min-w-[80px] text-right">{m.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Payouts */}
        <div>
          <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Payouts</h2>
          <div className="card overflow-hidden divide-y divide-[var(--line-2)]">
            {PAYOUTS.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--ink)]">{p.amount}</p>
                  <p className="text-[11px] text-[var(--ink-4)]">{p.period}</p>
                </div>
                <span className={`badge text-[9px] ${p.status === "paid" ? "badge-sage" : "badge-amber"}`}>
                  {p.status === "paid" ? "Paid" : "Pending"}
                </span>
                <span className="text-[12px] text-[var(--ink-3)]">{p.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank account */}
        <div>
          <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Payout account</h2>
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--paper-3)] flex items-center justify-center">
                <GlamrIcon name="wallet" size={18} className="text-[var(--ink-3)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--ink)]">ING Bank Romania</p>
                <p className="text-[11px] text-[var(--ink-4)] font-mono">RO** **** **** **** **42</p>
              </div>
            </div>
            <hr className="divider" />
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--ink-4)]">Payout schedule</span>
              <span className="text-[var(--ink)]">Weekly (Mondays)</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--ink-4)]">Minimum payout</span>
              <span className="text-[var(--ink)]">100 lei</span>
            </div>
            <button className="btn btn-ghost btn-sm w-full mt-2">
              <GlamrIcon name="settings" size={12} /> Update payout settings
            </button>
          </div>
        </div>
      </div>

      {/* Transaction table */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Recent transactions</h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--line-2)]">
                {["Date", "Client", "Service", "Gross", "Fee", "Net", "Method"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 small-meta text-[var(--ink-4)] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line-2)]">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--paper-2)] transition-colors">
                  <td className="px-4 py-3 text-[12px] text-[var(--ink-3)]">{tx.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[var(--ink)]">{tx.client}</td>
                  <td className="px-4 py-3 text-[13px] text-[var(--ink-2)]">{tx.service}</td>
                  <td className="px-4 py-3 tabular-num text-[13px] text-[var(--ink)]">{tx.gross}</td>
                  <td className="px-4 py-3 tabular-num text-[12px] text-[var(--ink-4)]">{tx.fee}</td>
                  <td className="px-4 py-3 tabular-num text-[13px] font-medium text-[var(--ink)]">{tx.net}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--ink-3)]">{tx.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
