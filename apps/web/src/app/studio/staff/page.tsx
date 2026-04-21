"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudio } from "@/lib/studio-context";
import {
  listStaff,
  createStaff,
  updateStaff,
  type StaffMember,
} from "@/lib/mvp-api";

const ROLES = ["owner", "manager", "technician", "receptionist", "assistant"];

export default function StaffPage() {
  const router = useRouter();
  const { businessId, business, loading: ctxLoading } = useStudio();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ displayName: "", role: "technician" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ctxLoading && !businessId) {
      router.replace("/studio/onboarding");
      return;
    }
    if (businessId) loadStaff();
  }, [businessId, ctxLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadStaff() {
    setLoading(true);
    try {
      const members = await listStaff(businessId!);
      setStaff(members);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await createStaff({ businessId: businessId!, ...form });
      setShowForm(false);
      setForm({ displayName: "", role: "technician" });
      await loadStaff();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    try {
      await updateStaff(member.id, { isActive: !member.isActive });
      await loadStaff();
    } catch {
      alert("Failed to update staff member");
    }
  }

  const inputClass =
    "w-full bg-transparent border border-outline-variant/60 px-4 py-3 font-body text-sm text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary-fixed transition-colors";
  const labelClass = "block font-label text-[9px] uppercase tracking-widest text-primary/50 mb-1.5";

  if (ctxLoading) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-label text-[9px] uppercase tracking-widest text-primary/40 mb-1">
            {business?.name}
          </p>
          <h1 className="font-headline font-black text-3xl tracking-tight text-primary">Staff</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setError(null);
          }}
          className="bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-primary transition-colors"
        >
          + Add Staff
        </button>
      </div>

      {/* Add staff form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 w-full max-w-md p-8">
            <h2 className="font-headline font-black text-xl tracking-tight text-primary mb-6">
              Add Staff Member
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className={labelClass}>Display name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Smith"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className={inputClass}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="font-label text-[10px] uppercase tracking-widest text-error">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-outline-variant/60 text-primary font-headline font-bold uppercase tracking-widest text-xs py-3 hover:border-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-fixed text-white font-headline font-bold uppercase tracking-widest text-xs py-3 hover:bg-primary transition-colors disabled:opacity-40"
                >
                  {saving ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff list */}
      {loading ? (
        <p className="font-label text-[10px] uppercase tracking-widest text-primary/30 animate-pulse">
          Loading staff…
        </p>
      ) : staff.length === 0 ? (
        <div className="border border-outline-variant/30 p-12 text-center">
          <p className="font-label text-[10px] uppercase tracking-widest text-primary/30">
            No staff members yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/20 border border-outline-variant/30">
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-5 py-5 bg-surface-container-lowest hover:bg-surface-container transition-colors"
            >
              <div>
                <p className="font-body text-sm font-medium text-primary flex items-center gap-2">
                  {member.displayName}
                  {!member.isActive && (
                    <span className="font-label text-[8px] uppercase tracking-widest text-primary/30 border border-outline-variant/20 px-1.5 py-0.5">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 mt-0.5">
                  {member.role}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/studio/staff/${member.id}/schedule`}
                  className="font-label text-[9px] uppercase tracking-widest text-primary/50 hover:text-primary border border-outline-variant/30 hover:border-primary/40 px-3 py-1.5 transition-colors"
                >
                  Schedule
                </Link>
                <button
                  type="button"
                  onClick={() => toggleActive(member)}
                  className={[
                    "font-label text-[9px] uppercase tracking-widest border px-3 py-1.5 transition-colors",
                    member.isActive
                      ? "text-primary/50 border-outline-variant/30 hover:text-error hover:border-error/40"
                      : "text-green-600 border-green-200 hover:border-green-400",
                  ].join(" ")}
                >
                  {member.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
