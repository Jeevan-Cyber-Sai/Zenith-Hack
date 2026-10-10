# Zenith — Adaptive Learning Platform

An adaptive practice platform for Class 12 Mathematics that picks each student's next question based on how they are actually doing, not a fixed sequence. Built for Zenith Hack (Feb 2026).

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

## What it does

- **Adaptive difficulty with a multi-armed bandit** — a UCB1 bandit chooses between Easy / Medium / Hard / Challenge questions, balancing exploration with what works best for each learner (`web/src/lib/bandit.ts`).
- **Per-concept mastery tracking** — every attempt updates a mastery score plus secondary signals: learning velocity, a frustration index and hint dependency (`web/src/lib/mastery.ts`).
- **Concept skill tree** — concepts are linked by prerequisites and reinforcement edges, so weak foundations are revisited before moving on (`web/src/lib/skillTree.ts`).
- **Step-by-step answer evaluation** — students submit their working, which is checked for the key ideas and classified by error type, with tiered hints (conceptual nudge → strategy hint → step correction).
- **Gamification** — XP for correct answers, penalties for hints and revealed solutions, and a leaderboard.
- **Diagnostic assessment, discussion threads and an in-app assistant (Nova).**

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI, lucide-react |
| Backend | Next.js API routes, Zod validation, bcrypt password hashing |
| Database | PostgreSQL with Prisma ORM (migrations + seed script) |

## Project structure

```
web/
├── prisma/            # schema.prisma + migrations
├── scripts/seed.cjs   # seeds subjects, chapters, concepts, questions, demo student
└── src/
    ├── app/           # pages (landing, login, /app dashboard, practice, assessment, discuss)
    │   └── api/       # auth, curriculum, adaptive practice, assessment, discussion, dashboard
    ├── components/    # landing sections, chatbot, UI primitives
    └── lib/           # bandit, mastery, skill tree, step evaluation
```

## Run it locally

Requirements: Node.js 20+, a PostgreSQL database.

```bash
git clone https://github.com/Jeevan-Cyber-Sai/Zenith-Hack.git
cd Zenith-Hack/web
npm install
cp .env.example .env          # then set DATABASE_URL
npx prisma migrate dev        # create tables
npm run db:seed               # load sample curriculum + demo student
npm run dev                   # http://localhost:3000
```

## Roadmap

- Replace keyword-based step evaluation with an LLM grader
- Move session handling from localStorage to secure HTTP-only cookies
- Add more subjects beyond Class 12 Mathematics
