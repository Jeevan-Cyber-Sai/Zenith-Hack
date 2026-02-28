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

  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    reasoning: { effort: "medium" },
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.output[0].content[0].text;
  const parsed = JSON.parse(raw) as StepEvaluationResult;
  if (!parsed.completeSolution) {
    parsed.completeSolution = parsed.hints?.stepCorrection ?? "See step correction above.";
  }
  return parsed;
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

