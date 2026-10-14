import { NextRequest, NextResponse } from "next/server";
import { complianceStore, DiscoveredCreatorListing } from "@/lib/importers";

export async function GET(req: NextRequest) {
  // Return list of discovered creators (and ingestion logs)
  const isEnabled = process.env.ENABLE_DISCOVERED === "true" || req.nextUrl.searchParams.get("enabled") === "true";
  
  const discovered = isEnabled ? complianceStore.getDiscoveredCreators() : [];
  // Ensure private fields are stripped from all returned listings
  const sanitized = discovered.map((c) => complianceStore.stripPrivateFields(c as any));

  return NextResponse.json({
    enabled: isEnabled,
    count: sanitized.length,
    creators: sanitized,
    suppressionCount: complianceStore.getSuppressionList().length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const isEnabled = process.env.ENABLE_DISCOVERED === "true" || req.headers.get("x-enable-discovered") === "true";

    if (!isEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "FEATURE_DISABLED: Discovered Creator Ingestion is disabled by default (ENABLE_DISCOVERED=false).",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, handle, sourcePlatform, sourceProfileUrl, works, adminId = "admin" } = body;

    if (!name || !handle || !sourceProfileUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required minimal fields (name, handle, sourceProfileUrl)." },
        { status: 400 }
      );
    }

    // Check suppression list before anything else
    if (complianceStore.isSuppressed(sourceProfileUrl) || complianceStore.isSuppressed(handle)) {
      return NextResponse.json(
        {
          success: false,
          error: "IDENTITY_SUPPRESSED: This creator has opted out and cannot be ingested onto CacheFlow.",
        },
        { status: 403 }
      );
    }

    // Strict cap: Up to 3 public works embedded with attribution
    const cappedWorks = (works || []).slice(0, 3);

    const verificationCode = `cf-verify-${Math.random().toString(36).substring(2, 8)}`;
    const listingId = `disc-${handle.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`;

    const newListing: DiscoveredCreatorListing = {
      id: listingId,
      name,
      handle,
      sourcePlatform: sourcePlatform || "youtube",
      sourceProfileUrl,
      bio: `Publicly discovered generative artist. Showcase indexed from verified public portfolio with attribution.`,
      works: cappedWorks,
      isClaimed: false,
      claimStatus: "unclaimed",
      claimVerificationCode: verificationCode,
      invitationSent: false,
      discoveredAt: new Date().toISOString(),
    };

    complianceStore.addDiscoveredCreator(newListing);

    // Record immutable audit log
    complianceStore.logIngestion({
      id: `log-ingest-${Date.now().toString(36)}`,
      source: `${sourcePlatform}_public_metadata`,
      timestamp: new Date().toISOString(),
      legalBasis: "GDPR Art 6(1)(f) Legitimate Interest - Public Metadata",
      adminId,
      targetHandle: handle,
      recordsCount: cappedWorks.length,
      metadata: { sourceProfileUrl, listingId },
    });

    // Strip any inadvertent private fields before responding
    const sanitizedResponse = complianceStore.stripPrivateFields(newListing as any);

    return NextResponse.json({
      success: true,
      creator: sanitizedResponse,
      message: "Minimal public listing created with zero private fields and explicit disclaimer.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to ingest discovered creator." },
      { status: 500 }
    );
  }
}
