"use client";

import React, { useState } from "react";
import { FolderPlus, Check, X, Bookmark, Plus } from "lucide-react";
import { getUserBoards, createBoard, saveItemToBoard, UserBoard } from "@/lib/engagement/store";

interface SaveToBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    itemType: "portfolio_item" | "creator" | "brief";
    itemId: string;
    title: string;
    subtitle: string;
    gradient: readonly string[];
  };
}

export function SaveToBoardModal({ isOpen, onClose, item }: SaveToBoardModalProps) {
  const [boards, setBoards] = useState<UserBoard[]>(() => getUserBoards());
  const [savedBoardIds, setSavedBoardIds] = useState<Set<string>>(() => {
    const existing = new Set<string>();
    for (const b of getUserBoards()) {
      if (b.items.some((i) => i.itemId === item.itemId)) {
        existing.add(b.id);
      }
    }
    return existing;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  if (!isOpen) return null;

  const handleSaveToBoard = (boardId: string) => {
    saveItemToBoard(boardId, item);
    setSavedBoardIds((prev) => new Set([...prev, boardId]));
    setBoards(getUserBoards());
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createBoard(newTitle.trim(), newDesc.trim(), true);
    saveItemToBoard(created.id, item);
    setSavedBoardIds((prev) => new Set([...prev, created.id]));
    setBoards(getUserBoards());
    setIsCreating(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface-elevated p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-content-primary">Save to Board</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/70 border border-surface-border/60">
          <div
            className="w-12 h-12 rounded-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${item.gradient[0] || "#1e1b4b"}, ${item.gradient[1] || "#065f46"})`,
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-content-primary truncate">{item.title}</div>
            <div className="text-[11px] text-content-muted truncate">{item.subtitle}</div>
          </div>
        </div>

        {/* Boards List */}
        {!isCreating ? (
          <div className="space-y-3">
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {boards.map((b) => {
                const isSaved = savedBoardIds.has(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSaveToBoard(b.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-surface-border/60 hover:bg-surface hover:border-accent/40 transition-all text-left"
                  >
                    <div>
                      <div className="text-xs font-semibold text-content-primary">{b.title}</div>
                      <div className="text-[11px] text-content-muted">
                        {b.itemCount} item{b.itemCount === 1 ? "" : "s"} • {b.isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    {isSaved ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <Check className="h-3 w-3" />
                        Saved
                      </span>
                    ) : (
                      <span className="text-xs text-accent font-semibold px-2 py-1 rounded-lg hover:bg-accent/10">
                        Save
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-surface-border hover:border-accent/60 text-xs font-medium text-content-muted hover:text-content-primary transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Board</span>
            </button>
          </div>
        ) : (
          /* Create Board Form */
          <form onSubmit={handleCreateBoard} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-content-muted mb-1">Board Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Footwear Commercial Renders"
                className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-content-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-content-muted mb-1">Description (Optional)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Notes or campaign reference"
                className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-content-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 rounded-xl border border-surface-border text-xs text-content-muted hover:text-content-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
              >
                Create & Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
