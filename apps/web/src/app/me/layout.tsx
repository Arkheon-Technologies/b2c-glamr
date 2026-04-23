"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlamrIcon } from "@/components/ui/GlamrIcon";

const ACCOUNT_NAV = [
  { label: "Profile", href: "/me", icon: "user" as const },
  { label: "Bookings", href: "/me/bookings", icon: "calendar" as const },
  { label: "Payment methods", href: "/me/payment-methods", icon: "wallet" as const },
  { label: "Loyalty & rewards", href: "/me/loyalty", icon: "star" as const },
  { label: "Referrals", href: "/me/referrals", icon: "gift" as const },
  { label: "Privacy & data", href: "/me/privacy", icon: "shield" as const },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex gap-10">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 space-y-1">
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-11 h-11 rounded-full bg-[var(--plum-soft)] flex items-center justify-center">
              <span className="text-[16px] font-display text-[var(--plum)]">E</span>
            </div>
            <div>
              <p className="text-[14px] font-medium text-[var(--ink)]">Elena M.</p>
              <p className="text-[11px] text-[var(--ink-4)]">Member since 2024</p>
            </div>
          </div>

          {ACCOUNT_NAV.map((item) => {
            const active = item.href === "/me" ? pathname === "/me" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={[
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  active ? "bg-[var(--card)] text-[var(--ink)] font-medium shadow-sm" : "text-[var(--ink-3)] hover:bg-[var(--paper-2)]",
                ].join(" ")}>
                <GlamrIcon name={item.icon} size={15} />
                {item.label}
              </Link>
            );
          })}

          <hr className="divider my-4" />
          <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-50 transition-colors w-full">
            <GlamrIcon name="arrow" size={15} className="rotate-180" />
            Sign out
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
