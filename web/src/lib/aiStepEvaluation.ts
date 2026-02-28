import OpenAI from "openai";

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

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

const systemPrompt = `
You are an AI tutor evaluating step-by-step math solutions.

For each response:
- Determine whether the student's overall solution is logically correct.
- If incorrect, classify the primary error as one of:
  - sign_error
  - expansion_error
  - algebra_isolation_error
  - conceptual_error
- Provide three levels of hints:
  1. Conceptual nudge (high-level idea, no formulas)
  2. Strategy hint (outline of the approach, still leaving work for the student)
  3. Step correction (explicit correction of the mistaken step)
- Provide a "completeSolution" field: the full step-by-step correct solution to the question, suitable to show to the student after they submit.

Respond ONLY in strict JSON with the following shape:
{
  "isCorrect": boolean,
  "errorType": "sign_error" | "expansion_error" | "algebra_isolation_error" | "conceptual_error" | "none",
  "hints": {
    "conceptualNudge": string,
    "strategyHint": string,
    "stepCorrection": string
  },
  "completeSolution": string
}
`;

export async function evaluateStudentSteps(
  input: StepEvaluationInput
): Promise<StepEvaluationResult> {
  const { questionPrompt, studentSteps } = input;

  const userPrompt = `
Question:
${questionPrompt}

Student solution (step-by-step):
${studentSteps}
`;

  // Fallback when OpenAI is not configured or call fails
  if (!hasOpenAiKey) {
    return {
      isCorrect: false,
      errorType: "none",
      hints: {
        conceptualNudge:
          "AI evaluation is not configured. Please verify your solution carefully, step by step.",
        strategyHint:
          "Try to restate the question, identify what is given and what needs to be found, then apply the relevant formula or theorem.",
        stepCorrection:
          "Double-check each algebraic manipulation (signs, expansions, and isolating the variable).",
      },
      completeSolution:
        "Automatic step evaluation is currently disabled. Ask your teacher or mentor to review this solution.",
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt + "\nRespond with only valid JSON, no other text." },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as StepEvaluationResult;
    if (!parsed.completeSolution) {
      parsed.completeSolution = parsed.hints?.stepCorrection ?? "See step correction above.";
    }
    return parsed;
  } catch (err) {
    console.error("evaluateStudentSteps failed:", err);
    return {
      isCorrect: false,
      errorType: "none",
      hints: {
        conceptualNudge:
          "There was an issue running automatic evaluation. Focus on the core concept and try to reason through the problem again.",
        strategyHint:
          "Break the question into smaller sub-steps and verify each one. Compare with similar examples you have solved.",
        stepCorrection:
          "Check your algebra and calculations; if you used a formula, ensure it is applied correctly.",
      },
      completeSolution:
        "Automatic evaluation failed temporarily. Please try again later or cross-check with your notes.",
    };
  }
}

/** Generate hints and full solution for a question (no student answer). Used for pre-submit reveal. */
export type QuestionHintsResult = {
  conceptualNudge: string;
  strategyHint: string;
  stepCorrection: string;
  completeSolution: string;
};

const hintsOnlySystemPrompt = `
You are an AI math tutor. Given a math question, provide:
1. conceptualNudge: A high-level idea or nudge (no formulas, just the concept).
2. strategyHint: Outline of the approach the student could take.
3. stepCorrection: A more direct hint pointing to the next step.
4. completeSolution: The full step-by-step correct solution to the question.

Respond ONLY in strict JSON:
{
  "conceptualNudge": string,
  "strategyHint": string,
  "stepCorrection": string,
  "completeSolution": string
}
`;

export async function generateQuestionHints(questionPrompt: string): Promise<QuestionHintsResult> {
  if (!hasOpenAiKey) {
    return {
      conceptualNudge:
        "AI hints are not configured. Think about what the question is really asking and which concept it belongs to.",
      strategyHint:
        "Identify knowns and unknowns, recall the relevant formula/theorem, and set up the equation step by step.",
      stepCorrection:
        "Carefully recompute any arithmetic and ensure you substitute values correctly into the formulas.",
      completeSolution:
        "Automatic hint generation is currently disabled. Use your textbook or class notes to construct a full solution.",
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: hintsOnlySystemPrompt + "\nRespond with only valid JSON, no other text." },
        { role: "user", content: `Question:\n${questionPrompt}` },
      ],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    return JSON.parse(raw) as QuestionHintsResult;
  } catch (err) {
    console.error("generateQuestionHints failed:", err);
    return {
      conceptualNudge:
        "There was an issue generating AI hints. Re-read the question and recall the underlying concept.",
      strategyHint:
        "Outline the steps you would take to solve a similar textbook example, then adapt them here.",
      stepCorrection:
        "Revisit your last step and check for algebra or sign mistakes.",
      completeSolution:
        "Automatic hints failed temporarily. Try searching your notes or textbook for a worked example.",
    };
  }
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

