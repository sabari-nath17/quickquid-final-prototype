"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Lock, CheckCircle2, FileText, FileArchive, FileImage, Video, Link2,
  Download, Eye, AlertCircle, Clock, ShieldCheck, ExternalLink,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface VaultFile {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "figma" | "zip" | "link";
  size?: string;
  url?: string;
  thumbColor?: string;
}

export type VaultState = "locked" | "reviewable" | "unlocked";

interface VaultDeliverableProps {
  milestoneLabel: string;
  milestoneDescription: string;
  state: VaultState;
  files: VaultFile[];
  proFee: number;
  buyerFee?: number;
  buyerTotal?: number;
  payoutReference?: string;
  paymentMethod?: string;
  onAccept?: () => void;
  onRequestRevision?: () => void;
  onSubmitPayment?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

const stateMeta: Record<VaultState, { tone: "warning" | "info" | "success"; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  locked: { tone: "warning", label: "Awaiting payment confirmation", icon: Lock },
  reviewable: { tone: "info", label: "Reviewing — payment confirmed", icon: Eye },
  unlocked: { tone: "success", label: "Payment confirmed · Unlocked", icon: CheckCircle2 },
};

function fileIcon(type: VaultFile["type"]) {
  switch (type) {
    case "image": return FileImage;
    case "video": return Video;
    case "zip": return FileArchive;
    case "link": return Link2;
    case "figma": return FileText;
    case "pdf": return FileText;
    default: return FileText;
  }
}
// (kept for potential external use; rendering uses inline conditionals to satisfy react-hooks/static-components)

export function VaultDeliverable({
  milestoneLabel,
  milestoneDescription,
  state,
  files,
  proFee,
  buyerFee,
  buyerTotal,
  payoutReference,
  paymentMethod,
  onAccept,
  onRequestRevision,
  onSubmitPayment,
  onContactSupport,
  className,
}: VaultDeliverableProps) {
  const meta = stateMeta[state];
  const Icon = meta.icon;
  const isLocked = state === "locked";
  const isUnlocked = state === "unlocked";

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-3 border-b px-4 py-3",
        isLocked ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
        : isUnlocked ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
        : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "flex size-9 items-center justify-center rounded-lg shrink-0",
            isLocked ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            : isUnlocked ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
            : "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
          )}>
            <Icon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">{milestoneLabel} · {milestoneDescription}</div>
            <div className="text-xs text-muted-foreground">
              {isLocked && "Deliverables are watermarked until payment is confirmed."}
              {state === "reviewable" && "Review the deliverable. Accept to unlock download."}
              {isUnlocked && "Deliverable unlocked. Download available."}
            </div>
          </div>
        </div>
        <StatusBadge tone={meta.tone} className="shrink-0">{meta.label}</StatusBadge>
      </div>

      {/* Files */}
      <div className="p-4 space-y-3">
        {files.map((f) => (
          <VaultFileRow key={f.id} file={f} locked={isLocked} unlocked={isUnlocked} />
        ))}
      </div>

      {/* Commercial summary */}
      <div className="border-t border-border bg-muted/30 px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pro fee</div>
            <div className="font-semibold tabular-nums">${proFee.toLocaleString()}</div>
          </div>
          {buyerFee !== undefined && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Buyer fee (14%)</div>
              <div className="font-semibold tabular-nums">${buyerFee.toLocaleString()}</div>
            </div>
          )}
          {buyerTotal !== undefined && (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Buyer total</div>
              <div className="font-semibold tabular-nums">${buyerTotal.toLocaleString()}</div>
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</div>
            <div className="font-medium text-xs">
              {isUnlocked && payoutReference ? `Ref ${payoutReference}` : isLocked ? "Pending verification" : "In review"}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        {isLocked && onSubmitPayment && (
          <Button size="sm" onClick={onSubmitPayment}><Clock className="size-3.5" /> Submit payment</Button>
        )}
        {state === "reviewable" && onAccept && (
          <Button size="sm" onClick={onAccept}><CheckCircle2 className="size-3.5" /> Accept milestone</Button>
        )}
        {state === "reviewable" && onRequestRevision && (
          <Button size="sm" variant="outline" onClick={onRequestRevision}><AlertCircle className="size-3.5" /> Request revision</Button>
        )}
        {isUnlocked && (
          <Button size="sm" variant="outline"><Download className="size-3.5" /> Download all ({files.length} files)</Button>
        )}
        {onContactSupport && (
          <Button size="sm" variant="ghost" className="ml-auto" onClick={onContactSupport}>Contact support</Button>
        )}
      </div>
    </Card>
  );
}

