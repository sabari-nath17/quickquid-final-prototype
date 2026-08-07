"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star, Eye, Send, Play, Pause, Volume2, VolumeX, ShieldCheck,
} from "lucide-react";
import { StatusBadge, statusMeta } from "./StatusBadge";
import { formatINR } from "@/lib/qq/format";
import type { GigDraft } from "@/lib/qq/types";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export interface VideoGigCardProps {
  gig: GigDraft;
  hasVideo?: boolean;
  views?: number;
  requests?: number;
  rating?: number;
  onOpen?: () => void;
}

export function VideoGigCard({ gig, hasVideo = false, views, requests, rating, onOpen }: VideoGigCardProps) {
  const [hovered, setHovered] = React.useState(false);
  const [muted, setMuted] = React.useState(true);
  const [playing, setPlaying] = React.useState(false);
  const meta = statusMeta(gig.status);
  const isLive = gig.status === "approved_live";

  // Simulate video play on hover
  React.useEffect(() => {
    if (hovered && hasVideo) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [hovered, hasVideo]);

  return (
    <Card
      className={cn("overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left h-full flex flex-col")}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover with video preview */}
      <div className="relative aspect-video w-full overflow-hidden" style={{ backgroundColor: gig.coverImageColor }}>
        {/* Gradient backdrop as "video frame" */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${gig.coverImageColor}, ${gig.coverImageColor}99)` }} />

        {/* Simulated content silhouette */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="grid grid-cols-3 gap-2 w-3/4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn("rounded bg-white/20 transition-all", hovered && hasVideo && "animate-pulse")} style={{ height: `${20 + (i % 3) * 12}px` }} />
            ))}
          </div>
        </div>

        {/* Video play indicator (shows on hover) */}
        {hasVideo && (
          <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity", hovered ? "opacity-100" : "opacity-0")}>
            <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm">
              {playing ? <Pause className="size-6 text-white" fill="white" /> : <Play className="size-6 text-white" fill="white" />}
            </div>
          </div>
        )}

        {/* Mute toggle (top-right, on hover) */}
        {hasVideo && hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm hover:bg-black/70"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="size-3.5 text-white" /> : <Volume2 className="size-3.5 text-white" />}
          </button>
        )}

        {/* Video badge */}
        {hasVideo && (
          <div className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            ▶ Video preview
          </div>
        )}

        {/* Rating (bottom-right) */}
        {rating !== undefined && (
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm flex items-center gap-1">
            <Star className="size-3 fill-amber-400 text-amber-400" /> {rating}
          </div>
        )}

        {/* "Live" pulse indicator */}
        {isLive && (
          <div className="absolute bottom-2 left-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-white animate-pulse" /> Live
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="text-xs shrink-0">{gig.category}</Badge>
          <StatusBadge tone={meta.tone} icon={false} className="shrink-0">{meta.label.replace("approved live", "live")}</StatusBadge>
        </div>
        <h3 className="font-semibold line-clamp-2">{gig.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{gig.shortDescription}</p>

        {/* Pro identity */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="size-5 rounded shrink-0"><AvatarFallback className="rounded bg-primary/10 text-primary text-[10px]">{initials(gig.proName)}</AvatarFallback></Avatar>
          <span className="truncate">{gig.proName}</span>
          <ShieldCheck className="size-3 text-emerald-600 shrink-0" />
          <span className="text-emerald-600 shrink-0">Verified</span>
        </div>

        {/* Commercial + metrics */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pro fee</div>
            <div className="font-bold">{formatINR(gig.proFee)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Delivery</div>
            <div className="font-semibold">{gig.deliveryTimeline}</div>
          </div>
        </div>

        {isLive && (views !== undefined || requests !== undefined) && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {views !== undefined && <span className="inline-flex items-center gap-1"><Eye className="size-3" /> {views}</span>}
            {requests !== undefined && <span className="inline-flex items-center gap-1"><Send className="size-3" /> {requests} requests</span>}
            <span className="ml-auto">Rev: {gig.revisions}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
