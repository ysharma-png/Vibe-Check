import { AspectRatio, DeliverableType, ImportPlatform } from "@/types/schema";

export interface ImportedAttribution {
  creatorName?: string;
  sourceProfileUrl?: string;
  license?: string;
  channelTitle?: string;
}

export interface ImportedMediaItem {
  id: string;
  title: string;
  description: string;
  platform: ImportPlatform;
  sourceUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  durationSec?: number;
  aspectRatio: AspectRatio;
  attribution: ImportedAttribution;
  suggestedTools: string[];
  suggestedDeliverableType: DeliverableType;
  styleTags: string[];
}

export interface ConsentDisclosure {
  fields: string[];
  hostingNotice: string;
  dataControlNotice: string;
  legalBasis: string;
  storageRetention: string;
}

export interface ImportPreviewResult {
  success: boolean;
  item?: ImportedMediaItem;
  consent: ConsentDisclosure;
  error?: string;
}

export interface DiscoveredCreatorListing {
  id: string;
  name: string;
  handle: string;
  sourcePlatform: ImportPlatform;
  sourceProfileUrl: string;
  bio: string;
  works: ImportedMediaItem[];
  isClaimed: boolean;
  claimStatus: "unclaimed" | "pending_verification" | "claimed";
  claimVerificationCode: string;
  invitationSent: boolean;
  discoveredAt: string;
}

export interface IngestionLogEntry {
  id: string;
  source: string;
  timestamp: string;
  legalBasis: string;
  adminId: string;
  targetHandle: string;
  recordsCount: number;
  metadata?: Record<string, unknown>;
}

export interface SuppressionEntry {
  id: string;
  identityHash: string;
  sourcePlatform: string;
  sourceProfileUrl: string;
  optOutTimestamp: string;
  reason: string;
  status: "suppressed";
}
