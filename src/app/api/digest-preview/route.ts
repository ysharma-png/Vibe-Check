import { NextResponse } from "next/server";
import { renderWeeklyDigestEmail } from "@/lib/engagement/notifications";

export async function GET() {
  const html = renderWeeklyDigestEmail({
    userName: "Alex Rivera",
    role: "creator",
    matchingBriefsCount: 6,
    profileViews: 142,
    newFollowers: 18,
    topOpportunities: [
      {
        title: "Pulse Energy 2026: Hyper-Speed Social Shorts",
        budget: "$4,000 - $8,000 USD",
        matchScore: 96,
        url: "https://cacheflow.ai/briefs/brief-pulse-social",
      },
      {
        title: "Nike Studios Global: Cyberpunk Athletic Sprint",
        budget: "$6,500 - $12,000 USD",
        matchScore: 92,
        url: "https://cacheflow.ai/briefs/brief-nike-sprint",
      },
      {
        title: "Aura Luminescence: Luxury Skincare 3D Teaser",
        budget: "$3,500 - $6,000 USD",
        matchScore: 88,
        url: "https://cacheflow.ai/briefs/brief-aura-skincare",
      },
    ],
  });

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
