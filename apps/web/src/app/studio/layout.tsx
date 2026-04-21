"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { StudioProvider, useStudio } from "@/lib/studio-context";
import { getStoredSession, isSessionExpired } from "@/lib/auth-client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/studio/dashboard" },
  { label: "Services", href: "/studio/services" },
  { label: "Staff", href: "/studio/staff" },
  { label: "Bookings", href: "/studio/bookings" },
  { label: "Settings", href: "/studio/settings" },
];

function StudioSidebar() {
  const pathname = usePathname();
  const { business, loading } = useStudio();

  return (
    <aside className="w-56 shrink-0 border-r border-outline-variant/30 min-h-screen bg-surface-container-lowest flex flex-col">
      <div className="px-6 py-5 border-b border-outline-variant/30">
        <Link href="/" className="font-headline font-black tracking-tighter text-primary text-lg">
          GLAMR
        </Link>
        <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mt-0.5">Studio</p>
      </div>

      {!loading && business && (
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-0.5">Business</p>
          <p className="font-headline font-bold text-xs text-primary truncate">{business.name}</p>
        </div>
      )}

      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block px-6 py-3 font-label text-[10px] uppercase tracking-widest transition-colors",
                active
                  ? "text-primary-fixed bg-surface-container font-bold border-l-2 border-primary-fixed"
                  : "text-primary/50 hover:text-primary hover:bg-surface-container/50",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-6">
        <Link
          href="/"
          className="font-label text-[9px] uppercase tracking-widest text-primary/30 hover:text-primary/60 transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}

function StudioGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    if (!session || isSessionExpired()) {
      router.replace("/auth/login?next=/studio/dashboard");
    }
  }, [router]);

  return <>{children}</>;
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudioProvider>
      <StudioGuard>
        <div className="flex min-h-screen bg-surface-container-low">
          <StudioSidebar />
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </StudioGuard>
    </StudioProvider>
  );
}
