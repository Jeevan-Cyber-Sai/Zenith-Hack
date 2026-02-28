import { StudentConceptStats, Difficulty } from "@prisma/client";

export type SkillTreeDecision =
  | { type: "UNLOCK_NEXT"; conceptId: string }
  | { type: "REDIRECT_PREREQUISITE"; conceptId: string }
  | { type: "INJECT_REINFORCEMENT"; conceptId: string }
  | { type: "STAY"; conceptId: string };

export type ConceptNode = {
  id: string;
  title: string;
  mastery: number;
  unlocked: boolean;
  isCurrent: boolean;
  prerequisites: string[];
  reinforcementNodes: string[];
};

export function decideNextStepForConcept(options: {
  stats: StudentConceptStats;
  nextConceptId?: string;
  prerequisiteConceptId?: string;
  reinforcementConceptId?: string;
}): SkillTreeDecision {
  const { stats, nextConceptId, prerequisiteConceptId, reinforcementConceptId } =
    options;

  const mastery = stats.masteryProbability;
  const velocity = stats.learningVelocity;
  const frustration = stats.frustrationIndex;

  if (mastery > 0.9 && velocity > 0.02 && nextConceptId) {
    return { type: "UNLOCK_NEXT", conceptId: nextConceptId };
  }

  if (mastery < 0.6 && frustration > 0.5 && prerequisiteConceptId) {
    return { type: "REDIRECT_PREREQUISITE", conceptId: prerequisiteConceptId };
  }

  if (
    mastery >= 0.6 &&
    mastery <= 0.9 &&
    velocity >= 0 &&
    velocity < 0.02 &&
    reinforcementConceptId
  ) {
    return {
      type: "INJECT_REINFORCEMENT",
      conceptId: reinforcementConceptId,
    };
  }

  return { type: "STAY", conceptId: stats.conceptId };
}

export function difficultyLabel(difficulty: Difficulty): string {
  switch (difficulty) {
    case "EASY":
      return "Easy";
    case "MEDIUM":
      return "Medium";
    case "HARD":
      return "Hard";
    case "CHALLENGE":
      return "Challenge";
    default:
      return difficulty;
  }
}

