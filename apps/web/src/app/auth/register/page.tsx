"use client";

import { useState } from "react";
import Link from "next/link";

type Role = "professional" | "client";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("professional");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: wire to POST /api/v1/auth/register
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block font-headline font-black tracking-tighter text-2xl text-primary mb-12 text-center">
          GLAMR
        </Link>

        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-10">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-primary text-white font-label text-[9px] font-bold tracking-[0.2em] uppercase mb-4">
              New Account
            </div>
            <h1 className="font-headline font-black tracking-tighter text-3xl uppercase text-primary">
              Join GLAMR
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-2 font-light">
              Create your account and start booking or building your studio.
            </p>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-px bg-outline-variant/30 border border-outline-variant/30 mb-8">
            <button
              type="button"
              onClick={() => setRole("professional")}
              className={`py-3 font-headline font-bold uppercase tracking-widest text-xs transition-colors ${role === "professional" ? "bg-primary text-white" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"}`}
            >
              Professional
            </button>
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`py-3 font-headline font-bold uppercase tracking-widest text-xs transition-colors ${role === "client" ? "bg-primary text-white" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"}`}
            >
              Client
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="reg-password">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            {role === "professional" && (
              <p className="font-label text-[9px] text-on-surface-variant uppercase tracking-wider">
                As a Professional you will get access to portfolio management, smart scheduling, walk-in queues, and payment tools.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs py-4 hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Creating account…" : `Create ${role === "professional" ? "Studio" : "Client"} Account`}
            </button>
          </form>

          <p className="text-center font-label text-xs text-on-surface-variant mt-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary-fixed font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
