"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AssessmentQuestion = {
  questionId: string;
  conceptId: string;
  prompt: string;
  difficulty: string;
  conceptTitle: string;
  chapterTitle: string | null;
};

type AdaptiveResult = {
  isCorrect: boolean;
  masteryBefore: number;
  masteryAfter: number;
  reward: number;
  difficulty: string;
  xpEarned?: number;
  xpTotal?: number;
};

export default function AssessmentPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AdaptiveResult | null>(null);
  const [summary, setSummary] = useState<{
    correct: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("studemy_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    fetch(`/api/app/assessment/start?userId=${encodeURIComponent(user.id)}`)
      .then(async (res) => {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          throw new Error("Unexpected response while starting assessment.");
        }
        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to start assessment.");
        }
        setQuestions(data.questions ?? []);
        setSummary(null);
        setCurrentIndex(0);
        setSteps("");
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start assessment."
        );
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const current = questions[currentIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !current) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/adaptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          conceptId: current.conceptId,
          questionId: current.questionId,
          studentSteps: steps,
          usedHint: false,
          mode: "STATIC",
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        setError("Unexpected server response. Please try again.");
        return;
      }

      if (!res.ok) {
        setError(data?.error ?? "Submission failed");
        return;
      }

      setResult(data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!current) return;
    const correctIncrement = result?.isCorrect ? 1 : 0;
    const prevCorrect = summary?.correct ?? 0;
    const prevTotal = summary?.total ?? 0;

    const newSummary = {
      correct: prevCorrect + correctIncrement,
      total: prevTotal + 1,
    };

    if (currentIndex + 1 >= questions.length) {
      setSummary(newSummary);
      setResult(null);
      return;
    }

    setSummary(newSummary);
    setCurrentIndex((i) => i + 1);
    setSteps("");
    setResult(null);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
        <p className="font-medium">Assessment unavailable</p>
        <p className="mt-1 text-sm">{error}</p>
        <Link
          href="/app"
          className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-slate-200">
        <p>No questions available for assessment.</p>
        <Link
          href="/app"
          className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const questionNumber = currentIndex + 1;
  const totalQuestions = questions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app" className="text-slate-400 hover:text-white">
          ← Back to dashboard
        </Link>
        <span className="ml-auto rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-100">
          Assessment · Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Combined assessment</h1>
        <p className="mt-1 text-sm text-slate-400">
          This assessment mixes questions from all chapters. Each attempt has up
          to 10 questions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {current.chapterTitle && (
            <span>Chapter: {current.chapterTitle}</span>
          )}
          <span>Section: {current.conceptTitle}</span>
          <span>·</span>
          <span>Difficulty: {current.difficulty}</span>
        </div>
        <p className="text-lg text-white">{current.prompt}</p>
      </div>

      {result && (
        <div
          className={`rounded-xl border p-5 ${
            result.isCorrect
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-amber-500/50 bg-amber-500/10"
          }`}
        >
          <h3 className="text-lg font-semibold text-white">Result</h3>
          <p className="mt-1 font-medium text-white">
            {result.isCorrect ? "Correct" : "Not quite right"}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Mastery: {(result.masteryBefore * 100).toFixed(0)}% →{" "}
            {(result.masteryAfter * 100).toFixed(0)}%
          </p>
        </div>
      )}

      {!summary && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Your solution (step by step)
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={6}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            {!result && (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Checking…" : "Submit answer"}
              </button>
            )}
            {result && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="rounded-lg bg-slate-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-500"
              >
                {currentIndex + 1 === totalQuestions
                  ? "Finish assessment"
                  : "Next question"}
              </button>
            )}
          </div>
        </form>
      )}

      {summary && (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/70 p-5 text-slate-100">
          <h2 className="text-lg font-semibold text-white">
            Assessment summary
          </h2>
          <p className="mt-2 text-sm">
            You answered {summary.correct} out of {summary.total} questions
            correctly.
          </p>
          <Link
            href="/app"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Back to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

