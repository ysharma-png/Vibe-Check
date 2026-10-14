"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  ExternalLink,
  Save,
  Eye,
  Sparkles,
  CheckCircle2,
  Star,
  Trash2,
  Edit3,
  Sliders,
  ShieldCheck,
  Layers,
  Film,
  Tag,
  Globe,
  ChevronUp,
  ChevronDown,
  Info,
  Clock,
  Cpu,
  Lock,
  Download,
} from "lucide-react";
import { CREATORS, PORTFOLIO_ITEMS } from "@/data";
import { TOOLS } from "@/lib/taxonomy";
import { ImportMediaModal } from "@/components/portfolio-editor/ImportMediaModal";
import { ImportedMediaItem } from "@/lib/importers/types";
import {
  PortfolioItem,
  PipelineStage,
  AspectRatio,
  DeliverableType,
  Resolution,
  ASPECT_RATIOS,
  DELIVERABLE_TYPES,
  RESOLUTIONS,
} from "@/types/schema";
import { ProfileStrengthMeter } from "@/components/portfolio-editor/ProfileStrengthMeter";
import { DragDropUploader, UploadedMedia } from "@/components/portfolio-editor/DragDropUploader";
import { WorkflowStepBuilder } from "@/components/portfolio-editor/WorkflowStepBuilder";

interface ExtendedItem extends PortfolioItem {
  isPublished: boolean;
  isFeatured: boolean;
  frameRate?: string;
  generationMethod?: string;
  licenseType?: string;
  outputOwnership?: string;
  modelLicenseNotes?: string;
  trainingDataDisclosure?: string;
  humanInTheLoopNotes?: string;
}

