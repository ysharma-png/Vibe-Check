import {
  AspectRatio,
  CreativeBrief,
  DeliverableType,
  NegativeConstraint,
  Resolution,
  ToolRequirements,
} from "@/types/schema";
import { TOOLS } from "@/lib/taxonomy";
import {
  COPYRIGHT_NEGATIVE_CONSTRAINT,
  DEFAULT_COMMERCIAL_TERMS,
  getDefaultMilestonesForDeliverable,
} from "./defaults";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ParsedBrief {
  readonly fields: Partial<CreativeBrief>;
  readonly confidence: Record<string, ConfidenceLevel>;
  readonly evidence: Record<string, string>;
  readonly questions: string[];
  readonly engine?: "deterministic" | "llm";
}

// Exchange rates stated for deterministic conversion to USD
const CURRENCY_RATES_TO_USD: Readonly<Record<string, number>> = {
  INR: 1 / 83.0, // INR 83 = 1 USD
  EUR: 1.08,     // 1 EUR = 1.08 USD
  GBP: 1.3,      // 1 GBP = 1.30 USD
};

/**
 * Deterministic Engine A:
 * Parses unstructured natural language campaign requirements into a structured CreativeBrief draft.
 * Runs completely offline with zero network dependencies.
 */
export function parseBriefDeterministic(rawText: string): ParsedBrief {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const fields: Partial<CreativeBrief> = {};
  const confidence: Record<string, ConfidenceLevel> = {};
  const evidence: Record<string, string> = {};
  const questions: string[] = [];

  if (!text) {
    return {
      fields: {},
      confidence: {},
      evidence: {},
      questions: ["Please provide campaign requirements or a brief description."],
      engine: "deterministic",
    };
  }

  // --------------------------------------------------------------------------
  // 1. Aspect Ratios (Detect platforms & formats, handles multi-aspect / conflicts)
  // --------------------------------------------------------------------------
  const aspectRatios: AspectRatio[] = [];

  const hasVertical =
    /\b(tiktok|reels|shorts|vertical|9:16|9x16|stories|story)\b/i.test(text);
  const hasCinematic =
    /\b(youtube|cinema|cinematic|tv|television|trailer|hero spot|broadcast|16:9|16x9|landscape|widescreen)\b/i.test(
      text
    );
  const hasSquare = /\b(square|1:1|1x1|feed post)\b/i.test(text);
  const hasPortrait = /\b(portrait|4:5|4x5|ig portrait)\b/i.test(text);
  const hasUltrawide = /\b(ultrawide|banner|billboard|21:9|21x9|anamorphic)\b/i.test(
    text
  );

  const aspectEvidenceParts: string[] = [];

  if (hasVertical) {
    aspectRatios.push("9:16");
    aspectEvidenceParts.push("vertical / mobile platforms (TikTok/Reels/Shorts)");
  }
  if (hasCinematic) {
    aspectRatios.push("16:9");
    aspectEvidenceParts.push("cinematic / broadcast platforms (YouTube/TV/Trailer)");
  }
  if (hasSquare) {
    aspectRatios.push("1:1");
    aspectEvidenceParts.push("square feed (1:1)");
  }
  if (hasPortrait) {
    aspectRatios.push("4:5");
    aspectEvidenceParts.push("social portrait (4:5)");
  }
  if (hasUltrawide) {
    aspectRatios.push("21:9");
    aspectEvidenceParts.push("ultrawide / banner (21:9)");
  }

  if (aspectRatios.length > 0) {
    fields.aspectRatios = aspectRatios;
    confidence.aspectRatios = "high";
    evidence.aspectRatios = `Detected platforms: ${aspectEvidenceParts.join(", ")}`;
  } else {
    fields.aspectRatios = ["16:9"];
    confidence.aspectRatios = "low";
    evidence.aspectRatios = "Defaulted to 16:9 landscape";
    questions.push(
      "Which platform or aspect ratio are you targeting? (e.g. 9:16 TikTok, 16:9 Cinema)"
    );
  }

  // --------------------------------------------------------------------------
  // 2. Deliverable Type
  // --------------------------------------------------------------------------
  let deliverableType: DeliverableType | undefined;
  let deliverableEvidence = "";

  if (/\b(social short|tiktok|reels|shorts|viral short|vertical video)\b/i.test(text)) {
    deliverableType = "social_short_form";
    deliverableEvidence = "Social short-form video cues";
  } else if (/\b(commercial|tv spot|hero spot|broadcast ad|campaign ad|commercial spot)\b/i.test(text)) {
    deliverableType = "commercial_spot";
    deliverableEvidence = "Commercial spot cues";
  } else if (/\b(animation|animated|cartoon|anime|character animation)\b/i.test(text)) {
    deliverableType = "animation";
    deliverableEvidence = "Animation cues";
  } else if (/\b(product visual|packshot|pack shot|e-commerce|bottle render|product render)\b/i.test(text)) {
    deliverableType = "product_visual";
    deliverableEvidence = "Product visualization cues";
  } else if (/\b(music video|track visualizer|visualizer)\b/i.test(text)) {
    deliverableType = "music_video";
    deliverableEvidence = "Music video cues";
  } else if (/\b(still assets|stills|key visual|posters|photography|print ad)\b/i.test(text)) {
    deliverableType = "still_assets";
    deliverableEvidence = "Still assets cues";
  }

  if (deliverableType) {
    fields.deliverableType = deliverableType;
    confidence.deliverableType = "high";
    evidence.deliverableType = deliverableEvidence;
  } else {
    // Fall back to social short if vertical, otherwise commercial spot
    fields.deliverableType = hasVertical ? "social_short_form" : "commercial_spot";
    confidence.deliverableType = "low";
    evidence.deliverableType = "Inferred from ratio / general video context";
    questions.push(
      "What deliverable format do you need? (e.g. social short form, commercial spot, product visual)"
    );
  }

  // --------------------------------------------------------------------------
  // 3. Duration
  // --------------------------------------------------------------------------
  const durationMatch = text.match(
    /\b(?:duration\s*(?:of|:)?\s*)?(\d+)\s*(?:-|–)?\s*(?:seconds?|sec\b|s\b)\b/i
  );
  const halfMinuteMatch = /\bhalf-minute\b/i.test(text);
  const oneMinuteMatch = /\b(?:one|1)\s*minute\b/i.test(text);

  if (durationMatch && durationMatch[1]) {
    const sec = parseInt(durationMatch[1], 10);
    if (!isNaN(sec) && sec > 0) {
      fields.durationSec = sec;
      confidence.durationSec = "high";
      evidence.durationSec = `Matched '${durationMatch[0]}'`;
    }
  } else if (halfMinuteMatch) {
    fields.durationSec = 30;
    confidence.durationSec = "high";
    evidence.durationSec = "Matched 'half-minute' -> 30s";
  } else if (oneMinuteMatch) {
    fields.durationSec = 60;
    confidence.durationSec = "high";
    evidence.durationSec = "Matched 'one minute' -> 60s";
  } else if (fields.deliverableType === "still_assets") {
    fields.durationSec = 5; // Default placeholder for stills
    confidence.durationSec = "medium";
    evidence.durationSec = "Still assets (non-temporal)";
  } else {
    // Reasonable default based on deliverable
    fields.durationSec = fields.deliverableType === "social_short_form" ? 15 : 30;
    confidence.durationSec = "low";
    evidence.durationSec = `Defaulted ${fields.durationSec}s for ${fields.deliverableType}`;
    questions.push(
      "What is the exact target duration in seconds? (e.g. 15s, 30s, 60s)"
    );
  }

  // --------------------------------------------------------------------------
  // 4. Resolution
  // --------------------------------------------------------------------------
  let resolution: Resolution = "1080p";
  let resolutionConfidence: ConfidenceLevel = "low";
  let resolutionEvidence = "Defaulted to 1080p standard HD";

  if (/\b(4k|uhd|ultra hd)\b/i.test(text)) {
    resolution = "4K";
    resolutionConfidence = "high";
    resolutionEvidence = "Explicit 4K / Ultra-HD request";
  } else if (/\b(2k|1440p|qhd)\b/i.test(text)) {
    resolution = "2K";
    resolutionConfidence = "high";
    resolutionEvidence = "Explicit 2K / 1440p request";
  } else if (/\b(1080p|fhd|full hd)\b/i.test(text)) {
    resolution = "1080p";
    resolutionConfidence = "high";
    resolutionEvidence = "Explicit 1080p request";
  } else if (fields.deliverableType === "commercial_spot") {
    resolution = "4K";
    resolutionConfidence = "medium";
    resolutionEvidence = "Commercial broadcast spots default to 4K";
  }

  fields.resolution = resolution;
  confidence.resolution = resolutionConfidence;
  evidence.resolution = resolutionEvidence;

  // --------------------------------------------------------------------------
  // 5. Budget (Multi-currency conversion: USD, INR, EUR, GBP)
  // --------------------------------------------------------------------------
  let detectedBudget: number | undefined;
  let budgetEvidence = "";

  // INR pattern: e.g. "INR 4 lakh", "400000 inr", "₹4 lakh"
  const inrLakhMatch = text.match(/(?:(?:₹|inr)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)|(\d+(?:\.\d+)?)\s*(?:lakh|lac)\s*(?:inr|rupees))/i);
  const inrRawMatch = text.match(/(?:₹|inr)\s*(\d{1,3}(?:,\d{3})+|\d+)/i);

  // EUR pattern: e.g. "€10k", "10,000 eur"
  const eurMatch = text.match(/(?:€|eur\s*)(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?|(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?\s*(?:€|eur)/i);

  // GBP pattern: e.g. "£5k", "5,000 gbp"
  const gbpMatch = text.match(/(?:£|gbp\s*)(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?|(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?\s*(?:£|gbp)/i);

  // USD pattern: e.g. "$8k", "$8,000", "5,000 usd", "budget of 4500"
  const usdMatch = text.match(/(?:\$|usd\s*)(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?|(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?\s*(?:\$|usd)|budget\s*(?:of|:)?\s*\$?(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand))?/i);

  if (inrLakhMatch) {
    const rawVal = inrLakhMatch[1] ?? inrLakhMatch[2];
    if (rawVal) {
      const lakhs = parseFloat(rawVal);
      const inrAmount = lakhs * 100000;
      detectedBudget = Math.round(inrAmount * (CURRENCY_RATES_TO_USD.INR ?? (1 / 83)));
      budgetEvidence = `Parsed 'INR ${lakhs} lakh' (~₹${inrAmount.toLocaleString()}) converted @ 83:1 to $${detectedBudget.toLocaleString()} USD`;
    }
  } else if (inrRawMatch && inrRawMatch[1]) {
    const cleanStr = inrRawMatch[1].replace(/,/g, "");
    const inrAmount = parseFloat(cleanStr);
    detectedBudget = Math.round(inrAmount * (CURRENCY_RATES_TO_USD.INR ?? (1 / 83)));
    budgetEvidence = `Parsed '₹${cleanStr}' converted @ 83:1 to $${detectedBudget.toLocaleString()} USD`;
  } else if (eurMatch) {
    const valStr = (eurMatch[1] ?? eurMatch[3] ?? "0").replace(/,/g, "");
    const isK = Boolean(eurMatch[2] ?? eurMatch[4]);
    let val = parseFloat(valStr);
    if (isK) val *= 1000;
    detectedBudget = Math.round(val * (CURRENCY_RATES_TO_USD.EUR ?? 1.08));
    budgetEvidence = `Parsed '€${val.toLocaleString()}' converted @ 1.08:1 to $${detectedBudget.toLocaleString()} USD`;
  } else if (gbpMatch) {
    const valStr = (gbpMatch[1] ?? gbpMatch[3] ?? "0").replace(/,/g, "");
    const isK = Boolean(gbpMatch[2] ?? gbpMatch[4]);
    let val = parseFloat(valStr);
    if (isK) val *= 1000;
    detectedBudget = Math.round(val * (CURRENCY_RATES_TO_USD.GBP ?? 1.30));
    budgetEvidence = `Parsed '£${val.toLocaleString()}' converted @ 1.30:1 to $${detectedBudget.toLocaleString()} USD`;
  } else if (usdMatch) {
    const valStr = (usdMatch[1] ?? usdMatch[3] ?? usdMatch[5] ?? "0").replace(/,/g, "");
    const isK = Boolean(usdMatch[2] ?? usdMatch[4] ?? usdMatch[6]);
    let val = parseFloat(valStr);
    if (isK) val *= 1000;
    detectedBudget = Math.round(val);
    budgetEvidence = `Parsed USD budget of $${detectedBudget.toLocaleString()}`;
  }

  if (detectedBudget && detectedBudget > 0) {
    fields.totalBudgetUsd = detectedBudget;
    confidence.totalBudgetUsd = "high";
    evidence.totalBudgetUsd = budgetEvidence;
  } else {
    // Crucial rule: Never invent a budget when not present in text!
    confidence.totalBudgetUsd = "low";
    questions.push(
      "What is your target budget for this campaign? (e.g. $5,000 USD)"
    );
  }

  // --------------------------------------------------------------------------
  // 6. Deadline
  // --------------------------------------------------------------------------
  const now = new Date();
  let deadlineIso: string | undefined;
  let deadlineEvidence = "";

  const weeksMatch = text.match(/\b(?:in\s+)?(\d+)\s*weeks?\b/i);
  const daysMatch = text.match(/\b(?:in\s+)?(\d+)\s*days?\b/i);
  const monthMatch = text.match(/\b(?:in\s+)?(\d+)\s*months?\b/i);
  const nextMonthMatch = /\bnext\s+month\b/i.test(text);

  // Month-day matching: e.g. "by March 15", "by December 2026", "by Nov 1st"
  const dateNameMatch = text.match(
    /\b(?:by|before|deadline:?)\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s*(\d{1,2})?(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/i
  );

  if (weeksMatch && weeksMatch[1]) {
    const w = parseInt(weeksMatch[1], 10);
    const target = new Date(now.getTime() + w * 7 * 24 * 60 * 60 * 1000);
    deadlineIso = target.toISOString();
    deadlineEvidence = `Inferred '${weeksMatch[0]}' (+${w * 7} days)`;
  } else if (daysMatch && daysMatch[1]) {
    const d = parseInt(daysMatch[1], 10);
    const target = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    deadlineIso = target.toISOString();
    deadlineEvidence = `Inferred '${daysMatch[0]}' (+${d} days)`;
  } else if (monthMatch && monthMatch[1]) {
    const m = parseInt(monthMatch[1], 10);
    const target = new Date(now.getTime() + m * 30 * 24 * 60 * 60 * 1000);
    deadlineIso = target.toISOString();
    deadlineEvidence = `Inferred '${monthMatch[0]}' (+${m * 30} days)`;
  } else if (nextMonthMatch) {
    const target = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    deadlineIso = target.toISOString();
    deadlineEvidence = "Inferred 'next month' (~30 days)";
  } else if (dateNameMatch) {
    const monthStr = dateNameMatch[1] ?? "december";
    const dayStr = dateNameMatch[2] ?? "15";
    const yearStr = dateNameMatch[3] ?? (now.getFullYear() + (now.getMonth() > 9 ? 1 : 0)).toString();
    const candidate = new Date(`${monthStr} ${dayStr}, ${yearStr} 00:00:00 UTC`);
    if (!isNaN(candidate.getTime())) {
      deadlineIso = candidate.toISOString();
      deadlineEvidence = `Matched explicit date '${dateNameMatch[0]}'`;
    }
  }

  if (deadlineIso) {
    fields.deadline = deadlineIso;
    confidence.deadline = "high";
    evidence.deadline = deadlineEvidence;
  } else {
    confidence.deadline = "low";
    questions.push(
      "When is your final delivery deadline? (e.g. 'in 3 weeks', 'by Nov 15')"
    );
  }

  // --------------------------------------------------------------------------
  // 7. Tool Mentions & Requirements
  // --------------------------------------------------------------------------
  const matchedToolIds: string[] = [];
  const toolEvidenceNames: string[] = [];

  for (const tool of TOOLS) {
    const toolRegex = new RegExp(`\\b${tool.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b|\\b${tool.id.replace(/-/g, " ")}\\b`, "i");
    if (toolRegex.test(text)) {
      matchedToolIds.push(tool.id);
      toolEvidenceNames.push(tool.name);
    }
  }

  // Also check common aliases like "FLUX", "Runway", "Midjourney", "ComfyUI"
  if (/\bflux\b/i.test(text) && !matchedToolIds.includes("flux-1-dev")) {
    matchedToolIds.push("flux-1-dev");
    toolEvidenceNames.push("FLUX");
  }
  if (/\brunway\b/i.test(text) && !matchedToolIds.includes("runway-gen3")) {
    matchedToolIds.push("runway-gen3");
    toolEvidenceNames.push("Runway");
  }
  if (/\bcomfy(?:ui)?\b/i.test(text) && !matchedToolIds.includes("comfy-ui")) {
    matchedToolIds.push("comfy-ui");
    toolEvidenceNames.push("ComfyUI");
  }
  if (/\bkling\b/i.test(text) && !matchedToolIds.includes("kling-1-5")) {
    matchedToolIds.push("kling-1-5");
    toolEvidenceNames.push("Kling");
  }

  // Risk / Legal enterprise cues
  const hasEnterpriseRisk = /\b(legal is strict|enterprise client|regulated|indemnified|compliance team|corporate legal|broadcast standard|risk-sensitive)\b/i.test(
    text
  );

  const baseModelPolicy: ToolRequirements["baseModelPolicy"] = hasEnterpriseRisk
    ? "indemnified_only"
    : /\b(permissive|open source|open weights|no proprietary lock-in)\b/i.test(text)
    ? "permissive_only"
    : "any";

  fields.toolRequirements = {
    mode: matchedToolIds.length > 0 ? "required_tools" : "open_to_creator_choice",
    requiredToolIds: matchedToolIds,
    baseModelPolicy,
  };

  confidence.toolRequirements = matchedToolIds.length > 0 || hasEnterpriseRisk ? "high" : "medium";
  evidence.toolRequirements =
    matchedToolIds.length > 0
      ? `Specific tools requested: ${toolEvidenceNames.join(", ")} | Base policy: ${baseModelPolicy}`
      : `Creator choice open | Base policy: ${baseModelPolicy}${hasEnterpriseRisk ? " (enterprise strict legal detected)" : ""}`;

  // --------------------------------------------------------------------------
  // 8. Negative Constraints Phrasing Extraction
  // --------------------------------------------------------------------------
  const extractedConstraints: NegativeConstraint[] = [COPYRIGHT_NEGATIVE_CONSTRAINT];
  let constraintCounter = 1;

  // Patterns matching negative constraints
  // e.g. "no logos", "avoid uncanny faces", "can't look like Pixar", "without watermarks"
  const negativeRegexes = [
    /\b(?:no|without|nothing|never)\s+([a-zA-Z0-9\s-]{3,35})(?=[,.;\n]|$)/gi,
    /\b(?:avoid|prevent)\s+([a-zA-Z0-9\s-]{3,35})(?=[,.;\n]|$)/gi,
    /\b(?:can'?t look like|cannot look like)\s+([a-zA-Z0-9\s-]{3,35})(?=[,.;\n]|$)/gi,
    /\b(?:don'?t want|do not want)\s+([a-zA-Z0-9\s-]{3,35})(?=[,.;\n]|$)/gi,
  ];

  for (const regex of negativeRegexes) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const phrase = match[1]?.trim();
      if (phrase && phrase.length > 2 && !phrase.startsWith("matter") && !phrase.startsWith("problem")) {
        const isAvoid = /avoid|prevent/i.test(match[0]);
        const isStyleExclusion = /look like/i.test(match[0]);
        
        let label = match[0].trim();
        // Capitalize first letter
        label = label.charAt(0).toUpperCase() + label.slice(1);

        extractedConstraints.push({
          id: `nc-extracted-${constraintCounter++}`,
          label,
          severity: isAvoid ? "soft" : "hard",
        });
      }
    }
  }

  fields.negativeConstraints = extractedConstraints;
  confidence.negativeConstraints = extractedConstraints.length > 1 ? "high" : "medium";
  evidence.negativeConstraints =
    extractedConstraints.length > 1
      ? `Extracted ${extractedConstraints.length - 1} custom constraints + standard copyright guard`
      : "Standard copyright and celebrity guard pre-applied";

  // --------------------------------------------------------------------------
  // 9. Commercial Terms & Risk Cues
  // --------------------------------------------------------------------------
  const commercial = { ...DEFAULT_COMMERCIAL_TERMS };

  // Rights model
  if (/\b(own it forever|full buyout|perpetual|buyout|own all rights|all rights in perpetuity)\b/i.test(text)) {
    commercial.rightsModel = "perpetual_buyout";
    evidence.commercialTerms_rights = "Matched perpetual buyout cue ('we own it forever' / 'perpetual')";
  } else if (/\b(launch quarter|quarter|(\d+)\s*months?|term license|limited period)\b/i.test(text)) {
    commercial.rightsModel = "term_license";
    const termMatch = text.match(/(\d+)\s*months?/i);
    commercial.termMonths = termMatch && termMatch[1] ? parseInt(termMatch[1], 10) : 3;
    evidence.commercialTerms_rights = `Matched term license (${commercial.termMonths} months)`;
  }

  // Territory
  if (/\b(worldwide|global|all territories|international)\b/i.test(text)) {
    commercial.territory = "worldwide";
  } else if (/\b(regional|north america|us only|europe only|asia)\b/i.test(text)) {
    commercial.territory = "regional";
    commercial.regions = ["North America"];
  }

  // Source Handover
  const handoverSet = new Set(commercial.sourceHandover);
  if (/\b(project files|source files|after effects|premiere)\b/i.test(text)) {
    handoverSet.add("project_files");
  }
  if (/\b(prompts and seeds|prompts|seeds|generation manifests)\b/i.test(text)) {
    handoverSet.add("prompts_and_seeds");
  }
  if (/\b(node graph|comfy graph|comfyui graph|workflow json)\b/i.test(text)) {
    handoverSet.add("node_graph");
  }
  if (/\b(lora|weights|fine-tuned weights)\b/i.test(text)) {
    handoverSet.add("lora_weights");
  }
  commercial.sourceHandover = Array.from(handoverSet);

  // Verification requirements
  if (hasEnterpriseRisk || /\b(verified license|commercial subscription|indemnified only)\b/i.test(text)) {
    commercial.requiresVerifiedLicense = true;
  }
  if (/\b(reproducible|deterministic|audit trail|exact seed)\b/i.test(text)) {
    commercial.requiresReproduciblePipeline = true;
  }

  fields.commercialTerms = commercial;
  confidence.commercialTerms = "high";
  evidence.commercialTerms = `Rights: ${commercial.rightsModel} (${commercial.territory}) | Handover: ${commercial.sourceHandover.join(", ")} | Verified license: ${commercial.requiresVerifiedLicense}`;

  // --------------------------------------------------------------------------
  // 10. Milestones
  // --------------------------------------------------------------------------
  fields.milestones = getDefaultMilestonesForDeliverable(fields.deliverableType ?? "social_short_form");
  confidence.milestones = "high";
  evidence.milestones = `Standard balanced escrow schedule (100% total) for ${fields.deliverableType}`;

  // --------------------------------------------------------------------------
  // 11. Title, Description, Brand
  // --------------------------------------------------------------------------
  fields.description = text;

  // Extract brand name if available
  const brandMatch = text.match(/\b(?:for|client|brand:?)\s+([A-Z][a-zA-Z0-9&.\s]{1,25})(?=\s+(?:202\d|new|campaign|ad|spot|launch|product|motors|lab))/i);
  if (brandMatch && brandMatch[1]) {
    fields.brandName = brandMatch[1].trim();
    confidence.brandName = "high";
    evidence.brandName = `Extracted brand '${fields.brandName}'`;
  } else {
    fields.brandName = "Creative Partner";
    confidence.brandName = "low";
    evidence.brandName = "Brand name not specified";
    questions.push("What is the official brand or client name?");
  }

  // Generate a clean title
  const titleWords = text.split(/\s+/).slice(0, 7).join(" ");
  fields.campaignTitle = titleWords.length > 0 ? `${titleWords}...` : "New Generative Campaign";
  confidence.campaignTitle = "medium";
  evidence.campaignTitle = "Derived from initial phrase";

  fields.styleReferences = [];
  if (/\b(cinematic|cyberpunk|anime|brutalist|photorealistic|clean|minimalist|neon|retro)\b/i.test(text)) {
    const styleMatches = text.match(/\b(cinematic|cyberpunk|anime|brutalist|photorealistic|clean|minimalist|neon|retro)\b/gi);
    if (styleMatches) {
      fields.styleReferences = Array.from(new Set(styleMatches.map((s) => s.toLowerCase())));
    }
  }

  return {
    fields,
    confidence,
    evidence,
    questions,
    engine: "deterministic",
  };
}
