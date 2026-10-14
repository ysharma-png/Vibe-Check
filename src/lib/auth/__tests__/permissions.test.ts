import { describe, it, expect } from "vitest";
import {
  can,
  requireUser,
  requireRole,
  requireOwnership,
  requireVerifiedEmail,
  requireAal2,
  AuthorizationError,
  AuthUser,
} from "../permissions";
import { validateEngagementTransition } from "../state-machine";

describe("Centralized Permission Matrix & RBAC (can)", () => {
  const creatorUser: AuthUser = {
    id: "user-creator-1",
    role: "creator",
    email: "creator@test.com",
    emailVerified: true,
  };

  const unverifiedCreator: AuthUser = {
    id: "user-creator-2",
    role: "creator",
    email: "unverified@test.com",
    emailVerified: false,
  };

  const brandUser: AuthUser = {
    id: "user-brand-1",
    role: "brand",
    email: "brand@test.com",
    emailVerified: true,
  };

  const adminUserAal1: AuthUser = {
    id: "user-admin-1",
    role: "admin",
    email: "admin@test.com",
    emailVerified: true,
    mfaLevel: "aal1",
  };

  const adminUserAal2: AuthUser = {
    id: "user-admin-2",
    role: "admin",
    email: "admin@test.com",
    emailVerified: true,
    mfaLevel: "aal2",
  };

  describe("Portfolio Items Permissions", () => {
    it("allows public to read published portfolio items", () => {
      expect(can(null, "read", "portfolio_item", { isPublished: true })).toBe(true);
    });

    it("allows verified creator to create portfolio items", () => {
      expect(can(creatorUser, "create", "portfolio_item")).toBe(true);
    });

    it("DENIES unverified creator from creating portfolio items", () => {
      expect(can(unverifiedCreator, "create", "portfolio_item")).toBe(false);
    });

    it("DENIES brand from creating portfolio items", () => {
      expect(can(brandUser, "create", "portfolio_item")).toBe(false);
    });

    it("allows creator to update their own item", () => {
      expect(
        can(creatorUser, "update", "portfolio_item", { creatorId: creatorUser.id })
      ).toBe(true);
    });

    it("DENIES creator from updating another creator's item", () => {
      expect(
        can(creatorUser, "update", "portfolio_item", { creatorId: "other-creator" })
      ).toBe(false);
    });
  });

  describe("Creative Briefs Permissions", () => {
    it("allows public to read published briefs", () => {
      expect(can(null, "read", "brief", { status: "published" })).toBe(true);
    });

    it("DENIES public from reading draft briefs", () => {
      expect(can(null, "read", "brief", { status: "draft" })).toBe(false);
    });

    it("allows verified brand to create briefs", () => {
      expect(can(brandUser, "create", "brief")).toBe(true);
    });

    it("DENIES creator from creating briefs", () => {
      expect(can(creatorUser, "create", "brief")).toBe(false);
    });

    it("allows brand to read and update their own draft briefs", () => {
      expect(
        can(brandUser, "read", "brief", { status: "draft", brandId: brandUser.id })
      ).toBe(true);
      expect(
        can(brandUser, "update", "brief", { brandId: brandUser.id })
      ).toBe(true);
    });

    it("DENIES brand from updating another brand's brief", () => {
      expect(
        can(brandUser, "update", "brief", { brandId: "other-brand" })
      ).toBe(false);
    });
  });

  describe("Privilege Escalation & Verification Badges", () => {
    it("DENIES creators from modifying verification status or roles", () => {
      expect(can(creatorUser, "publish", "verification")).toBe(false);
      expect(can(creatorUser, "moderate", "profile")).toBe(false);
    });

    it("allows creator to submit verification requests", () => {
      expect(can(creatorUser, "create", "verification")).toBe(true);
    });

    it("allows admin to moderate verification and profiles", () => {
      expect(can(adminUserAal2, "moderate", "profile")).toBe(true);
      expect(can(adminUserAal2, "update", "verification")).toBe(true);
    });
  });
});