export default function CreatorPortfolioEditorPage() {
  // Active creator profile (Alex Rivera by default)
  const creator = useMemo(() => CREATORS[0] ?? {
    id: "creator-alex-rivera",
    name: "Alex Rivera",
    handle: "alex_rivera",
    location: "San Francisco, CA",
    startingRateUsd: 2800,
  }, []);

  // Creator's items from mock data
  const initialItems: ExtendedItem[] = useMemo(() => {
    const creatorItems = PORTFOLIO_ITEMS.filter((item) => item.creatorId === creator.id);
    return creatorItems.map((item, idx) => ({
      ...item,
      isPublished: true,
      isFeatured: idx === 0, // First item featured by default
      frameRate: "24 fps",
      generationMethod: "ComfyUI Node Graph + ControlNet",
      licenseType: "Full Commercial Buyout (Perpetual Global)",
      outputOwnership: "Client 100% IP Assignment",
      modelLicenseNotes: "Apache 2.0 / Commercial SaaS SLA with full indemnity indemnification.",
      trainingDataDisclosure: "Synthetic custom LoRAs trained exclusively on licensed 35mm RAW scans.",
      humanInTheLoopNotes: "Lead director supervised latent keyframing, temporal coherence masking, and grading.",
    }));
  }, [creator.id]);

  const [items, setItems] = useState<ExtendedItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportSuccess = (imported: ImportedMediaItem) => {
    const newItem: ExtendedItem = {
      id: `imported-${Date.now().toString(36)}`,
      creatorId: creator.id,
      title: imported.title,
      description: imported.description,
      mediaType: "video",
      mediaUrl: null, // Zero local re-hosting: streams via official embed
      posterGradient: ["#181824", "#302B63", "#24243E"],
      aspectRatio: imported.aspectRatio,
      resolution: "4K",
      durationSec: imported.durationSec || 60,
      deliverableType: imported.suggestedDeliverableType,
      styleTags: imported.styleTags,
      toolchain: imported.suggestedTools,
      pipeline: [],
      nodeGraph: null,
      reproducibility: { kind: "unverified" },
      commercialSafety: {
        baseModelCompliance: "permissive",
        indemnified: true,
        subscriptionTier: "Creator Verified",
        subscriptionVerified: true,
        copyrightedIpScan: "clean",
        usageRightsNotes: `Directly imported from official ${imported.platform.toUpperCase()} player with creator consent and attribution.`,
      },
      isPublished: true,
      isFeatured: false,
      isImported: true,
      sourceUrl: imported.sourceUrl,
      platform: imported.platform,
      embedUrl: imported.embedUrl,
      attribution: imported.attribution,
    };

    setItems((prev) => [newItem, ...prev]);
    setNotification(
      `Successfully imported "${imported.title}" from ${imported.platform.toUpperCase()} with full attribution.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Form state for creating or editing an item
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDeliverableType, setFormDeliverableType] = useState<DeliverableType>("commercial_spot");
  const [formAspectRatio, setFormAspectRatio] = useState<AspectRatio>("16:9");
  const [formResolution, setFormResolution] = useState<Resolution>("4K");
  const [formDurationSec, setFormDurationSec] = useState<number>(15);
  const [formFrameRate, setFormFrameRate] = useState("24 fps");
  const [formGenerationMethod, setFormGenerationMethod] = useState("ComfyUI Node Graph + ControlNet");
  const [formStyleTags, setFormStyleTags] = useState<string>("Cinematic, Hyper-realistic, Cyberpunk, 35mm");
  const [formSelectedTools, setFormSelectedTools] = useState<string[]>(["flux-1-dev", "comfyui-core", "topaz-video-ai"]);
  const [formMedia, setFormMedia] = useState<UploadedMedia | null>({
    fileName: "tokyo_night_cinematic.mp4",
    fileSize: "48.2 MB",
    mediaType: "video",
    mediaUrl: "/media/cyberpunk-tokyo.mp4",
    aspectRatio: "16:9",
    posterGradient: ["#181824", "#302B63", "#24243E"],
  });

  // Licensing state
  const [formCommercialAllowed, setFormCommercialAllowed] = useState(true);
  const [formLicenseType, setFormLicenseType] = useState("Full Commercial Buyout (Perpetual Global)");
  const [formOutputOwnership, setFormOutputOwnership] = useState("Client 100% IP Assignment");
  const [formModelLicenseNotes, setFormModelLicenseNotes] = useState(
    "Apache 2.0 / Commercial Enterprise tier with verified training disclosure."
  );
  const [formTrainingDisclosure, setFormTrainingDisclosure] = useState(
    "Verified clean datasets; zero copyrighted character likenesses in training corpus."
  );
  const [formHumanInLoop, setFormHumanInLoop] = useState(
    "Prompt engineering, latent mask interpolation, and Davinci Resolve manual color grade."
  );
  const [formIndemnified, setFormIndemnified] = useState(true);
  const [formIndemnityProvider, setFormIndemnityProvider] = useState("Runway Enterprise Indemnity");
  const [formCompliance, setFormCompliance] = useState<"permissive" | "licensed_dataset" | "unknown" | "restricted">("permissive");

  // Workflow pipeline stages
  const [formStages, setFormStages] = useState<PipelineStage[]>([
    {
      id: "stage-1",
      order: 0,
      label: "Character Concept Latent Synthesis",
      toolId: "flux-1-dev",
      modelVersion: "dev-fp8",
      checkpointHash: "7b4c92e10fa3",
      loras: [{ name: "cyberpunk-lighting-v1", weight: 0.85 }],
      controlNets: [{ type: "depth", strength: 0.7 }],
      prompt: "Cinematic close-up of neon cybernetic protagonist, rain soaked streets of Neo Tokyo",
      negativePrompt: "blurry, low quality, artifacts, watermark",
      seed: 84920412,
      sampler: "Euler a",
      steps: 30,
      cfg: 7.0,
      inputStageIds: [],
      durationSec: 14,
      costUsd: 0.18,
      outputPreview: {
        gradient: ["#181824", "#302B63"],
        caption: "Latent character seed",
      },
    },
    {
      id: "stage-2",
      order: 1,
      label: "Temporal Motion & Camera Trajectory",
      toolId: "runway-gen3",
      modelVersion: "gen-3-alpha",
      loras: [],
      controlNets: [],
      prompt: "Smooth dolly-in camera motion, neon reflections pulsing on wet asphalt",
      negativePrompt: "jerky motion, frame drop, warping",
      seed: null,
      inputStageIds: ["stage-1"],
      durationSec: 45,
      costUsd: 1.25,
      outputPreview: {
        gradient: ["#302B63", "#24243E"],
        caption: "Motion sequence rendered",
      },
    },
    {
      id: "stage-3",
      order: 2,
      label: "4K Temporal Upscale & Grain Mastering",
      toolId: "topaz-video-ai",
      modelVersion: "v5.1",
      loras: [],
      controlNets: [],
      prompt: "ProRes 422HQ mastering, 4K spatial reconstruction, 35mm film grain retention",
      negativePrompt: "over-sharpening, plastic skin, ringing",
      seed: null,
      inputStageIds: ["stage-2"],
      durationSec: 60,
      costUsd: 0.5,
      outputPreview: {
        gradient: ["#24243E", "#181824"],
        caption: "Mastered 4K delivery",
      },
    },
  ]);

  // Compute profile strength dynamically
  const publishedCount = items.filter((i) => i.isPublished).length;
  const hasFeatured = items.some((i) => i.isFeatured);
  const allCommercialClean = items.every((i) => i.commercialSafety.baseModelCompliance === "permissive");
  const allHaveGraphs = items.every((i) => i.nodeGraph !== null);
  const hasHighRes = items.some((i) => i.resolution === "4K");

  const strengthScore = useMemo(() => {
    let score = 20; // Base score
    if (publishedCount >= 3) score += 25;
    if (hasFeatured) score += 15;
    if (allCommercialClean) score += 15;
    if (allHaveGraphs) score += 15;
    if (hasHighRes) score += 10;
    return Math.min(100, score);
  }, [publishedCount, hasFeatured, allCommercialClean, allHaveGraphs, hasHighRes]);

  const suggestions = useMemo(
    () => [
      {
        id: "publish-min-3",
        label: "Publish at least 3 verified AI deliverables",
        points: 25,
        completed: publishedCount >= 3,
        actionText: "Publish More",
      },
      {
        id: "feature-case-study",
        label: "Set 1 item as Featured Long-form Case Study",
        points: 15,
        completed: hasFeatured,
        actionText: "Select Feature",
      },
      {
        id: "verify-commercial",
        label: "Clear commercial license & indemnity on all outputs",
        points: 15,
        completed: allCommercialClean,
        actionText: "Review Rights",
      },
      {
        id: "attach-dag-graph",
        label: "Provide downloadable ComfyUI DAG node graph",
        points: 15,
        completed: allHaveGraphs,
        actionText: "Upload JSON",
      },
    ],
    [publishedCount, hasFeatured, allCommercialClean, allHaveGraphs]
  );

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Reordering handlers
  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    const item = updated[index];
    const targetItem = updated[targetIndex];
    if (!item || !targetItem) return;

    updated[index] = targetItem;
    updated[targetIndex] = item;
    setItems(updated);
    showToast("Portfolio order updated.");
  };

  const handleToggleFeatured = (id: string) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isFeatured: item.id === id ? !item.isFeatured : false, // Exclusive featured item
      }))
    );
    showToast("Featured case study updated.");
  };

  const handleTogglePublished = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPublished: !item.isPublished } : item))
    );
    showToast("Publish status updated.");
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
      setIsEditingNew(false);
    }
    showToast("Portfolio item deleted.");
  };

  const handleStartEdit = (item: ExtendedItem) => {
    setSelectedItemId(item.id);
    setIsEditingNew(true);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormDeliverableType(item.deliverableType);
    setFormAspectRatio(item.aspectRatio);
    setFormResolution(item.resolution);
    setFormDurationSec(item.durationSec ?? 15);
    setFormFrameRate(item.frameRate ?? "24 fps");
    setFormGenerationMethod(item.generationMethod ?? "ComfyUI Node Graph + ControlNet");
    setFormStyleTags(item.styleTags.join(", "));
    setFormSelectedTools(item.toolchain);
    setFormMedia({
      fileName: `${item.id}-deliverable.mp4`,
      fileSize: "52.4 MB",
      mediaType: item.mediaType === "3d" ? "image" : item.mediaType,
      mediaUrl: item.mediaUrl,
      aspectRatio: item.aspectRatio,
      posterGradient: item.posterGradient,
    });
    setFormCommercialAllowed(true);
    setFormLicenseType(item.licenseType ?? "Full Commercial Buyout (Perpetual Global)");
    setFormOutputOwnership(item.outputOwnership ?? "Client 100% IP Assignment");
    setFormModelLicenseNotes(
      item.modelLicenseNotes ?? "Commercial SaaS & permissive open models with clean IP pedigree."
    );
    setFormTrainingDisclosure(
      item.trainingDataDisclosure ?? "Synthetic LoRA and licensed stock references."
    );
    setFormHumanInLoop(
      item.humanInTheLoopNotes ?? "Lead director directed latents and final compositing."
    );
    setFormIndemnified(item.commercialSafety.indemnified);
    setFormIndemnityProvider(item.commercialSafety.indemnityProvider ?? "Runway Enterprise Indemnity");
    setFormCompliance(item.commercialSafety.baseModelCompliance);
    setFormStages(item.pipeline);
  };

  const handleStartNew = () => {
    setSelectedItemId(null);
    setIsEditingNew(true);
    setFormTitle("New Cybernetic Showcase 4K");
    setFormDescription("Commercial spot featuring consistent photorealistic character across complex lighting environments.");
    setFormDeliverableType("commercial_spot");
    setFormAspectRatio("16:9");
    setFormResolution("4K");
    setFormDurationSec(15);
    setFormFrameRate("24 fps");
    setFormGenerationMethod("ComfyUI Node Graph + ControlNet");
    setFormStyleTags("Cinematic, Hyper-realistic, 35mm, Volumetric");
    setFormSelectedTools(["flux-1-dev", "comfyui-core", "runway-gen3"]);
    setFormMedia({
      fileName: "new_spot_4k.mp4",
      fileSize: "64.0 MB",
      mediaType: "video",
      mediaUrl: "/media/cyberpunk-tokyo.mp4",
      aspectRatio: "16:9",
      posterGradient: ["#141E30", "#243B55", "#0F2027"],
    });
    setFormCommercialAllowed(true);
    setFormLicenseType("Full Commercial Buyout (Perpetual Global)");
    setFormOutputOwnership("Client 100% IP Assignment");
    setFormModelLicenseNotes("Full enterprise SLA with model IP clearance.");
    setFormTrainingDisclosure("Trained strictly on private licensed studio datasets.");
    setFormHumanInLoop("Full artistic supervision with node-level seed reproducibility.");
    setFormIndemnified(true);
    setFormIndemnityProvider("Enterprise Legal Indemnity Guarantee");
    setFormCompliance("permissive");
  };

  const handleSaveForm = (publishImmediately: boolean) => {
    if (!formTitle.trim()) {
      alert("Please provide a title for the portfolio item.");
      return;
    }

    const tagsArray = formStyleTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newItem: ExtendedItem = {
      id: selectedItemId ?? `item-${Date.now().toString(36)}`,
      creatorId: creator.id,
      title: formTitle,
      description: formDescription,
      mediaType: formMedia?.mediaType ?? "video",
      mediaUrl: formMedia?.mediaUrl ?? "/media/cyberpunk-tokyo.mp4",
      posterGradient: formMedia?.posterGradient ?? ["#181824", "#302B63", "#24243E"],
      aspectRatio: formAspectRatio,
      resolution: formResolution,
      durationSec: formDurationSec,
      deliverableType: formDeliverableType,
      styleTags: tagsArray.length > 0 ? tagsArray : ["Cinematic", "AI Native"],
      toolchain: formSelectedTools,
      pipeline: formStages,
      nodeGraph: {
        nodes: [
          { id: "node-1", type: "checkpointLoader", label: "FLUX.1 [dev]", x: 50, y: 100 },
          { id: "node-2", type: "loraStack", label: "Character LoRA", x: 260, y: 100 },
          { id: "node-3", type: "sampler", label: "KSampler Advanced", x: 480, y: 100 },
          { id: "node-4", type: "upscaler", label: "Topaz 4K Upscale", x: 700, y: 100 },
        ],
        edges: [
          { from: "node-1", to: "node-2" },
          { from: "node-2", to: "node-3" },
          { from: "node-3", to: "node-4" },
        ],
        downloadable: true,
        workflowJsonFilename: "comfy_flux_production_pipeline.json",
      },
      reproducibility: {
        kind: "verified_deterministic",
        verifiedAt: new Date().toISOString(),
        rerunMatchScore: 0.994,
      },
      commercialSafety: {
        baseModelCompliance: formCompliance,
        indemnified: formIndemnified,
        indemnityProvider: formIndemnified ? formIndemnityProvider : undefined,
        subscriptionTier: "Enterprise Production Tier",
        subscriptionVerified: true,
        copyrightedIpScan: "clean",
        usageRightsNotes: formModelLicenseNotes,
      },
      clientOutcome: "Delivered on schedule with 100% brand legal clearance and zero revisions required.",
      isPublished: publishImmediately,
      isFeatured: items.length === 0,
      frameRate: formFrameRate,
      generationMethod: formGenerationMethod,
      licenseType: formLicenseType,
      outputOwnership: formOutputOwnership,
      modelLicenseNotes: formModelLicenseNotes,
      trainingDataDisclosure: formTrainingDisclosure,
      humanInTheLoopNotes: formHumanInLoop,
    };

    if (selectedItemId) {
      setItems((prev) => prev.map((item) => (item.id === selectedItemId ? newItem : item)));
      showToast(`Updated "${newItem.title}" successfully.`);
    } else {
      setItems((prev) => [newItem, ...prev]);
      showToast(`Created & ${publishImmediately ? "published" : "drafted"} "${newItem.title}".`);
    }

    setIsEditingNew(false);
    setSelectedItemId(null);
  };

  return (
    <div className="min-h-screen bg-background text-content-primary py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-surface border border-accent/40 text-content-primary text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-content-muted">
              <Link href="/" className="hover:text-content-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Creator Studio</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-light text-content-primary tracking-tight">
                AI Portfolio &amp; Provenance Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono">
                Live Studio
              </span>
            </div>
            <p className="text-xs text-content-muted">
              Manage your verified deliverables, ComfyUI DAG pipelines, and commercial clearance disclosures.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/creators/${creator.handle}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-xs text-content-muted hover:text-content-primary hover:border-surface-border-strong transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview Public Profile</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-accent/40 text-accent text-xs font-medium hover:bg-accent/10 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Import (YouTube / Web)</span>
            </button>

            <button
              type="button"
              onClick={handleStartNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add AI Deliverable</span>
            </button>
          </div>
        </div>

        {/* Profile Strength Meter */}
        <ProfileStrengthMeter
          score={strengthScore}
          suggestions={suggestions}
          onActionClick={(id) => {
            if (id === "publish-min-3" || id === "feature-case-study") {
              // Focus on items list
              const el = document.getElementById("portfolio-items-list");
              el?.scrollIntoView({ behavior: "smooth" });
            } else {
              handleStartNew();
            }
          }}
        />

        {/* Main Content: Form Editor or Items Manager */}
        {isEditingNew ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-surface-border shadow-card space-y-8 animate-in fade-in">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingNew(false)}
                  className="p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-subtle transition-colors"
                  title="Back to portfolio items"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-base font-semibold text-content-primary">
                    {selectedItemId ? "Edit AI Portfolio Item" : "Create Verified AI Deliverable"}
                  </h2>
                  <p className="text-xs text-content-muted">
                    Equip your work with complete machine provenance and commercial clearance for enterprise buyers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveForm(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-primary hover:bg-surface-border/50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Publish to Profile</span>
                </button>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-content-primary uppercase tracking-wider block font-sans">
                Master Deliverable File &amp; Canvas Poster
              </label>
              <DragDropUploader
                media={formMedia}
                onMediaChange={setFormMedia}
                defaultAspectRatio={formAspectRatio}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-content-muted block font-medium">Deliverable Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Cybernetic Tokyo 2088 — Spec Commercial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-content-muted block font-medium">Deliverable Type</label>
                <select
                  value={formDeliverableType}
                  onChange={(e) => setFormDeliverableType(e.target.value as DeliverableType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent capitalize"
                >
                  {DELIVERABLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-content-muted block font-medium">Description &amp; Creative Synopsis</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the production challenge, creative intent, and client outcome..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
              />
            </div>

            {/* Technical Specs Panel */}
            <div className="p-5 rounded-2xl bg-surface-subtle/60 border border-surface-border space-y-4">
              <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider font-sans flex items-center gap-2">
                <Film className="h-4 w-4 text-accent" />
                <span>Technical Specifications</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-[11px] text-content-muted block mb-1">Aspect Ratio</label>
                  <select
                    value={formAspectRatio}
                    onChange={(e) => setFormAspectRatio(e.target.value as AspectRatio)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs font-mono"
                  >
                    {ASPECT_RATIOS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-content-muted block mb-1">Resolution</label>
                  <select
                    value={formResolution}
                    onChange={(e) => setFormResolution(e.target.value as Resolution)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs font-mono"
                  >
                    {RESOLUTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-content-muted block mb-1">Duration (Sec)</label>
                  <input
                    type="number"
                    value={formDurationSec}
                    onChange={(e) => setFormDurationSec(parseInt(e.target.value, 10) || 15)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-content-muted block mb-1">Frame Rate</label>
                  <input
                    type="text"
                    value={formFrameRate}
                    onChange={(e) => setFormFrameRate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] text-content-muted block mb-1">Method</label>
                  <input
                    type="text"
                    value={formGenerationMethod}
                    onChange={(e) => setFormGenerationMethod(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Tools & Models Catalog */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-content-primary uppercase tracking-wider block font-sans">
                  Tools &amp; Models Used ({formSelectedTools.length} Selected)
                </label>
                <p className="text-[11px] text-content-muted">
                  Select the underlying engines and tools used in this piece&apos;s production stack.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TOOLS.map((tool) => {
                  const isChecked = formSelectedTools.includes(tool.id);
                  return (
                    <button
                      type="button"
                      key={tool.id}
                      onClick={() => {
                        if (isChecked) {
                          setFormSelectedTools((prev) => prev.filter((id) => id !== tool.id));
                        } else {
                          setFormSelectedTools((prev) => [...prev, tool.id]);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs transition-colors flex items-center justify-between ${
                        isChecked
                          ? "bg-accent/10 border-accent/40 text-content-primary"
                          : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-strong"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-semibold block truncate">{tool.name}</span>
                        <span className="text-[10px] text-content-faint">{tool.vendor}</span>
                      </div>
                      {isChecked && <CheckCircle2 className="h-4 w-4 text-accent shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workflow Step Builder */}
            <WorkflowStepBuilder stages={formStages} onChange={setFormStages} />

            {/* Commercial Clearance & Licensing Fields */}
            <div className="p-6 rounded-3xl bg-surface-subtle border border-surface-border space-y-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider font-sans">
                  Commercial Clearance &amp; Licensing Disclosures
                </h3>
              </div>
              <p className="text-xs text-content-muted">
                Enterprise legal teams require explicit terms on model pedigree, indemnity, and human supervision.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-content-muted block font-medium">License Type</label>
                  <input
                    type="text"
                    value={formLicenseType}
                    onChange={(e) => setFormLicenseType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-content-muted block font-medium">Output Ownership</label>
                  <input
                    type="text"
                    value={formOutputOwnership}
                    onChange={(e) => setFormOutputOwnership(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-content-muted block font-medium">Base Model Compliance</label>
                  <select
                    value={formCompliance}
                    onChange={(e) => setFormCompliance(e.target.value as "permissive" | "licensed_dataset" | "unknown" | "restricted")}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs capitalize"
                  >
                    <option value="permissive">Permissive (Open Source / Commercial)</option>
                    <option value="licensed_dataset">Licensed Dataset Trained</option>
                    <option value="unknown">Unknown Pedigree</option>
                    <option value="restricted">Restricted Non-Commercial</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-content-muted block font-medium">Legal Indemnity Guarantee</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIndemnified(!formIndemnified)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                        formIndemnified
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : "bg-surface border-surface-border text-content-muted"
                      }`}
                    >
                      {formIndemnified ? "Active Indemnity" : "No Indemnity"}
                    </button>
                    {formIndemnified && (
                      <input
                        type="text"
                        value={formIndemnityProvider}
                        onChange={(e) => setFormIndemnityProvider(e.target.value)}
                        placeholder="Provider"
                        className="flex-1 px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-content-muted block font-medium">Model License Notes</label>
                  <textarea
                    rows={2}
                    value={formModelLicenseNotes}
                    onChange={(e) => setFormModelLicenseNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-content-muted block font-medium">Training Data Disclosure</label>
                  <textarea
                    rows={2}
                    value={formTrainingDisclosure}
                    onChange={(e) => setFormTrainingDisclosure(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-content-muted block font-medium">Human-in-the-Loop Supervision Notes</label>
                  <textarea
                    rows={2}
                    value={formHumanInLoop}
                    onChange={(e) => setFormHumanInLoop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-content-primary text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Style Tags */}
            <div className="space-y-1.5">
              <label className="text-xs text-content-muted block font-medium">Style Tags (Comma separated)</label>
              <div className="relative">
                <Tag className="h-3.5 w-3.5 absolute left-3 top-3 text-content-faint" />
                <input
                  type="text"
                  value={formStyleTags}
                  onChange={(e) => setFormStyleTags(e.target.value)}
                  placeholder="e.g. Cinematic, Photorealistic, Cyberpunk, 35mm"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setIsEditingNew(false)}
                className="px-4 py-2.5 rounded-xl text-xs text-content-muted hover:text-content-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-xs text-content-primary hover:bg-surface-border/50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" />
                <span>Publish to Public Profile</span>
              </button>
            </div>
          </div>
        ) : (
          /* Portfolio Items Manager */
          <div id="portfolio-items-list" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-content-primary uppercase tracking-wider font-sans">
                  Published &amp; Draft Works ({items.length})
                </h2>
                <p className="text-xs text-content-muted">
                  Drag or use arrows to reorder. Toggle featured item to highlight as the long-form case study.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-content-primary hover:border-surface-border-strong transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Item</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-12 rounded-3xl border border-dashed border-surface-border bg-surface text-center space-y-3">
                <Layers className="h-10 w-10 text-content-faint mx-auto" />
                <p className="text-sm text-content-muted">No items in your portfolio yet.</p>
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-medium"
                >
                  Create First Item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-3xl border transition-all bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                      item.isFeatured
                        ? "border-accent/40 ring-1 ring-accent/20"
                        : "border-surface-border hover:border-surface-border-strong"
                    }`}
                  >
                    {/* Item Thumbnail & Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Media Thumbnail */}
                      <div
                        className="h-16 w-24 rounded-2xl shrink-0 overflow-hidden relative border border-surface-border flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]}, ${item.posterGradient[2]})`,
                        }}
                      >
                        {item.mediaUrl && item.mediaType === "video" ? (
                          <video
                            src={item.mediaUrl}
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-80"
                          />
                        ) : null}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.5 rounded bg-black/70 text-white/80">
                          {item.aspectRatio}
                        </span>
                      </div>

                      {/* Text info */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs font-semibold text-content-primary truncate max-w-xs">
                            {item.title}
                          </h3>

                          {item.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent/15 text-accent border border-accent/25 flex items-center gap-1 font-medium">
                              <Star className="h-2.5 w-2.5 fill-accent" />
                              Featured Case Study
                            </span>
                          )}

                          {item.isPublished ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              Live
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25">
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-content-muted line-clamp-1">{item.description}</p>

                        <div className="flex items-center gap-2 text-[10px] text-content-faint font-mono">
                          <span>{item.toolchain.length} Tools</span>
                          <span>•</span>
                          <span>{item.pipeline.length} DAG Nodes</span>
                          <span>•</span>
                          <span className="text-emerald-400">100% Commercial Cleared</span>
                        </div>
                      </div>
                    </div>

                    {/* Controls & Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Reorder Buttons */}
                      <div className="flex items-center border border-surface-border rounded-xl overflow-hidden bg-surface-subtle">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveItem(idx, "up")}
                          className="p-1.5 text-content-muted hover:text-content-primary disabled:opacity-25"
                          title="Move Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => handleMoveItem(idx, "down")}
                          className="p-1.5 text-content-muted hover:text-content-primary disabled:opacity-25"
                          title="Move Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Feature Case Study Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item.id)}
                        className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                          item.isFeatured
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
                        }`}
                        title="Toggle Featured Case Study"
                      >
                        <Star className={`h-3.5 w-3.5 ${item.isFeatured ? "fill-accent" : ""}`} />
                        <span className="hidden md:inline text-[11px]">Feature</span>
                      </button>

                      {/* Publish / Draft Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(item.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-surface-border bg-surface-subtle text-[11px] text-content-muted hover:text-content-primary transition-colors"
                      >
                        {item.isPublished ? "Unpublish" : "Publish"}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-2 rounded-xl bg-surface-subtle border border-surface-border text-content-muted hover:text-accent hover:border-accent/40 transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-xl bg-surface-subtle border border-surface-border text-content-muted hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ImportMediaModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        creatorId={creator.id}
        creatorHandle={creator.handle}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
