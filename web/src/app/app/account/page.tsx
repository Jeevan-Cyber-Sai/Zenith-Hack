"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  school: string | null;
  createdAt: string;
};

type ConceptStat = {
  id: string;
  title: string;
  chapterTitle: string | null;
  chapterOrder: number | null;
  mastery: number;
  eloRating: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
};

type DashboardData = {
  user: UserProfile;
  concepts: ConceptStat[];
  learningVelocity: number;
  hintUsageRatio: number;
};

export default function AccountPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("studemy_user");
    if (raw) try { setUser(JSON.parse(raw)); } catch { setUser(null); }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    fetch(`/api/dashboard?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load account data"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-red-200">
        {error || "Could not load account details."}
      </div>
    );
  }

  const { user: profile, concepts } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/app" className="text-slate-400 hover:text-white">
          ← Back to Maths
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-white">Account details</h1>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Personal information</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Name</dt>
            <dd className="text-white">{profile.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="text-white">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Phone</dt>
            <dd className="text-white">{profile.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">School / Institution</dt>
            <dd className="text-white">{profile.school || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Progress by section (final ELO & questions attempted)
        </h2>
        {concepts.length === 0 ? (
          <p className="text-slate-400">No activity yet. Start practicing from the chapters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600 text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Chapter / Section</th>
                  <th className="pb-2 pr-4 font-medium">Final ELO</th>
                  <th className="pb-2 pr-4 font-medium">Questions attempted</th>
                  <th className="pb-2 pr-4 font-medium">Correct</th>
                  <th className="pb-2 font-medium">Mastery</th>
                </tr>
              </thead>
              <tbody>
                {concepts
                  .sort((a, b) => (a.chapterOrder ?? 99) - (b.chapterOrder ?? 99))
                  .map((c) => (
                    <tr key={c.id} className="border-b border-slate-700/50">
                      <td className="py-3 pr-4">
                        <span className="text-slate-500">
                          {c.chapterTitle ? `Ch. ${c.chapterOrder}: ${c.chapterTitle} → ` : ""}
                        </span>
                        <span className="text-white">{c.title}</span>
                      </td>
                      <td className="py-3 pr-4 text-white">{c.eloRating}</td>
                      <td className="py-3 pr-4 text-white">{c.questionsAnswered}</td>
                      <td className="py-3 pr-4 text-white">{c.correctAnswers}</td>
                      <td className="py-3 text-slate-300">{(c.mastery * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