function VaultFileRow({ file, locked, unlocked }: { file: VaultFile; locked: boolean; unlocked: boolean }) {
  const isLink = file.type === "link";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border overflow-hidden">
      {/* Preview thumbnail */}
      <div className="relative shrink-0 w-20 h-16 bg-muted flex items-center justify-center overflow-hidden">
        {isLink ? (
          <Link2 className="size-6 text-muted-foreground" />
        ) : file.type === "image" || file.type === "video" ? (
          <div
            className={cn("absolute inset-0 transition-all duration-500", locked && "blur-lg scale-110")}
            style={{ background: `linear-gradient(135deg, ${file.thumbColor ?? "#7C3AED"}, ${file.thumbColor ?? "#7C3AED"}88)` }}
          >
            <div className="flex items-center justify-center h-full">
              {file.type === "video" && <Video className="size-6 text-white/80" />}
              {file.type === "image" && <FileImage className="size-6 text-white/80" />}
            </div>
          </div>
        ) : file.type === "zip" ? (
          <FileArchive className="size-6 text-muted-foreground" />
        ) : (
          <FileText className="size-6 text-muted-foreground" />
        )}
        {/* Watermark overlay when locked */}
        {locked && !isLink && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rotate-[-20deg] text-[8px] font-bold text-white/60 tracking-widest whitespace-nowrap">
              QUICKQUID · PENDING
            </div>
          </div>
        )}
        {/* Lock badge */}
        {locked && (
          <div className="absolute top-1 left-1 rounded bg-amber-500/90 px-1 py-0.5">
            <Lock className="size-2.5 text-white" />
          </div>
        )}
        {/* Unlock badge */}
        {unlocked && (
          <div className="absolute top-1 left-1 rounded bg-emerald-500/90 px-1 py-0.5">
            <CheckCircle2 className="size-2.5 text-white" />
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 py-2">
        <div className="flex items-center gap-1.5">
          {isLink ? <Link2 className="size-3.5 text-muted-foreground shrink-0" /> : file.type === "zip" ? <FileArchive className="size-3.5 text-muted-foreground shrink-0" /> : <FileText className="size-3.5 text-muted-foreground shrink-0" />}
          <span className="text-sm font-medium truncate">{file.name}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {file.size ? `${file.size}` : ""}
          {locked && " · Watermarked preview only"}
          {unlocked && " · Ready to download"}
          {state === "reviewable" && " · Full preview available"}
        </div>
      </div>

      {/* Action */}
      <div className="pr-3 shrink-0">
        {isLink ? (
          <Button size="sm" variant="ghost"><ExternalLink className="size-3.5" /> Open</Button>
        ) : unlocked ? (
          <Button size="sm" variant="ghost"><Download className="size-3.5" /></Button>
        ) : locked ? (
          <Button size="sm" variant="ghost" disabled><Lock className="size-3.5" /></Button>
        ) : (
          <Button size="sm" variant="ghost"><Eye className="size-3.5" /></Button>
        )}
      </div>
    </div>
  );
}

// Demo helper: builds the Sarah/Alex demo vault for the spec walkthrough
export function VaultDemo() {
  const [state, setState] = React.useState<VaultState>("locked");
  const files: VaultFile[] = [
    { id: "f1", name: "MVP_Wireframes_v1.fig", type: "figma", size: "12.4 MB", thumbColor: "#7C3AED" },
    { id: "f2", name: "Concept_Sketch.jpg", type: "image", size: "2.1 MB", thumbColor: "#0891B2" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Demo state:</span>
        {(["locked", "reviewable", "unlocked"] as VaultState[]).map((s) => (
          <Button key={s} size="sm" variant={state === s ? "default" : "outline"} onClick={() => setState(s)}>
            {s === "locked" ? "1. Locked" : s === "reviewable" ? "2. Reviewable" : "3. Unlocked"}
          </Button>
        ))}
      </div>
      <VaultDeliverable
        milestoneLabel="M1"
        milestoneDescription="Discovery & wireframes"
        state={state}
        files={files}
        proFee={400}
        buyerFee={56}
        buyerTotal={456}
        payoutReference={state === "unlocked" ? "NEFT-882341005" : undefined}
        onAccept={() => setState("unlocked")}
        onSubmitPayment={() => setState("reviewable")}
      />
    </div>
  );
}
