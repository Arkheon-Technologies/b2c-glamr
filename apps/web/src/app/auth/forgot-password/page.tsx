"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await requestPasswordReset(email.trim().toLowerCase());
      setSuccessMessage(response.message || "If the account exists, reset instructions have been sent.");
    } catch (error) {
      const fallback = "Unable to process password reset right now.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block font-headline font-black tracking-tighter text-2xl text-primary mb-12 text-center"
        >
          GLAMR
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant/30 p-10">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-primary text-white font-label text-[9px] font-bold tracking-[0.2em] uppercase mb-4">
              Account Recovery
            </div>
            <h1 className="font-headline font-black tracking-tighter text-3xl uppercase text-primary">
              Reset Password
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-2 font-light">
              Enter your account email and we will issue reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errorMessage && (
              <div
                role="alert"
                className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="border border-primary-fixed/50 bg-primary-fixed/10 px-4 py-3 text-xs font-label uppercase tracking-wider text-primary">
                {successMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-headline font-bold uppercase tracking-widest text-xs py-4 hover:bg-primary-fixed transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center font-label text-xs text-on-surface-variant mt-8">
            Have a token already?{" "}
            <Link href="/auth/reset-password" className="text-primary-fixed font-bold hover:underline">
              Reset now
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/auth/login"
            className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
