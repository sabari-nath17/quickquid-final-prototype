"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Lock, CheckCircle2, FileText, FileArchive, FileImage, Video, Link2, Github,
  Download, Eye, AlertCircle, Clock, ShieldCheck, Upload, RefreshCw, History,
  ExternalLink, Figma, FileCode, ShieldAlert, XCircle, Loader2,
} from "lucide-react";
import { StatusBadge, statusMeta } from "./StatusBadge";
import type { VaultItem, VaultState, VaultAssetType } from "@/lib/qq/types";

export interface DeliveryVaultProps {
  contractId: string;
  milestoneId: string;
  milestoneLabel: string;
  milestoneDescription: string;
  proFee: number;
  state: VaultState;
  items: VaultItem[];
  currentVersion?: VaultItem;
  acceptanceCriteria: string[];
  userRole: "buyer" | "pro" | "admin_support" | "finance" | "risk" | "ops_manager";
  paymentConfirmed: boolean;
  disputeActive: boolean;
  onProSubmit?: (note: string) => void;
  onProAddDraft?: (item: Omit<VaultItem, "vault_item_id" | "submitted_at" | "version_number" | "activity_log">) => void;
  onBuyerAccept?: (versionId: string) => void;
  onBuyerRequestRevision?: (versionId: string, reason: string, criterion: string) => void;
  onContactSupport?: () => void;
  className?: string;
}

const stateMeta: Record<VaultState, { tone: "neutral" | "info" | "warning" | "success" | "critical"; label: string; description: string }> = {
  empty: { tone: "neutral", label: "No delivery submitted", description: "The Pro has not uploaded any deliverables for this milestone yet." },
  draft_upload: { tone: "info", label: "Draft in progress", description: "The Pro is preparing deliverables. Drafts are not visible to the Buyer." },
  uploading: { tone: "info", label: "Uploading", description: "Files are uploading. Progress is visible to the Pro." },
  processing: { tone: "info", label: "Processing", description: "Preview generation and scan in progress." },
  ready_to_submit: { tone: "info", label: "Ready to submit", description: "All required evidence is complete. Pro can submit for Buyer review." },
  submitted_for_review: { tone: "warning", label: "Submitted for review", description: "Buyer has been notified. This version is immutable." },
  revision_requested: { tone: "warning", label: "Revision requested", description: "Buyer requested changes. Pro must create a new version." },
  resubmitted: { tone: "info", label: "Resubmitted", description: "Pro submitted a new version. Old versions remain visible." },
  accepted: { tone: "success", label: "Accepted", description: "Delivery accepted by Buyer. Payout is queued for Admin processing." },
  disputed: { tone: "critical", label: "Disputed — evidence locked", description: "This version is preserved as evidence. Destructive changes are blocked." },
  access_restricted: { tone: "critical", label: "Access restricted", description: "Access is limited to authorized mediators via approved Admin workflow." },
  unsupported_failed: { tone: "critical", label: "Upload failed", description: "The file or link could not be processed. See error and recovery action." },
};

function assetIcon(type: VaultAssetType) {
  switch (type) {
    case "external_link": return Link2;
    case "repository": return Github;
    case "staging_link": return ExternalLink;
    case "design_link": return Figma;
    case "document_link": return FileText;
    case "file": return FileText;
    default: return FileText;
  }
}

function assetTypeLabel(type: VaultAssetType) {
  switch (type) {
    case "external_link": return "External link";
    case "repository": return "Repository";
    case "staging_link": return "Staging link";
    case "design_link": return "Design link";
    case "document_link": return "Document";
    case "file": return "File";
    default: return "Asset";
  }
}

