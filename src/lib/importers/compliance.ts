import { createHash } from "crypto";
import {
  ConsentDisclosure,
  DiscoveredCreatorListing,
  ImportedMediaItem,
  IngestionLogEntry,
  SuppressionEntry,
} from "./types";

export const CONSENT_DISCLOSURE: ConsentDisclosure = {
  fields: [
    "Item Title",
    "Description & Captions",
    "Video Duration",
    "Cover Thumbnail URL",
    "Official Embed Player Link",
    "Creator Attribution & Channel Link",
    "Canonical Source URL",
  ],
  hostingNotice:
    "Zero Re-Hosting Guarantee: CacheFlow never downloads, re-encodes, or re-hosts your media files. Your work is streamed exclusively through the platform's official sandboxed player or linked directly to your original showcase.",
  dataControlNotice:
    "Complete Data Sovereignty: You retain 100% intellectual property rights. You can edit metadata, disconnect your connected account, or permanently delete imported works at any time with immediate effect.",
  legalBasis: "GDPR Article 6(1)(a) Explicit Consent",
  storageRetention:
    "Active Account Lifecycle: Imported items are retained while your account remains active. Initiating account deletion or item removal purges all associated records within 24 hours.",
};

// Cryptographic hash for suppression matching
export function hashIdentity(input: string): string {
  return createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

// Global In-Memory Stores (Mirrored to Supabase when active)
class ComplianceStore {
  private ingestionLogs: IngestionLogEntry[] = [
    {
      id: "log-seed-1",
      source: "youtube_api_v3",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      legalBasis: "GDPR Art 6(1)(a) Explicit Consent",
      adminId: "creator-alex-rivera",
      targetHandle: "alex_rivera",
      recordsCount: 1,
      metadata: { item: "yt-dQw4w9WgXcQ", platform: "youtube" },
    },
  ];

  private suppressionList: Map<string, SuppressionEntry> = new Map();
  private invitations: Map<string, { sentAt: string; inviteToken: string; channel: string }> = new Map();
  private discoveredCreators: Map<string, DiscoveredCreatorListing> = new Map();

  constructor() {
    // Seed initial discovered creator for testing/demonstration
    const sampleDiscoveredId = "disc-elena-rodriguez";
    this.discoveredCreators.set(sampleDiscoveredId, {
      id: sampleDiscoveredId,
      name: "Elena Rodriguez",
      handle: "elena_rdz_ai",
      sourcePlatform: "youtube",
      sourceProfileUrl: "https://www.youtube.com/@elena_rdz_ai",
      bio: "Discovered independent generative video artist focusing on neural cinematography and high-coherence camera movements.",
      works: [
        {
          id: "yt-elena-1",
          title: "Neural Dreams: 4K Anamorphic Short",
          description: "Public YouTube portfolio showcase. Embedded directly from YouTube without re-hosting.",
          platform: "youtube",
          sourceUrl: "https://www.youtube.com/watch?v=sample123",
          embedUrl: "https://www.youtube-nocookie.com/embed/sample123?rel=0",
          thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
          durationSec: 90,
          aspectRatio: "16:9",
          attribution: {
            creatorName: "Elena Rodriguez",
            sourceProfileUrl: "https://www.youtube.com/@elena_rdz_ai",
            license: "Standard YouTube License (Embedded)",
          },
          suggestedTools: ["runway-gen3", "flux-1-dev"],
          suggestedDeliverableType: "commercial_spot",
          styleTags: ["Cinematic", "Anamorphic", "AI Video"],
        },
      ],
      isClaimed: false,
      claimStatus: "unclaimed",
      claimVerificationCode: "cf-verify-elena99",
      invitationSent: false,
      discoveredAt: new Date().toISOString(),
    });
  }

  // Suppression List (Opt-Out)
  isSuppressed(identifier: string): boolean {
    const hash = hashIdentity(identifier);
    return this.suppressionList.has(hash);
  }

  addSuppression(sourcePlatform: string, sourceProfileUrl: string, reason = "creator_opt_out"): SuppressionEntry {
    const hash = hashIdentity(sourceProfileUrl);
    const entry: SuppressionEntry = {
      id: `sup-${Date.now().toString(36)}`,
      identityHash: hash,
      sourcePlatform,
      sourceProfileUrl,
      optOutTimestamp: new Date().toISOString(),
      reason,
      status: "suppressed",
    };
    this.suppressionList.set(hash, entry);

    // Also remove from discovered creators if present
    for (const [id, creator] of this.discoveredCreators.entries()) {
      if (
        creator.sourceProfileUrl.toLowerCase() === sourceProfileUrl.toLowerCase() ||
        creator.handle.toLowerCase() === sourceProfileUrl.toLowerCase()
      ) {
        this.discoveredCreators.delete(id);
      }
    }

    // Record audit log of the suppression
    this.logIngestion({
      id: `log-sup-${Date.now().toString(36)}`,
      source: "public_opt_out_endpoint",
      timestamp: new Date().toISOString(),
      legalBasis: "GDPR Art 21 Right to Object (Suppression Enacted)",
      adminId: "system_opt_out",
      targetHandle: sourceProfileUrl,
      recordsCount: 1,
      metadata: { reason },
    });

    return entry;
  }

  getSuppressionList(): SuppressionEntry[] {
    return Array.from(this.suppressionList.values());
  }

  // Ingestion Logs
  logIngestion(entry: IngestionLogEntry): void {
    this.ingestionLogs.unshift(entry);
    // Keep most recent 500 in memory
    if (this.ingestionLogs.length > 500) {
      this.ingestionLogs.pop();
    }
  }

  getIngestionLogs(): IngestionLogEntry[] {
    return [...this.ingestionLogs];
  }

  // Invitations (Strict 1 Invite Ever Rate Limit)
  canSendInvitation(creatorProfileId: string): boolean {
    return !this.invitations.has(creatorProfileId);
  }

  recordInvitation(creatorProfileId: string, channel: string): { inviteToken: string; optOutUrl: string } {
    if (!this.canSendInvitation(creatorProfileId)) {
      throw new Error("RATE_LIMIT_EXCEEDED: CacheFlow strictly permits only ONE invitation per discovered creator.");
    }

    const inviteToken = `inv-${createHash("sha256").update(creatorProfileId + Date.now()).digest("hex").slice(0, 16)}`;
    const optOutUrl = `/remove-my-profile?token=${inviteToken}&target=${encodeURIComponent(creatorProfileId)}`;

    this.invitations.set(creatorProfileId, {
      sentAt: new Date().toISOString(),
      inviteToken,
      channel,
    });

    const discovered = this.discoveredCreators.get(creatorProfileId);
    if (discovered) {
      discovered.invitationSent = true;
    }

    this.logIngestion({
      id: `log-inv-${Date.now().toString(36)}`,
      source: "creator_invitation_service",
      timestamp: new Date().toISOString(),
      legalBasis: "GDPR Art 6(1)(f) Legitimate Interest - Single Outreach",
      adminId: "platform_invitation_bot",
      targetHandle: creatorProfileId,
      recordsCount: 1,
      metadata: { channel, inviteToken },
    });

    return { inviteToken, optOutUrl };
  }

  // Discovered Creators Store
  getDiscoveredCreators(): DiscoveredCreatorListing[] {
    return Array.from(this.discoveredCreators.values());
  }

  getDiscoveredCreatorById(id: string): DiscoveredCreatorListing | undefined {
    return this.discoveredCreators.get(id);
  }

  addDiscoveredCreator(creator: DiscoveredCreatorListing): void {
    if (this.isSuppressed(creator.sourceProfileUrl) || this.isSuppressed(creator.handle)) {
      throw new Error("IDENTITY_SUPPRESSED: This creator has previously requested removal and cannot be re-ingested.");
    }
    this.discoveredCreators.set(creator.id, creator);
  }

  // Claim Flow
  claimProfile(
    creatorProfileId: string,
    verificationCode: string,
    authenticatedUserId: string
  ): { success: boolean; message: string } {
    const creator = this.discoveredCreators.get(creatorProfileId);
    if (!creator) {
      return { success: false, message: "Profile not found or already claimed." };
    }

    if (creator.claimVerificationCode.trim().toLowerCase() !== verificationCode.trim().toLowerCase()) {
      return { success: false, message: "Invalid verification code. Please confirm the code placed in your public bio." };
    }

    // Mark as claimed
    creator.isClaimed = true as any;
    creator.claimStatus = "claimed";

    this.logIngestion({
      id: `log-claim-${Date.now().toString(36)}`,
      source: "profile_claim_flow",
      timestamp: new Date().toISOString(),
      legalBasis: "GDPR Art 6(1)(a) Explicit Consent (Profile Claimed & Activated)",
      adminId: authenticatedUserId,
      targetHandle: creator.handle,
      recordsCount: 1,
      metadata: { claimedBy: authenticatedUserId },
    });

    return { success: true, message: "Profile claimed successfully! You now have full editing rights." };
  }

  // Public Privacy & Security Sanitizer
  stripPrivateFields<T extends Record<string, unknown>>(data: T): Partial<T> {
    const sanitized = { ...data };
    const forbiddenKeys = [
      "email",
      "phone",
      "phoneNumber",
      "address",
      "exactLocation",
      "ipAddress",
      "billingDetails",
      "stripeCustomerId",
      "taxId",
      "ssn",
      "socialSecurity",
      "passwordHash",
    ];

    for (const key of Object.keys(sanitized)) {
      if (forbiddenKeys.includes(key) || forbiddenKeys.includes(key.toLowerCase())) {
        delete sanitized[key];
      }
    }

    return sanitized;
  }
}

export const complianceStore = new ComplianceStore();
