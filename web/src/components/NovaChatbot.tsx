"use client";

import { useState } from "react";

const NOVA_INTRO = `Hi! I'm **Nova**, your Studemy assistant.

**What is Studemy?**
Studemy is an adaptive learning platform for Class 12 Mathematics. It models your mastery per concept and uses a smart algorithm (multi-armed bandit) to pick question difficulty so you learn faster.

**How it works**
- **Chapters & sections**: Maths is organised into chapters; each has sections (concepts) with practice questions.
- **Adaptive mode**: Questions are chosen by difficulty (Easy/Medium/Hard/Challenge) based on your current level (ELO).
- **XP**: Solve correctly to earn +10 XP. Revealing hints costs 5 XP each; revealing the full solution costs 10 XP.
- **Mastery**: Your progress per section is tracked (mastery %, learning velocity). The skill tree can unlock next concepts or suggest revision.

**Tips**
- Try to solve without hints to maximise XP.
- Use "Adaptive (ELO)" mode for personalised difficulty.
- Check your Account page to see ELO and attempts per section.`;

const FAQ: { q: string; a: string }[] = [
  { q: "What are ELO points?", a: "ELO is a rating that reflects your level. Questions have difficulty levels (Easy = ELO−100, Medium = ELO, Hard = ELO+100, Challenge = ELO+200). The system picks questions near your level to keep you in the right zone." },
  { q: "How is mastery calculated?", a: "Mastery goes up when you answer correctly (more if you didn't use a hint) and goes down when you're wrong. It's a number between 0 and 1; high mastery can unlock the next concept." },
  { q: "What is the skill tree?", a: "Concepts are connected: some depend on others (prerequisites). When your mastery is high enough, the next concept unlocks. If you're stuck, the system may suggest revisiting a prerequisite or a reinforcement section." },
];

export default function NovaChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500"
        title="Chat with Nova"
        aria-label="Open Nova assistant"
      >
        <span className="text-xl font-bold">N</span>
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-md overflow-hidden rounded-2xl border border-slate-600 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-3">
            <span className="font-semibold text-white">Nova</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4 text-sm text-slate-200">
            <div className="whitespace-pre-wrap leading-relaxed">
              {NOVA_INTRO.split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
              )}
            </div>
            <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
              <p className="font-medium text-slate-300">Quick answers</p>
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-800/80 p-3">
                  <p className="font-medium text-indigo-200">{item.q}</p>
                  <p className="mt-1 text-slate-300">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
