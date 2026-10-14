import { NextRequest, NextResponse } from "next/server";
import { complianceStore } from "@/lib/importers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourcePlatform = "any", sourceProfileUrl, handle, reason = "creator_opt_out" } = body;

    const identifier = sourceProfileUrl || handle;
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid handle, profile URL, or invitation token to remove." },
        { status: 400 }
      );
    }

    const suppressionEntry = complianceStore.addSuppression(
      sourcePlatform,
      identifier,
      reason
    );

    return NextResponse.json({
      success: true,
      message: "Listing successfully removed. Your identity has been permanently added to the CacheFlow suppression list to prevent future re-import.",
      suppression: suppressionEntry,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process opt-out removal." },
      { status: 500 }
    );
  }
}
