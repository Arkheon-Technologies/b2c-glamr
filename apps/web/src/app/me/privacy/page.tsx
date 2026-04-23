"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

type Toggle = { id: string; label: string; desc: string; enabled: boolean; category: string };

const PRIVACY_TOGGLES: Toggle[] = [
  { id: "t1", label: "Booking confirmations", desc: "Email and push notifications for new bookings", enabled: true, category: "Notifications" },
  { id: "t2", label: "Appointment reminders", desc: "Reminders 24h and 1h before your appointment", enabled: true, category: "Notifications" },
  { id: "t3", label: "Review requests", desc: "Ask to review after completed appointments", enabled: true, category: "Notifications" },
  { id: "t4", label: "Marketing emails", desc: "Promotions, new features, and editorial content", enabled: false, category: "Notifications" },
  { id: "t5", label: "SMS notifications", desc: "Text message updates for bookings", enabled: true, category: "Notifications" },
  { id: "t6", label: "Profile visible to studios", desc: "Let studios see your beauty profile and preferences", enabled: true, category: "Visibility" },
  { id: "t7", label: "Show in review responses", desc: "Your first name appears on reviews you leave", enabled: true, category: "Visibility" },
  { id: "t8", label: "Activity tracking", desc: "Personalise recommendations based on your activity", enabled: true, category: "Data" },
  { id: "t9", label: "Location services", desc: "Use location for nearby studio suggestions", enabled: false, category: "Data" },
];

const CATEGORIES = [...new Set(PRIVACY_TOGGLES.map((t) => t.category))];

export default function PrivacyPage() {
  const [toggles, setToggles] = useState(PRIVACY_TOGGLES);

  const toggle = (id: string) => {
    setToggles((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-display text-[var(--ink)]">Privacy & data</h1>

      {/* Toggle groups */}
      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">{cat}</h2>
          <div className="card divide-y divide-[var(--line-2)]">
            {toggles.filter((t) => t.category === cat).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[13px] text-[var(--ink)]">{t.label}</p>
                  <p className="text-[11px] text-[var(--ink-4)]">{t.desc}</p>
                </div>
                <button onClick={() => toggle(t.id)}
                  className={`w-10 h-[22px] rounded-full flex items-center px-0.5 transition-colors ${t.enabled ? "bg-[var(--sage)]" : "bg-[var(--paper-3)]"}`}>
                  <span className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${t.enabled ? "translate-x-[18px]" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Data management */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Your data</h2>
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <GlamrIcon name="arrow" size={14} className="text-[var(--ink-3)] rotate-90" />
              <div>
                <p className="text-[13px] text-[var(--ink)]">Download your data</p>
                <p className="text-[11px] text-[var(--ink-4)]">Get a copy of all your personal data</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm">Request export</button>
          </div>

          <hr className="divider" />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <GlamrIcon name="x" size={14} className="text-red-500" />
              <div>
                <p className="text-[13px] text-red-600">Delete account</p>
                <p className="text-[11px] text-[var(--ink-4)]">Permanently delete your account and all data</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm text-red-500">Delete</button>
          </div>
        </div>
      </div>

      {/* Connected accounts */}
      <div>
        <h2 className="text-[14px] font-medium text-[var(--ink)] mb-3">Connected accounts</h2>
        <div className="card divide-y divide-[var(--line-2)]">
          {[
            { name: "Google", connected: true, email: "elena.marin@gmail.com" },
            { name: "Apple", connected: false, email: "" },
            { name: "Facebook", connected: false, email: "" },
          ].map((acc) => (
            <div key={acc.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--paper-3)] flex items-center justify-center">
                  <span className="text-[11px] font-medium text-[var(--ink-3)]">{acc.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-[13px] text-[var(--ink)]">{acc.name}</p>
                  {acc.connected && <p className="text-[11px] text-[var(--ink-4)]">{acc.email}</p>}
                </div>
              </div>
              <button className={`btn btn-sm ${acc.connected ? "btn-ghost" : "btn-primary"}`}>
                {acc.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
