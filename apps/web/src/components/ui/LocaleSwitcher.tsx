"use client";

import { useI18n, type Locale } from "@/i18n/context";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ro: "RO",
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language">
      {(["en", "ro"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={[
            "text-[11px] font-mono uppercase px-1.5 py-0.5 rounded transition-colors",
            locale === l
              ? "bg-[var(--plum)] text-white"
              : "text-[var(--ink-3)] hover:text-[var(--ink)]",
          ].join(" ")}
          aria-pressed={locale === l}
          aria-label={`Switch to ${l === "en" ? "English" : "Romanian"}`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
