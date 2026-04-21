"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithEmail, persistAuthSession } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginWithEmail({
        email: email.trim().toLowerCase(),
        password,
      });

      persistAuthSession(response.data);
      router.push("/explore");
    } catch (error) {
      const fallbackMessage = "Unable to sign in right now. Please try again.";
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsLoading(false);
    }
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
          <div className="mb-10">
            <div className="inline-block px-3 py-1 bg-primary text-white font-label text-[9px] font-bold tracking-[0.2em] uppercase mb-4">
              Secure Access
            </div>
            <h1 className="font-headline font-black tracking-tighter text-3xl uppercase text-primary">
              Welcome Back
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-2 font-light">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {errorMessage && (
              <div
                role="alert"
                className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error"
              >
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
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
              <div className="flex justify-between items-center">
                <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="password">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="font-label text-[9px] uppercase tracking-widest text-primary-fixed hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-headline font-bold uppercase tracking-widest text-xs py-4 hover:bg-primary-fixed transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">or</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full border border-outline-variant font-label font-bold uppercase tracking-widest text-xs py-4 hover:border-primary hover:bg-surface-container transition-all flex items-center justify-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center font-label text-xs text-on-surface-variant mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary-fixed font-bold hover:underline">
              Sign up free
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
