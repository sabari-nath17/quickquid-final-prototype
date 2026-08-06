"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Star, MapPin, Clock, ShieldCheck, Briefcase, FileText, ExternalLink,
  CheckCircle2, Circle, Send, Eye, MessageSquare,
} from "lucide-react";
import { StatusBadge, statusMeta } from "./StatusBadge";
import { FeeBreakdown } from "./FeeBreakdown";
import { formatINR, timeAgo, budgetBand } from "@/lib/qq/format";
import type { ProProfile, Brief, Proposal, GigDraft, Contract, PaymentEvidence, Milestone } from "@/lib/qq/types";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function ProfileCard({ profile, onClick }: { profile: ProProfile; onClick?: () => void }) {
  const status = profile.availability === "available_now" ? { tone: "success" as const, label: "Available now" } : profile.availability === "paused" ? { tone: "paused" as const, label: "Paused" } : { tone: "info" as const, label: "Booked" };
  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow cursor-pointer text-left w-full", onClick && "hover:border-primary/40")} onClick={onClick}>
      <div className="flex items-start gap-3">
        <Avatar className="size-12 rounded-md" style={{ backgroundColor: profile.userId === "PRO-2088" ? "#7C3AED" : profile.userId === "PRO-2099" ? "#0891B2" : profile.userId === "PRO-2101" ? "#DB2777" : "#CA8A04" }}>
          <AvatarFallback className="rounded-md text-white font-medium">{initials(profile.displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{profile.displayName}</h3>
            <StatusBadge tone={status.tone} icon={false}>{status.label}</StatusBadge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{profile.headline}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Briefcase className="size-3" />{profile.primaryCategory}</span>
            <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{profile.rating}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3" />{profile.responseTime}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.trustSignals.map((t) => (
          <Badge key={t} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
            <ShieldCheck className="size-3" /> {t}
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">From <span className="font-semibold text-foreground">{formatINR(profile.feeFrom ?? 0)}</span></span>
        <span className="text-muted-foreground">{profile.completedProjects} projects</span>
      </div>
    </Card>
  );
}

export function BriefCard({ brief, onOpen, onApply, onSave, showApply = true }: { brief: Brief; onOpen?: () => void; onApply?: () => void; onSave?: () => void; showApply?: boolean }) {
  const m = statusMeta(brief.status);
  return (
    <Card className="p-4 hover:shadow-md transition-all flex flex-col gap-3 text-left h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button className="text-left" onClick={onOpen}>
            <h3 className="font-semibold hover:underline line-clamp-2">{brief.title}</h3>
          </button>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{brief.category}</Badge>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{brief.buyerName}</span>
            <span>· {timeAgo(brief.createdAt)}</span>
          </div>
        </div>
        <StatusBadge tone={m.tone}>{m.label}</StatusBadge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{brief.objective}</p>
      {brief.exclusions.length > 0 && (
        <div className="text-xs text-muted-foreground"><span className="font-medium">Exclusions:</span> {brief.exclusions.join("; ")}</div>
      )}
      <div className="mt-auto grid grid-cols-3 gap-2 text-sm border-t border-border pt-3">
        <div><div className="text-xs text-muted-foreground">Budget</div><div className="font-semibold">{formatINR(brief.budget)}</div></div>
        <div><div className="text-xs text-muted-foreground">Timeline</div><div className="font-semibold">{brief.timeline}</div></div>
        <div><div className="text-xs text-muted-foreground">Visibility</div><div className="font-semibold capitalize">{brief.visibility}</div></div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onOpen}><Eye className="size-3.5" /> View</Button>
        {showApply && <Button size="sm" className="flex-1" onClick={onApply}><Send className="size-3.5" /> Apply</Button>}
        {onSave && <Button size="sm" variant="ghost" onClick={onSave}>Save</Button>}
      </div>
    </Card>
  );
}

export function ProposalCard({ proposal, onOpen, onShortlist, onDecline, onMessage }: { proposal: Proposal; onOpen?: () => void; onShortlist?: () => void; onDecline?: () => void; onMessage?: () => void }) {
  const m = statusMeta(proposal.status);
  return (
    <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-2 text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="size-9 rounded-md"><AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">{initials(proposal.proName)}</AvatarFallback></Avatar>
          <div>
            <h4 className="font-medium text-sm">{proposal.proName}</h4>
            <p className="text-xs text-muted-foreground">{proposal.proHeadline}</p>
          </div>
        </div>
        <StatusBadge tone={m.tone}>{m.label}</StatusBadge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{proposal.coverLetter}</p>
      <div className="flex items-center justify-between text-sm border-t border-border pt-2">
        <span className="text-muted-foreground">Proposed fee</span>
        <span className="font-semibold">{formatINR(proposal.proposedFee)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onOpen}>View</Button>
        {onShortlist && <Button size="sm" variant="outline" onClick={onShortlist}>Shortlist</Button>}
        {onMessage && <Button size="sm" variant="ghost" onClick={onMessage}><MessageSquare className="size-3.5" /></Button>}
        {onDecline && <Button size="sm" variant="ghost" onClick={onDecline}>Decline</Button>}
      </div>
    </Card>
  );
}

