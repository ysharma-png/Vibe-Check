import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseBriefDeterministic, ParsedBrief } from "@/lib/brief/parse-nl";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

// Optional zod schema to validate Claude LLM output structure
const ParsedBriefResponseSchema = z.object({
  fields: z.record(z.any()),
  confidence: z.record(z.enum(["high", "medium", "low"])),
  evidence: z.record(z.string()),
  questions: z.array(z.string()),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let rawText = "";

  try {
    const body = await req.json();
    rawText = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  // 1. Input Length Cap Defense (prevent token exhaustion & memory bloat)
  if (rawText.length > 8000) {
    return NextResponse.json(
      { error: "Input text exceeds maximum allowable length of 8,000 characters." },
      { status: 413 }
    );
  }

  // 2. Rate Limiting Defense (20 parse operations per hour per IP)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const rateLimit = checkRateLimit(`ai:brief-parse:${clientIp}`, RATE_LIMIT_PRESETS.aiBriefBuilder);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: rateLimit.message ?? "Rate limit exceeded. Please wait before retrying." },
      {
        status: 429,
        headers: { "Retry-After": rateLimit.retryAfter.toString() },
      }
    );
  }

  // 3. Prompt Injection Defense: strip script tags & delimiters
  const sanitizedInput = rawText
    .replace(/<\s*\/?\s*script\b[^>]*>/gi, "")
    .replace(/```/g, "'''")
    .trim();

  // Fallback engine A is always ready
  const deterministicResult = parseBriefDeterministic(sanitizedInput);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    // Engine A deterministic
    return NextResponse.json({
      ...deterministicResult,
      engine: "deterministic",
    });
  }

  // Engine B: LLM via Anthropic Messages API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // Strict 6 second timeout

    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

    const systemPrompt = `You are a Principal AI Creative Producer structuring commercial video and animation campaign briefs for an enterprise marketplace called CacheFlow.

Given the client's campaign description, extract structured parameters matching the following JSON schema:
{
  "fields": {
    "campaignTitle": string,
    "brandName": string,
    "description": string,
    "deliverableType": "social_short_form" | "commercial_spot" | "animation" | "still_assets" | "product_visual" | "music_video",
    "aspectRatios": ("9:16" | "16:9" | "1:1" | "4:5" | "21:9")[],
    "resolution": "1080p" | "2K" | "4K",
    "durationSec": number,
    "styleReferences": string[],
    "toolRequirements": {
      "mode": "open_to_creator_choice" | "required_tools",
      "requiredToolIds": string[],
      "baseModelPolicy": "any" | "permissive_only" | "indemnified_only"
    },
    "negativeConstraints": { "id": string, "label": string, "severity": "hard" | "soft" }[],
    "commercialTerms": {
      "rightsModel": "perpetual_buyout" | "term_license" | "usage_based",
      "termMonths"?: number,
      "territory": "worldwide" | "regional",
      "regions"?: string[],
      "exclusivity": boolean,
      "sourceHandover": ("node_graph" | "prompts_and_seeds" | "lora_weights" | "project_files")[],
      "requiresVerifiedLicense": boolean,
      "requiresReproduciblePipeline": boolean
    },
    "totalBudgetUsd"?: number,
    "deadline"?: string (ISO 8601 string)
  },
  "confidence": {
    [fieldName: string]: "high" | "medium" | "low"
  },
  "evidence": {
    [fieldName: string]: string (exact phrase from input that triggered this inference)
  },
  "questions": string[] (clarifications user should provide if budget, deadline, aspect ratio, or deliverables were not provided)
}

CRITICAL RULES:
1. NEVER invent a budget or deadline that is not explicitly in the user text. Leave undefined and ask in questions.
2. Commercially conservative defaults: perpetual buyout worldwide unless stated otherwise; always include prompts_and_seeds + project_files in sourceHandover.
3. If enterprise, legal risk, or regulated client is mentioned: set baseModelPolicy to "indemnified_only" and requiresVerifiedLicense to true.
4. Always provide quotes in "evidence" explaining each inferred value.
5. Return ONLY pure valid JSON with no markdown formatting, no backticks, no preamble.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Campaign brief text:\n\n${rawText}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Non-200 -> silently fallback to Engine A
      return NextResponse.json({
        ...deterministicResult,
        engine: "deterministic",
      });
    }

    const data = await response.json();
    const contentText = data?.content?.[0]?.text;

    if (!contentText || typeof contentText !== "string") {
      return NextResponse.json({
        ...deterministicResult,
        engine: "deterministic",
      });
    }

    // Parse JSON
    const cleanedJson = contentText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsedJson = JSON.parse(cleanedJson);
    const valid = ParsedBriefResponseSchema.safeParse(parsedJson);

    if (!valid.success) {
      return NextResponse.json({
        ...deterministicResult,
        engine: "deterministic",
      });
    }

    const parsedBrief: ParsedBrief = {
      fields: valid.data.fields,
      confidence: valid.data.confidence,
      evidence: valid.data.evidence,
      questions: valid.data.questions,
      engine: "llm",
    };

    return NextResponse.json(parsedBrief);
  } catch {
    // Timeout, network error, or invalid JSON -> silent fallback to Engine A
    return NextResponse.json({
      ...deterministicResult,
      engine: "deterministic",
    });
  }
}
