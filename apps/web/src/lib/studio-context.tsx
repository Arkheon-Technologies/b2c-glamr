"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getBusinessById, type BusinessSummary } from "@/lib/mvp-api";

interface StudioContextValue {
  business: BusinessSummary | null;
  businessId: string | null;
  loading: boolean;
  setBusinessId: (id: string) => void;
  reload: () => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

const STORAGE_KEY = "glamr.studio.businessId";

export function StudioProvider({ children }: { children: ReactNode }) {
  const [businessId, setBusinessIdState] = useState<string | null>(null);
  const [business, setBusiness] = useState<BusinessSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const setBusinessId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setBusinessIdState(id);
  }, []);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const b = await getBusinessById(id);
      setBusiness(b);
    } catch {
      // Demo fallback for dev preview
      setBusiness({ id, name: "Sala Studio", slug: "sala-studio", is_verified: true, description: null, about: null, logo_url: null, total_bookings: 0 } as BusinessSummary);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    if (businessId) {
      await load(businessId);
    }
  }, [businessId, load]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBusinessIdState(stored);
      load(stored);
    } else if (process.env.NODE_ENV === "development") {
      // Auto-seed demo business in dev
      const demoId = "demo-sala-studio";
      setBusinessIdState(demoId);
      load(demoId);
    } else {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    if (businessId) {
      load(businessId);
    }
  }, [businessId, load]);

  return (
    <StudioContext.Provider value={{ business, businessId, loading, setBusinessId, reload }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error("useStudio must be used inside <StudioProvider>");
  }
  return ctx;
}
