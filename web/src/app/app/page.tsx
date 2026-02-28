"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Section = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questionCount: number;
};

type Chapter = {
  id: string;
  title: string;
  order: number;
  sections: Section[];
};

type Curriculum = {
  subject: { id: string | null; name: string; slug: string };
  class: { id: string; name: string } | null;
  chapters: Chapter[];
};

export default function AppPage() {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [view, setView] = useState<"practice" | "assessment">("practice");

  useEffect(() => {
    fetch("/api/app/curriculum")
      .then((res) => res.json())
      .then((data: Curriculum) => {
        setCurriculum(data);
        if (data.chapters.length > 0 && !expandedChapter) {
          setExpandedChapter(data.chapters[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-slate-300">
        Failed to load curriculum.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {curriculum.subject.name} — Class {curriculum.class?.name ?? "12"}
          </h1>
          <p className="mt-1 text-slate-400">
            Choose how you want to study: regular practice by chapter or a mixed assessment.
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-800/60 p-1 text-sm">
          <button
            type="button"
            onClick={() => setView("practice")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              view === "practice"
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Regular practice
          </button>
          <button
            type="button"
            onClick={() => setView("assessment")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              view === "assessment"
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Assessment (10 questions)
          </button>
        </div>
      </div>

      {view === "assessment" && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 text-sm text-slate-100">
          <h2 className="text-lg font-semibold text-white">Combined assessment</h2>
          <p className="mt-1 text-slate-300">
            Take a mixed test that pulls questions from across all chapters. Each assessment has up to{" "}
            <span className="font-semibold text-white">10 questions</span>.
          </p>
          <p className="mt-2 text-slate-400">
            Your answers still update your mastery and XP for the underlying sections.
          </p>
          <Link
            href="/app/assessment"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Start assessment
          </Link>
        </div>
      )}

      {view === "practice" && curriculum.chapters.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400">
          No chapters yet. Run the seed script to load Class 12 Maths content.
        </div>
      ) : view === "practice" ? (
        <div className="space-y-3">
          {curriculum.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedChapter((id) =>
                    id === chapter.id ? null : chapter.id
                  )
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-white hover:bg-slate-700/30"
              >
                <span>
                  Chapter {chapter.order}: {chapter.title}
                </span>
                <span
                  className={`transition ${expandedChapter === chapter.id ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>
              {expandedChapter === chapter.id && (
                <div className="border-t border-slate-700 px-5 py-3">
                  <ul className="space-y-2">
                    {chapter.sections.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={`/app/section/${section.id}`}
                          className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-slate-200 transition hover:border-indigo-500 hover:bg-slate-700/80"
                        >
                          <span className="font-medium">{section.title}</span>
                          <span className="text-sm text-slate-500">
                            {section.questionCount} questions
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
