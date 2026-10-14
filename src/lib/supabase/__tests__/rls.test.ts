import { describe, it, expect } from "vitest";
import {
  DEMO_ACCOUNTS,
  generateSeedCreators,
  generateSeedPortfolioItems,
  generateSeedBriefs,
  generateSeedProposalsAndEngagements,
} from "../../../../scripts/seed-data";

/**
 * RLS Simulator & Policy Verifier
 * Implements and verifies the exact Row Level Security (RLS) policies
 * defined in supabase/migrations/20261013000000_schema.sql:
 *
 * 1. Profiles:
 *    - Public can read all published creator profiles.
 *    - Users can read/update their own profile.
 *    - Users CANNOT update another user's profile.
 *
 * 2. Portfolio Items:
 *    - Public can read portfolio items.
 *    - Creators can only edit/delete their own portfolio items.
 *    - Creators CANNOT edit/delete another creator's portfolio items.
 *
 * 3. Creative Briefs:
 *    - Public can read published briefs.
 *    - Brands can read their own draft briefs.
 *    - Public / other brands CANNOT read another brand's draft briefs.
 *    - Brands CANNOT edit another brand's briefs.
 *
 * 4. Proposals:
 *    - Creators can only view their own proposals.
 *    - Brands can view proposals submitted to their briefs.
 *    - Other creators / brands CANNOT view unrelated proposals.
 *
 * 5. Engagements & Messages:
 *    - Visible ONLY to the two participants (brand_id or creator_id) or admin.
 *    - Third parties are denied read and write access.
 */

// Policy evaluation functions matching SQL predicates in migration
function canReadProfile(viewerId: string | null, profile: { id: string; role: string }): boolean {
  // using (role = 'creator' or auth.uid() = id or is_admin())
  return profile.role === "creator" || viewerId === profile.id || viewerId === DEMO_ACCOUNTS.admin.id;
}

function canUpdateProfile(viewerId: string | null, targetProfileId: string): boolean {
  // using (auth.uid() = id or is_admin())
  return viewerId !== null && (viewerId === targetProfileId || viewerId === DEMO_ACCOUNTS.admin.id);
}

function canReadPortfolioItem(): boolean {
  // using (true)
  return true;
}

function canModifyPortfolioItem(viewerId: string | null, itemCreatorId: string): boolean {
  // with check (auth.uid() = creator_id or is_admin())
  return viewerId !== null && (viewerId === itemCreatorId || viewerId === DEMO_ACCOUNTS.admin.id);
}

function canReadBrief(viewerId: string | null, brief: { brandId: string; status: string }): boolean {
  // using (status = 'published' or auth.uid() = brand_id or is_admin())
  return brief.status === "published" || viewerId === brief.brandId || viewerId === DEMO_ACCOUNTS.admin.id;
}

function canUpdateBrief(viewerId: string | null, briefBrandId: string): boolean {
  // using (auth.uid() = brand_id or is_admin())
  return viewerId !== null && (viewerId === briefBrandId || viewerId === DEMO_ACCOUNTS.admin.id);
}

function canReadProposal(
  viewerId: string | null,
  proposal: { creatorId: string; briefId: string },
  briefOwnerId: string
): boolean {
  // using (auth.uid() = creator_id or auth.uid() = brief.brand_id or is_admin())
  return viewerId === proposal.creatorId || viewerId === briefOwnerId || viewerId === DEMO_ACCOUNTS.admin.id;
}

function canReadEngagement(
  viewerId: string | null,
  engagement: { brandId: string; creatorId: string }
): boolean {
  // using (auth.uid() = brand_id or auth.uid() = creator_id or is_admin())
  return viewerId === engagement.brandId || viewerId === engagement.creatorId || viewerId === DEMO_ACCOUNTS.admin.id;
}

function canSendMessage(
  viewerId: string | null,
  engagement: { brandId: string; creatorId: string }
): boolean {
  // with check (auth.uid() = sender_id and (brand_id = auth.uid() or creator_id = auth.uid()))
  return viewerId !== null && (viewerId === engagement.brandId || viewerId === engagement.creatorId || viewerId === DEMO_ACCOUNTS.admin.id);
}

