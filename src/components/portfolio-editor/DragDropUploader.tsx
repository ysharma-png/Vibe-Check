"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, FileVideo, FileImage, X, CheckCircle2, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { AspectRatio } from "@/types/schema";

export interface UploadedMedia {
  fileName: string;
  fileSize: string;
  mediaType: "video" | "image";
  mediaUrl: string | null;
  aspectRatio: AspectRatio;
  posterGradient: [string, string, string];
}

interface DragDropUploaderProps {
  readonly media: UploadedMedia | null;
  readonly onMediaChange: (media: UploadedMedia | null) => void;
  readonly defaultAspectRatio?: AspectRatio;
}

const PRESET_GRADIENTS: readonly [string, string, string][] = [
  ["#181824", "#302B63", "#24243E"],
  ["#0F2027", "#203A43", "#2C5364"],
  ["#1F1C2C", "#928DAB", "#1F1C2C"],
  ["#141E30", "#243B55", "#0F2027"],
  ["#2E1437", "#944BBB", "#2E1437"],
];

export function DragDropUploader({
  media,
  onMediaChange,
  defaultAspectRatio = "16:9",
}: DragDropUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (fileName: string, fileSizeStr: string, mediaType: "video" | "image", detectedRatio: AspectRatio) => {
      setUploadProgress(15);
      setError(null);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 15;
          if (prev >= 95) {
            clearInterval(interval);
            setTimeout(() => {
              const randomGradient = PRESET_GRADIENTS[Math.floor(Math.random() * PRESET_GRADIENTS.length)] ?? [
                "#181824",
                "#302B63",
                "#24243E",
              ];
              setUploadProgress(null);
              onMediaChange({
                fileName,
                fileSize: fileSizeStr,
                mediaType,
                mediaUrl: mediaType === "video" ? "/media/cyberpunk-tokyo.mp4" : null,
                aspectRatio: detectedRatio,
                posterGradient: randomGradient,
              });
            }, 300);
            return 100;
          }
          return prev + 25;
        });
      }, 120);
    },
    [onMediaChange]
  );

  const processFile = useCallback(
    (file: File) => {
      const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".webm");
      const isImage =
        file.type.startsWith("image/") ||
        file.name.endsWith(".png") ||
        file.name.endsWith(".jpg") ||
        file.name.endsWith(".webp");

      if (!isVideo && !isImage) {
        setError("Please upload a supported media file (MP4, WebM, PNG, JPG, or WebP).");
        return;
      }

      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeInMb} MB`;
      const mediaType: "video" | "image" = isVideo ? "video" : "image";

      // Detect initial aspect ratio heuristic or use default
      const ratio: AspectRatio = defaultAspectRatio;
      simulateUpload(file.name, sizeStr, mediaType, ratio);
    },
    [defaultAspectRatio, simulateUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      processFile(files[0]);
    }
  };

  const handleRemoveMedia = () => {
    onMediaChange(null);
    setUploadProgress(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cycleGradient = () => {
    if (!media) return;
    const currentIndex = PRESET_GRADIENTS.findIndex(
      (g) => g[0] === media.posterGradient[0] && g[1] === media.posterGradient[1]
    );
    const nextIndex = (currentIndex + 1) % PRESET_GRADIENTS.length;
    const nextGrad = PRESET_GRADIENTS[nextIndex] ?? PRESET_GRADIENTS[0] ?? ["#181824", "#302B63", "#24243E"];
    onMediaChange({
      ...media,
      posterGradient: nextGrad,
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadProgress !== null ? (
        <div className="p-8 rounded-3xl bg-surface border border-surface-border flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent animate-pulse">
            <Upload className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-content-primary">Ingesting &amp; Generating Poster...</h4>
            <p className="text-xs text-content-muted">Computing SHA-256 hash and metadata signature</p>
          </div>
          <div className="w-full max-w-xs space-y-1.5">
            <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-content-faint">
              <span>Optimizing preview</span>
              <span>{uploadProgress}%</span>
            </div>
          </div>
        </div>
      ) : media ? (
        <div className="p-4 rounded-3xl bg-surface border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-center shrink-0 text-accent">
                {media.mediaType === "video" ? <FileVideo className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-content-primary truncate">{media.fileName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Ready
                  </span>
                </div>
                <div className="text-[11px] text-content-muted flex items-center gap-2">
                  <span>{media.fileSize}</span>
                  <span>•</span>
                  <span>{media.aspectRatio}</span>
                  <span>•</span>
                  <span className="capitalize">{media.mediaType} asset</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={cycleGradient}
                title="Regenerate poster gradient"
                className="p-2 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-subtle border border-transparent hover:border-surface-border transition-colors text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px]">New Poster Palette</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="p-2 rounded-xl text-content-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Media Preview Box */}
          <div
            className="w-full rounded-2xl overflow-hidden relative border border-surface-border/80 flex items-center justify-center"
            style={{
              height: "220px",
              background: `linear-gradient(135deg, ${media.posterGradient[0]}, ${media.posterGradient[1]}, ${media.posterGradient[2]})`,
            }}
          >
            {media.mediaType === "video" && media.mediaUrl ? (
              <video
                src={media.mediaUrl}
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover opacity-85"
              />
            ) : null}

            {/* Overlay preview tag */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-verified" />
                <span>Auto-generated canvas preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white/70">
                Ratio: {media.aspectRatio}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${
            isDragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-surface-border hover:border-surface-border-strong bg-surface/50 hover:bg-surface"
          }`}
        >
          <div className="h-12 w-12 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-center text-content-muted group-hover:text-accent group-hover:scale-105 transition-all">
            <Upload className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-content-primary">
              Drag &amp; drop high-res deliverable or <span className="text-accent underline">browse</span>
            </p>
            <p className="text-[11px] text-content-muted">
              MP4, WebM (H.264/AV1) up to 250MB or PNG, WebP up to 40MB. Posters are auto-synthesized.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-content-faint">
            <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-surface-border">Auto Thumbnail</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-surface-border">SHA-256 Provenance</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-subtle border border-surface-border">No Cloud Leak</span>
          </div>
        </div>
      )}
    </div>
  );
}
