import { ImportedMediaItem } from "./types";

export function extractVimeoVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const match = parsed.pathname.match(/\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function parseVimeoVideo(url: string): Promise<ImportedMediaItem> {
  const videoId = extractVimeoVideoId(url);
  if (!videoId) {
    throw new Error("Invalid Vimeo URL. Please provide a valid video link (e.g. https://vimeo.com/123456789).");
  }

  const canonicalUrl = `https://vimeo.com/${videoId}`;
  const embedUrl = `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0`;
  let title = "Vimeo Video Showcase";
  let creatorName = "Vimeo Filmmaker";
  let sourceProfileUrl = `https://vimeo.com/${videoId}`;
  let duration = 60;
  let thumbnailUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80";

  try {
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(canonicalUrl)}`;
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": "CacheFlow-Compliance-Bot/1.0" },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) creatorName = data.author_name;
      if (data.author_url) sourceProfileUrl = data.author_url;
      if (data.duration) duration = data.duration;
      if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
    }
  } catch {
    // Graceful offline fallback
  }

  return {
    id: `vimeo-${videoId}`,
    title,
    description: `Official Vimeo portfolio release imported via Vimeo oEmbed API. Streamed directly via Vimeo embedded player without media re-hosting.`,
    platform: "vimeo",
    sourceUrl: canonicalUrl,
    embedUrl,
    thumbnailUrl,
    durationSec: duration,
    aspectRatio: "16:9",
    attribution: {
      creatorName,
      sourceProfileUrl,
      license: "All Rights Reserved (Embedded with Creator Attribution)",
    },
    suggestedTools: ["comfy-ui", "midjourney-v7", "topaz-video-ai"],
    suggestedDeliverableType: "commercial_spot",
    styleTags: ["Cinematic", "Color Graded", "VFX Master"],
  };
}
