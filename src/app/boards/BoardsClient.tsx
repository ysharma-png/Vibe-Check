"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Plus,
  Share2,
  Lock,
  Globe,
  ExternalLink,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { getUserBoards, createBoard, UserBoard } from "@/lib/engagement/store";
import { EmptyState } from "@/components/common/EmptyState";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { MagneticButton } from "@/components/common/MagneticButton";
import Image from "next/image";

export function BoardsClient() {
  const [boards, setBoards] = useState<UserBoard[]>(() => getUserBoards());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createBoard(newTitle.trim(), newDesc.trim(), isPublic);
    setBoards(getUserBoards());
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      {/* Header */}
      <GlassSurface
        tier="chrome"
        rounded="0"
        className="border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="h-4 w-4 text-accent" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                Collections & Moodboards
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-medium tracking-tight text-white">
              Saved Boards
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 font-light max-w-xl">
              Curate generative talent, verified ComfyUI workflows, and campaigns into shareable decks.
            </p>
          </div>

          <div onClick={() => setShowCreateModal(true)}>
            <MagneticButton variant="primary" size="md">
              <Plus className="h-4 w-4" />
              <span>New Board</span>
            </MagneticButton>
          </div>
        </div>
      </GlassSurface>

      {/* Boards Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((b) => (
              <GlassSurface
                key={b.id}
                tier="regular"
                rounded="32"
                className="group border border-white/10 p-6 hover:border-white/25 transition-all shadow-xl flex flex-col justify-between space-y-4 hover:shadow-glow-lime/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium">
                      {b.isPublic ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Globe className="h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-white/40">
                          <Lock className="h-3 w-3" /> Private
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(`${window.location.origin}/boards/${b.id}`);
                          alert("Board share link copied to clipboard!");
                        }
                      }}
                      className="p-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/60 hover:text-white transition-colors"
                      title="Share link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-display font-medium text-white group-hover:text-accent transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed font-light">
                      {b.description || "No description provided."}
                    </p>
                  </div>

                  {/* Items preview stack */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {b.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-2xl overflow-hidden p-2 flex flex-col justify-end border border-white/10 bg-black/40"
                      >
                        <Image
                          src={`/assets/thumbnails/thumb-${(((idx % 24) + 1)).toString().padStart(3, "0")}.svg`}
                          alt={item.title}
                          fill
                          sizes="100px"
                          className="object-cover opacity-90"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <span className="relative z-10 text-[9px] font-mono font-semibold text-white truncate drop-shadow">
                          {item.title}
                        </span>
                      </div>
                    ))}
                    {b.items.length === 0 && (
                      <div className="col-span-3 py-6 text-center text-xs font-mono text-white/40 border border-dashed border-white/10 rounded-2xl">
                        Empty board. Save items from Showcase or Feeds.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/40 font-medium">
                    {b.itemCount} saved item{b.itemCount === 1 ? "" : "s"}
                  </span>
                  <Link
                    href={`/boards/${b.id}`}
                    className="font-medium text-accent hover:underline flex items-center gap-1"
                  >
                    <span>Open Collection</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </GlassSurface>
            ))}
          </div>
        ) : (
          <EmptyState
            illustration="briefs"
            title="No moodboards created yet"
            description="Curate generative talent, verified ComfyUI workflows, and campaigns into shareable decks."
            primaryAction={{
              label: "Create Your First Board",
              onClick: () => setShowCreateModal(true),
            }}
            secondaryAction={{
              label: "Explore Showcase",
              href: "/showcase",
            }}
          />
        )}
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-150">
          <GlassSurface
            tier="thick"
            rounded="32"
            className="w-full max-w-md border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <MacTrafficLights onClose={() => setShowCreateModal(false)} />
                <h3 className="text-sm font-display font-medium text-white">Create New Board</h3>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 9:16 Kinetic Sport Shorts"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-sans text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Campaign brief reference or notes"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-sans text-white focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded text-accent focus:ring-accent accent-accent"
                />
                <label htmlFor="isPublic" className="text-xs text-white/60 select-none font-light">
                  Make collection public &amp; shareable via URL
                </label>
              </div>
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-accent text-[#08090B] text-xs font-mono font-bold hover:bg-accent/90 transition-all shadow-glow-lime"
                >
                  Create
                </button>
              </div>
            </form>
          </GlassSurface>
        </div>
      )}
    </div>
  );
}
