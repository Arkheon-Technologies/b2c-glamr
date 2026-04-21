"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getMe, updateMe, type UserProfile } from "@/lib/mvp-api";
import { getStoredSession } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!getStoredSession()) {
      router.replace("/auth/login?next=/profile");
      return;
    }

    getMe()
      .then((user) => {
        setProfile(user);
        setFullName(user.name ?? "");
      })
      .catch(() => setError("Unable to load profile."))
      .finally(() => setIsLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateMe({ fullName: fullName.trim() });
      setProfile((prev) => prev ? { ...prev, name: updated.name } : prev);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low pt-28 pb-20 px-6 md:px-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <Link href="/explore" className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-fixed">← Back</Link>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 p-8">
            <div className="mb-8">
              <div className="inline-block px-3 py-1 bg-primary text-white font-label text-[9px] font-bold tracking-[0.2em] uppercase mb-4">
                Account
              </div>
              <h1 className="font-headline font-black tracking-tighter text-3xl uppercase text-primary">My Profile</h1>
            </div>

            {isLoading ? (
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Loading...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {error && (
                  <div role="alert" className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="border border-primary-fixed/50 bg-primary-fixed/10 px-4 py-3 text-xs font-label uppercase tracking-wider text-primary">
                    {success}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile?.email ?? ""}
                    disabled
                    className="w-full bg-surface-container border border-outline-variant/30 py-3 px-4 text-sm font-body text-on-surface-variant/60 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant block" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-3 px-4 text-sm font-body placeholder:text-outline/40 transition-colors"
                  />
                </div>

                {profile?.referral_code && (
                  <div className="space-y-1.5">
                    <p className="font-label text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Referral Code</p>
                    <p className="font-label text-sm font-bold tracking-widest text-primary-fixed">{profile.referral_code}</p>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-primary text-white font-headline font-bold uppercase tracking-widest text-xs px-8 py-3 hover:bg-primary-fixed transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <Link
                    href="/my-bookings"
                    className="border border-outline-variant font-label text-[10px] uppercase tracking-widest px-6 py-3 hover:border-primary transition-colors text-primary flex items-center"
                  >
                    My Bookings
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
