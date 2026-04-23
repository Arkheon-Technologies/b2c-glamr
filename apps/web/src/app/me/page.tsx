"use client";

import { useState } from "react";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-display text-[var(--ink)]">Profile</h1>
        <button onClick={() => setEditing(!editing)} className="btn btn-ghost btn-sm">
          <GlamrIcon name={editing ? "check" : "settings"} size={13} />
          {editing ? "Save" : "Edit"}
        </button>
      </div>

      {/* Avatar section */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[var(--plum-soft)] flex items-center justify-center">
            <span className="text-[28px] font-display text-[var(--plum)]">E</span>
          </div>
          {editing && (
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--ink)] text-white flex items-center justify-center shadow-md">
              <GlamrIcon name="camera" size={13} />
            </button>
          )}
        </div>
        <div>
          <h2 className="text-[18px] font-medium text-[var(--ink)]">Elena Marin</h2>
          <p className="text-[13px] text-[var(--ink-3)]">elena.marin@email.com</p>
          <p className="text-[11px] text-[var(--ink-4)] mt-1">Joined April 2024 · 12 bookings</p>
        </div>
      </div>

      {/* Personal info */}
      <div className="card p-6 space-y-4">
        <h3 className="text-[14px] font-medium text-[var(--ink)]">Personal information</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "First name", value: "Elena" },
            { label: "Last name", value: "Marin" },
            { label: "Email", value: "elena.marin@email.com" },
            { label: "Phone", value: "+40 712 345 678" },
            { label: "Date of birth", value: "March 15, 1994" },
            { label: "Gender", value: "Female" },
          ].map((field) => (
            <div key={field.label}>
              <label className="small-meta text-[var(--ink-4)] block mb-1">{field.label}</label>
              {editing ? (
                <input className="input text-[13px]" defaultValue={field.value} />
              ) : (
                <p className="text-[14px] text-[var(--ink)]">{field.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="card p-6 space-y-4">
        <h3 className="text-[14px] font-medium text-[var(--ink)]">Preferences</h3>
        <div className="space-y-3">
          {[
            { label: "Language", value: "English", desc: "Interface language" },
            { label: "Notifications", value: "Email & Push", desc: "Booking confirmations and reminders" },
            { label: "Currency", value: "RON (lei)", desc: "Price display currency" },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2 border-b border-[var(--line-2)] last:border-0">
              <div>
                <p className="text-[13px] text-[var(--ink)]">{pref.label}</p>
                <p className="text-[11px] text-[var(--ink-4)]">{pref.desc}</p>
              </div>
              {editing ? (
                <select className="input text-[12px] py-1 w-auto">
                  <option>{pref.value}</option>
                </select>
              ) : (
                <span className="text-[13px] text-[var(--ink-3)]">{pref.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Beauty profile */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-[var(--ink)]">Beauty profile</h3>
          <span className="badge badge-plum text-[9px]">Personalises results</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Hair type", value: "Wavy (2B)" },
            { label: "Hair colour", value: "Dark brown" },
            { label: "Skin type", value: "Combination" },
            { label: "Skin tone", value: "Medium warm" },
            { label: "Nail shape", value: "Almond" },
            { label: "Allergies", value: "None specified" },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-[var(--paper-2)] rounded-lg">
              <p className="text-[10px] text-[var(--ink-4)] font-mono uppercase">{item.label}</p>
              <p className="text-[13px] text-[var(--ink)] mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