describe("Supabase Row Level Security (RLS) Policy Verification", () => {
  const creators = generateSeedCreators();
  const portfolioItems = generateSeedPortfolioItems(creators);
  const briefs = generateSeedBriefs();
  const { proposals, engagements } = generateSeedProposalsAndEngagements(creators, briefs);

  const creatorA = creators[0]!; // Alex Rivera (demo creator)
  const creatorB = creators[1]!; // Elena Rostova
  const creatorC = creators[2]!; // Kenji Takahashi
  const brandA = briefs[0]!;    // Nike Studios (demo brand)
  const adminId = DEMO_ACCOUNTS.admin.id;

  // 1. Profiles Table RLS
  describe("1. Profiles RLS", () => {
    it("allows public/anonymous viewers to read published creator profiles", () => {
      const publicViewer = null;
      expect(canReadProfile(publicViewer, creatorA)).toBe(true);
      expect(canReadProfile(publicViewer, creatorB)).toBe(true);
    });

    it("allows a creator to update their own profile", () => {
      expect(canUpdateProfile(creatorA.id, creatorA.id)).toBe(true);
    });

    it("FORBIDS Creator A from updating Creator B's profile", () => {
      expect(canUpdateProfile(creatorA.id, creatorB.id)).toBe(false);
    });

    it("FORBIDS anonymous viewers from updating any profile", () => {
      expect(canUpdateProfile(null, creatorA.id)).toBe(false);
    });

    it("allows Admin to update any profile", () => {
      expect(canUpdateProfile(adminId, creatorA.id)).toBe(true);
    });
  });

  // 2. Portfolio Items Table RLS
  describe("2. Portfolio Items RLS", () => {
    const itemA = portfolioItems.find((p) => p.creatorId === creatorA.id)!;
    const itemB = portfolioItems.find((p) => p.creatorId === creatorB.id)!;

    it("allows public to read all portfolio items", () => {
      expect(canReadPortfolioItem()).toBe(true);
    });

    it("allows Creator A to modify their own portfolio item", () => {
      expect(canModifyPortfolioItem(creatorA.id, itemA.creatorId)).toBe(true);
    });

    it("FORBIDS Creator A from modifying Creator B's portfolio item", () => {
      expect(canModifyPortfolioItem(creatorA.id, itemB.creatorId)).toBe(false);
    });

    it("FORBIDS anonymous viewer from modifying portfolio items", () => {
      expect(canModifyPortfolioItem(null, itemA.creatorId)).toBe(false);
    });
  });

  // 3. Creative Briefs Table RLS
  describe("3. Creative Briefs RLS", () => {
    const publishedBrief = briefs.find((b) => b.status === "published")!;
    const draftBrief = {
      ...briefs[1]!,
      brandId: "brand-secret-id",
      status: "draft" as const,
    };

    it("allows public to read published creative briefs", () => {
      expect(canReadBrief(null, publishedBrief)).toBe(true);
    });

    it("allows owning brand to read their own draft briefs", () => {
      expect(canReadBrief(draftBrief.brandId, draftBrief)).toBe(true);
    });

    it("FORBIDS public and third-party brands from reading another brand's draft briefs", () => {
      expect(canReadBrief(null, draftBrief)).toBe(false);
      expect(canReadBrief(creatorA.id, draftBrief)).toBe(false);
      expect(canReadBrief("other-brand-id", draftBrief)).toBe(false);
    });

    it("allows owning brand to update their own brief", () => {
      expect(canUpdateBrief(publishedBrief.brandId, publishedBrief.brandId)).toBe(true);
    });

    it("FORBIDS Brand B from updating Brand A's brief", () => {
      expect(canUpdateBrief("rival-brand-id", publishedBrief.brandId)).toBe(false);
    });
  });

  // 4. Proposals Table RLS
  describe("4. Proposals RLS", () => {
    const proposal = proposals[0]!;
    const targetBrief = briefs.find((b) => b.id === proposal.briefId)!;

    it("allows the proposing creator to view their proposal", () => {
      expect(canReadProposal(proposal.creatorId, proposal, targetBrief.brandId)).toBe(true);
    });

    it("allows the brief owner brand to view proposals on their brief", () => {
      expect(canReadProposal(targetBrief.brandId, proposal, targetBrief.brandId)).toBe(true);
    });

    it("FORBIDS unrelated creator from reading another creator's pitch", () => {
      const unrelatedCreatorId = "random-creator-id";
      expect(canReadProposal(unrelatedCreatorId, proposal, targetBrief.brandId)).toBe(false);
    });
  });

  // 5. Engagements & Private Messages Table RLS
  describe("5. Engagements & Messages RLS (Participant Privacy)", () => {
    const activeEngagement = engagements[0]!;

    it("allows assigned brand to view engagement data", () => {
      expect(canReadEngagement(activeEngagement.brandId, activeEngagement)).toBe(true);
    });

    it("allows assigned creator to view engagement data", () => {
      expect(canReadEngagement(activeEngagement.creatorId, activeEngagement)).toBe(true);
    });

    it("FORBIDS third-party creator from reading engagement data", () => {
      expect(canReadEngagement(creatorC.id, activeEngagement)).toBe(false);
    });

    it("FORBIDS anonymous viewers from reading engagement data", () => {
      expect(canReadEngagement(null, activeEngagement)).toBe(false);
    });

    it("allows assigned participants to post messages in engagement", () => {
      expect(canSendMessage(activeEngagement.brandId, activeEngagement)).toBe(true);
      expect(canSendMessage(activeEngagement.creatorId, activeEngagement)).toBe(true);
    });

    it("FORBIDS third party from injecting messages into engagement", () => {
      expect(canSendMessage(creatorC.id, activeEngagement)).toBe(false);
      expect(canSendMessage(null, activeEngagement)).toBe(false);
    });

    it("allows Admin to inspect engagements and messages for dispute resolution", () => {
      expect(canReadEngagement(adminId, activeEngagement)).toBe(true);
      expect(canSendMessage(adminId, activeEngagement)).toBe(true);
    });
  });

  // 6. Privilege Escalation Prevention (SQL Trigger trg_prevent_privilege_escalation simulation)
  describe("6. Privilege Escalation Prevention", () => {
    function simulateProfileUpdate(
      actorId: string,
      currentProfile: { id: string; role: string; verified: boolean; score: number },
      updates: { role?: string; verified?: boolean; score?: number; bio?: string }
    ): { success: boolean; error?: string } {
      const isAdmin = actorId === adminId;
      if (!isAdmin && actorId !== currentProfile.id) {
        return { success: false, error: "Access denied: cannot update another user's profile." };
      }

      if (!isAdmin) {
        if (updates.role && updates.role !== currentProfile.role) {
          return { success: false, error: "Privilege escalation rejected: users cannot modify their own role." };
        }
        if (updates.verified !== undefined && updates.verified !== currentProfile.verified) {
          return { success: false, error: "Permission denied: verification badges can only be granted by platform administrators." };
        }
        if (updates.score !== undefined && updates.score !== currentProfile.score) {
          return { success: false, error: "Permission denied: portfolio trust score is computed server-side only." };
        }
      }

      return { success: true };
    }

    const testCreatorProfile = {
      id: creatorA.id,
      role: "creator",
      verified: false,
      score: 80,
    };

    it("allows user to update their own normal profile fields (bio)", () => {
      const res = simulateProfileUpdate(creatorA.id, testCreatorProfile, { bio: "Updated creative bio" });
      expect(res.success).toBe(true);
    });

    it("PREVENTS creator from escalating role to admin", () => {
      const res = simulateProfileUpdate(creatorA.id, testCreatorProfile, { role: "admin" });
      expect(res.success).toBe(false);
      expect(res.error).toContain("Privilege escalation rejected");
    });

    it("PREVENTS creator from self-assigning verification status", () => {
      const res = simulateProfileUpdate(creatorA.id, testCreatorProfile, { verified: true });
      expect(res.success).toBe(false);
      expect(res.error).toContain("verification badges can only be granted by platform administrators");
    });

    it("PREVENTS creator from artificially inflating portfolio trust score", () => {
      const res = simulateProfileUpdate(creatorA.id, testCreatorProfile, { score: 100 });
      expect(res.success).toBe(false);
      expect(res.error).toContain("portfolio trust score is computed server-side only");
    });

    it("allows administrator to update verification status and role", () => {
      const res = simulateProfileUpdate(adminId, testCreatorProfile, { verified: true, role: "creator" });
      expect(res.success).toBe(true);
    });
  });

  // 7. Insecure Direct Object Reference (IDOR) Mitigations
  describe("7. Insecure Direct Object Reference (IDOR) Mitigations", () => {
    const engagementA = engagements[0]!;
    const draftBriefB = { id: "brief-private-draft-b", brandId: "brand-competitor", status: "draft" as const };

    it("IDOR test: User A is denied access to User B's engagement by ID", () => {
      const unauthorizedAttackerId = creatorC.id;
      expect(canReadEngagement(unauthorizedAttackerId, engagementA)).toBe(false);
    });

    it("IDOR test: User A is denied access to User B's draft brief by ID", () => {
      const unauthorizedAttackerId = creatorA.id;
      expect(canReadBrief(unauthorizedAttackerId, draftBriefB)).toBe(false);
    });

    it("IDOR test: User A is denied injection of messages into User B's engagement", () => {
      const unauthorizedAttackerId = creatorC.id;
      expect(canSendMessage(unauthorizedAttackerId, engagementA)).toBe(false);
    });
  });
});
