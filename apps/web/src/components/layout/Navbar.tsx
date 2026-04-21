"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Platform", href: "/#features" },
  { label: "Business",  href: "/#business" },
  { label: "Services",  href: "/#services" },
  { label: "Pricing",   href: "/#pricing" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-xl font-headline font-black tracking-tighter text-primary">
          GLAMR
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-headline font-bold tracking-tight uppercase text-xs text-primary/60 hover:text-primary-fixed transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/explore"
            className={[
              "font-headline font-bold tracking-tight uppercase text-xs transition-colors duration-200",
              pathname.startsWith("/explore")
                ? "text-primary-fixed border-b border-primary-fixed pb-0.5"
                : "text-primary/60 hover:text-primary-fixed",
            ].join(" ")}
          >
            Explore
          </Link>
          <Link
            href="/portfolio"
            className={[
              "font-headline font-bold tracking-tight uppercase text-xs transition-colors duration-200",
              pathname.startsWith("/portfolio") || pathname.startsWith("/studio/portfolio")
                ? "text-primary-fixed border-b border-primary-fixed pb-0.5"
                : "text-primary/60 hover:text-primary-fixed",
            ].join(" ")}
          >
            Portfolio
          </Link>
          <Link
            href="/queue"
            className={[
              "font-headline font-bold tracking-tight uppercase text-xs transition-colors duration-200",
              pathname.startsWith("/queue") || pathname.startsWith("/studio/queue")
                ? "text-primary-fixed border-b border-primary-fixed pb-0.5"
                : "text-primary/60 hover:text-primary-fixed",
            ].join(" ")}
          >
            Queue
          </Link>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="font-headline font-bold uppercase tracking-widest text-xs text-primary/60 hover:text-primary transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/book"
            className="bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs px-6 py-2.5 hover:bg-primary transition-all duration-300 active:scale-95"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            className="inline-flex items-center justify-center w-9 h-9 border border-outline-variant text-primary"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="8" x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block font-headline font-bold uppercase tracking-widest text-xs text-primary px-8 py-4 border-b border-outline-variant/20 hover:bg-surface-container"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/explore"
            className="block font-headline font-bold uppercase tracking-widest text-xs text-primary px-8 py-4 border-b border-outline-variant/20 hover:bg-surface-container"
            onClick={() => setIsOpen(false)}
          >
            Explore
          </Link>
          <Link
            href="/queue"
            className="block font-headline font-bold uppercase tracking-widest text-xs text-primary px-8 py-4 border-b border-outline-variant/20 hover:bg-surface-container"
            onClick={() => setIsOpen(false)}
          >
            Queue
          </Link>
          <Link
            href="/portfolio"
            className="block font-headline font-bold uppercase tracking-widest text-xs text-primary px-8 py-4 border-b border-outline-variant/20 hover:bg-surface-container"
            onClick={() => setIsOpen(false)}
          >
            Portfolio
          </Link>
          <div className="flex gap-3 px-8 py-4">
            <Link
              href="/auth/login"
              className="flex-1 text-center font-headline font-bold uppercase tracking-widest text-xs border border-outline-variant py-3 hover:border-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/book"
              className="flex-1 text-center font-headline font-bold uppercase tracking-widest text-xs bg-primary-fixed text-white py-3 hover:bg-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
