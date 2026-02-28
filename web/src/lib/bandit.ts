export type BanditArmId = "EASY" | "MEDIUM" | "HARD" | "CHALLENGE";

export type BanditArmStats = {
  armId: BanditArmId;
  timesSelected: number;
  averageReward: number;
};

export type BanditContext = {
  totalSelections: number;
  arms: BanditArmStats[];
};

// Simple UCB1 multi-armed bandit implementation.
export function selectBanditArm(ctx: BanditContext): BanditArmId {
  const { totalSelections, arms } = ctx;

  // Force exploration: if any arm has never been tried, pick it first.
  const unexplored = arms.find((a) => a.timesSelected === 0);
  if (unexplored) return unexplored.armId;

  const logN = Math.log(Math.max(totalSelections, 1));

  let bestArm: BanditArmStats = arms[0];
  let bestScore = -Infinity;

  for (const arm of arms) {
    const mean = arm.averageReward;
    const exploration = Math.sqrt((2 * logN) / arm.timesSelected);
    const score = mean + exploration;

    if (score > bestScore) {
      bestScore = score;
      bestArm = arm;
    }
  }

  return bestArm.armId;
}

export function eloForArm(baseElo: number, arm: BanditArmId): number {
  switch (arm) {
    case "EASY":
      return baseElo - 100;
    case "MEDIUM":
      return baseElo;
    case "HARD":
      return baseElo + 100;
    case "CHALLENGE":
      return baseElo + 200;
  }
}

