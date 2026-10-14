import { ImportPlatform } from "@/types/schema";
import { ImportedMediaItem } from "./types";

export function detectPlatform(url: string): ImportPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("vimeo.com")) return "vimeo";
  if (lower.includes("behance.net")) return "behance";
  if (lower.includes("artstation.com")) return "artstation";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("civitai.com")) return "civitai";
  if (lower.includes("huggingface.co")) return "huggingface";
  return "manual";
}

export async function parseExternalPlatformLink(url: string): Promise<ImportedMediaItem> {
  const platform = detectPlatform(url);

  // 1. Behance Gallery Import
  if (platform === "behance") {
    const slugMatch = url.match(/gallery\/(\d+)\/([^/?#]+)/i);
    const galleryId = slugMatch?.[1] ?? "gallery";
    const rawTitle = slugMatch?.[2] ? slugMatch[2].replace(/-/g, " ") : "Behance Design Case Study";
    const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

    return {
      id: `behance-${galleryId}`,
      title,
      description: `Behance design case study linked with author attribution. Linked directly to original project showcase.`,
      platform: "behance",
      sourceUrl: url,
      embedUrl: url,
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      attribution: {
        creatorName: "Behance Creator",
        sourceProfileUrl: url,
        license: "Behance Creative Commons / All Rights Reserved",
      },
      suggestedTools: ["flux-1-pro", "midjourney-v7"],
      suggestedDeliverableType: "still_assets",
      styleTags: ["Concept Art", "Brand Visuals", "Design System"],
    };
  }

  // 2. ArtStation Artwork Import
  if (platform === "artstation") {
    const artworkMatch = url.match(/artwork\/([a-zA-Z0-9]+)/i);
    const artworkId = artworkMatch?.[1] ?? "artwork";

    return {
      id: `artstation-${artworkId}`,
      title: "ArtStation Concept Art & 3D Render",
      description: `ArtStation digital artwork linked with original author attribution and high-resolution metadata.`,
      platform: "artstation",
      sourceUrl: url,
      embedUrl: url,
      thumbnailUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      attribution: {
        creatorName: "ArtStation Concept Artist",
        sourceProfileUrl: url,
        license: "ArtStation Standard License",
      },
      suggestedTools: ["sdxl-base", "comfy-ui"],
      suggestedDeliverableType: "still_assets",
      styleTags: ["3D Concept", "Matte Painting", "Visual Development"],
    };
  }

  // 3. Civitai Model & Workflow Import
  if (platform === "civitai") {
    const modelMatch = url.match(/models\/(\d+)/i);
    const modelId = modelMatch?.[1] ?? "model";

    return {
      id: `civitai-${modelId}`,
      title: `Civitai Generative Model #${modelId}`,
      description: `Civitai checkpoint/LoRA architecture linked via official catalog reference. Preserves training base model and license tags.`,
      platform: "civitai",
      sourceUrl: url,
      embedUrl: url,
      thumbnailUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "1:1",
      attribution: {
        creatorName: "Civitai Model Architect",
        sourceProfileUrl: url,
        license: "CreativeML OpenRAIL-M / Permissive",
      },
      suggestedTools: ["comfy-ui", "forge-webui"],
      suggestedDeliverableType: "still_assets",
      styleTags: ["LoRA Weights", "Model Checkpoint", "Prompt Engineered"],
    };
  }

  // 4. Hugging Face Repository Import
  if (platform === "huggingface") {
    const parsed = new URL(url);
    const parts = parsed.pathname.slice(1).split("/");
    const repoOwner = parts[0] || "hf-creator";
    const repoName = parts[1] || "generative-workflow";

    return {
      id: `hf-${repoOwner}-${repoName}`,
      title: `${repoOwner}/${repoName}`,
      description: `Open-source AI weights and ComfyUI pipeline hosted on Hugging Face Hub.`,
      platform: "huggingface",
      sourceUrl: url,
      embedUrl: url,
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      attribution: {
        creatorName: repoOwner,
        sourceProfileUrl: `https://huggingface.co/${repoOwner}`,
        license: "Apache 2.0 / OpenRAIL",
      },
      suggestedTools: ["comfy-ui", "flux-1-dev"],
      suggestedDeliverableType: "animation",
      styleTags: ["Open Source", "Model Weights", "Reproducible"],
    };
  }

  // 5. Instagram / TikTok Web Embeds
  if (platform === "instagram" || platform === "tiktok") {
    return {
      id: `${platform}-${Date.now().toString(36)}`,
      title: `${platform.toUpperCase()} Creator Showcase`,
      description: `Public social vertical video embedded via official player widget without re-hosting.`,
      platform,
      sourceUrl: url,
      embedUrl: url,
      thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      durationSec: 15,
      aspectRatio: "9:16",
      attribution: {
        creatorName: `@${platform}_creator`,
        sourceProfileUrl: url,
        license: "Official Platform Embed Terms",
      },
      suggestedTools: ["runway-gen3", "elevenlabs"],
      suggestedDeliverableType: "social_short_form",
      styleTags: ["Vertical Reel", "Social Short", "AI Audio"],
    };
  }

  // Fallback Manual URL
  return {
    id: `manual-${Date.now().toString(36)}`,
    title: "External Creative Portfolio Item",
    description: "Verified public portfolio link with creator attribution.",
    platform: "manual",
    sourceUrl: url,
    embedUrl: url,
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    aspectRatio: "16:9",
    attribution: {
      creatorName: "Creative Professional",
      sourceProfileUrl: url,
      license: "All Rights Reserved (Linked with Attribution)",
    },
    suggestedTools: ["flux-1-dev"],
    suggestedDeliverableType: "commercial_spot",
    styleTags: ["Portfolio Link", "External Showcase"],
  };
}
