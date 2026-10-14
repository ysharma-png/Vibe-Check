import { NextRequest, NextResponse } from "next/server";
import { complianceStore } from "@/lib/importers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorProfileId, channel = "public_channel" } = body;

    if (!creatorProfileId) {
      return NextResponse.json(
        { success: false, error: "Missing creatorProfileId parameter." },
        { status: 400 }
      );
    }

    // Rate-limit check: only ONE invitation ever per creator
    if (!complianceStore.canSendInvitation(creatorProfileId)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVITATION_LIMIT_REACHED: An invitation has already been sent to this creator. Repeated outreach is strictly prohibited by platform anti-spam rules.",
        },
        { status: 429 }
      );
    }

    const { inviteToken, optOutUrl } = complianceStore.recordInvitation(
      creatorProfileId,
      channel
    );

    // Return status to brand without exposing ANY creator private contact details!
    return NextResponse.json({
      success: true,
      message: "Invitation queued successfully. The platform will deliver a single secure notification. Creator contact information is confidential.",
      inviteToken,
      optOutUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch creator invitation." },
      { status: 500 }
    );
  }
}
