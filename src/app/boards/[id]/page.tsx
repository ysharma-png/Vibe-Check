"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bookmark,
  Share2,
  Globe,
  Lock,
  ArrowLeft,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getUserBoards, UserBoard } from "@/lib/engagement/store";

export default function SingleBoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [boards, setBoards] = useState<UserBoard[]>(() => getUserBoards());
  const board = boards.find((b) => b.id === boardId) || boards[0];

  if (!board) {
    return (
      <div className="min-h-screen bg-background text-content-primary p-12 text-center space-y-4">
        <h2 className="text-lg font-bold">Board not found</h2>
        <Link href="/boards" className="text-accent underline text-xs">
          Return to Boards
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-content-primary pb-20">
      {/* Top Banner */}
      <div className="border-b border-surface-border bg-surface-elevated/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
          <Link
            href="/boards"
            className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Boards</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-content-muted uppercase">Collection</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {board.isPublic ? "Public Deck" : "Private"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">{board.title}</h1>
              <p className="text-xs sm:text-sm text-content-secondary mt-1">{board.description}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Shareable link copied to clipboard!");
                }
              }}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-content-primary">
            Saved Items ({board.items.length})
          </h2>
        </div>

        {board.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-surface-border p-12 text-center text-xs text-content-muted">
            No items in this collection yet. Browse the Showcase or Feeds to bookmark workflows and creators.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {board.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-surface-border bg-surface-elevated/70 p-5 space-y-3 hover:border-accent/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className="h-36 w-full rounded-xl mb-3 flex items-end p-3"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradient[0] || "#1e1b4b"}, ${item.gradient[1] || "#065f46"})`,
                    }}
                  >
                    <span className="text-[10px] font-bold bg-black/60 text-white backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 uppercase">
                      {item.itemType.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-content-primary truncate">{item.title}</h3>
                  <p className="text-xs text-content-muted truncate mt-0.5">{item.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-content-muted">Verified Provenance</span>
                  <Link
                    href={item.itemType === "creator" ? `/creators/${item.itemId}` : "/showcase"}
                    className="text-accent font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View item</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