export function GigCard({ gig, onOpen }: { gig: GigDraft; onOpen?: () => void }) {
  const m = statusMeta(gig.status);
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer text-left" onClick={onOpen}>
      <div className="h-24 w-full" style={{ backgroundColor: gig.coverImageColor }} />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="text-xs">{gig.category}</Badge>
          <StatusBadge tone={m.tone} icon={false}>{m.label.replace("approved live", "live")}</StatusBadge>
        </div>
        <h3 className="font-semibold line-clamp-2">{gig.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{gig.shortDescription}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="size-5 rounded"><AvatarFallback className="rounded bg-primary/10 text-primary text-[10px]">{initials(gig.proName)}</AvatarFallback></Avatar>
          <span>{gig.proName}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Pro fee</div>
            <div className="font-semibold">{formatINR(gig.proFee)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Delivery</div>
            <div className="font-semibold">{gig.deliveryTimeline}</div>
          </div>
        </div>
        {gig.status === "approved_live" && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Eye className="size-3" />{gig.views} views</span>
            <span className="inline-flex items-center gap-1"><Send className="size-3" />{gig.requests} requests</span>
            {gig.rating && <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{gig.rating}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

export function PortfolioItemCard({ item, featured }: { item: { title: string; category: string; description: string; url?: string }; featured?: boolean }) {
  return (
    <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-2 text-left">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-sm">{item.title}</h4>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
        {featured && <Badge className="bg-amber-50 text-amber-700 border-amber-200">Featured</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">{item.description}</p>
      {item.url && (
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ExternalLink className="size-3.5" /> View case study
        </a>
      )}
    </Card>
  );
}

const MILESTONE_STEP_LABELS = ["Funding", "Work active", "Submitted", "Buyer review", "Accepted", "Payout queued"];

export function MilestoneStepper({ milestone }: { milestone: Milestone }) {
  const order: Milestone["status"][] = ["funding_pending", "funded", "work_active", "submitted", "in_review", "accepted", "payout_queued", "payout_processed"];
  const currentIdx = order.indexOf(milestone.status);
  const steps = ["Funding", "Work active", "Submitted", "In review", "Accepted", "Payout queued"];
  const activeStep = Math.max(0, Math.min(steps.length - 1, ["funding_pending", "funded", "work_active", "submitted", "in_review", "accepted", "payout_queued", "payout_processed"].indexOf(milestone.status)));
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div className={cn("flex size-7 items-center justify-center rounded-full border text-xs font-medium", done ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground")}>
                {done ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              <span className={cn("text-[10px] text-center leading-tight", active ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={cn("h-0.5 flex-1 min-w-[12px]", done ? "bg-emerald-500" : "bg-border")} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function PaymentTracker({ payment }: { payment: PaymentEvidence }) {
  const flow: { key: PaymentEvidence["status"]; label: string }[] = [
    { key: "payment_evidence_submitted", label: "Evidence submitted" },
    { key: "under_admin_verification", label: "Under Admin verification" },
    { key: "payment_confirmed", label: "Payment confirmed" },
  ];
  const order = flow.map((f) => f.key);
  const currentIdx = order.indexOf(payment.status);
  const rejected = payment.status === "payment_rejected";
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {flow.map((f, i) => {
        const done = !rejected && i < currentIdx;
        const active = !rejected && i === currentIdx;
        return (
          <React.Fragment key={f.key}>
            <div className="flex items-center gap-1.5">
              <div className={cn("flex size-5 items-center justify-center rounded-full border text-[10px]", done ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-primary bg-primary text-primary-foreground" : rejected && i <= currentIdx ? "border-destructive bg-destructive text-white" : "border-border text-muted-foreground")}>
                {done ? <CheckCircle2 className="size-3" /> : i + 1}
              </div>
              <span className={cn("text-xs", active ? "font-medium text-foreground" : done ? "text-foreground" : "text-muted-foreground")}>{f.label}</span>
            </div>
            {i < flow.length - 1 && <div className={cn("h-0.5 w-6", done ? "bg-emerald-500" : "bg-border")} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ContractMilestoneList({ contract }: { contract: Contract }) {
  return (
    <div className="space-y-2">
      {contract.milestones.map((m) => {
        const meta = statusMeta(m.status);
        return (
          <div key={m.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{m.index}</div>
                <div>
                  <div className="font-medium text-sm">{m.label} · {m.description}</div>
                  <div className="text-xs text-muted-foreground">{formatINR(m.proFee)}</div>
                </div>
              </div>
              <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
