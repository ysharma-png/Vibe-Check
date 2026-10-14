"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AspectRatio,
  CreativeBrief,
  DeliverableType,
  Milestone,
  NegativeConstraint,
  Resolution,
  ToolRequirements,
  CommercialTerms,
} from "@/types/schema";
import { BRIEFS } from "@/data/briefs";
import { CREATORS } from "@/data/creators";
import { AiBriefAssistant } from "./AiBriefAssistant";
import { FormatSection } from "./FormatSection";
import { ToolRequirementsSection } from "./ToolRequirementsSection";
import { NegativeConstraintsSection } from "./NegativeConstraintsSection";
import { CommercialTermsSection } from "./CommercialTermsSection";
import { MilestoneEditor } from "./MilestoneEditor";
import { BriefSummaryCard } from "./BriefSummaryCard";
import { FieldProvenance } from "./FieldProvenance";
import { ParsedBrief, ConfidenceLevel } from "@/lib/brief/parse-nl";
import { validateBrief } from "@/lib/brief/validate";
import {
  buildDiscoveryUrlForBrief,
  countMatchingCreators,
} from "@/lib/brief/match-bridge";
import {
  DEFAULT_COMMERCIAL_TERMS,
  COPYRIGHT_NEGATIVE_CONSTRAINT,
  getDefaultMilestonesForDeliverable,
} from "@/lib/brief/defaults";
import { formatUsd } from "@/lib/brief/budget";
import {
  Sparkles,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  Code2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Layers,
} from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { fireInteractiveConfetti } from "@/lib/interactiveConfetti";

const STORAGE_KEY = "cacheflow_brief_builder_draft_v2";

const STEPS = [
  { id: 1, label: "Format & identity" },
  { id: 2, label: "Tools & constraints" },
  { id: 3, label: "Commercial terms" },
  { id: 4, label: "Escrow milestones" },
] as const;

const INITIAL_DRAFT: Partial<CreativeBrief> = {
  id: `brief-${Date.now()}`,
  campaignTitle: "",
  brandName: "",
  description: "",
  deliverableType: "social_short_form",
  aspectRatios: ["9:16"],
  resolution: "1080p",
  durationSec: 15,
  styleReferences: [],
  toolRequirements: {
    mode: "open_to_creator_choice",
    requiredToolIds: [],
    baseModelPolicy: "any",
  },
  negativeConstraints: [COPYRIGHT_NEGATIVE_CONSTRAINT],
  commercialTerms: DEFAULT_COMMERCIAL_TERMS,
  milestones: getDefaultMilestonesForDeliverable("social_short_form"),
  totalBudgetUsd: 4500,
  deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
};

