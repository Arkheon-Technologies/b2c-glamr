"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GlamrIcon } from "@/components/ui/GlamrIcon";
import { getStoredUser, logout, type AuthUser } from "@/lib/auth-client";

/* ─── Customer top nav (§3.3) ────────────────────────────────────────
   glamr. · Discover · Inspiration · Gift cards · For business
   Right side: List your business · Sign in · Book now
   Sticky, paper bg, ink text, editorial aesthetic.
────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Discover", href: "/" },
  { label: "Inspiration", href: "/inspiration" },
  { label: "Gift cards", href: "/gift-cards" },
  { label: "For business", href: "/business" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  useEffect(() => {
    if (showDropdown) {
      const close = () => setShowDropdown(false);
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [showDropdown]);

  async function handleLogout() {
    await logout();
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--paper)]/95 backdrop-blur-md border-b border-[var(--line)]">
      <div className="page-container flex justify-between items-center h-14">
        {/* Logo — glamr. with plum dot */}
        <Link href="/" className="flex items-baseline gap-0">
          <span className="font-display text-xl tracking-tight text-[var(--ink)]">
            glamr
          </span>
          <span className="text-[var(--plum)] text-xl font-display">.</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={[
                "font-sans text-[13px] font-normal transition-colors duration-150",
                isActive(link.href)
                  ? "text-[var(--ink)]"
                  : "text-[var(--ink-3)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-4">
          {!user && (
            <Link
              href="/business"
              className="font-sans text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              List your business
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown((v) => !v);
                }}
                className="flex items-center gap-2 font-sans text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors px-2 py-1.5 rounded-lg"
              >
                {/* Avatar circle */}
                <span className="w-7 h-7 rounded-full bg-[var(--paper-3)] flex items-center justify-center text-[10px] font-medium text-[var(--ink-2)]">
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
                <GlamrIcon name="chevron" size={12} className={`transition-transform ${showDropdown ? "rotate-90" : ""}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-48 card p-1.5 shadow-lg z-50">
                  <Link
                    href="/me"
                    className="navitem text-[13px]"
                    onClick={() => setShowDropdown(false)}
                  >
                    <GlamrIcon name="user" size={15} />
                    Profile
                  </Link>
                  <Link
                    href="/me/bookings"
                    className="navitem text-[13px]"
                    onClick={() => setShowDropdown(false)}
                  >
                    <GlamrIcon name="calendar" size={15} />
                    My bookings
                  </Link>
                  <Link
                    href="/studio/calendar"
                    className="navitem text-[13px]"
                    onClick={() => setShowDropdown(false)}
                  >
                    <GlamrIcon name="grid" size={15} />
                    Studio
                  </Link>
                  <hr className="divider my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="navitem text-[13px] w-full text-[var(--ink-3)] hover:text-[var(--error)]"
                  >
                    <GlamrIcon name="arrow" size={15} className="rotate-180" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-sans text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
              >
                Sign in
              </Link>
              <Link href="/book" className="btn btn-primary btn-sm">
                Book now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <GlamrIcon name={isOpen ? "x" : "menu"} size={20} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[var(--paper)] border-t border-[var(--line)] px-6 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="navitem text-[14px]"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="divider my-2" />
          {user ? (
            <>
              <Link href="/me/bookings" className="navitem text-[14px]" onClick={() => setIsOpen(false)}>
                My bookings
              </Link>
              <Link href="/studio/calendar" className="navitem text-[14px]" onClick={() => setIsOpen(false)}>
                Studio
              </Link>
              <button type="button" onClick={handleLogout} className="navitem text-[14px] w-full text-[var(--ink-3)]">
                Log out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="btn btn-ghost flex-1 text-center" onClick={() => setIsOpen(false)}>
                Sign in
              </Link>
              <Link href="/book" className="btn btn-primary flex-1 text-center" onClick={() => setIsOpen(false)}>
                Book now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