describe("Authorization Helper Guards (require*)", () => {
  const creatorUser: AuthUser = {
    id: "usr-creator",
    role: "creator",
    email: "creator@test.com",
    emailVerified: true,
  };

  it("requireUser throws 401 when anonymous", () => {
    expect(() => requireUser(null)).toThrowError(AuthorizationError);
    try {
      requireUser(null);
    } catch (err: unknown) {
      expect((err as AuthorizationError).statusCode).toBe(401);
      expect((err as AuthorizationError).code).toBe("UNAUTHENTICATED");
    }
  });

  it("requireRole enforces role match and throws 403 on mismatch", () => {
    expect(requireRole(creatorUser, "creator")).toBe(creatorUser);
    expect(() => requireRole(creatorUser, "brand")).toThrowError(AuthorizationError);
  });

  it("requireOwnership throws 404 to prevent IDOR enumeration", () => {
    expect(requireOwnership(creatorUser, creatorUser.id)).toBe(creatorUser);
    try {
      requireOwnership(creatorUser, "foreign-resource-owner-id", "Creative Brief");
    } catch (err: unknown) {
      expect((err as AuthorizationError).statusCode).toBe(404);
      expect((err as AuthorizationError).message).toContain("Creative Brief not found.");
    }
  });

  it("requireVerifiedEmail asserts verified email status", () => {
    expect(requireVerifiedEmail(creatorUser)).toBe(creatorUser);
    const unverified: AuthUser = { ...creatorUser, emailVerified: false };
    expect(() => requireVerifiedEmail(unverified)).toThrowError("Email verification is required");
  });

  it("requireAal2 enforces AAL2 on administrator", () => {
    const adminAal1: AuthUser = { ...creatorUser, role: "admin", mfaLevel: "aal1" };
    const adminAal2: AuthUser = { ...creatorUser, role: "admin", mfaLevel: "aal2" };

    expect(() => requireAal2(adminAal1)).toThrowError("Multi-Factor Authentication (AAL2)");
    expect(requireAal2(adminAal2)).toBe(adminAal2);
  });
});

describe("Contract State Machine Authorization", () => {
  const brandId = "brand-123";
  const creatorId = "creator-456";

  it("allows creator to submit deliverables and transition active -> in_review", () => {
    const result = validateEngagementTransition({
      currentStage: "active",
      targetStage: "in_review",
      actorRole: "creator",
      actorId: creatorId,
      brandId,
      creatorId,
      escrowFunded: true,
      deliverablesUploaded: true,
    });
    expect(result.allowed).toBe(true);
  });

  it("REJECTS creator transition to in_review if deliverables are not uploaded", () => {
    const result = validateEngagementTransition({
      currentStage: "active",
      targetStage: "in_review",
      actorRole: "creator",
      actorId: creatorId,
      brandId,
      creatorId,
      escrowFunded: true,
      deliverablesUploaded: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Deliverables must be uploaded");
  });

  it("allows brand to approve milestone and transition in_review -> completed", () => {
    const result = validateEngagementTransition({
      currentStage: "in_review",
      targetStage: "completed",
      actorRole: "brand",
      actorId: brandId,
      brandId,
      creatorId,
      escrowFunded: true,
      deliverablesUploaded: true,
    });
    expect(result.allowed).toBe(true);
  });

  it("REJECTS creator attempting to self-approve and complete engagement", () => {
    const result = validateEngagementTransition({
      currentStage: "in_review",
      targetStage: "completed",
      actorRole: "creator",
      actorId: creatorId,
      brandId,
      creatorId,
      escrowFunded: true,
      deliverablesUploaded: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Only the brand client can approve deliverables");
  });

  it("allows either participant to flag a dispute", () => {
    const creatorDispute = validateEngagementTransition({
      currentStage: "in_review",
      targetStage: "disputed",
      actorRole: "creator",
      actorId: creatorId,
      brandId,
      creatorId,
      escrowFunded: true,
      deliverablesUploaded: true,
    });
    expect(creatorDispute.allowed).toBe(true);
  });
});
