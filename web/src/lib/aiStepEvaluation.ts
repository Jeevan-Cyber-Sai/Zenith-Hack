export type StepEvaluationInput = {
  questionPrompt: string;
  studentSteps: string;
};

export type ErrorTypeLabel =
  | "sign_error"
  | "expansion_error"
  | "algebra_isolation_error"
  | "conceptual_error"
  | "none";

export type HintLevel = "conceptual_nudge" | "strategy_hint" | "step_correction";

export type StepEvaluationResult = {
  isCorrect: boolean;
  errorType: ErrorTypeLabel;
  hints: {
    conceptualNudge: string;
    strategyHint: string;
    stepCorrection: string;
  };
  /** Full step-by-step solution for the question */
  completeSolution: string;
};

export async function evaluateStudentSteps(
  input: StepEvaluationInput
): Promise<StepEvaluationResult> {
  const { questionPrompt, studentSteps } = input;

  // Very simple rule-based / keyword matching evaluation.
  const questionLower = questionPrompt.toLowerCase();
  const stepsLower = studentSteps.toLowerCase();

  const keywords: string[] = [];

  if (questionLower.includes("reflexive") || questionLower.includes("symmetric") || questionLower.includes("transitive")) {
    keywords.push("reflexive", "symmetric", "transitive", "equivalence");
  }
  if (questionLower.includes("matrix") || questionLower.includes("matrices")) {
    keywords.push("determinant", "inverse", "transpose", "identity", "row", "column");
  }
  if (questionLower.includes("continuity") || questionLower.includes("continuous")) {
    keywords.push("limit", "left-hand limit", "right-hand limit", "continuous", "discontinuous");
  }
  if (questionLower.includes("differentiab")) {
    keywords.push("derivative", "differentiable", "dy/dx", "slope");
  }
  if (questionLower.includes("inverse trigonometric") || questionLower.includes("tan⁻¹") || questionLower.includes("sin⁻¹")) {
    keywords.push("principal value", "range", "domain", "identity");
  }

  // Also match numbers that appear in the question.
  const numberMatches = questionPrompt.match(/-?\d+(\.\d+)?/g) ?? [];

  let score = 0;
  for (const kw of keywords) {
    if (stepsLower.includes(kw)) score += 1;
  }
  for (const n of numberMatches) {
    if (studentSteps.includes(n)) score += 1;
  }

  const lengthScore = studentSteps.trim().length >= 40 ? 1 : 0;
  score += lengthScore;

  const isCorrect = score >= 2;

  return {
    isCorrect,
    errorType: "none",
    hints: {
      conceptualNudge:
        "Focus on the main concept of the question and explain each important step in words, not just calculations.",
      strategyHint:
        "Identify what is given, what you need to prove or find, then outline the sequence of algebraic or conceptual steps that bridge the two.",
      stepCorrection:
        "Check that every transformation you make is valid (especially signs, expansions and use of formulas) and that your final statement actually answers the question.",
    },
    completeSolution:
      "This version of STUDEMY uses simple keyword matching instead of a full AI model, so treat the correctness flag as a rough guide and always double-check your reasoning.",
  };
}

/** Generate hints and full solution for a question (no student answer). Used for pre-submit reveal. */
export type QuestionHintsResult = {
  conceptualNudge: string;
  strategyHint: string;
  stepCorrection: string;
  completeSolution: string;
};

export async function generateQuestionHints(questionPrompt: string): Promise<QuestionHintsResult> {
  const lower = questionPrompt.toLowerCase();

  if (lower.includes("continuity") || lower.includes("differentiab")) {
    return {
      conceptualNudge:
        "Think about how limits from the left and right at a point compare to the function value there, and how derivatives relate to the slope of the curve.",
      strategyHint:
        "First check continuity by computing the left-hand and right-hand limits and comparing them with f(a). Then, if needed, compute derivatives from the definition or using standard rules.",
      stepCorrection:
        "Write down lim(x→a-) f(x), lim(x→a+) f(x) and f(a) explicitly, simplify each, and only then decide continuity and differentiability.",
      completeSolution:
        "Outline: 1) Determine f(a). 2) Compute left-hand and right-hand limits at a. 3) Compare the three values to decide continuity. 4) If continuous, compute derivatives from the left and right at a and compare to decide differentiability.",
    };
  }

  if (lower.includes("matrix") || lower.includes("matrices")) {
    return {
      conceptualNudge:
        "Recall the basic operations on matrices: addition, multiplication, transpose, determinant, and inverse, and which of them are defined for the given orders.",
      strategyHint:
        "Check the order of each matrix, then apply the appropriate algebraic rule (like AB ≠ BA in general, or |AB| = |A||B| for square matrices) step by step.",
      stepCorrection:
        "Write the matrices in block form, carefully perform the row/column operations or multiplications, and double-check each entry you compute.",
      completeSolution:
        "Start by writing down the shapes of the matrices. Perform the required operations explicitly, use determinant or inverse formulas where needed, and simplify the final matrix or scalar result.",
    };
  }

  return {
    conceptualNudge:
      "Identify which topic this question belongs to (algebra, relations, calculus, matrices, etc.) and recall the key definitions involved.",
    strategyHint:
      "Restate the question in your own words, list the given information, then plan a 3–5 step route from what is given to what must be shown or computed.",
    stepCorrection:
      "Look at your last non-trivial step and check whether you applied the right formula or algebra rule; if anything seems like a guess, recompute it slowly.",
    completeSolution:
      "Because this version is rule-based, it cannot generate a full worked solution. Use your textbook or class notes to write a clean step-by-step answer once you are confident in your reasoning.",
  };
}

export function hintRewardMultiplier(options: {
  usedHint: boolean;
  hintLevel?: HintLevel;
}): number {
  const { usedHint, hintLevel } = options;
  if (!usedHint) return 1.0;

  switch (hintLevel) {
    case "conceptual_nudge":
      return 0.75;
    case "strategy_hint":
      return 0.5;
    case "step_correction":
      return 0.25;
    default:
      return 0.5;
  }
}

