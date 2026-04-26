"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StudioProvider, useStudio } from "@/lib/studio-context";
import { getStoredSession, isSessionExpired } from "@/lib/auth-client";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

/* ─── Business sidebar nav (§3.3) ─────────────────────────────────────
   220px fixed sidebar with sections:
     WORKSPACE: Calendar · Bookings · Clients
     CATALOG: Services · Team
     GROW: Analytics · Marketing · Payments
   Location switcher at top, profile completeness meter at bottom.
────────────────────────────────────────────────────────────────────── */

type NavSection = {
  label: string;
  items: { label: string; href: string; icon: React.ComponentProps<typeof GlamrIcon>["name"]; badge?: number }[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Calendar", href: "/studio/calendar", icon: "calendar" },
      { label: "Bookings", href: "/studio/inbox", icon: "clock" },
      { label: "Messages", href: "/studio/messages", icon: "message", badge: 2 },
      { label: "Clients", href: "/studio/clients", icon: "user" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Services", href: "/studio/services", icon: "scissors" },
      { label: "Team", href: "/studio/team", icon: "grid" },
    ],
  },
  {
    label: "Grow",
    items: [
      { label: "Analytics", href: "/studio/analytics", icon: "chart" },
      { label: "Marketing", href: "/studio/marketing", icon: "spark" },
      { label: "Payments", href: "/studio/payments", icon: "wallet" },
    ],
  },
];

function StudioSidebar() {
  const pathname = usePathname();
  const { business, loading } = useStudio();

  return (
    <aside className="w-[220px] shrink-0 border-r border-[var(--line)] min-h-screen bg-[var(--paper-2)] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[var(--line)]">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="font-display text-lg tracking-tight text-[var(--ink)]">glamr</span>
          <span className="text-[var(--plum)] text-lg font-display">.</span>
        </Link>
      </div>

      {/* Location switcher */}
      {!loading && business && (
        <div className="px-4 py-3 border-b border-[var(--line-2)]">
          <button className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-[var(--paper-3)] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <GlamrIcon name="pin" size={14} className="text-[var(--ink-3)] shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--ink)] truncate">{business.name}</p>
                <p className="text-[10px] text-[var(--ink-4)] font-mono uppercase tracking-wider">Main location</p>
              </div>
            </div>
            <GlamrIcon name="chevron" size={12} className="text-[var(--ink-4)] rotate-90 shrink-0" />
          </button>
        </div>
      )}

      {/* Nav sections */}
      <nav aria-label="Studio navigation" className="flex-1 py-3 px-3 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="small-meta text-[var(--ink-4)] px-2 mb-1.5">
              — {section.label.toLowerCase()}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "navitem text-[13px]",
                      active ? "active" : "",
                    ].join(" ")}
                  >
                    <GlamrIcon name={item.icon} size={16} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="badge badge-plum text-[9px]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile completeness meter */}
      <div className="px-4 py-4 border-t border-[var(--line-2)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-3)]">Profile</span>
          <span className="tabular-num text-[var(--plum)] text-[12px]">82%</span>
        </div>
        <div className="w-full h-1 bg-[var(--paper-3)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--plum)] rounded-full" style={{ width: "82%" }} />
        </div>
        <p className="text-[10px] text-[var(--ink-4)] mt-1.5">Add 3 photos to go live</p>
      </div>
    </aside>
  );
}

function StudioGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // In development, allow preview without auth
    if (process.env.NODE_ENV === "development") {
      setChecked(true);
      return;
    }
    const session = getStoredSession();
    if (!session || isSessionExpired()) {
      router.replace("/auth/login?next=/studio/calendar");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudioProvider>
      <StudioGuard>
        <div className="flex min-h-screen bg-[var(--paper)]">
          <StudioSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {/* Topbar — 56px */}
            <header className="h-14 shrink-0 border-b border-[var(--line)] bg-[var(--card)] flex items-center justify-between px-7">
              <div /> {/* Left placeholder — breadcrumb will go here */}
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] transition-colors">
                  <GlamrIcon name="bell" size={16} className="text-[var(--ink-3)]" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] transition-colors">
                  <GlamrIcon name="settings" size={16} className="text-[var(--ink-3)]" />
                </button>
              </div>
            </header>
            {/* Main content — 28px padded */}
            <main id="main-content" className="flex-1 p-7 overflow-auto" tabIndex={-1}>
              {children}
            </main>
          </div>
        </div>
      </StudioGuard>
    </StudioProvider>
  );
}
