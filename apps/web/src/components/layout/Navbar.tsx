"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo gradient-text">
          GLAMR
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links hidden md:flex">
          <a href="/#features"     className="navbar-link">Features</a>
          <a href="/#for-business" className="navbar-link">For Business</a>
          <a href="/#how-it-works" className="navbar-link">How it works</a>
          <Link href="/explore"    className="navbar-link">Explore</Link>
        </div>

        {/* Desktop actions */}
        <div className="navbar-actions hidden md:flex">
          <ThemeToggle />
          <Link href="/auth/login"    className="btn btn-ghost-dark btn-sm">Log in</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get started</Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <button
            className="btn btn-ghost-dark btn-sm"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6"  x2="6"  y2="18" />
                <line x1="6"  y1="6"  x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="8"  x2="21" y2="8"  />
                <line x1="3" y1="16" x2="21" y2="16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="navbar-mobile-menu md:hidden">
          <a href="/#features"     className="navbar-mobile-link" onClick={() => setIsOpen(false)}>Features</a>
          <a href="/#for-business" className="navbar-mobile-link" onClick={() => setIsOpen(false)}>For Business</a>
          <a href="/#how-it-works" className="navbar-mobile-link" onClick={() => setIsOpen(false)}>How it works</a>
          <Link href="/explore"    className="navbar-mobile-link" onClick={() => setIsOpen(false)}>Explore</Link>
          <div className="navbar-mobile-actions">
            <Link href="/auth/login"    className="btn btn-ghost-dark btn-sm" style={{ flex: 1, justifyContent: "center" }}>Log in</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm"    style={{ flex: 1, justifyContent: "center" }}>Get started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
