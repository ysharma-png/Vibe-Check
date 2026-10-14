import React from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { HomeFeedClient } from "./HomeFeedClient";

export const metadata: Metadata = {
  title: "Personalized Home Feed • CacheFlow",
  description: "AI-matched creative briefs, trending ComfyUI workflows, and verified talent intelligence.",
};

export default function HomePage() {
  const cookieStore = cookies();
  const demoRole = cookieStore.get("cf_demo_role")?.value || "creator";
  const rawName = cookieStore.get("cf_user_name")?.value;
  const rawHandle = cookieStore.get("cf_user_handle")?.value;

  const userName = rawName ? decodeURIComponent(rawName) : (demoRole === "brand" ? "Nike Studios" : "Alex Rivera");
  const userHandle = rawHandle ? decodeURIComponent(rawHandle) : (demoRole === "brand" ? "nike_studios" : "alex_rivera");

  return <HomeFeedClient initialRole={demoRole} userName={userName} userHandle={userHandle} />;
}
