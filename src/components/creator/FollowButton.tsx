"use client";

import React, { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollowCreator, isCreatorFollowed } from "@/lib/engagement/store";

interface FollowButtonProps {
  creatorId: string;
  initialFollowed?: boolean;
  compact?: boolean;
  onToggle?: (isFollowing: boolean) => void;
}

export function FollowButton({
  creatorId,
  initialFollowed,
  compact = false,
  onToggle,
}: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean>(() => {
    return initialFollowed !== undefined ? initialFollowed : isCreatorFollowed(creatorId);
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = toggleFollowCreator(creatorId);
    setFollowing(nextState);
    if (onToggle) onToggle(nextState);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all ${
        compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-xs"
      } ${
        following
          ? isHovered
            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            : "bg-surface-elevated text-content-primary border border-surface-border"
          : "bg-accent text-white hover:bg-accent/90 shadow-sm"
      }`}
    >
      {following ? (
        <>
          <UserCheck className="h-3.5 w-3.5" />
          <span>{isHovered ? "Unfollow" : "Following"}</span>
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
