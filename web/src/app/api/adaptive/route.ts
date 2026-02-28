import { NextRequest, NextResponse } from "next/server";
import { Difficulty, PracticeMode, ErrorType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { selectBanditArm } from "@/lib/bandit";
import { updateMastery } from "@/lib/mastery";
import { decideNextStepForConcept } from "@/lib/skillTree";
import {
  evaluateStudentSteps,
  hintRewardMultiplier,
} from "@/lib/aiStepEvaluation";

type Mode = "STATIC" | "ADAPTIVE";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      conceptId,
      questionId: clientQuestionId,
      studentSteps,
      usedHint,
      mode,
    }: {
      userId: string;
      conceptId: string;
      questionId: string | null;
      studentSteps: string;
      usedHint: boolean;
      mode: Mode;
    } = body;

    let questionId = clientQuestionId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        reinforcementNodes: true,
        prerequisiteOf: {
          include: { toConcept: true },
        },
        prerequisites: {
          include: { fromConcept: true },
        },
      },
    });

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    let stats = await prisma.studentConceptStats.findFirst({
      where: { userId: user.id, conceptId: concept.id },
      include: { banditStats: true },
    });

    if (!stats) {
      stats = await prisma.studentConceptStats.create({
        data: {
          userId: user.id,
          conceptId: concept.id,
        },
        include: { banditStats: true },
      });
    }

    const questionsForConcept = await prisma.question.findMany({
      where: { conceptId: concept.id },
    });

    if (questionsForConcept.length === 0) {
      return NextResponse.json(
        { error: "No questions for concept" },
        { status: 400 }
      );
    }

    let difficulty: Difficulty;
    let selectedQuestionId: string;
    let question: { id: string; prompt: string; difficulty: Difficulty } | undefined;

    // If client sent a questionId (e.g. from GET /api/app/practice/next), use that question.
    if (questionId) {
      const existing = questionsForConcept.find((q) => q.id === questionId);
      if (existing) {
        question = existing;
        selectedQuestionId = existing.id;
        difficulty = existing.difficulty;
      }
    }

    if (!question) {
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
                    data: {
                      statsId: stats!.id,
                      difficulty: d,
                    },
                  })
                )
              );

        const totalSelections = banditStats.reduce(
          (acc, b) => acc + b.timesSelected,
          0
        );

        const banditChoice = selectBanditArm({
          totalSelections: totalSelections || 1,
          arms: banditStats.map((b) => ({
            armId: b.difficulty as "EASY" | "MEDIUM" | "HARD" | "CHALLENGE",
            timesSelected: b.timesSelected || 0,
            averageReward: b.averageReward || 0,
          })),
        });

        difficulty = Difficulty[banditChoice];
      }

      const candidateQuestions = questionsForConcept.filter(
        (q) => q.difficulty === difficulty
      );
      question =
        candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)] ??
        questionsForConcept[0];
      selectedQuestionId = question.id;
    }

    const chosenQuestion = question ?? questionsForConcept[0];
    const evalResult = await evaluateStudentSteps({
      questionPrompt: chosenQuestion.prompt,
      studentSteps,
    });

    const isCorrect = evalResult.isCorrect;

    const masteryBefore = stats.masteryProbability;

    const masteryUpdate = updateMastery({
      mastery: stats.masteryProbability,
      learningVelocity: stats.learningVelocity,
      frustrationIndex: stats.frustrationIndex,
      hintDependencyRatio: stats.hintDependencyRatio,
      questionsAnswered: stats.questionsAnswered,
      correctAnswers: stats.correctAnswers,
      incorrectAnswers: stats.incorrectAnswers,
      usedHint,
      isCorrect,
    });

    const masteryAfter = masteryUpdate.mastery;

    let reward = masteryAfter - masteryBefore;
    const rewardMultiplier = hintRewardMultiplier({
      usedHint,
      hintLevel: usedHint ? "strategy_hint" : undefined,
    });
    reward *= rewardMultiplier;

    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        questionId: chosenQuestion.id,
        conceptId: concept.id,
        statsId: stats.id,
        isCorrect,
        usedHint,
        mode: mode === "STATIC" ? PracticeMode.STATIC : PracticeMode.ADAPTIVE,
        masteryBefore,
        masteryAfter,
        reward,
        selectedDifficulty: chosenQuestion.difficulty,
      },
    });

    // Gamification: +10 XP for correct answer
    if (isCorrect) {
      await prisma.user.update({
        where: { id: user.id },
        data: { xp: { increment: 10 } },
      });
    }

    if (evalResult.errorType && evalResult.errorType !== "none") {
      await prisma.errorLog.create({
        data: {
          userId: user.id,
          attemptId: attempt.id,
          conceptId: concept.id,
          errorType: mapErrorType(evalResult.errorType),
          message: evalResult.hints.stepCorrection,
        },
      });
    }

    const totalHints = stats.hintsUsed + (usedHint ? 1 : 0);
    const totalAnswered = stats.questionsAnswered + 1;

    const updatedStats = await prisma.studentConceptStats.update({
      where: { id: stats.id },
      data: {
        masteryProbability: masteryUpdate.mastery,
        learningVelocity: masteryUpdate.learningVelocity,
        frustrationIndex: masteryUpdate.frustrationIndex,
        hintDependencyRatio: masteryUpdate.hintDependencyRatio,
        questionsAnswered: totalAnswered,
        correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: stats.incorrectAnswers + (!isCorrect ? 1 : 0),
        hintsUsed: totalHints,
        lastUpdatedAt: new Date(),
      },
      include: { banditStats: true },
    });

    if (mode === "ADAPTIVE") {
      await prisma.banditStats.update({
        where: {
          statsId_difficulty: {
            statsId: updatedStats.id,
            difficulty: chosenQuestion.difficulty,
          },
        },
        data: {
          timesSelected: {
            increment: 1,
          },
          averageReward:
            (reward +
              updatedStats.banditStats.find((b) => b.difficulty === chosenQuestion.difficulty)!
                .averageReward *
                (updatedStats.banditStats.find((b) => b.difficulty === chosenQuestion.difficulty)!
                  .timesSelected || 0)) /
            ((updatedStats.banditStats.find((b) => b.difficulty === chosenQuestion.difficulty)!
              .timesSelected || 0) +
              1),
          updatedAt: new Date(),
        },
      });
    }

    const nextConceptRelation = concept.prerequisiteOf[0];
    const prerequisiteRelation = concept.prerequisites[0];
    const reinforcementNode = concept.reinforcementNodes[0];

    const decision = decideNextStepForConcept({
      stats: updatedStats,
      nextConceptId: nextConceptRelation?.toConceptId,
      prerequisiteConceptId: prerequisiteRelation?.fromConceptId,
      reinforcementConceptId: reinforcementNode?.reinforcementConceptId,
    });

    if (
      decision.type === "REDIRECT_PREREQUISITE" ||
      decision.type === "INJECT_REINFORCEMENT"
    ) {
      await prisma.studentConceptStats.update({
        where: { id: updatedStats.id },
        data: {
          redirectedCount: {
            increment: 1,
          },
        },
      });
    }

    const xpEarned = isCorrect ? 10 : 0;
    const xpTotal = (user.xp ?? 0) + xpEarned;

    return NextResponse.json({
      attemptId: attempt.id,
      isCorrect,
      masteryBefore,
      masteryAfter,
      reward,
      difficulty: chosenQuestion.difficulty,
      banditEnabled: mode === "ADAPTIVE",
      hints: evalResult.hints,
      completeSolution: evalResult.completeSolution ?? evalResult.hints.stepCorrection,
      skillTreeDecision: decision,
      xpEarned,
      xpTotal,
    });
  } catch (err) {
    console.error("Error in /api/adaptive:", err);
    return NextResponse.json(
      {
        error:
          "Something went wrong while checking your answer. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

function mapErrorType(label: string): ErrorType {
  switch (label) {
    case "sign_error":
      return ErrorType.SIGN_ERROR;
    case "expansion_error":
      return ErrorType.EXPANSION_ERROR;
    case "algebra_isolation_error":
      return ErrorType.ALGEBRA_ISOLATION_ERROR;
    case "conceptual_error":
    default:
      return ErrorType.CONCEPTUAL_ERROR;
  }
}

