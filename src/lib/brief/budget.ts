import { Milestone } from "@/types/schema";

export interface MilestoneWithAmount extends Milestone {
  readonly amountUsd: number;
}

export interface MilestoneSumValidation {
  readonly valid: boolean;
  readonly sum: number;
  readonly diff: number; // Positive if under 100, negative if over 100
}

/**
 * Calculates exact USD escrow amounts for each milestone based on its percentage and total budget.
 */
export function calculateMilestoneAmounts(
  milestones: readonly Milestone[],
  totalBudgetUsd: number
): MilestoneWithAmount[] {
  const safeBudget = isNaN(totalBudgetUsd) || totalBudgetUsd < 0 ? 0 : totalBudgetUsd;

  return milestones.map((m) => {
    const rawAmount = (m.percentOfBudget / 100) * safeBudget;
    return {
      ...m,
      amountUsd: Math.round(rawAmount),
    };
  });
}

/**
 * Validates whether the milestone percentages sum to exactly 100%.
 */
export function validateMilestonesSum(
  milestones: readonly Milestone[]
): MilestoneSumValidation {
  const sum = milestones.reduce((acc, m) => acc + (isNaN(m.percentOfBudget) ? 0 : m.percentOfBudget), 0);
  const roundedSum = Math.round(sum * 100) / 100;
  const diff = Math.round((100 - roundedSum) * 100) / 100;
  const valid = Math.abs(diff) < 0.001;

  return {
    valid,
    sum: roundedSum,
    diff,
  };
}

/**
 * Normalizes milestone percentages so they sum to exactly 100%.
 * Preserves relative weights while guaranteeing whole-integer or clean round percentages.
 */
export function autoBalanceMilestones(
  milestones: readonly Milestone[]
): Milestone[] {
  if (milestones.length === 0) {
    return [];
  }

  if (milestones.length === 1) {
    const single = milestones[0];
    if (!single) return [];
    return [{ ...single, percentOfBudget: 100 }];
  }

  const currentSum = milestones.reduce((acc, m) => acc + (m.percentOfBudget || 0), 0);

  if (currentSum === 0) {
    // Even distribution fallback
    const baseShare = Math.floor(100 / milestones.length);
    const remainder = 100 - baseShare * milestones.length;

    return milestones.map((m, idx) => ({
      ...m,
      percentOfBudget: idx === milestones.length - 1 ? baseShare + remainder : baseShare,
    }));
  }

  // Proportional rebalancing
  let allocated = 0;
  const rebalanced: Milestone[] = [];

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    if (!m) continue;

    if (i === milestones.length - 1) {
      // Last milestone absorbs any rounding delta to guarantee exact 100%
      const finalPercent = Math.max(0, 100 - allocated);
      rebalanced.push({
        ...m,
        percentOfBudget: finalPercent,
      });
    } else {
      const propPercent = Math.round((m.percentOfBudget / currentSum) * 100);
      allocated += propPercent;
      rebalanced.push({
        ...m,
        percentOfBudget: propPercent,
      });
    }
  }

  return rebalanced;
}

/**
 * Formats a number as a clean USD currency string.
 */
export function formatUsd(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "$0";
  }
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}
