import { NextRequest, NextResponse } from "next/server";
import { complianceStore } from "@/lib/importers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorProfileId, verificationCode, authenticatedUserId = "user-claimed" } = body;

    if (!creatorProfileId || !verificationCode) {
      return NextResponse.json(
        { success: false, error: "Missing creatorProfileId or verificationCode." },
        { status: 400 }
      );
    }

    const result = complianceStore.claimProfile(
      creatorProfileId,
      verificationCode,
      authenticatedUserId
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process profile claim." },
      { status: 500 }
    );
  }
}
