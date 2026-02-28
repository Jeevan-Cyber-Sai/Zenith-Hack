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
      <div>
        <h1 className="text-2xl font-bold text-white">
          {curriculum.subject.name} — Class {curriculum.class?.name ?? "12"}
        </h1>
        <p className="mt-1 text-slate-400">
          Choose a chapter, then a section to practice. Questions adapt to your level (ELO-based).
        </p>
      </div>

      {curriculum.chapters.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400">
          No chapters yet. Run the seed script to load Class 12 Maths content.
        </div>
      ) : (
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
      )}
    </div>
  );
}
