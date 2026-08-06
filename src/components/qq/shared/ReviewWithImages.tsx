"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Star, ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface ReviewImage {
  id: string;
  color: string;
  label?: string;
}

export interface ReviewWithImagesProps {
  fromName: string;
  fromRole: string;
  avatarColor: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: ReviewImage[];
  visible: boolean;
  bothSubmitted: boolean;
  isOwn?: boolean;
}

export function ReviewWithImages({
  fromName, fromRole, avatarColor, rating, comment, createdAt, images = [], visible, bothSubmitted, isOwn,
}: ReviewWithImagesProps) {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  if (!visible && !isOwn) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        ⏳ Review hidden — visible once both parties submit (double-blind). {isOwn ? "Your review is saved." : ""}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 rounded-md shrink-0" style={{ backgroundColor: avatarColor }}>
            <AvatarFallback className="rounded-md text-white text-xs font-medium">
              {fromName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium text-sm">{fromName}</div>
                <div className="text-xs text-muted-foreground">{fromRole}</div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("size-3.5", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{comment}</p>

            {/* Image thumbnails */}
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setLightboxIdx(idx)}
                    className="group relative size-14 overflow-hidden rounded-md border border-border transition-all hover:shadow-md hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${img.color}, ${img.color}aa)` }}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <ImageIcon className="size-4 text-white" />
                    </div>
                  </button>
                ))}
                <div className="text-[10px] text-muted-foreground self-center ml-1">
                  {images.length} photo{images.length !== 1 ? "s" : ""} of delivered work
                </div>
              </div>
            )}

            <div className="mt-2 text-[10px] text-muted-foreground">
              {new Date(createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              {!bothSubmitted && isOwn && " · Your review will be visible once they submit theirs"}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxIdx !== null} onOpenChange={(o) => { if (!o) setLightboxIdx(null); }}>
        <DialogContent className="max-w-[80vw] max-h-[80vh] p-0 gap-0 bg-black/95 border-border/0" showCloseButton>
          <DialogTitle className="sr-only">Review photo</DialogTitle>
          {lightboxIdx !== null && images[lightboxIdx] && (
            <div className="flex flex-col items-center p-4">
              <div
                className="rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${images[lightboxIdx].color}, ${images[lightboxIdx].color}aa)`,
                  width: "min(70vw, 800px)",
                  aspectRatio: "4 / 3",
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="size-12 text-white/60" />
                </div>
              </div>
              {images[lightboxIdx].label && (
                <div className="mt-3 text-sm text-white/80">{images[lightboxIdx].label}</div>
              )}
              <div className="mt-1 text-xs text-white/50">{lightboxIdx + 1} of {images.length}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
