import { NextRequest, NextResponse } from "next/server";
import { importFromUrl } from "@/lib/importers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ success: false, error: "A valid media URL is required." }, { status: 400 });
    }

    const preview = await importFromUrl(url);
    if (!preview.success) {
      return NextResponse.json(preview, { status: 422 });
    }

    return NextResponse.json(preview);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal error resolving media import." },
      { status: 500 }
    );
  }
}
