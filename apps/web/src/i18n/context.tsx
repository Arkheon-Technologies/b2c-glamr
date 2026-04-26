"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en } from "./messages/en";
import { ro } from "./messages/ro";
import type { Messages } from "./messages/en";

export type Locale = "en" | "ro";

const MESSAGES: Record<Locale, Messages> = { en, ro };

const STORAGE_KEY = "glamr.locale";

/* ─── Path helper: walk nested object with dot-notation key ─────────── */
type NestedValue<T, K extends string> =
  K extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? NestedValue<T[Head], Tail>
      : string
    : K extends keyof T
      ? T[K]
      : string;

/* ─── Context ────────────────────────────────────────────────────────── */
type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
  messages: en,
});

function resolvePath(obj: unknown, path: string): string {
  return path.split(".").reduce((acc: unknown, part) => {
    if (acc && typeof acc === "object" && part in (acc as object)) {
      return (acc as Record<string, unknown>)[part];
    }
    return path; // fallback to key
  }, obj) as string;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && (stored === "en" || stored === "ro")) {
        setLocaleState(stored);
        document.documentElement.lang = stored;
      }
    } catch {/* SSR / private browsing */}
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {/* ignore */}
  }, []);

  const t = useCallback(
    (key: string): string => resolvePath(MESSAGES[locale], key),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages: MESSAGES[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  const { t } = useContext(I18nContext);
  return t;
}
