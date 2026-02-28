import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, school: true, xp: true, createdAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stats = await prisma.studentConceptStats.findMany({
    where: { userId },
    include: {
      concept: {
        include: {
          chapter: true,
          prerequisites: {
            include: { fromConcept: true },
          },
          reinforcementNodes: true,
        },
      },
      banditStats: true,
    },
  });

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { question: true },
  });

  const errorLogs = await prisma.errorLog.groupBy({
    by: ["conceptId", "errorType"],
    where: { userId },
    _count: { _all: true },
  });

  const conceptNodes = stats.map((s) => {
    const prereqIds = s.concept.prerequisites.map((p) => p.fromConceptId);
    const reinforcementIds = s.concept.reinforcementNodes.map(
      (r) => r.reinforcementConceptId
    );

    return {
      id: s.conceptId,
      title: s.concept.title,
      chapterTitle: s.concept.chapter?.title ?? null,
      chapterOrder: s.concept.chapter?.order ?? null,
      mastery: s.masteryProbability,
      learningVelocity: s.learningVelocity,
      frustrationIndex: s.frustrationIndex,
      hintDependencyRatio: s.hintDependencyRatio,
      eloRating: s.eloRating,
      questionsAnswered: s.questionsAnswered,
      correctAnswers: s.correctAnswers,
      incorrectAnswers: s.incorrectAnswers,
      prerequisites: prereqIds,
      reinforcementNodes: reinforcementIds,
      unlocked: s.masteryProbability >= 0.2,
      isCurrent: false,
    };
  });

  attempts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const conceptRedirectHistory = attempts.map((a) => ({
    attemptId: a.id,
    conceptId: a.conceptId,
    difficulty: a.selectedDifficulty,
    mode: a.mode,
    masteryAfter: a.masteryAfter,
    createdAt: a.createdAt,
  }));

  const totalHints = stats.reduce((acc, s) => acc + s.hintsUsed, 0);
  const totalQuestions = stats.reduce((acc, s) => acc + s.questionsAnswered, 0);
  const hintUsageRatio =
    totalQuestions > 0 ? totalHints / totalQuestions : 0;

  const velocity =
    stats.length > 0
      ? stats.reduce((acc, s) => acc + s.learningVelocity, 0) / stats.length
      : 0;

  const adaptiveAttempts = attempts.filter((a) => a.mode === "ADAPTIVE");
  const staticAttempts = attempts.filter((a) => a.mode === "STATIC");

  const masteryByMode = {
    adaptive: adaptiveAttempts.length
      ? adaptiveAttempts[adaptiveAttempts.length - 1].masteryAfter
      : 0,
    static: staticAttempts.length
      ? staticAttempts[staticAttempts.length - 1].masteryAfter
      : 0,
  };

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      school: user.school,
      xp: user.xp ?? 0,
      createdAt: user.createdAt,
    },
    concepts: conceptNodes,
    errorSummary: errorLogs,
    conceptRedirectHistory,
    learningVelocity: velocity,
    hintUsageRatio,
    masteryByMode,
  });
}

