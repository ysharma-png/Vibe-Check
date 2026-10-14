import { parseYouTubeVideo } from "./youtube";
import { parseVimeoVideo } from "./vimeo";
import { detectPlatform, parseExternalPlatformLink } from "./oembed";
import { ImportedMediaItem, ImportPreviewResult } from "./types";
import { complianceStore, CONSENT_DISCLOSURE } from "./compliance";

export * from "./types";
export * from "./compliance";
export * from "./youtube";
export * from "./vimeo";
export * from "./oembed";

export async function importFromUrl(url: string): Promise<ImportPreviewResult> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return {
      success: false,
      consent: CONSENT_DISCLOSURE,
      error: "Please provide a valid media URL.",
    };
  }

  // Check permanent suppression list
  if (complianceStore.isSuppressed(cleanUrl)) {
    return {
      success: false,
      consent: CONSENT_DISCLOSURE,
      error: "This source URL or creator has opted out of CacheFlow indexing (SUPPRESSED).",
    };
  }

  const platform = detectPlatform(cleanUrl);

  try {
    let item: ImportedMediaItem;

    if (platform === "youtube") {
      item = await parseYouTubeVideo(cleanUrl);
    } else if (platform === "vimeo") {
      item = await parseVimeoVideo(cleanUrl);
    } else {
      item = await parseExternalPlatformLink(cleanUrl);
    }

    return {
      success: true,
      item,
      consent: CONSENT_DISCLOSURE,
    };
  } catch (err: any) {
    return {
      success: false,
      consent: CONSENT_DISCLOSURE,
      error: err.message || "Failed to parse portfolio link via official API / oEmbed.",
    };
  }
}

export function confirmCreatorImport(params: {
  creatorId: string;
  creatorHandle: string;
  item: ImportedMediaItem;
  consentConfirmed: boolean;
}): { success: boolean; item?: ImportedMediaItem; error?: string } {
  if (!params.consentConfirmed) {
    return {
      success: false,
      error: "CONSENT_REQUIRED: You must explicitly confirm consent to import this work onto CacheFlow.",
    };
  }

  // Record audit log entry in ingestion_logs
  complianceStore.logIngestion({
    id: `log-import-${Date.now().toString(36)}`,
    source: `${params.item.platform}_official_api`,
    timestamp: new Date().toISOString(),
    legalBasis: "GDPR Art 6(1)(a) Explicit Consent",
    adminId: params.creatorId,
    targetHandle: params.creatorHandle,
    recordsCount: 1,
    metadata: {
      itemId: params.item.id,
      platform: params.item.platform,
      sourceUrl: params.item.sourceUrl,
      embedUrl: params.item.embedUrl,
    },
  });

  return {
    success: true,
    item: params.item,
  };
}
