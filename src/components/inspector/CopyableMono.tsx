"use client";

import React, { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";

interface CopyableMonoProps {
  readonly text: string;
  readonly label?: string;
  readonly clampLines?: number;
  readonly className?: string;
}

export function CopyableMono({
  text,
  label,
  clampLines,
  className = "",
}: CopyableMonoProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLong = clampLines && text.length > 120;

  return (
    <div className={`group relative rounded-xl border border-surface-border bg-surface-subtle p-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between pb-1.5 text-[10px] text-content-muted">
          <span>{label}</span>
          {copied && (
            <span className="text-verified font-medium">
              Copied
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <p
          className={`font-mono text-xs text-content-primary leading-relaxed break-all select-all ${
            isLong && !expanded ? "line-clamp-2" : ""
          }`}
        >
          {text}
        </p>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy prompt to clipboard"
          className="shrink-0 p-1 rounded-md text-content-muted hover:text-content-primary hover:bg-surface transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-verified" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-[10px] text-content-muted hover:text-content-primary transition-colors"
        >
          <span>{expanded ? "Show less" : "Expand full prompt"}</span>
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
