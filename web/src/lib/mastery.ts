export type MasteryUpdateInput = {
  mastery: number; // 0-1
  learningVelocity: number;
  frustrationIndex: number;
  hintDependencyRatio: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  usedHint: boolean;
  isCorrect: boolean;
};

export type MasteryUpdateResult = {
  mastery: number;
  learningVelocity: number;
  frustrationIndex: number;
  hintDependencyRatio: number;
};

/**
 * Applies the specified mastery update rules and updates
 * secondary indicators (velocity, frustration, hint ratio).
 */
export function updateMastery(input: MasteryUpdateInput): MasteryUpdateResult {
  const {
    mastery,
    learningVelocity,
    frustrationIndex,
    hintDependencyRatio,
    questionsAnswered,
    correctAnswers,
    incorrectAnswers,
    usedHint,
    isCorrect,
  } = input;

  let newMastery = mastery;

  if (isCorrect && !usedHint) {
    newMastery += 0.08 * (1 - newMastery);
  } else if (isCorrect && usedHint) {
    newMastery += 0.04 * (1 - newMastery);
  } else if (!isCorrect) {
    newMastery -= 0.1 * newMastery;
  }

  // Clamp between 0 and 1
  newMastery = Math.max(0, Math.min(1, newMastery));

  const totalQuestions = questionsAnswered + 1;
  const newCorrect = correctAnswers + (isCorrect ? 1 : 0);
  const newIncorrect = incorrectAnswers + (!isCorrect ? 1 : 0);
  const newHintsUsed = usedHint ? 1 : 0;

  // Simple learning velocity: recent mastery delta smoothed with previous velocity
  const delta = newMastery - mastery;
  const velocityAlpha = 0.3;
  const newVelocity = velocityAlpha * delta + (1 - velocityAlpha) * learningVelocity;

  // Frustration: more weight on incorrect answers and hint usage
  const incorrectRate = newIncorrect / totalQuestions;
  const hintRate = (hintDependencyRatio * questionsAnswered + newHintsUsed) / totalQuestions;
  const newFrustration = Math.max(
    0,
    Math.min(1, 0.7 * incorrectRate + 0.3 * hintRate)
  );

  const newHintDependency =
    (hintDependencyRatio * questionsAnswered + newHintsUsed) / totalQuestions;

  return {
    mastery: newMastery,
    learningVelocity: newVelocity,
    frustrationIndex: newFrustration,
    hintDependencyRatio: newHintDependency,
  };
}

