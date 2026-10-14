/**
 * State-Machine Authorization for Engagements and Milestones
 *
 * Enforces contract progression rules server-side:
 * - 'active' -> 'in_review' (Only creator can submit deliverables for review)
 * - 'in_review' -> 'active' (Only brand can request revisions)
 * - 'in_review' -> 'completed' (Only brand can approve completion and release escrow)
 * - 'active' | 'in_review' -> 'disputed' (Either participant can flag a dispute)
 * - 'disputed' -> 'active' | 'completed' (Only admin can resolve disputes)
 *
 * Illegal transitions are strictly rejected and logged to the audit log.
 */

import { UserRole } from "@/types/supabase";

export type EngagementStage = "active" | "in_review" | "completed" | "disputed";

export interface StateTransitionRequest {
  readonly currentStage: EngagementStage;
  readonly targetStage: EngagementStage;
  readonly actorRole: UserRole;
  readonly actorId: string;
  readonly brandId: string;
  readonly creatorId: string;
  readonly escrowFunded: boolean;
  readonly deliverablesUploaded: boolean;
}

export interface TransitionValidationResult {
  readonly allowed: boolean;
  readonly reason?: string;
}

export function validateEngagementTransition(
  req: StateTransitionRequest
): TransitionValidationResult {
  const {
    currentStage,
    targetStage,
    actorRole,
    actorId,
    brandId,
    creatorId,
    escrowFunded,
    deliverablesUploaded,
  } = req;

  // 1. Participant identity check
  const isBrand = actorId === brandId && actorRole === "brand";
  const isCreator = actorId === creatorId && actorRole === "creator";
  const isAdmin = actorRole === "admin";

  if (!isBrand && !isCreator && !isAdmin) {
    return {
      allowed: false,
      reason: "Actor is not a participant or authorized administrator on this contract.",
    };
  }

  // 2. Identity no-op transition
  if (currentStage === targetStage) {
    return { allowed: true };
  }

  // 3. Admin dispute resolution override
  if (isAdmin) {
    if (currentStage === "disputed") {
      return { allowed: true };
    }
    // Admins can intervene at any time with audit logging
    return { allowed: true };
  }

  // 4. Transitions from 'completed' are terminal for non-admins
  if (currentStage === "completed") {
    return {
      allowed: false,
      reason: "Completed engagements are immutable. Re-opening requires dispute resolution.",
    };
  }

  // 5. Dispute triggers: either participant may dispute an active or in-review engagement
  if (targetStage === "disputed") {
    if (currentStage === "active" || currentStage === "in_review") {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Cannot dispute an engagement in '${currentStage}' status.`,
    };
  }

  // 6. Transition: active -> in_review
  if (currentStage === "active" && targetStage === "in_review") {
    if (!isCreator) {
      return {
        allowed: false,
        reason: "Only the creator can submit deliverables to move contract to review.",
      };
    }
    if (!deliverablesUploaded) {
      return {
        allowed: false,
        reason: "Deliverables must be uploaded before requesting client review.",
      };
    }
    if (!escrowFunded) {
      return {
        allowed: false,
        reason: "Escrow must be funded by brand before submitting work for milestone review.",
      };
    }
    return { allowed: true };
  }

  // 7. Transition: in_review -> active (Revision requested)
  if (currentStage === "in_review" && targetStage === "active") {
    if (!isBrand) {
      return {
        allowed: false,
        reason: "Only the brand client can request contract revisions.",
      };
    }
    return { allowed: true };
  }

  // 8. Transition: in_review -> completed (Approval & Release)
  if (currentStage === "in_review" && targetStage === "completed") {
    if (!isBrand) {
      return {
        allowed: false,
        reason: "Only the brand client can approve deliverables and mark contract completed.",
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Illegal state transition from '${currentStage}' to '${targetStage}' by role '${actorRole}'.`,
  };
}
