"use client";

import { userService } from "@/api/services/userService";
import { CheckCircle2, Mail, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type RegisteredUser = {
  userId: string;
  name: string;
  email: string;
  verified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const UserProfile = () => {
  const [profile, setProfile] = useState<RegisteredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await userService.getMe();
        setProfile(data);
      } catch (err) {
        setError("Unable to load your profile. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <section className="min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-50 to-cyan-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm">
          Loading profile...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-50 to-cyan-100 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen w-full bg-linear-to-br from-slate-100 via-sky-50 to-cyan-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Account</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800 sm:text-3xl">My Profile</h1>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <UserRound size={14} /> Name
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{profile?.name ?? "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Mail size={14} /> Email
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{profile?.email ?? "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">User ID</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-800">{profile?.userId ?? "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <ShieldCheck size={14} /> Status
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{profile?.status ?? "-"}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email Verified</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                {profile?.verified ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" /> Yes
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-rose-600" /> No
                  </>
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered On</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{formatDate(profile?.createdAt)}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{formatDate(profile?.updatedAt)}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default UserProfile;
