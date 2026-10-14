import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, targetType, targetId, metadata } = body;

    if (!eventType) {
      return NextResponse.json({ error: "Missing eventType" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase = Boolean(supabaseUrl && !supabaseUrl.includes("placeholder"));

    if (isLiveSupabase) {
      try {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        await (supabase.from("interaction_events" as any) as any).insert({
          user_id: userData?.user?.id ?? null,
          event_type: eventType,
          target_type: targetType ?? "brief",
          target_id: String(targetId ?? "general"),
          metadata: metadata ?? {},
        });
      } catch {}
    }

    return NextResponse.json({ success: true, recorded: eventType });
  } catch {
    return NextResponse.json({ success: true, fallback: true });
  }
}
