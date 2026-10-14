import { NextRequest, NextResponse } from "next/server";
import { confirmCreatorImport } from "@/lib/importers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, creatorHandle, item, consentConfirmed } = body;

    if (!creatorId || !item) {
      return NextResponse.json(
        { success: false, error: "Missing creatorId or item payload." },
        { status: 400 }
      );
    }

    if (!consentConfirmed) {
      return NextResponse.json(
        {
          success: false,
          error: "CONSENT_REQUIRED: You must explicitly confirm consent to import this work.",
        },
        { status: 403 }
      );
    }

    const result = confirmCreatorImport({
      creatorId,
      creatorHandle: creatorHandle || "creator",
      item,
      consentConfirmed,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to confirm item import." },
      { status: 500 }
    );
  }
}
