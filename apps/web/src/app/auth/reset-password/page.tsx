"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordWithToken } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setIsSuccess(false);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordWithToken(token.trim(), password);
      setIsSuccess(Boolean(response.reset));
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error) {
      const fallback = "Unable to reset password. Verify token and try again.";
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
              Set New Password
            </h1>
            <p className="font-body text-sm text-on-surface-variant mt-2 font-light">
              Paste your reset token and create a new secure password.
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

            {isSuccess && (
              <div className="border border-primary-fixed/50 bg-primary-fixed/10 px-4 py-3 text-xs font-label uppercase tracking-wider text-primary">
                Password updated. You can sign in with your new credentials.
              </div>
            )}

            <div className="space-y-1.5">
              <label
                className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block"
                htmlFor="token"
              >
                Reset Token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste token"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block"
                htmlFor="password"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-headline font-bold uppercase tracking-widest text-xs py-4 hover:bg-primary-fixed transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Update Password"}
            </button>
          </form>

          <p className="text-center font-label text-xs text-on-surface-variant mt-8">
            Need a token?{" "}
            <Link href="/auth/forgot-password" className="text-primary-fixed font-bold hover:underline">
              Request reset
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