export function DeliveryVault({
  contractId, milestoneId, milestoneLabel, milestoneDescription, proFee,
  state, items, currentVersion, acceptanceCriteria, userRole,
  paymentConfirmed, disputeActive,
  onProSubmit, onProAddDraft, onBuyerAccept, onBuyerRequestRevision, onContactSupport, className,
}: DeliveryVaultProps) {
  const meta = stateMeta[state];
  const isPro = userRole === "pro";
  const isBuyer = userRole === "buyer";
  const isMediator = userRole === "risk" || userRole === "ops_manager";
  const isSupport = userRole === "admin_support";
  const isFinance = userRole === "finance";

  // Permission checks
  const canUpload = isPro && paymentConfirmed && !disputeActive && state !== "accepted";
  const canSubmit = isPro && paymentConfirmed && !disputeActive && (state === "draft_upload" || state === "ready_to_submit" || state === "revision_requested");
  const canAccept = isBuyer && !disputeActive && (state === "submitted_for_review" || state === "resubmitted");
  const canRequestRevision = isBuyer && !disputeActive && (state === "submitted_for_review" || state === "resubmitted");
  const canPreview = isBuyer || isPro || (isMediator && disputeActive) || (isSupport && false); // Support needs ticket attachment
  const canDownload = isBuyer && state === "accepted";
  const financeDenied = isFinance;

  // State transition guards
  const proBlockedReason = !paymentConfirmed
    ? "Payment must be confirmed before you can submit delivery."
    : disputeActive
    ? "This milestone is under dispute. Delivery is frozen."
    : state === "accepted"
    ? "This milestone has been accepted."
    : null;

  const buyerBlockedReason = disputeActive
    ? "This milestone is under dispute. Acceptance is paused."
    : (state !== "submitted_for_review" && state !== "resubmitted")
    ? "No submitted version to accept. Wait for the Pro to submit delivery."
    : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-3 border-b px-4 py-3",
        state === "accepted" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
        : disputeActive || state === "disputed" ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
        : state === "submitted_for_review" || state === "resubmitted" || state === "revision_requested" ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
        : "bg-muted/30 border-border",
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "flex size-9 items-center justify-center rounded-lg shrink-0",
            state === "accepted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
            : disputeActive ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            : "bg-muted text-muted-foreground",
          )}>
            {state === "accepted" ? <CheckCircle2 className="size-4.5" />
              : disputeActive ? <ShieldAlert className="size-4.5" />
              : <Lock className="size-4.5" />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">{milestoneLabel} · {milestoneDescription}</div>
            <div className="text-xs text-muted-foreground">{meta.description}</div>
          </div>
        </div>
        <StatusBadge tone={meta.tone} className="shrink-0">{meta.label}</StatusBadge>
      </div>

      {/* Finance access denied */}
      {financeDenied && (
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" />
            <span>Finance role does not have access to delivery contents. You see only contract/milestone/payout metadata.</span>
          </div>
        </div>
      )}

      {/* Body: version history + scope rail */}
      {!financeDenied && (
        <div className="grid lg:grid-cols-[65%_35%] divide-x divide-border">
          {/* Version history */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Delivery versions</h3>
              {items.length > 0 && <Badge variant="outline" className="text-xs">{items.length} version{items.length !== 1 ? "s" : ""}</Badge>}
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <Upload className="size-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isPro && !paymentConfirmed
                    ? "You can upload deliverables once payment is confirmed."
                    : isPro
                    ? "No deliverables uploaded yet. Add files or links to begin."
                    : "The Pro has not submitted any deliverables for this milestone yet."}
                </p>
                {isPro && canUpload && (
                  <Button size="sm" className="mt-3" onClick={() => onProAddDraft?.(createDraftItem(contractId, milestoneId, userRole))}>
                    <Upload className="size-3.5" /> Add evidence
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const isCurrent = currentVersion?.vault_item_id === item.vault_item_id;
                  const isAccepted = item.review_status === "accepted";
                  const isRejected = item.review_status === "rejected";
                  const isImmutable = item.review_status !== "not_submitted";
                  return (
                    <VaultVersionRow
                      key={item.vault_item_id}
                      item={item}
                      isCurrent={isCurrent}
                      isAccepted={isAccepted}
                      isRejected={isRejected}
                      isImmutable={isImmutable}
                      canPreview={canPreview}
                      canDownload={canDownload && isAccepted}
                      canAccept={canAccept && isCurrent}
                      canRequestRevision={canRequestRevision && isCurrent}
                      onAccept={() => onBuyerAccept?.(item.vault_item_id)}
                      onRequestRevision={(reason, criterion) => onBuyerRequestRevision?.(item.vault_item_id, reason, criterion)}
                    />
                  );
                })}
              </div>
            )}

            {/* Pro actions */}
            {isPro && (
              <div className="border-t border-border pt-3 space-y-2">
                {proBlockedReason && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Cannot submit delivery</div>
                      <div>{proBlockedReason}</div>
                      {!paymentConfirmed && <Button size="sm" variant="outline" className="mt-1.5 h-7 text-xs" onClick={onContactSupport}>Contact support</Button>}
                    </div>
                  </div>
                )}
                {canSubmit && (
                  <ProSubmitBar
                    canAddDraft={canUpload}
                    onAddDraft={() => onProAddDraft?.(createDraftItem(contractId, milestoneId, userRole))}
                    onSubmit={(note) => onProSubmit?.(note)}
                  />
                )}
              </div>
            )}

            {/* Buyer actions */}
            {isBuyer && buyerBlockedReason && (state === "submitted_for_review" || state === "resubmitted") === false && state !== "empty" && (
              <div className="border-t border-border pt-3">
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Cannot accept</div>
                    <div>{buyerBlockedReason}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scope & review rail */}
          <div className="p-4 space-y-3 bg-muted/20">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Acceptance criteria</h3>
              <ul className="space-y-1.5">
                {acceptanceCriteria.length === 0 ? (
                  <li className="text-xs text-muted-foreground">No criteria recorded.</li>
                ) : (
                  acceptanceCriteria.map((c, i) => {
                    const checked = state === "accepted";
                    return (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <span className={cn("mt-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border", checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-border")}>
                          {checked && <CheckCircle2 className="size-2.5" />}
                        </span>
                        <span className={checked ? "text-foreground" : "text-muted-foreground"}>{c}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <div className="border-t border-border pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Commercial record</h3>
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">Pro fee</dt><dd className="font-medium tabular-nums">₹{proFee.toLocaleString("en-IN")}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Commission (Pro)</dt><dd className="font-medium tabular-nums">₹0</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Payment status</dt><dd className="font-medium">{paymentConfirmed ? "Confirmed" : "Pending"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Dispute hold</dt><dd className="font-medium">{disputeActive ? "Active" : "None"}</dd></div>
              </dl>
            </div>

            {state === "accepted" && (
              <div className="border-t border-border pt-3">
                <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5 inline mr-1" />
                  <strong>Payout queued.</strong> Acceptance created Payout Queued. Finance will process manually.
                </div>
              </div>
            )}

            {isMediator && disputeActive && (
              <div className="border-t border-border pt-3">
                <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-3 py-2 text-xs text-red-800 dark:text-red-300">
                  <ShieldAlert className="size-3.5 inline mr-1" />
                  <strong>Mediator access.</strong> You have read-only access to this evidence while resolving an authorized dispute.
                </div>
              </div>
            )}

            {/* Fitts's Law: Sticky primary action bar at bottom of rail */}
            {canAccept && currentVersion && (
              <div className="border-t border-border pt-3 sticky bottom-4">
                <div className="rounded-lg border border-primary/30 bg-background shadow-md p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">Reviewing v{currentVersion.version_number}. Accept to queue payout.</div>
                  <Button
                    className="w-full h-12 text-sm font-semibold"
                    onClick={() => onBuyerAccept?.(currentVersion.vault_item_id)}
                  >
                    <CheckCircle2 className="size-4" /> Accept milestone
                  </Button>
                  {canRequestRevision && (
                    <Button variant="outline" className="w-full h-10 text-sm" onClick={() => {
                      const row = document.querySelector(`[data-version-id="${currentVersion.vault_item_id}"] [data-revision-btn]`) as HTMLButtonElement;
                      row?.click();
                    }}>
                      <RefreshCw className="size-3.5" /> Request revision
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Buyer blocked reason with recovery */}
            {isBuyer && buyerBlockedReason && (state === "submitted_for_review" || state === "resubmitted") === false && state !== "empty" && state !== "accepted" && (
              <div className="border-t border-border pt-3">
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="size-3.5 inline mr-1" />
                  <strong>Cannot accept:</strong> {buyerBlockedReason}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function VaultVersionRow({
  item, isCurrent, isAccepted, isRejected, isImmutable,
  canPreview, canDownload, canAccept, canRequestRevision,
  onAccept, onRequestRevision,
}: {
  item: VaultItem;
  isCurrent: boolean;
  isAccepted: boolean;
  isRejected: boolean;
  isImmutable: boolean;
  canPreview: boolean;
  canDownload: boolean;
  canAccept: boolean;
  canRequestRevision: boolean;
  onAccept: () => void;
  onRequestRevision: (reason: string, criterion: string) => void;
}) {
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [revisionReason, setRevisionReason] = React.useState("");
  const [revisionCriterion, setRevisionCriterion] = React.useState("");
  const locked = !canPreview && item.review_status !== "not_submitted";

  return (
    <div data-version-id={item.vault_item_id} className={cn(
      "rounded-lg border overflow-hidden transition-all",
      isCurrent ? "border-primary ring-1 ring-primary/20" : "border-border",
      isAccepted && "border-emerald-300 dark:border-emerald-800",
      isRejected && "border-red-300 dark:border-red-800 opacity-75",
    )}>
      {/* Version header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="text-[10px] shrink-0">v{item.version_number}</Badge>
          {isCurrent && <Badge className="text-[10px] bg-primary text-primary-foreground shrink-0">Current</Badge>}
          {isAccepted && <Badge className="text-[10px] bg-emerald-500 text-white shrink-0"><CheckCircle2 className="size-2.5" /> Accepted</Badge>}
          {isRejected && <Badge className="text-[10px] bg-red-500 text-white shrink-0"><XCircle className="size-2.5" /> Rejected</Badge>}
          {isImmutable && !isAccepted && !isRejected && <Badge variant="outline" className="text-[10px] shrink-0"><Lock className="size-2.5" /> Immutable</Badge>}
          <span className="text-xs text-muted-foreground truncate">{item.submitted_by} · {new Date(item.submitted_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        {item.replaces_vault_item_id && <Badge variant="outline" className="text-[10px] shrink-0">Replaces v{item.version_number - 1}</Badge>}
      </div>

      {/* File/asset card */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="relative shrink-0 w-14 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {item.source_type === "design_link" || item.source_type === "staging_link" || item.source_type === "external_link" ? (
            <AssetTypeIcon type={item.source_type} className="size-5 text-muted-foreground" />
          ) : (
            <>
              <div className={cn("absolute inset-0 transition-all", locked && "blur-md")}>
                <div className="flex items-center justify-center h-full">
                  <AssetTypeIcon type={item.source_type} className="size-5 text-muted-foreground/60" />
                </div>
              </div>
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Lock className="size-3 text-foreground/60" />
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.file_name_or_link_title}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{assetTypeLabel(item.source_type)}</span>
            {item.file_size && <span>· {item.file_size}</span>}
            <span>· {item.content_type}</span>
          </div>
          {item.submission_note && <div className="text-xs text-muted-foreground mt-0.5 italic">"{item.submission_note}"</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Scan status */}
          <ScanBadge status={item.scan_status} />
          {/* Actions */}
          {canDownload ? (
            <Button size="sm" variant="ghost"><Download className="size-3.5" /></Button>
          ) : canPreview ? (
            <Button size="sm" variant="ghost"><Eye className="size-3.5" /></Button>
          ) : locked ? (
            <Button size="sm" variant="ghost" disabled><Lock className="size-3.5" /></Button>
          ) : null}
        </div>
      </div>

      {/* Revision reason */}
      {isRejected && item.revision_reason && (
        <div className="px-3 py-2 border-t border-border bg-red-50 dark:bg-red-950/20 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="size-3 inline mr-1" />
          <strong>Revision requested:</strong> {item.revision_reason}
        </div>
      )}

      {/* Buyer actions */}
      {(canAccept || canRequestRevision) && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/30">
          {canAccept && <Button size="sm" onClick={onAccept}><CheckCircle2 className="size-3.5" /> Accept milestone</Button>}
          {canRequestRevision && !revisionOpen && (
            <Button size="sm" variant="outline" data-revision-btn onClick={() => setRevisionOpen(true)}><RefreshCw className="size-3.5" /> Request revision</Button>
          )}
          {canRequestRevision && revisionOpen && (
            <div className="w-full space-y-2">
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                value={revisionCriterion}
                onChange={(e) => setRevisionCriterion(e.target.value)}
              >
                <option value="">Select acceptance criterion…</option>
                <option value="all">All criteria</option>
              </select>
              <textarea
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                rows={2}
                placeholder="Describe what does not meet the criteria…"
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setRevisionOpen(false); setRevisionReason(""); setRevisionCriterion(""); }}>Cancel</Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!revisionReason.trim() || !revisionCriterion}
                  onClick={() => { onRequestRevision(revisionReason, revisionCriterion); setRevisionOpen(false); setRevisionReason(""); setRevisionCriterion(""); }}
                >
                  Submit revision request
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScanBadge({ status }: { status: VaultItem["scan_status"] }) {
  if (status === "clean") return <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck className="size-2.5" /> Clean</Badge>;
  if (status === "scanning") return <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300"><Loader2 className="size-2.5 animate-spin" /> Scanning</Badge>;
  if (status === "flagged") return <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"><ShieldAlert className="size-2.5" /> Flagged</Badge>;
  return <Badge variant="outline" className="text-[10px]"><Clock className="size-2.5" /> Pending</Badge>;
}

function ProSubmitBar({ canAddDraft, onAddDraft, onSubmit }: { canAddDraft: boolean; onAddDraft: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = React.useState("");
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {canAddDraft && <Button size="sm" variant="outline" onClick={onAddDraft}><Upload className="size-3.5" /> Add evidence</Button>}
        <Button size="sm" onClick={() => { onSubmit(note); setNote(""); }} className="ml-auto">
          <CheckCircle2 className="size-3.5" /> Submit for review
        </Button>
      </div>
      <textarea
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
        rows={2}
        placeholder="Submission note (optional) — describe what's included in this version…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <p className="text-[10px] text-muted-foreground">Submitting creates an immutable version. The Buyer will be notified and can review, request revision, or accept.</p>
    </div>
  );
}

function createDraftItem(contractId: string, milestoneId: string, submittedBy: string): Omit<VaultItem, "vault_item_id" | "submitted_at" | "version_number" | "activity_log"> {
  return {
    contract_id: contractId,
    milestone_id: milestoneId,
    submitted_by: submittedBy,
    asset_type: "file",
    file_name_or_link_title: "New deliverable",
    content_type: "application/octet-stream",
    source_type: "file",
    preview_status: "pending",
    scan_status: "pending",
    access_policy: "contract_parties",
    submission_note: "",
    review_status: "not_submitted",
    retention_hold_status: "none",
  };
}

function AssetTypeIcon({ type, className }: { type: VaultAssetType; className?: string }) {
  switch (type) {
    case "external_link": return <Link2 className={className} />;
    case "repository": return <Github className={className} />;
    case "staging_link": return <ExternalLink className={className} />;
    case "design_link": return <Figma className={className} />;
    case "document_link": return <FileText className={className} />;
    case "file": return <FileText className={className} />;
    default: return <FileText className={className} />;
  }
}
