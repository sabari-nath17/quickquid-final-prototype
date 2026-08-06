"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Play, Star, ExternalLink } from "lucide-react";

export interface GalleryItem {
  id: string;
  type: "image" | "video" | "link";
  title: string;
  description?: string;
  url?: string;
  color: string;
  featured?: boolean;
}

export function PortfolioGallery({ items }: { items: GalleryItem[] }) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const [zoomed, setZoomed] = React.useState(false);

  function navigate(dir: 1 | -1) {
    setOpenIdx((prev) => {
      if (prev === null) return prev;
      const next = (prev + dir + items.length) % items.length;
      setZoomed(false);
      return next;
    });
  }

  React.useEffect(() => {
    if (openIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "Escape") setOpenIdx(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, items.length]);

  if (items.length === 0) return null;

  const current = openIdx !== null ? items[openIdx] : null;

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 [column-fill:_balance]">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setOpenIdx(idx)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border text-left transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div
              className="relative aspect-video w-full"
              style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}aa)` }}
            >
              {/* Play icon for videos */}
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/40 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Play className="size-6 text-white" fill="white" />
                  </div>
                </div>
              )}
              {item.type === "link" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ExternalLink className="size-8 text-white/80" />
                </div>
              )}
              {/* Featured badge */}
              {item.featured && (
                <div className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1">
                  <Star className="size-2.5" fill="white" /> Featured
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  {item.description && <div className="text-xs text-white/80 line-clamp-1">{item.description}</div>}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={openIdx !== null} onOpenChange={(o) => { if (!o) setOpenIdx(null); }}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 gap-0 bg-black/95 border-border/0" showCloseButton={false}>
          <DialogTitle className="sr-only">{current?.title}</DialogTitle>
          {current && (
            <div className="relative flex flex-col h-[90vh]">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 text-white">
                <div className="min-w-0">
                  <div className="font-medium truncate">{current.title}</div>
                  {current.description && <div className="text-xs text-white/70 truncate">{current.description}</div>}
                </div>
                <div className="flex items-center gap-1">
                  {current.type === "image" && (
                    <button onClick={() => setZoomed((z) => !z)} className="rounded p-1.5 hover:bg-white/10" aria-label="Toggle zoom">
                      {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
                    </button>
                  )}
                  {current.url && (
                    <a href={current.url} target="_blank" rel="noreferrer" className="rounded p-1.5 hover:bg-white/10" aria-label="Open original">
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  <button onClick={() => setOpenIdx(null)} className="rounded p-1.5 hover:bg-white/10" aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              {/* Media */}
              <div className="flex-1 flex items-center justify-center overflow-hidden px-4 pb-4 relative">
                <div
                  className={cn(
                    "rounded-lg transition-all duration-300",
                    zoomed ? "cursor-zoom-out max-w-none" : "cursor-zoom-in max-w-full max-h-full",
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${current.color}, ${current.color}aa)`,
                    width: zoomed ? "auto" : "100%",
                    height: zoomed ? "auto" : "100%",
                    maxWidth: zoomed ? "none" : "min(90vw, 1200px)",
                    maxHeight: zoomed ? "none" : "70vh",
                    aspectRatio: "16 / 9",
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    {current.type === "video" && (
                      <div className="rounded-full bg-black/40 p-5 backdrop-blur-sm">
                        <Play className="size-10 text-white" fill="white" />
                      </div>
                    )}
                    {current.type === "link" && <ExternalLink className="size-12 text-white/80" />}
                  </div>
                </div>
                {/* Nav arrows */}
                {items.length > 1 && (
                  <>
                    <button
                      onClick={() => navigate(-1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-sm"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={() => navigate(1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 backdrop-blur-sm"
                      aria-label="Next"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </div>
              {/* Counter */}
              <div className="px-4 py-2 text-center text-xs text-white/60">
                {openIdx! + 1} of {items.length}
                {zoomed && " · Zoomed (click to reset)"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
