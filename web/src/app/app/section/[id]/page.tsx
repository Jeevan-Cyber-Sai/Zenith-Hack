"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type User = { id: string; email: string; name?: string };

type QuestionState = {
  questionId: string;
  prompt: string;
  difficulty: string;
  displayElo: number;
  conceptTitle: string;
};

type ResultState = {
  isCorrect: boolean;
  masteryBefore: number;
  masteryAfter: number;
  reward: number;
  difficulty: string;
  banditEnabled: boolean;
  hints: {
    conceptualNudge: string;
    strategyHint: string;
    stepCorrection: string;
  };
  completeSolution: string;
  skillTreeDecision: { type: string; conceptId: string };
};

export default function SectionPage() {
  const params = useParams();
  const sectionId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"STATIC" | "ADAPTIVE">("ADAPTIVE");
  const [question, setQuestion] = useState<QuestionState | null>(null);
  const [steps, setSteps] = useState("");
  const [usedHint, setUsedHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("studemy_user");
    if (raw) try { setUser(JSON.parse(raw)); } catch { setUser(null); }
  }, []);

  const fetchQuestion = useCallback(async () => {
    if (!user) return;
    setError("");
    setResult(null);
    setSteps("");
    setUsedHint(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/app/practice/next?userId=${encodeURIComponent(user.id)}&conceptId=${encodeURIComponent(sectionId)}&mode=${mode}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load question");
        return;
      }
      setQuestion(data);
    } finally {
      setLoading(false);
    }
  }, [user, sectionId, mode]);

  useEffect(() => {
    if (user && sectionId) fetchQuestion();
  }, [user, sectionId, mode]); // re-fetch when mode changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !question) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/adaptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          conceptId: sectionId,
          questionId: question.questionId,
          studentSteps: steps,
          usedHint,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed");
        return;
      }
      setResult(data);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="text-slate-400 hover:text-white"
        >
          ← Back to chapters
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white">
          {question?.conceptTitle ?? "Section"}
        </h1>
        <div className="flex gap-2 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => setMode("STATIC")}
            className={`rounded-md px-3 py-1.5 text-sm ${mode === "STATIC" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Fixed difficulty
          </button>
          <button
            type="button"
            onClick={() => setMode("ADAPTIVE")}
            className={`rounded-md px-3 py-1.5 text-sm ${mode === "ADAPTIVE" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Adaptive (ELO)
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/20 px-4 py-2 text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : question ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <span>Difficulty: {question.difficulty}</span>
              <span>·</span>
              <span>ELO: {question.displayElo}</span>
            </div>
            <p className="text-lg text-white">{question.prompt}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Your solution (step by step)
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="Write each step..."
              rows={6}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {result && (
            <div
              className={`rounded-xl border p-5 ${result.isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-amber-500/50 bg-amber-500/10"}`}
            >
              <h3 className="text-lg font-semibold text-white">Final result</h3>
              <p className="mt-1 font-medium text-white">
                {result.isCorrect ? "Correct" : "Not quite right"}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Mastery: {(result.masteryBefore * 100).toFixed(0)}% → {(result.masteryAfter * 100).toFixed(0)}%
                {result.banditEnabled && ` · Reward: ${result.reward.toFixed(3)}`}
              </p>

              <div className="mt-4 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-slate-300">Hints for this question</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium text-slate-400">1. Conceptual nudge:</span>
                    <span className="ml-1 text-slate-200">{result.hints.conceptualNudge}</span>
                  </li>
                  <li>
                    <span className="font-medium text-slate-400">2. Strategy hint:</span>
                    <span className="ml-1 text-slate-200">{result.hints.strategyHint}</span>
                  </li>
                  <li>
                    <span className="font-medium text-slate-400">3. Step correction:</span>
                    <span className="ml-1 text-slate-200">{result.hints.stepCorrection}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
                <h4 className="mb-2 text-sm font-semibold text-indigo-200">Final solution</h4>
                <p className="whitespace-pre-wrap text-sm text-slate-200">
                  {result.completeSolution}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchQuestion}
                className="mt-4 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500"
              >
                Next question
              </button>
            </div>
          )}

          {!result && (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Checking…" : "Submit"}
              </button>
            </div>
          )}
        </form>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-slate-400">
          No question available. Try another section or run the seed script.
        </div>
      )}
    </div>
  );
}