export function BriefBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [brief, setBrief] = useState<Partial<CreativeBrief>>(INITIAL_DRAFT);
  const [confidence, setConfidence] = useState<Record<string, ConfidenceLevel>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<string[]>([]);
  const [engineUsed, setEngineUsed] = useState<"deterministic" | "llm">("deterministic");

  // Stepper state: initial landing shows only AI assistant until parsed or manually expanded
  const [hasRevealedSections, setHasRevealedSections] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showJsonExport, setShowJsonExport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill handling for ?creator=<id> and ?brief=<id>
  const creatorIdParam = searchParams.get("creator");
  const briefIdParam = searchParams.get("brief");

  const invitedCreator = creatorIdParam
    ? CREATORS.find((c) => c.id === creatorIdParam || c.handle === creatorIdParam)
    : undefined;

  // Hydrate from localStorage or URL params
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (briefIdParam) {
      const existing = BRIEFS.find((b) => b.id === briefIdParam);
      if (existing) {
        setBrief(existing);
        setHasRevealedSections(true);
        return;
      }
    }

    if (creatorIdParam) {
      setHasRevealedSections(true);
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setBrief((prev) => ({ ...prev, ...parsed }));
          if (parsed.campaignTitle || parsed.brandName) {
            setHasRevealedSections(true);
          }
        }
      }
    } catch {
      // Storage quota
    }
  }, [briefIdParam, creatorIdParam]);

  // Persist draft to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(brief));
    } catch {
      // Storage quota
    }
  }, [brief]);

  const handleResetDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setBrief(INITIAL_DRAFT);
    setConfidence({});
    setEvidence({});
    setQuestions([]);
    setHasRevealedSections(false);
    setCurrentStep(1);
  };

  const handleClearProvenance = (field: string) => {
    setConfidence((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setEvidence((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBriefParsed = (parsed: ParsedBrief) => {
    setBrief((prev) => ({
      ...prev,
      ...parsed.fields,
      milestones:
        parsed.fields.milestones ??
        getDefaultMilestonesForDeliverable(
          parsed.fields.deliverableType ?? prev.deliverableType ?? "social_short_form"
        ),
    }));
    setConfidence(parsed.confidence);
    setEvidence(parsed.evidence);
    setQuestions(parsed.questions);
    if (parsed.engine) {
      setEngineUsed(parsed.engine);
    }
    setHasRevealedSections(true);
    setCurrentStep(1);
  };

  // Validation
  const validationResult = validateBrief(brief);
  const isValid = validationResult.success;
  const missingFields = validationResult.missingFields;

  const handleSubmit = () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
      fireInteractiveConfetti();
    }, 600);
  };

  const matchingCreatorsCount = countMatchingCreators(brief);
  const discoveryUrl = buildDiscoveryUrlForBrief(brief);

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-content-primary">
            Brief builder
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1 max-w-xl leading-relaxed">
            Specify formats, tools, compliance standards, and milestone escrow schedules to match verified creators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-surface-border bg-surface hover:bg-surface-subtle text-xs text-content-muted hover:text-content-primary transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset draft</span>
          </button>
        </div>
      </div>

      {/* Invited Creator Banner if prefilled */}
      {invitedCreator && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-surface-border bg-surface text-xs shadow-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/15 text-accent">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-content-primary">
                Direct brief for {invitedCreator.name} (@{invitedCreator.handle})
              </div>
              <div className="text-content-muted text-[11px] mt-0.5">
                Starting rate from ${invitedCreator.startingRateUsd.toLocaleString()} • {invitedCreator.specializations.slice(0, 2).join(", ")}
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-surface-subtle border border-surface-border text-content-muted">
            Direct invite
          </span>
        </div>
      )}

      {/* Top AI Assistant (Always visible) */}
      <AiBriefAssistant
        onBriefParsed={handleBriefParsed}
        questions={questions}
        engineUsed={engineUsed}
      />

      {/* Initial state: if not structured yet, show gentle manual disclosure button */}
      {!hasRevealedSections && (
        <div className="text-center py-6">
          <button
            type="button"
            onClick={() => setHasRevealedSections(true)}
            className="text-xs text-content-muted hover:text-content-primary underline underline-offset-4 transition-colors"
          >
            Or fill out the brief form manually
          </button>
        </div>
      )}

      {/* Structured Stepper Form (Revealed after parsing or manual expansion) */}
      {hasRevealedSections && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Main Left Form: Stepper Steps (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stepper Navigation Pills */}
            <GlassSurface
              tier="regular"
              rounded="24"
              className="flex items-center gap-1.5 p-1.5 border border-white/10 overflow-x-auto scrollbar-none"
            >
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-mono transition-all text-center ${
                    currentStep === s.id
                      ? "bg-accent text-[#08090B] font-semibold shadow-glow-lime"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`${currentStep === s.id ? "text-[#08090B]/60" : "text-white/30"} mr-1 font-mono`}>
                    {s.id}.
                  </span>
                  <span>{s.label}</span>
                </button>
              ))}
            </GlassSurface>

            {/* Stepper Content Panels */}
            <AnimatePresence mode="wait">
              {/* STEP 1: Format & Identity */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  {/* Campaign Identity Card */}
                  <div className="rounded-3xl border border-surface-border bg-surface p-6 space-y-4 shadow-soft">
                    <div className="border-b border-surface-border/60 pb-3">
                      <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                        <span>Campaign identity</span>
                        <FieldProvenance
                          confidence={confidence.campaignTitle}
                          evidence={evidence.campaignTitle}
                          fieldName="Campaign Title"
                          onConfirm={() => handleClearProvenance("campaignTitle")}
                        />
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-content-primary block mb-1">
                          Brand name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Pulse Nutrition, Apex Motors..."
                          value={brief.brandName ?? ""}
                          onChange={(e) => {
                            handleClearProvenance("brandName");
                            setBrief((prev) => ({ ...prev, brandName: e.target.value }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs text-content-primary focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-content-primary block mb-1">
                          Campaign title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hyper-Speed Social Shorts 2026..."
                          value={brief.campaignTitle ?? ""}
                          onChange={(e) => {
                            handleClearProvenance("campaignTitle");
                            setBrief((prev) => ({ ...prev, campaignTitle: e.target.value }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs text-content-primary focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-content-primary block mb-1">
                        Campaign description &amp; creative direction
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Narrative summary, core visual mood, target audience, and messaging..."
                        value={brief.description ?? ""}
                        onChange={(e) => {
                          handleClearProvenance("description");
                          setBrief((prev) => ({ ...prev, description: e.target.value }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs text-content-primary focus:border-accent focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-xs font-medium text-content-primary block mb-1">
                          Total budget (USD)
                          <FieldProvenance
                            confidence={confidence.totalBudgetUsd}
                            evidence={evidence.totalBudgetUsd}
                            fieldName="Total Budget"
                            onConfirm={() => handleClearProvenance("totalBudgetUsd")}
                          />
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-mono text-content-muted">$</span>
                          <input
                            type="number"
                            min={100}
                            step={100}
                            value={brief.totalBudgetUsd ?? 4500}
                            onChange={(e) => {
                              handleClearProvenance("totalBudgetUsd");
                              const val = parseFloat(e.target.value);
                              setBrief((prev) => ({ ...prev, totalBudgetUsd: isNaN(val) ? 0 : val }));
                            }}
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs font-mono text-content-primary focus:border-accent focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-content-primary block mb-1">
                          Target deadline
                          <FieldProvenance
                            confidence={confidence.deadline}
                            evidence={evidence.deadline}
                            fieldName="Target Deadline"
                            onConfirm={() => handleClearProvenance("deadline")}
                          />
                        </label>
                        <input
                          type="date"
                          value={
                            brief.deadline
                              ? new Date(brief.deadline).toISOString().split("T")[0]
                              : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
                                  .toISOString()
                                  .split("T")[0]
                          }
                          onChange={(e) => {
                            handleClearProvenance("deadline");
                            const dateVal = e.target.value
                              ? new Date(`${e.target.value}T00:00:00.000Z`).toISOString()
                              : new Date().toISOString();
                            setBrief((prev) => ({ ...prev, deadline: dateVal }));
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs font-mono text-content-primary focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Format Section */}
                  <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-soft">
                    <FormatSection
                      aspectRatios={brief.aspectRatios ?? ["9:16"]}
                      deliverableType={brief.deliverableType ?? "social_short_form"}
                      resolution={brief.resolution ?? "1080p"}
                      durationSec={brief.durationSec ?? 15}
                      confidence={confidence}
                      evidence={evidence}
                      onUpdateAspectRatios={(ratios) => setBrief((prev) => ({ ...prev, aspectRatios: ratios }))}
                      onUpdateDeliverableType={(type) =>
                        setBrief((prev) => ({
                          ...prev,
                          deliverableType: type,
                          milestones: getDefaultMilestonesForDeliverable(type),
                        }))
                      }
                      onUpdateResolution={(res) => setBrief((prev) => ({ ...prev, resolution: res }))}
                      onUpdateDurationSec={(sec) => setBrief((prev) => ({ ...prev, durationSec: sec }))}
                      onClearProvenance={handleClearProvenance}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Tools & Constraints */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-soft">
                    <ToolRequirementsSection
                      toolRequirements={
                        brief.toolRequirements ?? {
                          mode: "open_to_creator_choice",
                          requiredToolIds: [],
                          baseModelPolicy: "any",
                        }
                      }
                      confidence={confidence}
                      evidence={evidence}
                      onUpdateToolRequirements={(req) => setBrief((prev) => ({ ...prev, toolRequirements: req }))}
                      onClearProvenance={handleClearProvenance}
                    />
                  </div>

                  <div className="rounded-3xl border border-surface-border bg-surface p-6 shadow-soft">
                    <NegativeConstraintsSection
                      negativeConstraints={brief.negativeConstraints ?? [COPYRIGHT_NEGATIVE_CONSTRAINT]}
                      confidence={confidence}
                      evidence={evidence}
                      onUpdateNegativeConstraints={(constraints) =>
                        setBrief((prev) => ({ ...prev, negativeConstraints: constraints }))
                      }
                      onClearProvenance={handleClearProvenance}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Commercial Terms (Prominent Legal Card) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <CommercialTermsSection
                    commercialTerms={brief.commercialTerms ?? DEFAULT_COMMERCIAL_TERMS}
                    confidence={confidence}
                    evidence={evidence}
                    onUpdateCommercialTerms={(terms) => setBrief((prev) => ({ ...prev, commercialTerms: terms }))}
                    onClearProvenance={handleClearProvenance}
                  />
                </motion.div>
              )}

              {/* STEP 4: Milestones */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-3xl border border-surface-border bg-surface p-6 shadow-soft"
                >
                  <MilestoneEditor
                    milestones={brief.milestones ?? []}
                    totalBudgetUsd={brief.totalBudgetUsd ?? 4500}
                    confidence={confidence}
                    evidence={evidence}
                    onUpdateMilestones={(m) => setBrief((prev) => ({ ...prev, milestones: m }))}
                    onClearProvenance={handleClearProvenance}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Controls */}
            <div className="flex items-center justify-between pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-xs font-mono font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition-all backdrop-blur-md"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
              ) : <div />}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-accent text-[#08090B] text-xs font-mono font-semibold hover:bg-accent/90 transition-all shadow-glow-lime hover:scale-[1.02]"
                >
                  <span>Next: {STEPS[currentStep]?.label}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-7 py-3 rounded-2xl bg-accent text-[#08090B] text-xs font-mono font-bold hover:bg-accent/90 disabled:opacity-40 transition-all shadow-glow-lime hover:scale-[1.02]"
                >
                  <span>Publish &amp; match creators</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Rail: BriefSummaryCard (Sticky on Desktop, Collapsible on Mobile) */}
          <div className="lg:col-span-4">
            {/* Mobile Collapsible Header */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-black/60 text-xs font-mono font-medium text-white"
              >
                <span>Campaign summary &amp; escrow schedule</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileSummaryOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className={`${isMobileSummaryOpen ? "block" : "hidden lg:block"}`}>
              <BriefSummaryCard
                brief={brief}
                missingFields={missingFields}
                isValid={isValid}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
            <GlassSurface
              tier="thick"
              rounded="32"
              className="w-full max-w-xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <MacTrafficLights onClose={() => setIsSuccessModalOpen(false)} />
                  <div className="h-4 w-px bg-white/10" />
                  <div>
                    <h3 className="text-sm font-display font-medium text-white">
                      Brief Published
                    </h3>
                    <p className="text-xs text-white/50 font-mono">
                      Escrow milestones and technical mandates locked.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJsonExport(!showJsonExport)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono bg-white/[0.04] text-white/60 hover:text-white border border-white/10 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{showJsonExport ? "View spec" : "View JSON"}</span>
                </button>
              </div>

              {/* Matching candidate badge */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between backdrop-blur-md">
                <div>
                  <div className="text-xs font-mono font-semibold text-white">
                    Qualified Creator Candidates
                  </div>
                  <div className="text-[11px] text-white/50 font-light mt-0.5">
                    Creators whose verified pipelines meet your criteria.
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-accent">
                    {matchingCreatorsCount}
                  </span>
                  <span className="text-xs text-white/50 ml-1 font-mono">creators</span>
                </div>
              </div>

              {/* View spec or JSON */}
              {showJsonExport ? (
                <div className="max-h-64 overflow-y-auto p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-white/70">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(brief, null, 2)}</pre>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Campaign</span>
                    <span className="font-medium text-white">{brief.campaignTitle || "Untitled"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Brand</span>
                    <span className="font-medium text-white">{brief.brandName || "Pending"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Total Escrow</span>
                    <span className="font-medium text-white">{formatUsd(brief.totalBudgetUsd ?? 0)}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Target Ratios</span>
                    <span className="font-medium text-accent">{brief.aspectRatios?.join(", ")}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-white/60 hover:text-white transition-colors"
                >
                  Continue editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    router.push(discoveryUrl);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-accent text-[#08090B] text-xs font-mono font-semibold hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-glow-lime hover:scale-[1.02]"
                >
                  <span>Explore {matchingCreatorsCount} matching creators</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </GlassSurface>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
