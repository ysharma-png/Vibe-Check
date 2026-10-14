"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  User,
  Film,
  Bookmark,
  Briefcase,
  Settings,
  Home,
  X,
  CornerDownLeft,
  Sliders,
  Palette,
  Building2,
  FileText,
  Compass,
} from "lucide-react";
import { CREATORS } from "@/data/creators";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

interface CommandItem {
  id: string;
  category: "Navigation" | "Creators" | "Engines & Tools" | "Actions";
  title: string;
  subtitle?: string;
  url?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

export function GlobalCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Keyboard Shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Reset query & selection on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Base Commands
  const baseCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: "nav-design",
        category: "Navigation",
        title: "Design Atelier & System Showcase",
        subtitle: "Liquid glass surfaces, 3D physics, tokens & contrast",
        url: "/design",
        icon: Compass,
      },
      {
        id: "nav-showcase",
        category: "Navigation",
        title: "Showcase Feed",
        subtitle: "Full-screen vertical swipe reels & video proofs",
        url: "/showcase",
        icon: Film,
      },
      {
        id: "nav-creators",
        category: "Navigation",
        title: "Talent Radar Directory",
        subtitle: "Explore 140+ verified AI filmmakers & DAG studios",
        url: "/creators",
        icon: User,
      },
      {
        id: "nav-brief-new",
        category: "Navigation",
        title: "Commission Creative Brief",
        subtitle: "AI brief assistant and technical requirements parser",
        url: "/briefs/new",
        icon: FileText,
      },
      {
        id: "nav-boards",
        category: "Navigation",
        title: "Creative Moodboards",
        subtitle: "Organize client references, seeds, & deliverables",
        url: "/boards",
        icon: Bookmark,
      },
      {
        id: "nav-home",
        category: "Navigation",
        title: "Home Intelligence Feed",
        subtitle: "Scored brief matches & trending workflows",
        url: "/home",
        icon: Home,
      },
      {
        id: "nav-creator-dash",
        category: "Navigation",
        title: "Creator Studio Dashboard",
        subtitle: "Manage LoRA proofs, proposals, and pipeline scores",
        url: "/dashboard/creator",
        icon: Palette,
      },
      {
        id: "nav-brand-dash",
        category: "Navigation",
        title: "Brand Workspace Hub",
        subtitle: "Review campaign bids, escrow payouts, and media",
        url: "/dashboard/brand",
        icon: Building2,
      },
      {
        id: "nav-settings",
        category: "Navigation",
        title: "Settings & Security",
        subtitle: "Security, quiet hours, 2FA, and export data",
        url: "/settings",
        icon: Settings,
      },

      // Popular Engine Filters
      {
        id: "tool-flux",
        category: "Engines & Tools",
        title: "FLUX.1 [dev] Filmmakers",
        subtitle: "Filter creators specializing in FLUX latent models",
        url: "/about?tools=flux-1-dev",
        icon: Sliders,
      },
      {
        id: "tool-comfy",
        category: "Engines & Tools",
        title: "ComfyUI DAG Architects",
        subtitle: "Filter creators delivering reproducible node graphs",
        url: "/about?tools=comfy-ui",
        icon: Sliders,
      },
      {
        id: "tool-runway",
        category: "Engines & Tools",
        title: "Runway Gen-3 Motion Specialists",
        subtitle: "Filter creators with dynamic camera motion control",
        url: "/about?tools=runway-gen-3",
        icon: Sliders,
      },
      {
        id: "tool-topaz",
        category: "Engines & Tools",
        title: "Topaz Video AI 4K Masters",
        subtitle: "Filter creators delivering 60fps ProRes upscales",
        url: "/about?tools=topaz-video-ai",
        icon: Sliders,
      },
    ];

    // Creator Jumps
    CREATORS.forEach((creator) => {
      items.push({
        id: `creator-${creator.id}`,
        category: "Creators",
        title: creator.name,
        subtitle: `${creator.handle} • ${creator.specializations.slice(0, 2).join(", ")}`,
        url: `/creators/${creator.handle.replace("@", "")}`,
        icon: User,
      });
    });

    return items;
  }, []);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return baseCommands.slice(0, 8);
    const q = query.toLowerCase();
    return baseCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [baseCommands, query]);

  // Keyboard navigation inside list
  const handleItemSelect = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.url) {
      router.push(item.url);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleItemSelect(filteredCommands[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-28">
          {/* Backdrop with optical blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-md"
          />

          {/* macOS Spotlight Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-modal="true"
            aria-label="macOS Spotlight Command Palette"
            className="relative z-10 w-full max-w-xl"
          >
            <GlassSurface
              tier="thick"
              radius="32"
              specular
              className="border border-white/20 shadow-2xl overflow-hidden"
            >
              {/* macOS Window Title Bar */}
              <div className="flex items-center justify-between px-5 pt-3.5 pb-2 border-b border-white/5">
                <MacTrafficLights onClose={() => setIsOpen(false)} />
                <span className="text-[10px] font-mono tracking-widest uppercase text-content-faint">
                  SPOTLIGHT // QUICK JUMP
                </span>
                <span className="text-[10px] font-mono text-accent">⌘K</span>
              </div>

              {/* Search Bar Input */}
              <div className="flex items-center px-5 py-4 border-b border-white/10">
                <Search className="h-4 w-4 text-[#D8FD38] shrink-0 mr-3" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search creators, ComfyUI DAGs, or system navigation..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  className="w-full bg-transparent text-sm text-white placeholder-content-muted focus:outline-none font-light"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-content-muted hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isSelected = selectedIndex === idx;

                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => handleItemSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-[#D8FD38]/15 border border-[#D8FD38]/40 text-white shadow-sm"
                            : "border border-transparent text-content-muted hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl transition-colors ${
                              isSelected
                                ? "bg-[#D8FD38] text-[#08090B]"
                                : "bg-white/5 text-[#D8FD38]"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-white truncate flex items-center gap-2">
                              <span>{cmd.title}</span>
                              <span className="text-[9px] font-mono text-content-faint">
                                {cmd.category}
                              </span>
                            </div>
                            {cmd.subtitle && (
                              <div className="text-[11px] text-content-muted truncate mt-0.5">
                                {cmd.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <CornerDownLeft
                          className={`h-3 w-3 shrink-0 transition-opacity ${
                            isSelected ? "text-[#D8FD38] opacity-100" : "opacity-0"
                          }`}
                        />
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-content-muted font-light">
                    No commands matching &quot;{query}&quot;. Try typing &quot;FLUX&quot;, &quot;ComfyUI&quot;, or &quot;Showcase&quot;.
                  </div>
                )}
              </div>

              {/* Footer Shortcuts Legend */}
              <div className="px-5 py-2.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-[10px] text-content-muted font-mono">
                <div className="flex items-center gap-3">
                  <span>[↑↓] Navigate</span>
                  <span>[↵] Select</span>
                  <span>[ESC] Close</span>
                </div>
                <span>macOS Spotlight System</span>
              </div>
            </GlassSurface>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
