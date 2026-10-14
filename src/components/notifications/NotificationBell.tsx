"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Briefcase,
  FileText,
  MessageSquare,
  ShieldCheck,
  Settings,
} from "lucide-react";
import {
  getAppNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AppNotification,
} from "@/lib/engagement/store";
import { groupNotifications, NotificationType } from "@/lib/engagement/notifications";
import { EmptyNotificationsIllustration } from "@/components/common/illustrations/EmptyIllustrations";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "briefs" | "proposals" | "messages">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    setNotifications(getAppNotifications());
  };

  useEffect(() => {
    loadNotifications();

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const grouped = groupNotifications(notifications);
  const displayed =
    activeTab === "briefs"
      ? grouped.briefs
      : activeTab === "proposals"
      ? grouped.proposals
      : activeTab === "messages"
      ? grouped.messages
      : grouped.all;

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "brief_match":
        return <Briefcase className="h-3.5 w-3.5 text-[#D8FD38]" />;
      case "proposal_received":
      case "invite_received":
        return <FileText className="h-3.5 w-3.5 text-[#38F2C7]" />;
      case "message":
        return <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />;
      case "creator_verified":
      case "level_upgraded":
        return <ShieldCheck className="h-3.5 w-3.5 text-[#D8FD38]" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notification center"
        className="relative p-2 rounded-xl text-content-muted hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
      >
        <Bell className="h-4 w-4" />
        {grouped.unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#D8FD38] text-[9px] font-bold text-[#08090B] shadow-sm">
            {grouped.unreadCount > 9 ? "9+" : grouped.unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <GlassSurface
            tier="thick"
            radius="24"
            specular
            className="border border-white/20 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/5">
              <div className="flex items-center gap-2">
                <MacTrafficLights onClose={() => setIsOpen(false)} />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white ml-2">
                  Notification Hub
                </span>
                {grouped.unreadCount > 0 && (
                  <span className="text-[10px] font-mono bg-[#D8FD38] text-[#08090B] font-bold px-1.5 py-0.2 rounded-full">
                    {grouped.unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {grouped.unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-mono text-content-muted hover:text-[#D8FD38] transition-colors flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Read all</span>
                  </button>
                )}
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="text-content-muted hover:text-white p-1 rounded-lg transition-colors"
                  title="Alert preferences"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Categorical Tabs */}
            <div className="flex border-b border-white/5 bg-black/40 px-3 py-1.5 gap-1 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "all" ? "bg-white/15 text-white font-semibold" : "text-content-muted hover:text-white"
                }`}
              >
                All ({grouped.all.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("briefs")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "briefs" ? "bg-white/15 text-white font-semibold" : "text-content-muted hover:text-white"
                }`}
              >
                Briefs ({grouped.briefs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("proposals")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "proposals" ? "bg-white/15 text-white font-semibold" : "text-content-muted hover:text-white"
                }`}
              >
                Proposals ({grouped.proposals.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("messages")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === "messages" ? "bg-white/15 text-white font-semibold" : "text-content-muted hover:text-white"
                }`}
              >
                Messages ({grouped.messages.length})
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {displayed.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <EmptyNotificationsIllustration className="w-24 h-20 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-medium text-white">All caught up</p>
                  <p className="text-[11px] text-content-muted mt-0.5">No notifications in this category.</p>
                </div>
              ) : (
                displayed.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative p-3.5 flex gap-3 transition-colors ${
                      n.read ? "bg-transparent opacity-75 hover:opacity-100" : "bg-[#D8FD38]/5 hover:bg-[#D8FD38]/10"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0 p-1.5 rounded-lg bg-black/40 border border-white/10">
                      {getIconForType(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-medium text-white truncate">{n.title}</h4>
                        <span className="text-[10px] font-mono text-content-muted flex-shrink-0">{n.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-content-muted line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                      {n.data.actionUrl && (
                        <Link
                          href={n.data.actionUrl}
                          onClick={() => {
                            handleMarkRead(n.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-mono text-accent hover:underline"
                        >
                          <span>Inspect pipeline</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="absolute top-3.5 right-3 opacity-0 group-hover:opacity-100 text-content-muted hover:text-[#D8FD38] p-1 transition-all"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Bar */}
            <div className="border-t border-white/10 px-4 py-2 bg-black/40 flex items-center justify-between text-[10px] font-mono">
              <Link
                href="/api/digest-preview"
                target="_blank"
                className="text-content-muted hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Weekly Digest</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
              <span className="text-content-faint">Realtime Active</span>
            </div>
          </GlassSurface>
        </div>
      )}
    </div>
  );
}
