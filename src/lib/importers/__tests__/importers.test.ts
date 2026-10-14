import { describe, it, expect, beforeEach } from "vitest";
import {
  parseYouTubeVideo,
  extractYouTubeVideoId,
  isYouTubeShorts,
} from "../youtube";
import { parseVimeoVideo, extractVimeoVideoId } from "../vimeo";
import {
  importFromUrl,
  confirmCreatorImport,
} from "../index";
import { complianceStore } from "../compliance";

describe("Compliant Creator Import & Safety Pipeline", () => {
  beforeEach(() => {
    // Reset test identities in suppression store if needed
  });

  describe("1. Creator-Owned Import & Zero Re-Hosting", () => {
    it("parses public YouTube watch link with attribution and zero local re-hosting", async () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      const item = await parseYouTubeVideo(url);

      expect(item).toBeDefined();
      expect(item.id).toBe("yt-dQw4w9WgXcQ");
      expect(item.platform).toBe("youtube");
      expect(item.sourceUrl).toBe(url);

      // Verify no re-hosting: Sandboxed official embed player is used
      expect(item.embedUrl).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
      expect(item.thumbnailUrl).toContain("img.youtube.com/vi/dQw4w9WgXcQ");

      // Verify attribution is preserved
      expect(item.attribution).toBeDefined();
      expect(item.attribution.license).toContain("Standard YouTube License");
      expect(item.aspectRatio).toBe("16:9");
    });

    it("parses vertical YouTube shorts into 9:16 aspect ratio", async () => {
      const shortsUrl = "https://www.youtube.com/shorts/abcdef12345";
      const id = extractYouTubeVideoId(shortsUrl);
      expect(id).toBe("abcdef12345");
      expect(isYouTubeShorts(shortsUrl)).toBe(true);

      const item = await parseYouTubeVideo(shortsUrl);
      expect(item.aspectRatio).toBe("9:16");
      expect(item.suggestedDeliverableType).toBe("social_short_form");
    });

    it("parses Vimeo video into official player embed with attribution", async () => {
      const vimeoUrl = "https://vimeo.com/76979871";
      const id = extractVimeoVideoId(vimeoUrl);
      expect(id).toBe("76979871");

      const item = await parseVimeoVideo(vimeoUrl);
      expect(item.platform).toBe("vimeo");
      expect(item.embedUrl).toContain("player.vimeo.com/video/76979871");
      expect(item.attribution).toBeDefined();
    });

    it("enforces explicit creator consent confirmation before persisting import", () => {
      const mockItem = {
        id: "yt-test-1",
        title: "Test AI Short",
        description: "Test description",
        platform: "youtube" as const,
        sourceUrl: "https://youtube.com/watch?v=test1234",
        embedUrl: "https://youtube-nocookie.com/embed/test1234",
        thumbnailUrl: "https://img.youtube.com/vi/test1234/hqdefault.jpg",
        aspectRatio: "16:9" as const,
        attribution: { creatorName: "Test Creator", sourceProfileUrl: "https://youtube.com" },
        suggestedTools: ["flux-1-dev"],
        suggestedDeliverableType: "commercial_spot" as const,
        styleTags: ["AI"],
      };

      // Fails when consent is missing
      const denied = confirmCreatorImport({
        creatorId: "creator-alex",
        creatorHandle: "alex_rivera",
        item: mockItem,
        consentConfirmed: false,
      });
      expect(denied.success).toBe(false);
      expect(denied.error).toContain("CONSENT_REQUIRED");

      // Succeeds when consent is explicitly confirmed
      const approved = confirmCreatorImport({
        creatorId: "creator-alex",
        creatorHandle: "alex_rivera",
        item: mockItem,
        consentConfirmed: true,
      });
      expect(approved.success).toBe(true);
      expect(approved.item).toBeDefined();

      // Check that audit log entry was created
      const logs = complianceStore.getIngestionLogs();
      const matchingLog = logs.find((l) => l.targetHandle === "alex_rivera");
      expect(matchingLog).toBeDefined();
      expect(matchingLog?.legalBasis).toBe("GDPR Art 6(1)(a) Explicit Consent");
    });
  });

  describe("2. Unclaimed Discovered Creator Claim Flow", () => {
    const testDiscoveredId = "disc-marcus-vance";

    beforeEach(() => {
      complianceStore.addDiscoveredCreator({
        id: testDiscoveredId,
        name: "Marcus Vance",
        handle: "marcus_vance_3d",
        sourcePlatform: "vimeo",
        sourceProfileUrl: "https://vimeo.com/marcusvance",
        bio: "Specializing in procedural 3D environments and NeRF capture.",
        works: [],
        isClaimed: false,
        claimStatus: "unclaimed",
        claimVerificationCode: "cf-verify-marcus77",
        invitationSent: false,
        discoveredAt: new Date().toISOString(),
      });
    });

    it("rejects claim attempt with invalid verification code", () => {
      const res = complianceStore.claimProfile(testDiscoveredId, "wrong-code", "user-marcus");
      expect(res.success).toBe(false);
      expect(res.message).toContain("Invalid verification code");
    });

    it("successfully completes ownership claim with valid verification code", () => {
      const res = complianceStore.claimProfile(testDiscoveredId, "cf-verify-marcus77", "user-marcus");
      expect(res.success).toBe(true);

      const updated = complianceStore.getDiscoveredCreatorById(testDiscoveredId);
      expect(updated?.isClaimed).toBe(true);
      expect(updated?.claimStatus).toBe("claimed");

      // Verifies audit log entry for claim transition
      const logs = complianceStore.getIngestionLogs();
      const claimLog = logs.find((l) => l.targetHandle === "marcus_vance_3d");
      expect(claimLog).toBeDefined();
      expect(claimLog?.legalBasis).toContain("Explicit Consent (Profile Claimed");
    });
  });

  describe("3. Outreach & Single-Invitation Rate Limiting", () => {
    const inviteTestId = "disc-zara-chen";

    beforeEach(() => {
      complianceStore.addDiscoveredCreator({
        id: inviteTestId,
        name: "Zara Chen",
        handle: "zara_chen_ai",
        sourcePlatform: "youtube",
        sourceProfileUrl: "https://youtube.com/@zarachen",
        bio: "Fashion lookbook generative video director.",
        works: [],
        isClaimed: false,
        claimStatus: "unclaimed",
        claimVerificationCode: "cf-verify-zara",
        invitationSent: false,
        discoveredAt: new Date().toISOString(),
      });
    });

    it("allows a single invitation and generates secure opt-out link", () => {
      expect(complianceStore.canSendInvitation(inviteTestId)).toBe(true);
      const { inviteToken, optOutUrl } = complianceStore.recordInvitation(inviteTestId, "public_link");

      expect(inviteToken).toBeDefined();
      expect(optOutUrl).toContain("/remove-my-profile");
      expect(optOutUrl).toContain("target=disc-zara-chen");
    });

    it("strictly blocks repeated invitations to the same creator (Anti-Spam Rate Limit)", () => {
      const freshId = `disc-repeat-${Date.now().toString(36)}`;
      complianceStore.addDiscoveredCreator({
        id: freshId,
        name: "Repeat Test Creator",
        handle: "repeat_test",
        sourcePlatform: "youtube",
        sourceProfileUrl: `https://youtube.com/@${freshId}`,
        bio: "Test bio",
        works: [],
        isClaimed: false,
        claimStatus: "unclaimed",
        claimVerificationCode: "code",
        invitationSent: false,
        discoveredAt: new Date().toISOString(),
      });

      // First invitation succeeds
      complianceStore.recordInvitation(freshId, "public_link");

      // Second attempt is strictly blocked by rate limit
      expect(complianceStore.canSendInvitation(freshId)).toBe(false);
      expect(() => {
        complianceStore.recordInvitation(freshId, "public_link");
      }).toThrowError(/RATE_LIMIT_EXCEEDED/);
    });
  });

  describe("4. Opt-Out & Permanent Suppression List", () => {
    const optOutProfileUrl = "https://youtube.com/@optout_artist";

    it("removes listing and adds identity to permanent suppression list", () => {
      complianceStore.addDiscoveredCreator({
        id: "disc-optout",
        name: "Opt Out Artist",
        handle: "optout_artist",
        sourcePlatform: "youtube",
        sourceProfileUrl: optOutProfileUrl,
        bio: "Bio text",
        works: [],
        isClaimed: false,
        claimStatus: "unclaimed",
        claimVerificationCode: "code",
        invitationSent: false,
        discoveredAt: new Date().toISOString(),
      });

      // Submit opt-out
      const entry = complianceStore.addSuppression("youtube", optOutProfileUrl, "creator_opt_out");
      expect(entry.status).toBe("suppressed");
      expect(complianceStore.isSuppressed(optOutProfileUrl)).toBe(true);

      // Verify profile is purged from discovered listing
      const remaining = complianceStore.getDiscoveredCreatorById("disc-optout");
      expect(remaining).toBeUndefined();
    });

    it("permanently prevents re-import or re-ingestion of suppressed identity", () => {
      complianceStore.addSuppression("youtube", optOutProfileUrl, "creator_opt_out");

      expect(() => {
        complianceStore.addDiscoveredCreator({
          id: "disc-optout-again",
          name: "Opt Out Artist",
          handle: "optout_artist",
          sourcePlatform: "youtube",
          sourceProfileUrl: optOutProfileUrl,
          bio: "Bio text",
          works: [],
          isClaimed: false,
          claimStatus: "unclaimed",
          claimVerificationCode: "code",
          invitationSent: false,
          discoveredAt: new Date().toISOString(),
        });
      }).toThrowError(/IDENTITY_SUPPRESSED/);
    });
  });

  describe("5. Data Minimization & Privacy Audit", () => {
    it("strips private contact fields from public API responses", () => {
      const rawCreator = {
        id: "creator-test",
        name: "Test Person",
        handle: "test_person",
        email: "private.email@personal.com",
        phone: "+1-555-0199",
        address: "123 Private Street, CA",
        billingDetails: { card: "4242" },
        bio: "Public Bio",
      };

      const sanitized = complianceStore.stripPrivateFields(rawCreator);
      expect(sanitized.name).toBe("Test Person");
      expect(sanitized.handle).toBe("test_person");
      expect(sanitized.bio).toBe("Public Bio");

      // Verify confidential fields are completely stripped
      expect((sanitized as any).email).toBeUndefined();
      expect((sanitized as any).phone).toBeUndefined();
      expect((sanitized as any).address).toBeUndefined();
      expect((sanitized as any).billingDetails).toBeUndefined();
    });
  });
});
