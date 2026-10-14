import { CreativeBrief, CreativeBriefSchema } from "@/types/schema";
import { validateMilestonesSum } from "./budget";

export interface BriefValidationResult {
  readonly success: boolean;
  readonly data?: CreativeBrief;
  readonly errors: Record<string, string>;
  readonly missingFields: string[];
}

/**
 * Validates a creative brief against the Zod schema and generates friendly human-facing error lists.
 */
export function validateBrief(input: unknown): BriefValidationResult {
  const parsed = CreativeBriefSchema.safeParse(input);

  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
      errors: {},
      missingFields: [],
    };
  }

  const errors: Record<string, string> = {};
  const missingFields: string[] = [];

  for (const issue of parsed.error.issues) {
    const pathStr = issue.path.join(".");
    errors[pathStr] = issue.message;

    // Friendly labels for missing fields gate
    if (pathStr.includes("campaignTitle")) {
      missingFields.push("Campaign Title is required");
    } else if (pathStr.includes("brandName")) {
      missingFields.push("Brand Name is required");
    } else if (pathStr.includes("description")) {
      missingFields.push("Campaign Description is required");
    } else if (pathStr.includes("aspectRatios")) {
      missingFields.push("At least one Aspect Ratio must be selected");
    } else if (pathStr.includes("totalBudgetUsd")) {
      missingFields.push("A valid Total Budget (USD) is required");
    } else if (pathStr.includes("deadline")) {
      missingFields.push("A valid Target Deadline is required");
    } else if (pathStr.includes("milestones")) {
      missingFields.push(issue.message);
    } else if (pathStr.includes("commercialTerms.termMonths")) {
      missingFields.push("Term License duration in months is required");
    } else if (pathStr.includes("commercialTerms.regions")) {
      missingFields.push("At least one region is required for regional territory");
    }
  }

  // Also check milestone sum specifically
  const candidate = input as Partial<CreativeBrief> | null | undefined;
  if (candidate?.milestones && Array.isArray(candidate.milestones)) {
    const milestoneCheck = validateMilestonesSum(candidate.milestones);
    if (!milestoneCheck.valid) {
      errors["milestones"] = `Milestones sum to ${milestoneCheck.sum}%, but must sum to exactly 100% (${milestoneCheck.diff > 0 ? `${milestoneCheck.diff}% remaining` : `${Math.abs(milestoneCheck.diff)}% over`})`;
      if (!missingFields.includes("Milestone percentages must sum to 100%")) {
        missingFields.push("Milestone percentages must sum to 100%");
      }
    }
  }

  // Deduplicate missing fields
  const uniqueMissing = Array.from(new Set(missingFields));

  return {
    success: false,
    errors,
    missingFields: uniqueMissing,
  };
}

/**
 * Checks if a partial brief draft is complete enough to submit.
 */
export function canSubmitBrief(draft: Partial<CreativeBrief>): boolean {
  const result = validateBrief(draft);
  return result.success;
}
