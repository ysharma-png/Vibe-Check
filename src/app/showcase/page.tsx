import React from "react";
import { Metadata } from "next";
import { ShowcaseClient } from "./ShowcaseClient";

export const metadata: Metadata = {
  title: "Showcase Feed • CacheFlow",
  description: "Immersive full-screen showcase of AI-native generative media, ComfyUI workflows, and proven pipeline creators.",
};

export default function ShowcasePage() {
  return <ShowcaseClient />;
}
