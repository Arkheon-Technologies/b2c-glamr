"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithEmail, persistAuthSession } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/explore";
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
      router.push(nextPath);
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
