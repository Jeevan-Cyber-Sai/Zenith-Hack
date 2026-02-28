import { NextRequest, NextResponse } from "next/server";
import { Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { selectBanditArm } from "@/lib/bandit";

type Mode = "STATIC" | "ADAPTIVE";

/**
 * GET /api/app/practice/next?userId=...&conceptId=...&mode=STATIC|ADAPTIVE
 * Returns the next question to show for this user/section. Use questionId in POST /api/adaptive when submitting.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const conceptId = req.nextUrl.searchParams.get("conceptId");
  const mode = (req.nextUrl.searchParams.get("mode") ?? "ADAPTIVE") as Mode;

  if (!userId || !conceptId) {
    return NextResponse.json(
      { error: "userId and conceptId required" },
      { status: 400 }
    );
  }

  const concept = await prisma.concept.findUnique({
    where: { id: conceptId },
  });
  if (!concept) {
    return NextResponse.json({ error: "Concept not found" }, { status: 404 });
  }

  const questions = await prisma.question.findMany({
    where: { conceptId },
  });
  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No questions for this section" },
      { status: 400 }
    );
  }

  let stats = await prisma.studentConceptStats.findFirst({
    where: { userId, conceptId },
    include: { banditStats: true },
  });
  if (!stats) {
    stats = await prisma.studentConceptStats.create({
      data: { userId, conceptId },
      include: { banditStats: true },
    });
  }

  let difficulty: Difficulty;
  if (mode === "STATIC") {
    difficulty = Difficulty.MEDIUM;
  } else {
    const banditArms = [
      Difficulty.EASY,
      Difficulty.MEDIUM,
      Difficulty.HARD,
      Difficulty.CHALLENGE,
    ];
    const banditStats =
      stats.banditStats.length > 0
        ? stats.banditStats
        : await prisma.$transaction(
            banditArms.map((d) =>
              prisma.banditStats.create({
                data: { statsId: stats!.id, difficulty: d },
              })
            )
          );
    const totalSelections = banditStats.reduce((a, b) => a + b.timesSelected, 0);
    const choice = selectBanditArm({
      totalSelections: totalSelections || 1,
      arms: banditStats.map((b) => ({
        armId: b.difficulty as "EASY" | "MEDIUM" | "HARD" | "CHALLENGE",
        timesSelected: b.timesSelected || 0,
        averageReward: b.averageReward || 0,
      })),
    });
    difficulty = Difficulty[choice];
  }

  const candidates = questions.filter((q) => q.difficulty === difficulty);
  const question =
    candidates[Math.floor(Math.random() * candidates.length)] ?? questions[0];

  // ELO-style display: base 1200, difficulty offsets (same as bandit)
  const baseElo = stats.eloRating;
  const eloOffset =
    question.difficulty === "EASY"
      ? -100
      : question.difficulty === "MEDIUM"
        ? 0
        : question.difficulty === "HARD"
          ? 100
          : 200;
  const displayElo = baseElo + eloOffset;

  return NextResponse.json({
    questionId: question.id,
    prompt: question.prompt,
    difficulty: question.difficulty,
    displayElo,
    conceptTitle: concept.title,
  });
}
