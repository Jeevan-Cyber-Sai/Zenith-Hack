import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuestionHints } from "@/lib/aiStepEvaluation";

const XP_HINT = 5;
const XP_SOLUTION = 10;

type RevealType = "hint1" | "hint2" | "hint3" | "solution";

const hintCache = new Map<string, Awaited<ReturnType<typeof generateQuestionHints>>>();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, questionId, type } = body as {
    userId: string;
    questionId: string;
    type: RevealType;
  };

  if (!userId || !questionId || !type) {
    return NextResponse.json(
      { error: "userId, questionId, and type required" },
      { status: 400 }
    );
  }
  if (!["hint1", "hint2", "hint3", "solution"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const xpCost = type === "solution" ? XP_SOLUTION : XP_HINT;
  const currentXp = user.xp ?? 0;
  if (currentXp < xpCost) {
    return NextResponse.json(
      { error: `Not enough XP. Need ${xpCost} XP. You have ${currentXp} XP.`, code: "INSUFFICIENT_XP" },
      { status: 400 }
    );
  }

  let hints = hintCache.get(questionId);
  if (!hints) {
    try {
      hints = await generateQuestionHints(question.prompt);
      hintCache.set(questionId, hints);
    } catch (e) {
      console.error(e);
      hints = {
        conceptualNudge:
          "Think about the main concept and what the question is asking.",
        strategyHint:
          "Identify what is given and what you need to find; then outline the steps.",
        stepCorrection:
          "Check each step for algebra or sign errors and that you answered the question.",
        completeSolution:
          "Review the question and your steps. Use your notes or textbook for a full solution.",
      };
    }
  }

  const newXp = currentXp - xpCost;
  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp },
  });

  let content: string;
  if (type === "hint1") content = hints.conceptualNudge?.trim() || "Consider the main idea behind the question.";
  else if (type === "hint2") content = hints.strategyHint?.trim() || "Plan the steps from given information to the answer.";
  else if (type === "hint3") content = hints.stepCorrection?.trim() || "Recheck your last step and the required formula.";
  else content = hints.completeSolution?.trim() || "Use your textbook or notes for the full solution.";

  return NextResponse.json({
    content,
    xpDeducted: xpCost,
    xpTotal: newXp,
  });
}
