import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveSupabase = Boolean(supabaseUrl && !supabaseUrl.includes("placeholder"));
    const demoRole = request.cookies.get("cf_demo_role")?.value;

    let user: any = null;
    let profile: any = null;
    let portfolioItems: any[] = [];
    let briefs: any[] = [];
    let proposals: any[] = [];

    if (isLiveSupabase) {
      const supabase = await createClient();
      const {
        data: { user: liveUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !liveUser) {
        return NextResponse.json(
          { error: "Authentication required to export data." },
          { status: 401 }
        );
      }
      user = liveUser;

      // Explicit select list - never SELECT * to prevent leaking sensitive internal credentials
      const profileRes = await supabase
        .from("profiles")
        .select(
          "id, role, full_name, display_name, handle, bio, location, website, verified_identity, deterministic_pipeline, commercial_clearance_cleared, portfolio_score, created_at"
        )
        .eq("id", user.id)
        .single();
      profile = profileRes.data;

      // Portfolio items if creator
      const portRes = await supabase
        .from("portfolio_items")
        .select("id, title, description, aspect_ratio, base_models, tools, reproducibility_score, reproducibility_kind, commercial_clearance_status, created_at")
        .eq("creator_id", user.id);
      portfolioItems = portRes.data ?? [];

      // Creative briefs if brand
      const briefRes = await supabase
        .from("creative_briefs")
        .select("id, title, description, budget_min, budget_max, status, required_tools, created_at")
        .eq("brand_id", user.id);
      briefs = briefRes.data ?? [];

      // Proposals
      const propRes = await supabase
        .from("proposals")
        .select("id, brief_id, pitch_text, proposed_budget, proposed_timeline_days, status, created_at")
        .eq("creator_id", user.id);
      proposals = propRes.data ?? [];
    } else if (demoRole) {
      user = {
        id: `demo-${demoRole}-001`,
        email: demoRole === "brand" ? "brand.creative@cacheflow.test" : "amara.okafor@cacheflow.test",
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      };
      profile = {
        id: user.id,
        role: demoRole,
        full_name: demoRole === "brand" ? "Brand Creative Director" : "Amara Okafor",
        handle: demoRole === "brand" ? "brand_director" : "amara_okafor",
        bio: "Demo verified account in sandbox environment.",
        location: "San Francisco, CA",
        portfolio_score: 98,
      };
    } else {
      return NextResponse.json(
        { error: "Authentication required to export data." },
        { status: 401 }
      );
    }

    const exportPayload = {
      exportVersion: "1.0",
      generatedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.email_confirmed_at,
        lastSignInAt: user.last_sign_in_at,
      },
      profile: profile ?? null,
      portfolio: portfolioItems ?? [],
      briefs: briefs ?? [],
      proposals: proposals ?? [],
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="cacheflow-user-data-${user.id}.json"`,
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to generate user data export." },
      { status: 500 }
    );
  }
}
