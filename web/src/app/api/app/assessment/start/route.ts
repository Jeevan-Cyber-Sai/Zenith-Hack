import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/app/assessment/start?userId=...
 * Returns up to 10 questions sampled across all concepts for a combined assessment.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const questions = await prisma.question.findMany({
    include: {
      concept: {
        include: {
          chapter: true,
        },
      },
    },
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No questions available for assessment" },
      { status: 400 }
    );
  }

  // Shuffle questions and take the first 10
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 10);

  const payload = selected.map((q) => ({
    questionId: q.id,
    conceptId: q.conceptId,
    prompt: q.prompt,
    difficulty: q.difficulty,
    conceptTitle: q.concept.title,
    chapterTitle: q.concept.chapter?.title ?? null,
  }));

  return NextResponse.json({
    questions: payload,
    total: payload.length,
  });
}

