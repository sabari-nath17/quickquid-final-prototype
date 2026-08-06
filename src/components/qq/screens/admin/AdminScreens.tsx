"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PageHeader, SectionCard, EmptyState, MaskedField, SLATimer, AuditRow,
} from "@/components/qq/shared";
import { StatusBadge, statusMeta } from "@/components/qq/shared/StatusBadge";
import { PermissionMatrix } from "@/components/qq/shared/EvidenceDropzone";
import { QueueTable, type QueueColumn } from "@/components/qq/shared/QueueTable";
import { formatINR, formatDate, formatDateTime, timeAgo, hoursSince, PAYMENT_REJECTION_REASONS, GIG_MODERATION_REASONS } from "@/lib/qq/format";
import type {
  Role, AuditEvent, KycSubmission, PaymentEvidence, Payout, Refund, Dispute,
  GigDraft, OfflineInstrument, TrustSafetyCase,
} from "@/lib/qq/types";
import {
  ShieldCheck, ShieldAlert, Clock, AlertTriangle, CheckCircle2, XCircle,
  Eye, EyeOff, FileText, Banknote, ArrowRight, ArrowLeft, Lock, PauseCircle,
  PlayCircle, UserX, Scale, FileSearch, Send, Ban,
  Landmark, Receipt, Wallet, FileWarning, FileCheck2,
  DownloadCloud, AlertOctagon, Gavel, Hourglass, BadgeCheck, Info, UserCog,
  ChevronRight, MessageSquareOff, Fingerprint, ScrollText, ListChecks,
} from "lucide-react";

// ===================== Helpers =====================

const ROLE_LABELS: Record<Role, string> = {
  visitor: "Visitor",
  buyer: "Buyer",
  pro: "Pro",
  admin_support: "Support (T1)",
  finance: "Finance (T2)",
  risk: "Risk (T3)",
  ops_manager: "Ops Manager",
};

function canVerifyPayments(r: Role) { return r === "finance"; }
function canTriggerPayouts(r: Role) { return r === "finance"; }
function canProcessRefunds(r: Role) { return r === "finance"; }
function canSuspend(r: Role) { return r === "risk"; }
function canMakeRiskDecisions(r: Role) { return r === "risk"; }
function canMediateDisputes(r: Role) { return r === "risk" || r === "ops_manager"; }
function canReassign(r: Role) { return r === "ops_manager"; }
function canProcessKyc(r: Role) { return r === "admin_support" || r === "ops_manager"; }
function canViewAudit(r: Role) { return r === "finance" || r === "risk" || r === "ops_manager"; }
function canExportPayoutBatches(r: Role) { return r === "finance" || r === "ops_manager"; }
function canModerateGigs(r: Role) { return r === "admin_support" || r === "ops_manager"; }
function canRevealMasked(r: Role) { return r === "risk" || r === "finance" || r === "ops_manager"; }
function canManageDeletionExport(r: Role) { return r === "risk" || r === "ops_manager"; }

function PermissionDenied({ action, allowedRoles }: { action: string; allowedRoles: Role[] }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 flex items-start gap-2">
      <Lock className="size-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <div className="text-sm">
        <div className="font-medium text-amber-800 dark:text-amber-300">Permission denied</div>
        <p className="text-amber-700 dark:text-amber-400 mt-0.5">
          {action} requires: {allowedRoles.map((r) => ROLE_LABELS[r]).join(" or ")}. Your current role cannot perform this action.
        </p>
      </div>
    </div>
  );
}

function RolePill({ role }: { role: Role }) {
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {ROLE_LABELS[role]}
    </Badge>
  );
}

/** Generic reason modal — used by reject / escalate / request-info flows */
function ReasonDialog({
  open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm,
  options, destructive = false, placeholder = "Provide a reason (recorded in audit log)",
  requireOption = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: (reason: string, option?: string) => void;
  options?: string[];
  destructive?: boolean;
  placeholder?: string;
  requireOption?: boolean;
}) {
  const [reason, setReason] = React.useState("");
  const [option, setOption] = React.useState<string | undefined>(options?.[0]);
  React.useEffect(() => { if (open) { setReason(""); setOption(options?.[0]); } }, [open, options]);
  const valid = requireOption ? !!option && reason.trim().length > 0 : reason.trim().length > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3">
          {options && (
            <div className="space-y-1.5">
              <Label>Reason category</Label>
              <Select value={option} onValueChange={setOption}>
                <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason / note</Label>
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={placeholder} />
            <p className="text-xs text-muted-foreground">This reason is recorded in the immutable audit log with your role and timestamp.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!valid}
            onClick={() => { onConfirm(reason.trim(), option); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Generic confirm modal — used for approve / execute / pause / etc */
function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm, destructive = false, children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={() => { onConfirm(); onOpenChange(false); }}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** SLA tone computation from createdAt + target hours */
function slaTone(createdAt: string, targetHours: number): "success" | "pending" | "warning" | "critical" {
  const h = hoursSince(createdAt);
  if (h >= targetHours * 2) return "critical";
  if (h >= targetHours) return "warning";
  if (h >= targetHours * 0.7) return "pending";
  return "success";
}

function slaLabel(createdAt: string, targetHours: number): string {
  const h = hoursSince(createdAt);
  if (h >= targetHours * 2) return `Breached >${targetHours * 2}h`;
  if (h >= targetHours) return `Breached ${h}h/${targetHours}h`;
  if (h >= targetHours * 0.7) return `Approaching ${h}h/${targetHours}h`;
  return `${h}h / ${targetHours}h`;
}

// ===================== 1. AdminOperations =====================

type UnifiedRow = {
  id: string;
  ref: string;
  user: string;
  contract?: string;
  amount?: number;
  status: string;
  owner?: string;
  createdAt: string;
  targetHours: number;
  riskFlags: string[];
  nextAction: string;
  kind: "kyc" | "payment" | "payout" | "refund" | "dispute" | "trust" | "support";
  navigateView: string;
};

export function AdminOperations() {
  const { kyc, payments, payouts, refunds, disputes, trustCases, tickets, currentRole, navigate } = useQQ();

  const openKyc = kyc.filter((k) => k.status === "under_review" || k.status === "submitted");
  const openPayments = payments.filter((p) => p.status === "under_admin_verification" || p.status === "payment_evidence_submitted" || p.status === "more_info_requested");
  const openPayouts = payouts.filter((p) => p.status !== "processed" && p.status !== "failed");
  const openRefunds = refunds.filter((r) => r.status !== "rejected" && r.status !== "executed");
  const openDisputes = disputes.filter((d) => d.status !== "resolved");
  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const openTrust = trustCases.filter((t) => t.status !== "restored");
  const slaBreaches = [
    ...openKyc.filter((k) => hoursSince(k.submittedAt) > 24),
    ...openPayments.filter((p) => hoursSince(p.submittedAt) > p.targetReviewHours),
    ...openDisputes.filter((d) => hoursSince(d.slaOpenedAt) > 168),
  ];

  const cards = [
    { title: "KYC review", count: openKyc.length, oldest: openKyc[0]?.submittedAt, team: "Support / Risk", target: 24, view: "admin_kyc", role: "admin_support" as Role, tone: "info" as const },
    { title: "Payment verification", count: openPayments.length, oldest: openPayments[0]?.submittedAt, team: "Finance T2", target: 24, view: "admin_payments", role: "finance" as Role, tone: "pending" as const },
    { title: "Payouts", count: openPayouts.length, oldest: openPayouts[0]?.queuedAt, team: "Finance T2", target: 48, view: "admin_payouts", role: "finance" as Role, tone: "info" as const },
    { title: "Refunds", count: openRefunds.length, oldest: openRefunds[0]?.createdAt, team: "Finance T2", target: 72, view: "admin_refunds", role: "finance" as Role, tone: "info" as const },
    { title: "Disputes", count: openDisputes.length, oldest: openDisputes[0]?.slaOpenedAt, team: "Risk / Ops", target: 120, view: "admin_disputes", role: "risk" as Role, tone: "warning" as const },
    { title: "Support", count: openTickets.length, oldest: openTickets[0]?.createdAt, team: "Support T1", target: 24, view: "support", role: "admin_support" as Role, tone: "info" as const },
    { title: "Trust & Safety", count: openTrust.length, oldest: openTrust[0]?.createdAt, team: "Risk T3", target: 48, view: "admin_trust", role: "risk" as Role, tone: "critical" as const },
    { title: "SLA breaches", count: slaBreaches.length, oldest: undefined, team: "Ops Manager", target: 0, view: "admin_audit", role: "ops_manager" as Role, tone: "critical" as const },
  ];

  // Emphasise per role
  const emphasis: Record<Role, string[]> = {
    finance: ["Payment verification", "Payouts", "Refunds"],
    risk: ["Disputes", "Trust & Safety"],
    admin_support: ["KYC review", "Support"],
    ops_manager: [],
    visitor: [], buyer: [], pro: [],
  };
  const emphasised = emphasis[currentRole] ?? [];

  // Build unified rows
  const rows: UnifiedRow[] = [
    ...openKyc.map<UnifiedRow>((k) => ({
      id: k.id, ref: k.id, user: k.userName, contract: undefined, amount: undefined,
      status: k.status, owner: k.riskFlag ? "Risk T3" : "Support T1", createdAt: k.submittedAt, targetHours: 24,
      riskFlags: k.riskFlag ? [k.riskFlag.signal] : [], nextAction: k.riskFlag ? "Investigate risk signal" : "Review & approve/reject",
      kind: "kyc", navigateView: "admin_kyc",
    })),
    ...openPayments.map<UnifiedRow>((p) => ({
      id: p.id, ref: p.id, user: "Buyer", contract: p.contractId, amount: p.amountDue,
      status: p.status, owner: "Finance T2", createdAt: p.submittedAt, targetHours: p.targetReviewHours,
      riskFlags: [], nextAction: "Match bank evidence",
      kind: "payment", navigateView: "admin_payments",
    })),
    ...openPayouts.map<UnifiedRow>((p) => ({
      id: p.id, ref: p.id, user: p.proName, contract: p.contractId, amount: p.netPayout,
      status: p.status, owner: "Finance T2", createdAt: p.queuedAt, targetHours: 48,
      riskFlags: [], nextAction: p.status === "queued" ? "Maker confirm" : p.status === "maker_confirmed" ? "Checker authorize" : "Process batch",
      kind: "payout", navigateView: "admin_payouts",
    })),
    ...openRefunds.map<UnifiedRow>((r) => ({
      id: r.id, ref: r.id, user: r.buyerName, contract: r.contractId, amount: r.amount,
      status: r.status, owner: "Finance T2", createdAt: r.createdAt, targetHours: 72,
      riskFlags: [], nextAction: r.status === "requested" ? "Approve" : "Execute & attach proof",
      kind: "refund", navigateView: "admin_refunds",
    })),
    ...openDisputes.map<UnifiedRow>((d) => ({
      id: d.id, ref: d.id, user: d.raisedByName, contract: d.contractId, amount: undefined,
      status: d.status, owner: d.owner ?? "Unassigned", createdAt: d.slaOpenedAt, targetHours: 168,
      riskFlags: [], nextAction: hoursSince(d.slaOpenedAt) > 168 ? "Escalate Ops" : "Request evidence / mediate",
      kind: "dispute", navigateView: "admin_disputes",
    })),
    ...openTrust.map<UnifiedRow>((t) => ({
      id: t.id, ref: t.id, user: t.complainant, contract: undefined, amount: undefined,
      status: t.status, owner: t.owner ?? "Unassigned", createdAt: t.createdAt, targetHours: 48,
      riskFlags: t.urgency === "critical" ? ["Critical urgency"] : [], nextAction: "Investigate / restrict / suspend",
      kind: "trust", navigateView: "admin_trust",
    })),
  ];

  const columns: QueueColumn<UnifiedRow>[] = [
    { key: "ref", header: "Reference", render: (r) => <span className="font-mono text-xs font-medium">{r.ref}</span> },
    { key: "user", header: "User", render: (r) => <span className="truncate">{r.user}</span> },
    { key: "contract", header: "Contract", render: (r) => r.contract ? <span className="font-mono text-xs">{r.contract}</span> : <span className="text-muted-foreground">—</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (r) => r.amount ? <span className="tabular-nums">{formatINR(r.amount)}</span> : <span className="text-muted-foreground">—</span>, hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge tone={statusMeta(r.status).tone}>{statusMeta(r.status).label}</StatusBadge> },
    { key: "owner", header: "Owner", render: (r) => <span className="text-xs">{r.owner ?? "—"}</span>, hideOnMobile: true },
    { key: "created", header: "Created", render: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>, hideOnMobile: true },
    { key: "pending", header: "Pending", render: (r) => <StatusBadge tone={slaTone(r.createdAt, r.targetHours)} icon={false}>{slaLabel(r.createdAt, r.targetHours)}</StatusBadge> },
    { key: "risk", header: "Risk flags", render: (r) => r.riskFlags.length ? <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-300"><AlertTriangle className="size-3" />{r.riskFlags.length}</Badge> : <span className="text-muted-foreground">—</span>, hideOnMobile: true },
    { key: "next", header: "Next action", render: (r) => <span className="text-xs">{r.nextAction}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations dashboard"
        description="Live queue health across all admin functions. Money movement and high-risk actions remain permission-gated with maker-checker and audit events."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      {emphasised.length > 0 && (
        <Card className="p-3 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4 text-primary" />
            <span>Your role typically owns: <strong>{emphasised.join(", ")}</strong>. Other queues are visible but action-gated.</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => {
          const tone = c.count === 0 ? "success" : c.tone;
          const isEmphasised = emphasised.includes(c.title);
          const oldestLabel = c.oldest ? slaLabel(c.oldest, c.target || 24) : "—";
          return (
            <Card key={c.title} className={cn("p-4 flex flex-col gap-2", isEmphasised && "ring-1 ring-primary/40")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">{c.title}</div>
                  <div className="text-2xl font-semibold tabular-nums">{c.count}</div>
                </div>
                <StatusBadge tone={tone} icon={false}>{c.count === 0 ? "Clear" : c.count > 5 ? "Heavy" : "Open"}</StatusBadge>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>Oldest: <span className="text-foreground font-medium">{oldestLabel}</span></div>
                <div>Team: <span className="text-foreground">{c.team}</span></div>
              </div>
              <Button size="sm" variant="outline" className="mt-auto w-full min-h-[44px]" onClick={() => navigate(c.view as never)}>
                Open queue <ArrowRight className="size-3.5" />
              </Button>
            </Card>
          );
        })}
      </div>

      <SectionCard
        title="Unified SLA queue"
        description="All open items across queues. SLA states: normal · approaching · breached · escalation-due. Click a row to open the relevant queue."
      >
        <QueueTable
          columns={columns}
          rows={rows}
          onRowClick={(r) => navigate(r.navigateView as never)}
          emptyMessage="No open items. All queues are clear."
          slaKey={(r) => ({ tone: slaTone(r.createdAt, r.targetHours), label: slaLabel(r.createdAt, r.targetHours) })}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><StatusBadge tone="success" icon={false}>Normal</StatusBadge> &lt; 70% of SLA</span>
          <span className="inline-flex items-center gap-1"><StatusBadge tone="pending" icon={false}>Approaching</StatusBadge> 70–100%</span>
          <span className="inline-flex items-center gap-1"><StatusBadge tone="warning" icon={false}>Breached</StatusBadge> &gt; 100%</span>
          <span className="inline-flex items-center gap-1"><StatusBadge tone="critical" icon={false}>Escalation due</StatusBadge> &gt; 200%</span>
        </div>
      </SectionCard>

      <SectionCard title="Maker-checker & audit policy" description="Applies to all money movement and high-risk actions in v0.1.">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> Maker confirms; Checker authorizes. Both identities + timestamps are recorded in audit.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> Threshold configurable (currently <strong>₹25,000</strong> net payout). Below threshold single-approval; above requires checker.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> Ops Manager must not bypass maker-checker without documented authorization.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> PAN / account / IFSC masked by default. Reveal requires authorized role + reason + audit event.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> No raw bank details in general tables — beneficiary token (e.g. <code className="font-mono">BNF-7781</code>) only.</li>
        </ul>
      </SectionCard>
    </div>
  );
}

// ===================== 2. AdminKyc =====================

export function AdminKyc() {
  const {
    kyc, currentRole, currentUserId, audit,
    updateKyc, updateProProfile, addAudit, navigate,
  } = useQQ();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"queue" | "risk" | "deletion" | "export">("queue");
  const [reveal, setReveal] = React.useState<{ field: string } | null>(null);
  const [revealReasonOpen, setRevealReasonOpen] = React.useState(false);
  const [revealedFields, setRevealedFields] = React.useState<Record<string, boolean>>({});

  const selected = kyc.find((k) => k.id === selectedId) ?? null;

  function logAudit(action: string, entityId: string, oldStatus?: string, newStatus?: string, reason?: string, maskedReveal = false) {
    addAudit({
      adminId: currentUserId ?? "",
      adminRole: currentRole,
      action, entity: "KYC", entityId, oldStatus, newStatus, reason, maskedReveal,
    });
  }

  function approve() {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "approved", resolvedAt: new Date().toISOString() });
    if (selected.role === "pro") updateProProfile(selected.userId, { payoutReadiness: "approved" });
    logAudit("KYC approved", selected.id, oldStatus, "approved", "Identity & payout details verified");
    toast({ title: "KYC approved", description: `${selected.userName} can now submit paid-work proposals.` });
    setSelectedId(null);
  }

  function reject(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "rejected", rejectionReason: reason, resolvedAt: new Date().toISOString(), identityDocStatus: "rejected" });
    logAudit("KYC rejected", selected.id, oldStatus, "rejected", reason);
    toast({ title: "KYC rejected", description: reason, variant: "destructive" });
  }

  function escalate(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "under_review" });
    logAudit("KYC escalated to Risk", selected.id, oldStatus, "under_review", reason);
    toast({ title: "Escalated to Risk T3", description: "Risk team will investigate." });
  }

  function requestMoreInfo(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "pending_reverification" });
    logAudit("KYC more info requested", selected.id, oldStatus, "pending_reverification", reason);
    toast({ title: "More info requested", description: "User notified to resubmit." });
  }

  function doReveal(field: string, reason: string) {
    if (!selected) return;
    setRevealedFields((s) => ({ ...s, [field]: true }));
    logAudit(`Masked reveal: ${field}`, selected.id, undefined, undefined, reason, true);
    toast({ title: "Field revealed", description: "Reveal recorded in audit log." });
  }

  const kycColumns: QueueColumn<KycSubmission>[] = [
    { key: "id", header: "Ref", render: (k) => <span className="font-mono text-xs font-medium">{k.id}</span> },
    { key: "user", header: "User", render: (k) => <span>{k.userName}</span> },
    { key: "role", header: "Role", render: (k) => <Badge variant="outline" className="text-xs">{k.role}</Badge>, hideOnMobile: true },
    { key: "doc", header: "Identity doc", render: (k) => <span className="text-xs">{k.identityDocName}</span>, hideOnMobile: true },
    { key: "status", header: "Status", render: (k) => <StatusBadge tone={statusMeta(k.status).tone}>{statusMeta(k.status).label}</StatusBadge> },
    { key: "risk", header: "Risk", render: (k) => k.riskFlag ? <Badge variant="outline" className="border-amber-300 text-amber-700"><AlertTriangle className="size-3" />Flagged</Badge> : <span className="text-muted-foreground">—</span> },
    { key: "submitted", header: "Submitted", render: (k) => <span className="text-xs text-muted-foreground">{timeAgo(k.submittedAt)}</span>, hideOnMobile: true },
    { key: "sla", header: "SLA", render: (k) => <StatusBadge tone={slaTone(k.submittedAt, 24)} icon={false}>{slaLabel(k.submittedAt, 24)}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC review"
        description="Identity & payout verification queue. PAN, account, IFSC masked by default — reveal requires authorized role + reason + audit event."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="queue">KYC queue</TabsTrigger>
          <TabsTrigger value="risk">Risk flag view (01.6)</TabsTrigger>
          <TabsTrigger value="deletion">Account deletion (12.11)</TabsTrigger>
          <TabsTrigger value="export">Data export (12.12)</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4 mt-4">
          <SectionCard>
            <QueueTable
              columns={kycColumns}
              rows={kyc}
              onRowClick={(k) => setSelectedId(k.id)}
              slaKey={(k) => ({ tone: slaTone(k.submittedAt, 24), label: slaLabel(k.submittedAt, 24) })}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <RiskFlagView />
        </TabsContent>

        <TabsContent value="deletion" className="mt-4">
          <AccountDeletionPanel />
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <DataExportPanel />
        </TabsContent>
      </Tabs>

      {/* Detail drawer */}
      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  KYC review · <span className="font-mono text-base">{selected.id}</span>
                </SheetTitle>
                <SheetDescription>{selected.userName} · {ROLE_LABELS[selected.role]} · Submitted {timeAgo(selected.submittedAt)}</SheetDescription>
              </SheetHeader>

              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  {selected.riskFlag && (
                    <Badge variant="outline" className="border-amber-300 text-amber-700"><AlertTriangle className="size-3" />Risk flag</Badge>
                  )}
                  <SLATimer openedAt={selected.submittedAt} targetHours={24} breachedAtHours={24} escalateAtHours={48} />
                </div>

                {selected.riskFlag && (
                  <Card className="p-3 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
                    <div className="flex items-start gap-2">
                      <Fingerprint className="size-4 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <div className="text-sm">
                        <div className="font-medium text-amber-800 dark:text-amber-300">Risk signal</div>
                        <p className="text-amber-700 dark:text-amber-400 mt-0.5">{selected.riskFlag.signal}</p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div><div className="text-muted-foreground">Confidence</div><div className="font-medium">{Math.round(selected.riskFlag.confidence * 100)}%</div></div>
                          <div><div className="text-muted-foreground">Prior status</div><div className="font-medium">{selected.riskFlag.priorAccountStatus}</div></div>
                          <div><div className="text-muted-foreground">Signal hash</div><div className="font-mono">{selected.riskFlag.hashedSignal}</div></div>
                        </div>
                        <p className="mt-2 text-xs">This is a signal, not a decision. Raw identifiers are never displayed — only the hashed pattern.</p>
                      </div>
                    </div>
                  </Card>
                )}

                <SectionCard title="Identity document">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="size-4 text-muted-foreground" />
                      <span>{selected.identityDocName}</span>
                      <StatusBadge tone={selected.identityDocStatus === "uploaded" ? "pending" : "rejected"}>{selected.identityDocStatus}</StatusBadge>
                    </div>
                    <Button size="sm" variant="outline" disabled>Preview masked</Button>
                  </div>
                </SectionCard>

                <SectionCard title="Payout details (masked)" description="Reveal requires an authorized role and a reason. Each reveal is audited.">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <MaskedField
                      label="Beneficiary name"
                      value={selected.beneficiaryName}
                      masked={false}
                    />
                    <MaskedField
                      label="PAN"
                      value={revealedFields["PAN"] ? selected.panMasked.replace(/•/g, "X") : selected.panMasked}
                      masked={!revealedFields["PAN"]}
                      canReveal={canRevealMasked(currentRole)}
                      onReveal={() => { setReveal({ field: "PAN" }); setRevealReasonOpen(true); }}
                      onUnmask={() => setRevealedFields((s) => ({ ...s, PAN: false }))}
                    />
                    <MaskedField
                      label="Account number"
                      value={revealedFields["Account"] ? selected.accountNumberMasked.replace(/•/g, "X") : selected.accountNumberMasked}
                      masked={!revealedFields["Account"]}
                      canReveal={canRevealMasked(currentRole)}
                      onReveal={() => { setReveal({ field: "Account" }); setRevealReasonOpen(true); }}
                      onUnmask={() => setRevealedFields((s) => ({ ...s, Account: false }))}
                    />
                    <MaskedField
                      label="IFSC"
                      value={revealedFields["IFSC"] ? selected.ifscMasked.replace(/•/g, "X") : selected.ifscMasked}
                      masked={!revealedFields["IFSC"]}
                      canReveal={canRevealMasked(currentRole)}
                      onReveal={() => { setReveal({ field: "IFSC" }); setRevealReasonOpen(true); }}
                      onUnmask={() => setRevealedFields((s) => ({ ...s, IFSC: false }))}
                    />
                  </div>
                  {!canRevealMasked(currentRole) && (
                    <div className="mt-3"><PermissionDenied action="Reveal masked payout fields" allowedRoles={["risk", "finance", "ops_manager"]} /></div>
                  )}
                </SectionCard>

                <SectionCard title="Audit history" description="Recent events for this KYC submission.">
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canProcessKyc(currentRole) ? (
                  <PermissionDenied action="KYC approve / reject / request info" allowedRoles={["admin_support", "ops_manager"]} />
                ) : (
                  <>
                    <Button className="flex-1 min-h-[44px]" onClick={approve}><CheckCircle2 className="size-4" /> Approve</Button>
                    <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setRejectOpen(true)}><XCircle className="size-4" /> Reject</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setMoreInfoOpen(true)}><FileSearch className="size-4" /> Request info</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setEscalateOpen(true)}><ShieldAlert className="size-4" /> Escalate to Risk</Button>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReasonDialog
        open={rejectOpen} onOpenChange={setRejectOpen}
        title="Reject KYC submission"
        description="User will be asked to resubmit. The reason is shown to the user and recorded in audit."
        confirmLabel="Reject submission" destructive
        options={[
          "Image is too blurry. Upload a clearer document.",
          "Document cropped — full document required.",
          "Name on document does not match beneficiary name.",
          "Document expired — upload a current document.",
          "Suspected fraudulent document.",
        ]}
        placeholder="Add a clear reason for the user"
        onConfirm={(reason, option) => reject(option ?? reason)}
      />
      <ReasonDialog
        open={escalateOpen} onOpenChange={setEscalateOpen}
        title="Escalate to Risk T3"
        description="Case will be assigned to Risk for deeper investigation. Provide rationale for escalation."
        confirmLabel="Escalate to Risk"
        onConfirm={(reason) => escalate(reason)}
      />
      <ReasonDialog
        open={moreInfoOpen} onOpenChange={setMoreInfoOpen}
        title="Request more information"
        description="User will be asked to provide additional detail or resubmit."
        confirmLabel="Request info"
        onConfirm={(reason) => requestMoreInfo(reason)}
      />
      <ReasonDialog
        open={revealReasonOpen} onOpenChange={setRevealReasonOpen}
        title={`Reveal ${reveal?.field ?? "field"}`}
        description="Revealing sensitive data creates an immutable audit event with your role and timestamp."
        confirmLabel="Reveal & audit"
        onConfirm={(reason) => { if (reveal) doReveal(reveal.field, reason); }}
      />
    </div>
  );
}

function RiskFlagView() {
  const { kyc, audit, currentRole, currentUserId, updateKyc, updateProProfile, addAudit } = useQQ();
  const { toast } = useToast();
  const flagged = kyc.filter((k) => k.riskFlag);
  const [selectedId, setSelectedId] = React.useState<string | null>(flagged[0]?.id ?? null);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [approveReasonOpen, setApproveReasonOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);

  const selected = kyc.find((k) => k.id === selectedId) ?? null;

  function logAudit(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "KYC", entityId, oldStatus, newStatus, reason });
  }

  function investigate() {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "under_review" });
    logAudit("Risk investigation opened", selected.id, oldStatus, "under_review", "Manual risk review");
    toast({ title: "Investigation opened", description: "Case is now under manual risk review." });
  }
  function requestInfo(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "pending_reverification" });
    logAudit("Risk: information requested", selected.id, oldStatus, "pending_reverification", reason);
    toast({ title: "Information requested" });
  }
  function reject(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "rejected", rejectionReason: reason, resolvedAt: new Date().toISOString() });
    logAudit("Risk: KYC rejected", selected.id, oldStatus, "rejected", reason);
    toast({ title: "KYC rejected", variant: "destructive" });
  }
  function approveWithRationale(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateKyc(selected.id, { status: "approved", resolvedAt: new Date().toISOString() });
    if (selected.role === "pro") updateProProfile(selected.userId, { payoutReadiness: "approved" });
    logAudit("Risk: KYC approved with rationale", selected.id, oldStatus, "approved", reason);
    toast({ title: "Approved with documented rationale" });
  }

  return (
    <SectionCard title="Risk flag view (Screen 01.6)" description="Risk signals are never displayed as raw identifiers. Hashed pattern + confidence + prior account status only.">
      {flagged.length === 0 ? (
        <EmptyState title="No risk-flagged submissions" description="KYC submissions with a duplicate device/network signal will appear here." icon={Fingerprint} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            {flagged.map((k) => (
              <Card key={k.id} className={cn("p-3 cursor-pointer hover:border-primary/40", selectedId === k.id && "ring-1 ring-primary")} onClick={() => setSelectedId(k.id)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{k.id}</span>
                  <Badge variant="outline" className="border-amber-300 text-amber-700">{Math.round((k.riskFlag?.confidence ?? 0) * 100)}%</Badge>
                </div>
                <div className="text-sm font-medium mt-1">{k.userName}</div>
                <div className="text-xs text-muted-foreground">{k.riskFlag?.signal}</div>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-4">
            {selected && selected.riskFlag && (
              <>
                <Card className="p-4 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
                  <div className="flex items-start gap-2">
                    <Fingerprint className="size-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="text-sm flex-1">
                      <div className="font-medium text-amber-800 dark:text-amber-300">Risk signal: {selected.riskFlag.signal}</div>
                      <div className="grid sm:grid-cols-3 gap-3 mt-3 text-xs">
                        <div><div className="text-muted-foreground">Confidence</div><div className="text-base font-semibold">{Math.round(selected.riskFlag.confidence * 100)}%</div></div>
                        <div><div className="text-muted-foreground">Prior account</div><div className="font-medium">{selected.riskFlag.priorAccountStatus}</div></div>
                        <div><div className="text-muted-foreground">Signal hash</div><div className="font-mono">{selected.riskFlag.hashedSignal}</div></div>
                      </div>
                      <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">Raw identifiers (device ID, IP, PAN) are never displayed. Only the hashed signal pattern is shown. This is a signal, not a decision.</p>
                    </div>
                  </div>
                </Card>

                <SectionCard title="Audit history">
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>

                {canMakeRiskDecisions(currentRole) ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={investigate}><FileSearch className="size-4" /> Investigate</Button>
                    <Button variant="outline" onClick={() => setInfoOpen(true)}><Send className="size-4" /> Request information</Button>
                    <Button variant="destructive" onClick={() => setRejectOpen(true)}><XCircle className="size-4" /> Reject</Button>
                    <Button onClick={() => setApproveReasonOpen(true)}><CheckCircle2 className="size-4" /> Approve with rationale</Button>
                  </div>
                ) : (
                  <PermissionDenied action="Make risk decisions on flagged KYC" allowedRoles={["risk"]} />
                )}
              </>
            )}
          </div>
        </div>
      )}
      <ReasonDialog open={infoOpen} onOpenChange={setInfoOpen} title="Request information from user" confirmLabel="Request info" onConfirm={(r) => requestInfo(r)} />
      <ReasonDialog open={rejectOpen} onOpenChange={setRejectOpen} title="Reject KYC (risk)" description="Document the risk rationale for rejection." confirmLabel="Reject" destructive onConfirm={(r) => reject(r)} />
      <ReasonDialog open={approveReasonOpen} onOpenChange={setApproveReasonOpen} title="Approve with documented rationale" description="Approval requires a documented rationale that goes into the audit log." confirmLabel="Approve & document" onConfirm={(r) => approveWithRationale(r)} />
    </SectionCard>
  );
}

function AccountDeletionPanel() {
  const { users, contracts, payouts, refunds, disputes, currentRole, currentUserId, addAudit, updateProProfile } = useQQ();
  const { toast } = useToast();
  const [userId, setUserId] = React.useState<string>("");
  const [step, setStep] = React.useState<"request" | "obligations" | "deactivate" | "retain" | "purge" | "confirm">("request");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (!canManageDeletionExport(currentRole)) {
    return <SectionCard title="Account deletion (Screen 12.11)"><PermissionDenied action="Manage account deletion" allowedRoles={["risk", "ops_manager"]} /></SectionCard>;
  }

  const target = users.find((u) => u.id === userId);
  const activeContracts = contracts.filter((c) => (c.buyerId === userId || c.proId === userId) && c.status !== "completed" && c.status !== "cancelled");
  const pendingPayouts = payouts.filter((p) => p.proId === userId && p.status !== "processed" && p.status !== "failed");
  const pendingRefunds = refunds.filter((r) => r.buyerId === userId && r.status !== "executed" && r.status !== "rejected");
  const openDisputes = disputes.filter((d) => (d.raisedByName === target?.name) && d.status !== "resolved");

  const retentionCategories = [
    { type: "Identity verification records", retention: "Retained per regulatory KYC obligations (e.g. 5 years)", retainable: true },
    { type: "Transaction & payment ledger", retention: "Retained per financial record-keeping obligations", retainable: true },
    { type: "Audit log entries", retention: "Retained — audit log is immutable", retainable: true },
    { type: "Active contract obligations", retention: activeContracts.length ? `Blocked: ${activeContracts.length} active contract(s)` : "Eligible", retainable: activeContracts.length === 0 },
    { type: "Pending payouts / refunds", retention: (pendingPayouts.length + pendingRefunds.length) ? `Blocked: ${pendingPayouts.length + pendingRefunds.length} pending` : "Eligible", retainable: pendingPayouts.length + pendingRefunds.length === 0 },
    { type: "Profile, portfolio, messages", retention: "Eligible for purge", retainable: true },
  ];

  function reset() { setStep("request"); setUserId(""); }
  function deactivate() {
    if (!target) return;
    if (target.role === "pro") updateProProfile(target.id, { publicVisibility: false, availability: "paused" });
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action: "Account deactivation", entity: "User", entityId: target.id, oldStatus: "Active", newStatus: "Deactivated", reason: "User-initiated deletion request" });
    setStep("retain");
  }
  function purge() {
    if (!target) return;
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action: "Personal data purge", entity: "User", entityId: target.id, oldStatus: "Deactivated", newStatus: "Purged", reason: "Eligible personal data purged; retainable records held per policy" });
    toast({ title: "Eligible personal data purged", description: "Retainable records held per regulatory obligations." });
    setStep("confirm");
  }

  return (
    <SectionCard title="Account deletion (Screen 12.11)" description="Request → check obligations → deactivate → identify retainable records → purge eligible → confirm. Retention language is per record type.">
      <div className="grid lg:grid-cols-3 gap-4">
        <ol className="space-y-2 text-sm">
          {["Request received", "Check obligations", "Deactivate account", "Identify retainable records", "Purge eligible data", "Confirm completion"].map((s, i) => {
            const stepIdx = ["request", "obligations", "deactivate", "retain", "purge", "confirm"].indexOf(step);
            return (
              <li key={s} className={cn("flex items-center gap-2", i <= stepIdx ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-medium", i < stepIdx ? "bg-emerald-500 text-white" : i === stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i < stepIdx ? "✓" : i + 1}</span>
                {s}
              </li>
            );
          })}
        </ol>
        <div className="lg:col-span-2 space-y-4">
          {step === "request" && (
            <div className="space-y-3">
              <Label>Select user requesting deletion</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
                <SelectContent>
                  {users.filter((u) => u.role === "buyer" || u.role === "pro").map((u) => <SelectItem key={u.id} value={u.id}>{u.name} · {u.id}</SelectItem>)}
                </SelectContent>
              </Select>
              {target && (
                <Card className="p-3">
                  <div className="text-sm font-medium">{target.name}</div>
                  <div className="text-xs text-muted-foreground">{target.email} · {ROLE_LABELS[target.role]}</div>
                </Card>
              )}
              <Button disabled={!target} onClick={() => setStep("obligations")}>Check obligations <ArrowRight className="size-4" /></Button>
            </div>
          )}
          {step === "obligations" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Obligation check</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">{activeContracts.length === 0 ? <CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> : <XCircle className="size-4 mt-0.5 text-destructive" />} Active contracts: <strong>{activeContracts.length}</strong> {activeContracts.length > 0 && <span className="text-amber-700">(must resolve before deletion)</span>}</li>
                <li className="flex items-start gap-2">{pendingPayouts.length === 0 ? <CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> : <XCircle className="size-4 mt-0.5 text-destructive" />} Pending payouts: <strong>{pendingPayouts.length}</strong></li>
                <li className="flex items-start gap-2">{pendingRefunds.length === 0 ? <CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> : <XCircle className="size-4 mt-0.5 text-destructive" />} Pending refunds: <strong>{pendingRefunds.length}</strong></li>
                <li className="flex items-start gap-2">{openDisputes.length === 0 ? <CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> : <XCircle className="size-4 mt-0.5 text-destructive" />} Open disputes: <strong>{openDisputes.length}</strong></li>
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("request")}><ArrowLeft className="size-4" /> Back</Button>
                <Button onClick={() => setStep("deactivate")} disabled={activeContracts.length > 0 || pendingPayouts.length > 0 || pendingRefunds.length > 0}>Proceed to deactivate <ArrowRight className="size-4" /></Button>
              </div>
            </Card>
          )}
          {step === "deactivate" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Deactivate account</div>
              <p className="text-sm text-muted-foreground">Account will be deactivated: profile hidden, no new contracts/proposals allowed. User data remains for retention review.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("obligations")}><ArrowLeft className="size-4" /> Back</Button>
                <Button variant="destructive" onClick={() => setConfirmOpen(true)}><Ban className="size-4" /> Deactivate account</Button>
              </div>
            </Card>
          )}
          {step === "retain" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Identify retainable records</div>
              <ul className="space-y-2 text-sm">
                {retentionCategories.map((r) => (
                  <li key={r.type} className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2">
                    <div>
                      <div className="font-medium">{r.type}</div>
                      <div className="text-xs text-muted-foreground">{r.retention}</div>
                    </div>
                    <StatusBadge tone={r.retainable ? "warning" : "critical"} icon={false}>{r.retainable ? "Retain" : "Block"}</StatusBadge>
                  </li>
                ))}
              </ul>
              <Button onClick={() => setStep("purge")}><ArrowRight className="size-4" /> Purge eligible data</Button>
            </Card>
          )}
          {step === "purge" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Purging eligible personal data…</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>· Profile, portfolio, public reviews removed</li>
                <li>· Messages scrubbed</li>
                <li>· KYC documents securely deleted (retained metadata only)</li>
                <li>· Retainable records held per regulatory obligations</li>
              </ul>
              <Button onClick={purge}><ArrowRight className="size-4" /> Confirm purge</Button>
            </Card>
          )}
          {step === "confirm" && target && (
            <Card className="p-4 space-y-3 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900">
              <CheckCircle2 className="size-6 text-emerald-600" />
              <div className="font-medium">Deletion complete</div>
              <p className="text-sm text-muted-foreground">Eligible personal data for <strong>{target.name}</strong> ({target.id}) has been purged. Retainable records held per policy. Audit event recorded.</p>
              <Button variant="outline" onClick={reset}>Process another request</Button>
            </Card>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="Deactivate account?"
        description="This will hide the user's profile and block all new transactions. Retainable records remain held per regulatory obligations."
        confirmLabel="Deactivate" destructive
        onConfirm={deactivate}
      />
    </SectionCard>
  );
}

function DataExportPanel() {
  const { users, currentRole, currentUserId, addAudit } = useQQ();
  const { toast } = useToast();
  const [userId, setUserId] = React.useState("");
  const [step, setStep] = React.useState<"request" | "risk_review" | "redact" | "generate" | "link" | "done">("request");
  const [format, setFormat] = React.useState<"JSON" | "CSV">("JSON");

  if (!canManageDeletionExport(currentRole)) {
    return <SectionCard title="Personal data export (Screen 12.12)"><PermissionDenied action="Generate personal data export" allowedRoles={["risk", "ops_manager"]} /></SectionCard>;
  }

  const target = users.find((u) => u.id === userId);

  function generate() {
    if (!target) return;
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action: "Personal data export generated", entity: "User", entityId: target.id, reason: `Format: ${format}. Other-party data redacted.` });
    setStep("link");
  }

  return (
    <SectionCard title="Personal data export (Screen 12.12)" description="Request → Risk reviews scope → redact other-party data → generate JSON/CSV → time-limited secure link → record completion. Never export other users' personal data or raw financial secrets.">
      <div className="grid lg:grid-cols-3 gap-4">
        <ol className="space-y-2 text-sm">
          {["Request received", "Risk reviews scope", "Redact other-party data", "Generate export", "Time-limited secure link", "Record completion"].map((s, i) => {
            const stepIdx = ["request", "risk_review", "redact", "generate", "link", "done"].indexOf(step);
            return (
              <li key={s} className={cn("flex items-center gap-2", i <= stepIdx ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-medium", i < stepIdx ? "bg-emerald-500 text-white" : i === stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i < stepIdx ? "✓" : i + 1}</span>
                {s}
              </li>
            );
          })}
        </ol>
        <div className="lg:col-span-2 space-y-4">
          {step === "request" && (
            <div className="space-y-3">
              <Label>Select user requesting export</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
                <SelectContent>
                  {users.filter((u) => u.role === "buyer" || u.role === "pro").map((u) => <SelectItem key={u.id} value={u.id}>{u.name} · {u.id}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button disabled={!target} onClick={() => setStep("risk_review")}>Send to Risk review <ArrowRight className="size-4" /></Button>
            </div>
          )}
          {step === "risk_review" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Risk review</div>
              <p className="text-sm text-muted-foreground">Risk team reviews scope to ensure other-party personal data (counterparty names, counterparty bank details, etc.) is excluded from the export.</p>
              <ul className="space-y-1 text-sm">
                <li>· Other-party PAN / bank / IFSC: <strong>excluded</strong></li>
                <li>· Counterparty names in messages: <strong>redacted</strong></li>
                <li>· Raw financial secrets: <strong>never exported</strong></li>
                <li>· Own profile, contracts, payouts: <strong>included</strong></li>
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("request")}><ArrowLeft className="size-4" /> Back</Button>
                <Button onClick={() => setStep("redact")}>Approve scope <ArrowRight className="size-4" /></Button>
              </div>
            </Card>
          )}
          {step === "redact" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Redaction</div>
              <p className="text-sm text-muted-foreground">Other-party data is being redacted from messages, contracts, and audit references.</p>
              <Button onClick={() => setStep("generate")}>Continue <ArrowRight className="size-4" /></Button>
            </Card>
          )}
          {step === "generate" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Generate export</div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as "JSON" | "CSV")}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JSON">JSON</SelectItem>
                    <SelectItem value="CSV">CSV (zipped)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generate}><DownloadCloud className="size-4" /> Generate {format}</Button>
            </Card>
          )}
          {step === "link" && target && (
            <Card className="p-4 space-y-3">
              <div className="font-medium">Time-limited secure link</div>
              <p className="text-sm text-muted-foreground">A signed, time-limited download link (24h) has been generated. Link is single-use and tied to the user's verified email.</p>
              <code className="block text-xs font-mono bg-muted p-2 rounded">https://quickquid.example/d/export/{target.id}/{Math.random().toString(36).slice(2, 10)}?expires=24h</code>
              <Button onClick={() => { setStep("done"); toast({ title: "Export completed & logged" }); }}><ArrowRight className="size-4" /> Mark complete</Button>
            </Card>
          )}
          {step === "done" && target && (
            <Card className="p-4 space-y-3 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900">
              <CheckCircle2 className="size-6 text-emerald-600" />
              <div className="font-medium">Export completed</div>
              <p className="text-sm text-muted-foreground">Personal data export for <strong>{target.name}</strong> ({target.id}) generated in {format}. Audit event recorded with completion timestamp.</p>
              <Button variant="outline" onClick={() => { setStep("request"); setUserId(""); }}>Process another request</Button>
            </Card>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ===================== 3. AdminPayments =====================

export function AdminPayments() {
  const {
    payments, contracts, users, currentRole, currentUserId, audit,
    updatePayment, updateMilestone, addAudit, navigate,
  } = useQQ();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = React.useState(false);
  const [escalateOpen, setEscalateOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"verification" | "over_under" | "chargeback">("verification");
  const [bankRef, setBankRef] = React.useState("");
  const [bankAmount, setBankAmount] = React.useState("");

  const selected = payments.find((p) => p.id === selectedId) ?? null;
  const contract = selected ? contracts.find((c) => c.id === selected.contractId) : null;

  function userName(id?: string) {
    if (!id) return "—";
    return users.find((u) => u.id === id)?.name ?? id;
  }

  function auditAction(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "Payment", entityId, oldStatus, newStatus, reason });
  }

  function confirmPayment() {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayment(selected.id, {
      status: "payment_confirmed", resolvedAt: new Date().toISOString(),
      makerId: currentUserId ?? "", bankEvidence: `Bank ref: ${bankRef || "matched"} · ₹${bankAmount || selected.amountReceived || selected.amountDue}`,
    });
    // Move milestone to funded/work_active
    if (contract) {
      updateMilestone(contract.id, selected.milestoneId, { status: "funded" });
      setTimeout(() => updateMilestone(contract.id, selected.milestoneId, { status: "work_active" }), 50);
    }
    auditAction("Payment confirmed (maker)", selected.id, oldStatus, "payment_confirmed", `Bank evidence matched: ${bankRef || "UTR matched"}`);
    toast({ title: "Payment confirmed", description: `Milestone ${selected.milestoneLabel} → funded → work active. Buyer & Pro notified.` });
    setSelectedId(null);
    setBankRef(""); setBankAmount("");
  }

  function rejectPayment(reason: string, option: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayment(selected.id, { status: "payment_rejected", rejectionReason: option, resolvedAt: new Date().toISOString() });
    // Unlock resubmission by leaving milestone as funding_pending
    auditAction("Payment rejected", selected.id, oldStatus, "payment_rejected", `${option} — ${reason}`);
    toast({ title: "Payment rejected", description: "Buyer can resubmit evidence.", variant: "destructive" });
  }

  function requestInfo(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayment(selected.id, { status: "more_info_requested" });
    auditAction("More info requested", selected.id, oldStatus, "more_info_requested", reason);
    toast({ title: "More info requested" });
  }
  function escalate(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayment(selected.id, { status: "escalated" });
    auditAction("Payment escalated", selected.id, oldStatus, "escalated", reason);
    toast({ title: "Escalated to Ops Manager" });
  }

  const overUnderRow = {
    id: "PAY-OU1", ref: "PAY-OU1", user: "Verdant Retail", contract: "QQ-0620",
    expected: 34200, received: 35000, surplus: 800, status: "under_admin_verification",
  };

  const chargebackRows = [
    { id: "CB-1", ref: "CB-9001", user: "Northstar Labs", contract: "QQ-0612", amount: 20000, state: "reported", at: "2025-01-18T09:00:00Z" },
    { id: "CB-2", ref: "CB-9002", user: "Verdant Retail", contract: "QQ-0700", amount: 12000, state: "under_review", at: "2025-01-15T09:00:00Z" },
    { id: "CB-3", ref: "CB-9003", user: "Northstar Labs", contract: "QQ-0650", amount: 7000, state: "provisional_hold", at: "2025-01-10T09:00:00Z" },
  ] as { id: string; ref: string; user: string; contract: string; amount: number; state: string; at: string }[];

  const paymentColumns: QueueColumn<PaymentEvidence>[] = [
    { key: "id", header: "Ref", render: (p) => <span className="font-mono text-xs font-medium">{p.id}</span> },
    { key: "contract", header: "Contract", render: (p) => <span className="font-mono text-xs">{p.contractId}</span> },
    { key: "ms", header: "Milestone", render: (p) => <span>{p.milestoneLabel}</span>, hideOnMobile: true },
    { key: "amount", header: "Expected", render: (p) => <span className="tabular-nums">{formatINR(p.amountDue)}</span> },
    { key: "utr", header: "UTR", render: (p) => <span className="font-mono text-xs">{p.utr}</span>, hideOnMobile: true },
    { key: "method", header: "Method", render: (p) => <Badge variant="outline" className="text-xs">{p.method}</Badge>, hideOnMobile: true },
    { key: "status", header: "Status", render: (p) => <StatusBadge tone={statusMeta(p.status).tone}>{statusMeta(p.status).label}</StatusBadge> },
    { key: "sla", header: "SLA", render: (p) => <StatusBadge tone={slaTone(p.submittedAt, p.targetReviewHours)} icon={false}>{slaLabel(p.submittedAt, p.targetReviewHours)}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment verification"
        description="Bank statement matcher with maker-checker. Finance T2 confirms match; threshold configurable. PAN/bank/account/IFSC never displayed in queues."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="verification">Bank matcher (09.3–09.5)</TabsTrigger>
          <TabsTrigger value="over_under">Over / under payment (09.8)</TabsTrigger>
          <TabsTrigger value="chargeback">Chargeback queue (09.9)</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4 mt-4">
          <SectionCard>
            <QueueTable
              columns={paymentColumns}
              rows={payments}
              onRowClick={(p) => setSelectedId(p.id)}
              slaKey={(p) => ({ tone: slaTone(p.submittedAt, p.targetReviewHours), label: slaLabel(p.submittedAt, p.targetReviewHours) })}
            />
          </SectionCard>
          <Card className="p-3 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-2 text-sm">
              <Info className="size-4 mt-0.5 text-primary" />
              <div>
                <strong>Maker-checker policy:</strong> Maker (Finance T2) confirms bank match → milestone becomes <code className="font-mono">funded</code> → <code className="font-mono">work_active</code>. Above the ₹25,000 threshold, a Checker (separate Finance T2) must authorize before milestone unlock. Currently single-approval for demo.
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="over_under" className="mt-4">
          <SectionCard title="Over / under payment resolver (Screen 09.8)" description="No wallet in v0.1 — surplus cannot be auto-credited. Choose: hold for reconciliation, apply to approved outstanding, manual refund, or reject and request correction.">
            <Card className="p-4">
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div><div className="text-xs text-muted-foreground">Expected</div><div className="text-xl font-semibold tabular-nums">{formatINR(overUnderRow.expected)}</div></div>
                <div><div className="text-xs text-muted-foreground">Received</div><div className="text-xl font-semibold tabular-nums text-emerald-600">{formatINR(overUnderRow.received)}</div></div>
                <div><div className="text-xs text-muted-foreground">Surplus</div><div className="text-xl font-semibold tabular-nums text-amber-600">+{formatINR(overUnderRow.surplus)}</div></div>
              </div>
              <Separator className="my-4" />
              <div className="grid sm:grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start min-h-[44px]" onClick={() => toast({ title: "Held for reconciliation", description: "Surplus held; Finance will reconcile manually." })}><PauseCircle className="size-4" /> Hold for reconciliation</Button>
                <Button variant="outline" className="justify-start min-h-[44px]" onClick={() => toast({ title: "Applied to outstanding", description: "Surplus applied to next approved milestone." })}><ArrowRight className="size-4" /> Apply to approved outstanding</Button>
                <Button variant="outline" className="justify-start min-h-[44px]" onClick={() => toast({ title: "Manual refund queued", description: "Surplus added to refund queue." })}><Receipt className="size-4" /> Manual refund surplus</Button>
                <Button variant="destructive" className="justify-start min-h-[44px]" onClick={() => toast({ title: "Rejected — request correction", description: "Buyer asked to resubmit correct amount." })}><XCircle className="size-4" /> Reject & request correction</Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">No wallet, no auto-credit. All actions create audit events with role + timestamp.</p>
            </Card>
          </SectionCard>
        </TabsContent>

        <TabsContent value="chargeback" className="mt-4">
          <SectionCard title="Chargeback & unauthorized transaction queue (Screen 09.9)" description="States: reported → under review → provisional hold → recovery requested → resolved. Account actions may be temporarily restricted.">
            <QueueTable
              columns={[
                { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs font-medium">{r.ref}</span> },
                { key: "user", header: "User", render: (r) => <span>{r.user}</span> },
                { key: "contract", header: "Contract", render: (r) => <span className="font-mono text-xs">{r.contract}</span>, hideOnMobile: true },
                { key: "amount", header: "Amount", render: (r) => <span className="tabular-nums">{formatINR(r.amount)}</span> },
                { key: "state", header: "State", render: (r) => <StatusBadge tone={r.state === "resolved" ? "success" : r.state === "provisional_hold" ? "warning" : "pending"}>{r.state.replace(/_/g, " ")}</StatusBadge> },
                { key: "at", header: "Reported", render: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.at)}</span>, hideOnMobile: true },
              ]}
              rows={chargebackRows}
              onRowClick={() => toast({ title: "Chargeback under review", description: "Some account actions may be temporarily restricted while this is reviewed." })}
              emptyMessage="No chargebacks reported."
            />
            <Card className="mt-3 p-3 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="size-4 mt-0.5 text-amber-600" />
                <div>
                  <strong>Payment reversal under review.</strong> Some account actions may be temporarily restricted while we review this report. The user can appeal via Support or respond to the resolution centre.
                </div>
              </div>
            </Card>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Detail drawer with split-pane matcher */}
      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">Bank matcher · <span className="font-mono text-base">{selected.id}</span></SheetTitle>
                <SheetDescription>{selected.contractId} · Milestone {selected.milestoneLabel} · Submitted {timeAgo(selected.submittedAt)}</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  <SLATimer openedAt={selected.submittedAt} targetHours={selected.targetReviewHours} breachedAtHours={selected.targetReviewHours} escalateAtHours={selected.targetReviewHours * 2} />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {/* Left: Buyer-submitted */}
                  <Card className="p-4 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><FileText className="size-3" />Buyer-submitted evidence</div>
                    <Row label="UTR / reference" value={<span className="font-mono text-sm">{selected.utr}</span>} />
                    <Row label="Expected amount" value={<span className="font-semibold tabular-nums">{formatINR(selected.amountDue)}</span>} />
                    <Row label="Method" value={selected.method} />
                    <Row label="Date" value={formatDate(selected.date)} />
                    {selected.screenshot && <Row label="Screenshot" value={<span className="text-xs text-muted-foreground">{selected.screenshot}</span>} />}
                  </Card>
                  {/* Right: Admin-entered bank evidence */}
                  <Card className="p-4 space-y-2 border-primary/30">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Banknote className="size-3" />Admin bank evidence</div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bankRef">Matched bank reference</Label>
                      <Input id="bankRef" value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="e.g. N0325…" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bankAmt">Amount found in bank statement</Label>
                      <Input id="bankAmt" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} placeholder="₹" inputMode="numeric" />
                    </div>
                    {bankAmount && (
                      <div className="text-xs">
                        {parseInt(bankAmount) === selected.amountDue ? (
                          <span className="text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="size-3" />Exact match</span>
                        ) : (
                          <span className="text-amber-600 inline-flex items-center gap-1"><AlertTriangle className="size-3" />Mismatch — use over/under resolver</span>
                        )}
                      </div>
                    )}
                  </Card>
                </div>

                <SectionCard title="Maker-checker trail">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Maker (confirms match)</div>
                      <div className="font-medium">{selected.makerId ? userName(selected.makerId) : "Pending"}</div>
                      <div className="text-xs text-muted-foreground">{selected.makerId ? "Confirmed" : "Awaiting Finance T2 confirmation"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Checker (authorizes)</div>
                      <div className="font-medium">{selected.checkerId ? userName(selected.checkerId) : "—"}</div>
                      <div className="text-xs text-muted-foreground">{selected.checkerId ? "Authorized" : "Below ₹25,000 — single-approval"}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Threshold: ₹25,000. Above threshold requires separate Checker authorization before milestone unlock.</p>
                </SectionCard>

                <SectionCard title="Audit history">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canVerifyPayments(currentRole) ? (
                  <PermissionDenied action="Verify payment / trigger milestone unlock" allowedRoles={["finance"]} />
                ) : (
                  <>
                    <Button className="flex-1 min-h-[44px]" onClick={confirmPayment} disabled={selected.status === "payment_confirmed"}><CheckCircle2 className="size-4" /> Confirm payment</Button>
                    <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setRejectOpen(true)}><XCircle className="size-4" /> Reject</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setMoreInfoOpen(true)}><FileSearch className="size-4" /> More info</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setEscalateOpen(true)}><ShieldAlert className="size-4" /> Escalate</Button>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReasonDialog
        open={rejectOpen} onOpenChange={setRejectOpen}
        title="Reject payment evidence"
        description="Buyer will be able to resubmit. Selecting a reason unlocks the resubmission path."
        confirmLabel="Reject" destructive
        options={PAYMENT_REJECTION_REASONS}
        requireOption
        onConfirm={(reason, option) => rejectPayment(reason, option ?? "Rejected")}
      />
      <ReasonDialog open={moreInfoOpen} onOpenChange={setMoreInfoOpen} title="Request more info from buyer" confirmLabel="Request info" onConfirm={(r) => requestInfo(r)} />
      <ReasonDialog open={escalateOpen} onOpenChange={setEscalateOpen} title="Escalate to Ops Manager" confirmLabel="Escalate" onConfirm={(r) => escalate(r)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

// ===================== 4. AdminPayouts =====================

export function AdminPayouts() {
  const {
    payouts, offlineInstruments, audit, currentRole, currentUserId,
    updatePayout, updateOfflineInstrument, addAudit,
  } = useQQ();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"batch" | "slip" | "offline" | "cheque_bounce">("batch");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [makerConfirmOpen, setMakerConfirmOpen] = React.useState(false);
  const [checkerAuthOpen, setCheckerAuthOpen] = React.useState(false);
  const [processOpen, setProcessOpen] = React.useState(false);
  const [processRef, setProcessRef] = React.useState("");
  const [failedOpen, setFailedOpen] = React.useState(false);
  const [bounceOpen, setBounceOpen] = React.useState(false);

  const selected = payouts.find((p) => p.id === selectedId) ?? null;

  function auditAction(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "Payout", entityId, oldStatus, newStatus, reason });
  }

  function makerConfirm() {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayout(selected.id, { status: "maker_confirmed" });
    auditAction("Payout maker-confirmed", selected.id, oldStatus, "maker_confirmed", `Maker: ${currentUserId ?? ""} — matched to approved milestone`);
    toast({ title: "Maker confirmed", description: "Awaiting checker authorization (if above threshold)." });
  }
  function checkerAuthorize() {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayout(selected.id, { status: "checker_authorized" });
    auditAction("Payout checker-authorized", selected.id, oldStatus, "checker_authorized", `Checker: ${currentUserId ?? ""} — independent review complete`);
    toast({ title: "Checker authorized", description: "Payout ready for batch processing." });
  }
  function markProcessed() {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayout(selected.id, { status: "processed", reference: processRef || `NEFT-${Math.random().toString(36).slice(2, 12).toUpperCase()}`, processedAt: new Date().toISOString(), slipAvailable: true });
    auditAction("Payout processed (manual bank)", selected.id, oldStatus, "processed", `Bank reference ${processRef || "auto-generated"} attached`);
    toast({ title: "Payout marked processed", description: "Slip available to Pro. Reconciliation queued." });
    setProcessRef("");
  }
  function markFailed(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updatePayout(selected.id, { status: "failed", failureReason: reason });
    auditAction("Payout failed", selected.id, oldStatus, "failed", reason);
    toast({ title: "Payout marked failed", description: "Pro notified. Re-queue after correction.", variant: "destructive" });
  }

  const payoutColumns: QueueColumn<Payout>[] = [
    { key: "id", header: "Ref", render: (p) => <span className="font-mono text-xs font-medium">{p.id}</span> },
    { key: "pro", header: "Pro", render: (p) => <span>{p.proName}</span> },
    { key: "contract", header: "Contract", render: (p) => <span className="font-mono text-xs">{p.contractId}</span>, hideOnMobile: true },
    { key: "ms", header: "Milestone", render: (p) => <span>{p.milestoneLabel}</span>, hideOnMobile: true },
    { key: "bnf", header: "Beneficiary", render: (p) => <span className="font-mono text-xs">{p.beneficiaryToken}</span> },
    { key: "amount", header: "Net payout", render: (p) => <span className="tabular-nums">{formatINR(p.netPayout)}</span> },
    { key: "status", header: "Status", render: (p) => <StatusBadge tone={statusMeta(p.status).tone}>{statusMeta(p.status).label}</StatusBadge> },
    { key: "sla", header: "Age", render: (p) => <StatusBadge tone={slaTone(p.queuedAt, 48)} icon={false}>{slaLabel(p.queuedAt, 48)}</StatusBadge> },
  ];

  const oiColumns: QueueColumn<OfflineInstrument>[] = [
    { key: "id", header: "Ref", render: (o) => <span className="font-mono text-xs font-medium">{o.id}</span> },
    { key: "type", header: "Type", render: (o) => <Badge variant="outline" className="text-xs">{o.instrumentType}</Badge> },
    { key: "contract", header: "Contract", render: (o) => <span className="font-mono text-xs">{o.contractRef}</span>, hideOnMobile: true },
    { key: "bank", header: "Bank", render: (o) => <span className="text-xs">{o.bank}</span>, hideOnMobile: true },
    { key: "number", header: "Instrument #", render: (o) => <span className="font-mono text-xs">{o.instrumentNumber}</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (o) => <span className="tabular-nums">{formatINR(o.amount)}</span> },
    { key: "status", header: "Status", render: (o) => <StatusBadge tone={statusMeta(o.status).tone}>{statusMeta(o.status).label}</StatusBadge> },
    { key: "settle", header: "Settlement", render: (o) => <span className="text-xs text-muted-foreground">{formatDate(o.expectedSettlement)}</span>, hideOnMobile: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts & offline instruments"
        description="Manual payout batch flow with maker-checker. Raw bank details never appear in tables — beneficiary token (e.g. BNF-7781) only. TDS/GST never hardcoded."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="batch">Batch queue (12.5)</TabsTrigger>
          <TabsTrigger value="slip">Slip detail (12.10)</TabsTrigger>
          <TabsTrigger value="offline">Offline instruments (12.13)</TabsTrigger>
          <TabsTrigger value="cheque_bounce">Cheque bounce (12.15)</TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="space-y-4 mt-4">
          <SectionCard>
            <QueueTable columns={payoutColumns} rows={payouts} onRowClick={(p) => setSelectedId(p.id)} slaKey={(p) => ({ tone: slaTone(p.queuedAt, 48), label: slaLabel(p.queuedAt, 48) })} />
          </SectionCard>
          <Card className="p-3 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-2 text-sm">
              <Info className="size-4 mt-0.5 text-primary" />
              <div>
                <strong>Manual batch export flow (12.10):</strong> Maker confirms → Checker authorizes → Secure export (simulated) → Manual bank processing → Attach reference/proof → Mark processed → Reconciliation. General tables show <code className="font-mono">beneficiaryToken</code> only — never raw account/IFSC.
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="slip" className="mt-4">
          {selected ? <PayoutSlipDetail payout={selected} /> : <EmptyState title="Select a payout" description="Open a payout from the batch queue to view its slip detail." icon={Receipt} actions={<Button onClick={() => setTab("batch")}>Open batch queue</Button>} />}
        </TabsContent>

        <TabsContent value="offline" className="space-y-4 mt-4">
          <SectionCard title="Offline instrument logger (Screen 12.13)" description="Cheque / DD / Bankers Cheque. Status: logged → pending_settlement → cleared / dishonoured / escalated.">
            <QueueTable columns={oiColumns} rows={offlineInstruments} onRowClick={(o) => toast({ title: `Instrument ${o.id}`, description: `${o.instrumentType} · ${o.status}` })} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="cheque_bounce" className="mt-4">
          <ChequeBounceQueue />
        </TabsContent>
      </Tabs>

      {/* Payout detail drawer */}
      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">Payout · <span className="font-mono text-base">{selected.id}</span></SheetTitle>
                <SheetDescription>{selected.proName} · {selected.contractId} · {selected.milestoneLabel}</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  <SLATimer openedAt={selected.queuedAt} targetHours={48} breachedAtHours={48} escalateAtHours={96} />
                </div>

                <SectionCard title="Beneficiary (token only)" description="Raw bank details are never displayed in this view. Use the slip-detail tab to see fee breakdown.">
                  <Row label="Beneficiary token" value={<span className="font-mono">{selected.beneficiaryToken}</span>} />
                  <Row label="Pro" value={selected.proName} />
                  <Row label="Contract" value={<span className="font-mono">{selected.contractId}</span>} />
                </SectionCard>

                <SectionCard title="Maker-checker trail" description="Maker & Checker identities are recorded in audit events (see history below). Status of this payout:">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Maker (confirms match)</div>
                      <div className="font-medium">{["maker_confirmed", "checker_authorized", "processing", "processed"].includes(selected.status) ? "Confirmed" : "Pending"}</div>
                      <div className="text-xs text-muted-foreground">{selected.status === "queued" ? "Awaiting Finance T2 confirmation" : "Confirmed"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Checker (authorizes)</div>
                      <div className="font-medium">{["checker_authorized", "processing", "processed"].includes(selected.status) ? "Authorized" : "—"}</div>
                      <div className="text-xs text-muted-foreground">{selected.netPayout >= 25000 ? "Required (above ₹25k threshold)" : "Single-approval (below threshold)"}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Above ₹25,000 net payout requires a separate Checker (different Finance T2 identity) before processing. Ops Manager must not bypass without documented authorization.</p>
                </SectionCard>

                <SectionCard title="Audit history">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canTriggerPayouts(currentRole) ? (
                  <PermissionDenied action="Trigger / process payout" allowedRoles={["finance"]} />
                ) : (
                  <>
                    {selected.status === "queued" && <Button className="flex-1 min-h-[44px]" onClick={() => setMakerConfirmOpen(true)}><CheckCircle2 className="size-4" /> Maker confirm</Button>}
                    {selected.status === "maker_confirmed" && selected.netPayout >= 25000 && <Button className="flex-1 min-h-[44px]" onClick={() => setCheckerAuthOpen(true)}><ShieldCheck className="size-4" /> Checker authorize</Button>}
                    {(selected.status === "checker_authorized" || (selected.status === "maker_confirmed" && selected.netPayout < 25000)) && (
                      <Button className="flex-1 min-h-[44px]" onClick={() => setProcessOpen(true)}><Banknote className="size-4" /> Mark processed</Button>
                    )}
                    {selected.status !== "processed" && selected.status !== "failed" && <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setFailedOpen(true)}><XCircle className="size-4" /> Mark failed (09.6)</Button>}
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={makerConfirmOpen} onOpenChange={setMakerConfirmOpen} title="Maker confirm payout?" description="You confirm this payout matches an approved milestone. Audit event will be recorded." confirmLabel="Confirm (maker)" onConfirm={makerConfirm} />
      <ConfirmDialog open={checkerAuthOpen} onOpenChange={setCheckerAuthOpen} title="Checker authorize payout?" description="Independent review. You authorize this payout for batch processing. Audit event recorded." confirmLabel="Authorize (checker)" onConfirm={checkerAuthorize} />
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Mark payout processed</DialogTitle>
            <DialogDescription>Attach the bank reference / proof from manual bank processing. Slip will be made available to the Pro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pref">Bank reference (UTR / NEFT / cheque #)</Label>
            <Input id="pref" value={processRef} onChange={(e) => setProcessRef(e.target.value)} placeholder="e.g. NEFT-885511002" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProcessOpen(false)}>Cancel</Button>
            <Button onClick={() => { markProcessed(); setProcessOpen(false); }}><CheckCircle2 className="size-4" /> Mark processed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ReasonDialog open={failedOpen} onOpenChange={setFailedOpen} title="Mark payout failed (09.6)" description="Pro will be notified. Re-queue required after correction." confirmLabel="Mark failed" destructive onConfirm={(r) => markFailed(r)} />
      <ReasonDialog open={bounceOpen} onOpenChange={setBounceOpen} title="Escalate cheque bounce" confirmLabel="Escalate" onConfirm={(r) => toast({ title: "Escalated to legal review", description: r })} />
    </div>
  );
}

function PayoutSlipDetail({ payout }: { payout: Payout }) {
  const { addAudit, currentRole, currentUserId } = useQQ();
  const { toast } = useToast();
  function download() {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action: "Payout slip downloaded", entity: "Payout", entityId: payout.id, reason: "Pro request / Finance reconciliation" });
    toast({ title: "Slip downloaded", description: "Audit event recorded." });
  }
  return (
    <SectionCard title="Payout slip detail (Screen 12.10)" description="Agreed Pro fee, commission ₹0, statutory withholding if applicable, bank/provider charge if disclosed, net payout. TDS never hardcoded." actions={<Button size="sm" variant="outline" onClick={download}><DownloadCloud className="size-4" /> Download slip</Button>}>
      <Card className="p-4 space-y-2 text-sm">
        <Row label="Payout reference" value={<span className="font-mono">{payout.id}</span>} />
        <Row label="Pro" value={payout.proName} />
        <Row label="Beneficiary token" value={<span className="font-mono">{payout.beneficiaryToken}</span>} />
        <Row label="Contract" value={<span className="font-mono">{payout.contractId}</span>} />
        <Row label="Milestone" value={payout.milestoneLabel} />
        <Separator className="my-2" />
        <Row label="Agreed Pro fee" value={<span className="tabular-nums">{formatINR(payout.proFee)}</span>} />
        <Row label="QuickQuid commission (deducted from Pro)" value={<span className="text-muted-foreground">{formatINR(0)} (0%)</span>} />
        <Row label="Statutory withholding (if applicable)" value={payout.statutoryWithholding ? <span className="tabular-nums">−{formatINR(payout.statutoryWithholding)}</span> : <span className="text-muted-foreground">Not applied</span>} />
        <Row label="Bank / provider charge (if disclosed)" value={payout.bankCharge ? <span className="tabular-nums">−{formatINR(payout.bankCharge)}</span> : <span className="text-muted-foreground">Not disclosed</span>} />
        <Separator className="my-2" />
        <Row label="Net payout" value={<span className="font-semibold tabular-nums">{formatINR(payout.netPayout)}</span>} />
        {payout.reference && <Row label="Payout reference (bank)" value={<span className="font-mono">{payout.reference}</span>} />}
        {payout.processedAt && <Row label="Processed at" value={<span className="text-xs">{formatDateTime(payout.processedAt)}</span>} />}
        {payout.failureReason && <Row label="Failure reason" value={<span className="text-destructive">{payout.failureReason}</span>} />}
      </Card>
      <p className="mt-2 text-xs text-muted-foreground">Statutory withholding is only applied when Finance has confirmed it. TDS/GST/TCS rates are never hardcoded in the UI.</p>
    </SectionCard>
  );
}

function ChequeBounceQueue() {
  const { offlineInstruments, currentRole, currentUserId, updateOfflineInstrument, addAudit } = useQQ();
  const { toast } = useToast();
  const bounced = offlineInstruments.filter((o) => o.status === "dishonoured" || o.status === "escalated");

  function escalate(o: OfflineInstrument, reason: string) {
    const oldStatus = o.status;
    updateOfflineInstrument(o.id, { status: "escalated" });
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action: "Cheque bounce escalated to legal review", entity: "OfflineInstrument", entityId: o.id, oldStatus, newStatus: "escalated", reason });
    toast({ title: "Escalated to legal review", description: "Deadline tracked. Owner notified." });
  }

  const cols: QueueColumn<OfflineInstrument>[] = [
    { key: "id", header: "Ref", render: (o) => <span className="font-mono text-xs font-medium">{o.id}</span> },
    { key: "type", header: "Type", render: (o) => <Badge variant="outline" className="text-xs">{o.instrumentType}</Badge> },
    { key: "contract", header: "Contract", render: (o) => <span className="font-mono text-xs">{o.contractRef}</span>, hideOnMobile: true },
    { key: "number", header: "Instrument #", render: (o) => <span className="font-mono text-xs">{o.instrumentNumber}</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (o) => <span className="tabular-nums">{formatINR(o.amount)}</span> },
    { key: "status", header: "Status", render: (o) => <StatusBadge tone={statusMeta(o.status).tone}>{statusMeta(o.status).label}</StatusBadge> },
    { key: "owner", header: "Owner", render: (o) => <span className="text-xs">{o.owner}</span>, hideOnMobile: true },
  ];

  return (
    <SectionCard title="Cheque bounce escalation queue (Screen 12.15)" description="Mark dishonoured → restrict workflow per policy → notify owner → assign legal review → track deadline → record payment/escalation.">
      <Card className="p-3 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 mb-3">
        <div className="flex items-start gap-2 text-sm">
          <Info className="size-4 mt-0.5 text-amber-600" />
          <div><strong>The system tracks the workflow; it does not provide legal advice.</strong> Escalations are routed to counsel with a tracked deadline.</div>
        </div>
      </Card>
      {bounced.length === 0 ? (
        <EmptyState title="No dishonoured instruments" description="Cheques / DDs marked dishonoured will appear here for escalation." icon={FileWarning} />
      ) : (
        <QueueTable
          columns={cols}
          rows={bounced}
          onRowClick={(o) => toast({ title: `${o.id} — ${o.status}`, description: `Owner: ${o.owner}` })}
        />
      )}
      {bounced.length > 0 && canTriggerPayouts(currentRole) && (
        <div className="mt-3 flex gap-2">
          {bounced.map((o) => (
            <Button key={o.id} variant="outline" size="sm" onClick={() => escalate(o, "Cheque bounce — legal review requested")}>
              <Gavel className="size-3.5" /> Escalate {o.id}
            </Button>
          ))}
        </div>
      )}
      {bounced.length > 0 && !canTriggerPayouts(currentRole) && (
        <div className="mt-3"><PermissionDenied action="Escalate cheque bounce" allowedRoles={["finance"]} /></div>
      )}
    </SectionCard>
  );
}

// ===================== 5. AdminRefunds =====================

export function AdminRefunds() {
  const { refunds, audit, currentRole, currentUserId, updateRefund, addAudit } = useQQ();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [executeOpen, setExecuteOpen] = React.useState(false);
  const [transferRef, setTransferRef] = React.useState("");

  const selected = refunds.find((r) => r.id === selectedId) ?? null;

  function auditAction(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "Refund", entityId, oldStatus, newStatus, reason });
  }

  function approve(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateRefund(selected.id, { status: "approved", approver: currentUserId ?? "" });
    auditAction("Refund approved", selected.id, oldStatus, "approved", reason);
    toast({ title: "Refund approved", description: "Ready for manual execution." });
  }
  function execute() {
    if (!selected) return;
    const oldStatus = selected.status;
    updateRefund(selected.id, { status: "executed", transferReference: transferRef || `NEFT-${Math.random().toString(36).slice(2, 12).toUpperCase()}`, executedAt: new Date().toISOString() });
    auditAction("Refund executed (manual)", selected.id, oldStatus, "executed", `Transfer reference: ${transferRef || "auto"}`);
    toast({ title: "Refund executed", description: "Buyer notified with transfer reference." });
    setTransferRef("");
  }

  const cols: QueueColumn<Refund>[] = [
    { key: "id", header: "Refund ref", render: (r) => <span className="font-mono text-xs font-medium">{r.id}</span> },
    { key: "contract", header: "Contract", render: (r) => <span className="font-mono text-xs">{r.contractId}</span> },
    { key: "buyer", header: "Buyer", render: (r) => <span>{r.buyerName}</span> },
    { key: "amount", header: "Amount", render: (r) => <span className="tabular-nums">{formatINR(r.amount)}</span> },
    { key: "reason", header: "Reason", render: (r) => <span className="text-xs line-clamp-1">{r.reason}</span>, hideOnMobile: true },
    { key: "approver", header: "Approver", render: (r) => <span className="text-xs">{r.approver ?? "—"}</span>, hideOnMobile: true },
    { key: "bnf", header: "Beneficiary", render: (r) => <span className="font-mono text-xs">{r.beneficiaryToken}</span>, hideOnMobile: true },
    { key: "transfer", header: "Transfer ref", render: (r) => r.transferReference ? <span className="font-mono text-xs">{r.transferReference}</span> : <span className="text-muted-foreground">—</span>, hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge tone={statusMeta(r.status).tone}>{statusMeta(r.status).label}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refunds"
        description="Manual refund queue. Approve → execute manually → attach proof → mark refunded → notify Buyer. Beneficiary token only — no raw bank details in tables."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />
      <SectionCard>
        <QueueTable columns={cols} rows={refunds} onRowClick={(r) => setSelectedId(r.id)} slaKey={(r) => ({ tone: slaTone(r.createdAt, 72), label: slaLabel(r.createdAt, 72) })} />
      </SectionCard>

      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">Refund · <span className="font-mono text-base">{selected.id}</span></SheetTitle>
                <SheetDescription>{selected.buyerName} · {selected.contractId}</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  <SLATimer openedAt={selected.createdAt} targetHours={72} breachedAtHours={72} escalateAtHours={144} />
                </div>
                <Card className="p-4 space-y-2 text-sm">
                  <Row label="Amount" value={<span className="font-semibold tabular-nums">{formatINR(selected.amount)}</span>} />
                  <Row label="Reason" value={selected.reason} />
                  <Row label="Beneficiary token" value={<span className="font-mono">{selected.beneficiaryToken}</span>} />
                  <Row label="Approver" value={selected.approver ?? "—"} />
                  {selected.transferReference && <Row label="Transfer reference" value={<span className="font-mono">{selected.transferReference}</span>} />}
                </Card>
                <SectionCard title="Audit history">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>
              </div>
              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canProcessRefunds(currentRole) ? (
                  <PermissionDenied action="Approve / execute refund" allowedRoles={["finance"]} />
                ) : (
                  <>
                    {selected.status === "requested" && <Button className="flex-1 min-h-[44px]" onClick={() => setApproveOpen(true)}><CheckCircle2 className="size-4" /> Approve refund</Button>}
                    {selected.status === "approved" && <Button className="flex-1 min-h-[44px]" onClick={() => setExecuteOpen(true)}><Banknote className="size-4" /> Execute & attach proof</Button>}
                    {selected.status === "executed" && <div className="text-sm text-emerald-600 inline-flex items-center gap-2"><CheckCircle2 className="size-4" /> Refund executed — Buyer notified</div>}
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReasonDialog open={approveOpen} onOpenChange={setApproveOpen} title="Approve refund?" description="Approval recorded with your role + timestamp. Refund moves to execute state." confirmLabel="Approve" onConfirm={(r) => approve(r)} />
      <Dialog open={executeOpen} onOpenChange={setExecuteOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Execute refund manually</DialogTitle>
            <DialogDescription>Process via bank transfer outside QuickQuid. Attach the transfer reference as proof.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tref">Transfer reference (UTR / NEFT / cheque #)</Label>
            <Input id="tref" value={transferRef} onChange={(e) => setTransferRef(e.target.value)} placeholder="e.g. NEFT-771290033" />
            <p className="text-xs text-muted-foreground">On confirm: refund marked executed, Buyer notified with reference, audit event recorded.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setExecuteOpen(false)}>Cancel</Button>
            <Button onClick={() => { execute(); setExecuteOpen(false); }}><Banknote className="size-4" /> Execute & notify Buyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== 6. AdminDisputes =====================

export function AdminDisputes() {
  const {
    disputes, contracts, payments, payouts, audit, currentRole, currentUserId,
    updateDispute, addAudit,
  } = useQQ();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [decisionOpen, setDecisionOpen] = React.useState<"release_full" | "partial" | "refund" | "evidence" | "escalate" | null>(null);
  const [partialAmount, setPartialAmount] = React.useState("");

  const selected = disputes.find((d) => d.id === selectedId) ?? null;
  const contract = selected ? contracts.find((c) => c.id === selected.contractId) : null;
  const paymentLedger = selected ? payments.filter((p) => p.contractId === selected.contractId) : [];
  const payoutLedger = selected ? payouts.filter((p) => p.contractId === selected.contractId) : [];

  function auditAction(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "Dispute", entityId, oldStatus, newStatus, reason });
  }

  function releaseFull(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateDispute(selected.id, { status: "resolved", adminDecision: `Release full amount to Pro. ${reason}` });
    auditAction("Dispute resolved — release full", selected.id, oldStatus, "resolved", reason);
    toast({ title: "Resolved — full amount released to Pro" });
  }
  function partial(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    const amt = parseInt(partialAmount) || 0;
    updateDispute(selected.id, { status: "resolved", adminDecision: `Partial payout ₹${amt} to Pro, refund balance to Buyer. ${reason}` });
    auditAction("Dispute resolved — partial", selected.id, oldStatus, "resolved", `Partial ₹${amt}. ${reason}`);
    toast({ title: "Resolved — partial payout/refund" });
    setPartialAmount("");
  }
  function refund(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateDispute(selected.id, { status: "resolved", adminDecision: `Full refund to Buyer. ${reason}` });
    auditAction("Dispute resolved — refund", selected.id, oldStatus, "resolved", reason);
    toast({ title: "Resolved — full refund to Buyer" });
  }
  function requestEvidence(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateDispute(selected.id, { status: "evidence_requested" });
    auditAction("Evidence requested", selected.id, oldStatus, "evidence_requested", reason);
    toast({ title: "Evidence requested from both parties" });
  }
  function escalate(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateDispute(selected.id, { status: "escalated_ops" });
    auditAction("Dispute escalated to Ops Manager", selected.id, oldStatus, "escalated_ops", reason);
    toast({ title: "Escalated to Ops Manager" });
  }

  const disputeSlaHours = hoursSince(selected?.slaOpenedAt ?? new Date().toISOString());
  const disputeSlaTone: "success" | "pending" | "warning" | "critical" = disputeSlaHours >= 336 ? "critical" : disputeSlaHours >= 168 ? "warning" : disputeSlaHours >= 120 ? "pending" : "success";

  const cols: QueueColumn<Dispute>[] = [
    { key: "id", header: "Dispute ref", render: (d) => <span className="font-mono text-xs font-medium">{d.id}</span> },
    { key: "contract", header: "Contract", render: (d) => <span className="font-mono text-xs">{d.contractId}</span> },
    { key: "raisedBy", header: "Raised by", render: (d) => <span>{d.raisedByName} <Badge variant="outline" className="ml-1 text-[10px]">{d.raisedBy}</Badge></span> },
    { key: "cat", header: "Category", render: (d) => <Badge variant="outline" className="text-xs">{d.category.replace(/_/g, " ")}</Badge>, hideOnMobile: true },
    { key: "status", header: "Status", render: (d) => <StatusBadge tone={statusMeta(d.status).tone}>{statusMeta(d.status).label}</StatusBadge> },
    { key: "owner", header: "Owner", render: (d) => <span className="text-xs">{d.owner ?? "Unassigned"}</span>, hideOnMobile: true },
    { key: "sla", header: "SLA", render: (d) => {
      const h = hoursSince(d.slaOpenedAt);
      const tone = h >= 336 ? "critical" : h >= 168 ? "warning" : h >= 120 ? "pending" : "success";
      const label = h >= 336 ? `Escalation due (>${14}d)` : h >= 168 ? `Breached ${Math.floor(h / 24)}d` : h >= 120 ? `Approaching ${Math.floor(h / 24)}d` : `${Math.floor(h / 24)}d / 5d`;
      return <StatusBadge tone={tone as never} icon={false}>{label}</StatusBadge>;
    } },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputes"
        description="Admin mediation with immutable contract evidence and payment ledger. SLA: 0–5d normal, 5–7d approaching, 7d+ breached, 14d+ Ops Manager escalation."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <SectionCard>
        <QueueTable columns={cols} rows={disputes} onRowClick={(d) => setSelectedId(d.id)} />
      </SectionCard>

      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">Dispute · <span className="font-mono text-base">{selected.id}</span></SheetTitle>
                <SheetDescription>{selected.contractId} · Raised by {selected.raisedByName} · {selected.category.replace(/_/g, " ")}</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  <StatusBadge tone={disputeSlaTone} icon>{disputeSlaHours >= 336 ? "Escalation due (>14d)" : disputeSlaHours >= 168 ? "SLA breached (>7d)" : disputeSlaHours >= 120 ? "SLA approaching (5–7d)" : `SLA normal · ${Math.floor(disputeSlaHours / 24)}d / 5d`}</StatusBadge>
                  <Badge variant="outline" className="text-xs">Owner: {selected.owner ?? "Unassigned"}</Badge>
                </div>

                {/* Deadlock interlock */}
                <Card className="p-3 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquareOff className="size-4 mt-0.5 text-amber-600" />
                    <div>
                      <strong>This dispute is under Admin mediation.</strong> Direct dispute chat is paused while evidence is reviewed. Reviews on this contract are also paused (extortion interlock, Screen 11.13).
                    </div>
                  </div>
                </Card>

                <SectionCard title="Buyer claim">
                  <p className="text-sm">{selected.narrative}</p>
                  <div className="mt-2 text-xs text-muted-foreground">Requested resolution: <span className="text-foreground">{selected.requestedResolution}</span></div>
                  <div className="text-xs text-muted-foreground">Desired outcome: <span className="text-foreground">{selected.desiredOutcome}</span></div>
                  {selected.evidence.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">{selected.evidence.map((e) => <Badge key={e} variant="outline" className="text-xs"><FileText className="size-3" />{e}</Badge>)}</div>
                  )}
                </SectionCard>

                {selected.counterclaim && (
                  <SectionCard title="Pro response / counterclaim">
                    <p className="text-sm">{selected.counterclaim}</p>
                  </SectionCard>
                )}

                {contract && (
                  <SectionCard title="Immutable contract evidence" description="Scope, milestones, exclusions — fixed at contract acceptance.">
                    <div className="text-sm space-y-1">
                      <Row label="Scope" value={contract.scope} />
                      <Row label="Timeline" value={contract.timeline} />
                      <Row label="Total Pro fee" value={formatINR(contract.totalProFee)} />
                      <Row label="Milestones" value={`${contract.milestones.length} (max 4 in v0.1)`} />
                      {contract.exclusions.length > 0 && <Row label="Exclusions" value={contract.exclusions.join("; ")} />}
                    </div>
                  </SectionCard>
                )}

                <SectionCard title="Payment ledger">
                  {paymentLedger.length === 0 && payoutLedger.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payments or payouts recorded for this contract.</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {paymentLedger.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                          <div><div className="font-medium">{p.id} · {p.milestoneLabel}</div><div className="text-xs text-muted-foreground">{p.utr} · {formatDate(p.date)}</div></div>
                          <div className="text-right"><div className="tabular-nums">{formatINR(p.amountDue)}</div><StatusBadge tone={statusMeta(p.status).tone} icon={false}>{statusMeta(p.status).label}</StatusBadge></div>
                        </div>
                      ))}
                      {payoutLedger.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                          <div><div className="font-medium">{p.id} · Payout to {p.proName}</div><div className="text-xs text-muted-foreground">{p.milestoneLabel} · {p.beneficiaryToken}</div></div>
                          <div className="text-right"><div className="tabular-nums">{formatINR(p.netPayout)}</div><StatusBadge tone={statusMeta(p.status).tone} icon={false}>{statusMeta(p.status).label}</StatusBadge></div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {selected.adminDecision && (
                  <Card className="p-3 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900">
                    <div className="flex items-start gap-2 text-sm">
                      <Gavel className="size-4 mt-0.5 text-emerald-600" />
                      <div><strong>Admin decision:</strong> {selected.adminDecision}</div>
                    </div>
                  </Card>
                )}

                <SectionCard title="Audit history">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canMediateDisputes(currentRole) ? (
                  <PermissionDenied action="Mediate dispute / issue decision" allowedRoles={["risk", "ops_manager"]} />
                ) : selected.status === "resolved" ? (
                  <div className="text-sm text-emerald-600 inline-flex items-center gap-2"><CheckCircle2 className="size-4" /> Resolved</div>
                ) : (
                  <>
                    <Button className="flex-1 min-h-[44px]" onClick={() => setDecisionOpen("release_full")}><CheckCircle2 className="size-4" /> Release full</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setDecisionOpen("partial")}><Scale className="size-4" /> Partial</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setDecisionOpen("refund")}><Receipt className="size-4" /> Refund Buyer</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setDecisionOpen("evidence")}><FileSearch className="size-4" /> Request evidence</Button>
                    <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setDecisionOpen("escalate")}><ShieldAlert className="size-4" /> Escalate Ops</Button>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReasonDialog open={decisionOpen === "release_full"} onOpenChange={(o) => !o && setDecisionOpen(null)} title="Release full amount to Pro" confirmLabel="Release full" onConfirm={(r) => releaseFull(r)} />
      <Dialog open={decisionOpen === "partial"} onOpenChange={(o) => !o && setDecisionOpen(null)}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader><DialogTitle>Partial payout / refund</DialogTitle><DialogDescription>Specify the amount to release to Pro. Balance is refunded to Buyer. Both recorded as separate audit events.</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pamt">Amount to release to Pro (₹)</Label>
            <Input id="pamt" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} placeholder="e.g. 20000" inputMode="numeric" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDecisionOpen(null)}>Cancel</Button>
            <Button onClick={() => { partial("Documented per policy"); setDecisionOpen(null); }}>Resolve partial</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ReasonDialog open={decisionOpen === "refund"} onOpenChange={(o) => !o && setDecisionOpen(null)} title="Full refund to Buyer" confirmLabel="Resolve — refund" destructive onConfirm={(r) => refund(r)} />
      <ReasonDialog open={decisionOpen === "evidence"} onOpenChange={(o) => !o && setDecisionOpen(null)} title="Request evidence from both parties" confirmLabel="Request evidence" onConfirm={(r) => requestEvidence(r)} />
      <ReasonDialog open={decisionOpen === "escalate"} onOpenChange={(o) => !o && setDecisionOpen(null)} title="Escalate to Ops Manager" description="Used after 14-day SLA breach or when Risk cannot resolve." confirmLabel="Escalate" destructive onConfirm={(r) => escalate(r)} />
    </div>
  );
}

// ===================== 7. AdminTrust =====================

export function AdminTrust() {
  const {
    trustCases, users, contracts, payouts, refunds, disputes, kyc, audit,
    currentRole, currentUserId, updateTrustCase, addAudit,
  } = useQQ();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [actionDialog, setActionDialog] = React.useState<"info" | "restrict" | "suspend_content" | "suspend_account" | "restore" | "escalate" | null>(null);
  const [suspendOpen, setSuspendOpen] = React.useState(false);

  const selected = trustCases.find((t) => t.id === selectedId) ?? null;

  function auditAction(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "TrustSafetyCase", entityId, oldStatus, newStatus, reason });
  }

  function applyAction(action: "info" | "restrict" | "suspend_content" | "suspend_account" | "restore" | "escalate", reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    const newStatusMap = {
      info: "investigating" as const,
      restrict: "restricted" as const,
      suspend_content: "suspended_content" as const,
      suspend_account: "suspended_account" as const,
      restore: "restored" as const,
      escalate: "escalated_counsel" as const,
    };
    const newStatus = newStatusMap[action];
    const actionLabel = {
      info: "Requested information",
      restrict: "Restricted visibility",
      suspend_content: "Suspended content",
      suspend_account: "Suspended account",
      restore: "Restored",
      escalate: "Escalated to counsel",
    }[action];
    updateTrustCase(selected.id, {
      status: newStatus,
      actionHistory: [...selected.actionHistory, { action: actionLabel, at: new Date().toISOString(), by: currentUserId ?? "" }],
    });
    auditAction(actionLabel, selected.id, oldStatus, newStatus, reason);
    toast({ title: actionLabel, description: "Action recorded in case history + audit log." });
  }

  const cols: QueueColumn<TrustSafetyCase>[] = [
    { key: "id", header: "Case ref", render: (t) => <span className="font-mono text-xs font-medium">{t.id}</span> },
    { key: "complainant", header: "Complainant", render: (t) => <span>{t.complainant}</span> },
    { key: "entity", header: "Affected entity", render: (t) => <span className="text-xs">{t.affectedEntity}</span>, hideOnMobile: true },
    { key: "allegation", header: "Allegation", render: (t) => <span className="text-xs line-clamp-1">{t.allegation}</span> },
    { key: "urgency", header: "Urgency", render: (t) => <StatusBadge tone={t.urgency === "critical" ? "critical" : t.urgency === "high" ? "warning" : t.urgency === "medium" ? "pending" : "info"} icon={false}>{t.urgency}</StatusBadge> },
    { key: "owner", header: "Owner", render: (t) => <span className="text-xs">{t.owner ?? "Unassigned"}</span>, hideOnMobile: true },
    { key: "status", header: "Status", render: (t) => <StatusBadge tone={statusMeta(t.status).tone}>{statusMeta(t.status).label}</StatusBadge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trust & Safety · IP takedown"
        description="Risk-flagged cases: IP takedown, circumvention, account suspension. Suspend-user interlock checks obligations before action."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />
      <SectionCard>
        <QueueTable columns={cols} rows={trustCases} onRowClick={(t) => setSelectedId(t.id)} slaKey={(t) => ({ tone: slaTone(t.createdAt, 48), label: slaLabel(t.createdAt, 48) })} />
      </SectionCard>

      <SectionCard title="Risk flag cases — duplicate device / IP" description="KYC submissions with risk signals (duplicate device/IP/network pattern) appear here for cross-reference.">
        <div className="space-y-2">
          {kyc.filter((k) => k.riskFlag).map((k) => (
            <div key={k.id} className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Fingerprint className="size-4 text-amber-600" />
                <div>
                  <div className="font-medium">{k.userName} · <span className="font-mono text-xs">{k.id}</span></div>
                  <div className="text-xs text-muted-foreground">{k.riskFlag?.signal}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{Math.round((k.riskFlag?.confidence ?? 0) * 100)}%</Badge>
                <Button size="sm" variant="outline" onClick={() => useQQ.getState().navigate("admin_kyc")}>Open in KYC <ArrowRight className="size-3.5" /></Button>
              </div>
            </div>
          ))}
          {kyc.filter((k) => k.riskFlag).length === 0 && <p className="text-sm text-muted-foreground">No active risk-flagged KYC cases.</p>}
        </div>
      </SectionCard>

      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">Trust & Safety case · <span className="font-mono text-base">{selected.id}</span></SheetTitle>
                <SheetDescription>{selected.complainant} → {selected.affectedEntity}</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  <StatusBadge tone={selected.urgency === "critical" ? "critical" : selected.urgency === "high" ? "warning" : selected.urgency === "medium" ? "pending" : "info"} icon={false}>{selected.urgency} urgency</StatusBadge>
                  <SLATimer openedAt={selected.createdAt} targetHours={48} breachedAtHours={48} escalateAtHours={96} />
                </div>

                <SectionCard title="Allegation">
                  <p className="text-sm">{selected.allegation}</p>
                  {selected.evidence.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">{selected.evidence.map((e) => <Badge key={e} variant="outline" className="text-xs"><FileText className="size-3" />{e}</Badge>)}</div>
                  )}
                </SectionCard>

                <SectionCard title="Action history">
                  <ol className="space-y-2 text-sm">
                    {selected.actionHistory.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-medium mt-0.5">{i + 1}</span>
                        <div><div className="font-medium">{h.action}</div><div className="text-xs text-muted-foreground">{formatDateTime(h.at)} · {h.by}</div></div>
                      </li>
                    ))}
                  </ol>
                </SectionCard>

                {selected.resolution && (
                  <Card className="p-3 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900">
                    <div className="flex items-start gap-2 text-sm"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /><div><strong>Resolution:</strong> {selected.resolution}</div></div>
                  </Card>
                )}

                <SectionCard title="Audit history">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior events.</p>}
                  </div>
                </SectionCard>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canSuspend(currentRole) ? (
                  <PermissionDenied action="Suspend account / make risk decisions" allowedRoles={["risk"]} />
                ) : (
                  <>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("info")}><Send className="size-4" /> Request info</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("restrict")}><EyeOff className="size-4" /> Restrict visibility</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("suspend_content")}><FileWarning className="size-4" /> Suspend content</Button>
                    <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setSuspendOpen(true)}><UserX className="size-4" /> Suspend account (12.6)</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("restore")}><PlayCircle className="size-4" /> Restore</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("escalate")}><ScrollText className="size-4" /> Escalate to counsel</Button>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReasonDialog open={actionDialog === "info"} onOpenChange={(o) => !o && setActionDialog(null)} title="Request information" confirmLabel="Request" onConfirm={(r) => applyAction("info", r)} />
      <ReasonDialog open={actionDialog === "restrict"} onOpenChange={(o) => !o && setActionDialog(null)} title="Restrict visibility" confirmLabel="Restrict" onConfirm={(r) => applyAction("restrict", r)} />
      <ReasonDialog open={actionDialog === "suspend_content"} onOpenChange={(o) => !o && setActionDialog(null)} title="Suspend content" confirmLabel="Suspend content" destructive onConfirm={(r) => applyAction("suspend_content", r)} />
      <ReasonDialog open={actionDialog === "restore"} onOpenChange={(o) => !o && setActionDialog(null)} title="Restore entity" confirmLabel="Restore" onConfirm={(r) => applyAction("restore", r)} />
      <ReasonDialog open={actionDialog === "escalate"} onOpenChange={(o) => !o && setActionDialog(null)} title="Escalate to counsel" confirmLabel="Escalate" onConfirm={(r) => applyAction("escalate", r)} />

      {/* Suspend-user interlock (12.6) */}
      <SuspendUserDialog open={suspendOpen} onOpenChange={setSuspendOpen} caseId={selected?.id} onConfirm={(reason, mode) => {
        if (selected) applyAction("suspend_account", `${mode}: ${reason}`);
      }} />
    </div>
  );
}

function SuspendUserDialog({ open, onOpenChange, caseId, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; caseId?: string; onConfirm: (reason: string, mode: string) => void }) {
  const { users, contracts, payouts, refunds, disputes, kyc } = useQQ();
  const [userId, setUserId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [mode, setMode] = React.useState<"restrict_actions" | "full_suspend">("restrict_actions");
  const target = users.find((u) => u.id === userId);
  const activeContracts = target ? contracts.filter((c) => (c.buyerId === target.id || c.proId === target.id) && c.status !== "completed" && c.status !== "cancelled") : [];
  const pendingPayouts = target ? payouts.filter((p) => p.proId === target.id && p.status !== "processed" && p.status !== "failed") : [];
  const pendingRefunds = target ? refunds.filter((r) => r.buyerId === target.id && r.status !== "executed" && r.status !== "rejected") : [];
  const openDisputes = target ? disputes.filter((d) => d.raisedByName === target.name && d.status !== "resolved") : [];
  const retentionObligations = target ? kyc.filter((k) => k.userId === target.id && k.status === "approved") : [];

  const blocked = activeContracts.length > 0 || pendingPayouts.length > 0 || pendingRefunds.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suspend user — interlock check (Screen 12.6)</DialogTitle>
          <DialogDescription>Before suspending, the system checks active contracts, pending payments, pending payouts, open disputes, and retention obligations.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>User to suspend</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Choose user" /></SelectTrigger>
              <SelectContent>
                {users.filter((u) => u.role === "buyer" || u.role === "pro").map((u) => <SelectItem key={u.id} value={u.id}>{u.name} · {u.id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {target && (
            <Card className="p-3 space-y-2 text-sm">
              <div className="font-medium">Obligation check for {target.name}</div>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">{activeContracts.length === 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />} Active contracts: <strong>{activeContracts.length}</strong></li>
                <li className="flex items-center gap-2">{pendingPayouts.length === 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />} Pending payouts: <strong>{pendingPayouts.length}</strong></li>
                <li className="flex items-center gap-2">{pendingRefunds.length === 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />} Pending refunds: <strong>{pendingRefunds.length}</strong></li>
                <li className="flex items-center gap-2">{openDisputes.length === 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />} Open disputes: <strong>{openDisputes.length}</strong></li>
                <li className="flex items-center gap-2"><Info className="size-4 text-muted-foreground" /> Retention obligations (KYC): <strong>{retentionObligations.length}</strong> (held)</li>
              </ul>
              {blocked && <p className="text-xs text-amber-700 dark:text-amber-400">Suspension may need to be scoped — recommend <strong>restrict selected actions</strong> instead of full suspend until obligations clear.</p>}
            </Card>
          )}
          <div className="space-y-1.5">
            <Label>Suspension mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="restrict_actions">Restrict selected actions (recommended)</SelectItem>
                <SelectItem value="full_suspend">Full account suspend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sreason">Reason (recorded in audit)</Label>
            <Textarea id="sreason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Repeat circumvention policy violation" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={!target || !reason.trim()} onClick={() => { onConfirm(reason.trim(), mode === "restrict_actions" ? "Restricted actions" : "Full suspend"); onOpenChange(false); }}>
            <UserX className="size-4" /> {mode === "restrict_actions" ? "Restrict actions" : "Suspend account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== 8. AdminAudit =====================

export function AdminAudit() {
  const { audit, currentRole, currentUserId, addAudit } = useQQ();
  const { toast } = useToast();
  const [entityFilter, setEntityFilter] = React.useState<string>("all");
  const [adminFilter, setAdminFilter] = React.useState<string>("all");
  const [revealOpen, setRevealOpen] = React.useState(false);

  if (!canViewAudit(currentRole)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit log" description="Immutable record of all admin actions, including masked reveals." status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>} />
        <SectionCard><PermissionDenied action="View audit log" allowedRoles={["finance", "risk", "ops_manager"]} /></SectionCard>
      </div>
    );
  }

  const entities = Array.from(new Set(audit.map((a) => a.entity)));
  const admins = Array.from(new Set(audit.map((a) => a.adminId)));
  const filtered = audit.filter((a) =>
    (entityFilter === "all" || a.entity === entityFilter) &&
    (adminFilter === "all" || a.adminId === adminFilter)
  );

  function doReveal(reason: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action: "Masked reveal (demo)", entity: "KYC", entityId: "KYC-2201", reason, maskedReveal: true });
    toast({ title: "Masked reveal recorded", description: "Event added to audit log with maskedReveal: true." });
  }

  const cols: QueueColumn<AuditEvent>[] = [
    { key: "id", header: "Event ID", render: (a) => <span className="font-mono text-xs font-medium">{a.id}</span> },
    { key: "admin", header: "Admin", render: (a) => <div><div className="text-xs font-medium">{a.adminId}</div><div className="text-xs text-muted-foreground">{ROLE_LABELS[a.adminRole]}</div></div> },
    { key: "action", header: "Action", render: (a) => <span className="text-xs">{a.action}{a.maskedReveal && <Badge variant="outline" className="ml-1 text-[10px] border-amber-300 text-amber-700"><Eye className="size-2.5" />masked</Badge>}</span> },
    { key: "entity", header: "Entity", render: (a) => <span className="text-xs">{a.entity} <span className="font-mono text-[10px] text-muted-foreground">{a.entityId}</span></span>, hideOnMobile: true },
    { key: "transition", header: "Transition", render: (a) => <span className="text-xs text-muted-foreground">{a.oldStatus ?? "—"} → {a.newStatus ?? "—"}</span>, hideOnMobile: true },
    { key: "ts", header: "Timestamp", render: (a) => <span className="text-xs text-muted-foreground">{formatDateTime(a.timestamp)}</span> },
    { key: "reason", header: "Reason", render: (a) => a.reason ? <span className="text-xs line-clamp-1">{a.reason}</span> : <span className="text-muted-foreground">—</span>, hideOnMobile: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Immutable record of all admin actions. Masked-reveal events are flagged. Filter by entity type, admin, or date."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <SectionCard title="Filters" actions={
        <Button variant="outline" size="sm" onClick={() => setRevealOpen(true)}><Eye className="size-3.5" /> Demo masked reveal</Button>
      }>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Entity type</Label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entities.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Admin</Label>
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All admins</SelectItem>
                {admins.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">{filtered.length} events · Showing most recent first · Audit log is immutable</div>
      </SectionCard>

      <SectionCard>
        <QueueTable columns={cols} rows={filtered} onRowClick={(a) => toast({ title: a.action, description: `${a.adminId} · ${formatDateTime(a.timestamp)}` })} emptyMessage="No events match the filter." />
      </SectionCard>

      <ReasonDialog open={revealOpen} onOpenChange={setRevealOpen} title="Reveal masked field (demo)" description="Demonstrates the masked-reveal audit event. Each reveal creates an immutable event with your role and timestamp." confirmLabel="Reveal & audit" onConfirm={(r) => doReveal(r)} />
    </div>
  );
}

// ===================== 9. AdminGigModeration =====================

export function AdminGigModeration() {
  const { gigs, audit, currentRole, currentUserId, updateGig, addAudit } = useQQ();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [actionDialog, setActionDialog] = React.useState<"changes" | "reject" | "pause" | "escalate" | null>(null);

  const selected = gigs.find((g) => g.id === selectedId) ?? null;
  const queue = gigs.filter((g) => g.status === "submitted" || g.status === "under_review" || g.status === "changes_requested");

  function auditAction(action: string, entityId: string, oldStatus: string, newStatus: string, reason?: string) {
    addAudit({ adminId: currentUserId ?? "", adminRole: currentRole, action, entity: "Gig", entityId, oldStatus, newStatus, reason });
  }

  function approve() {
    if (!selected) return;
    const oldStatus = selected.status;
    updateGig(selected.id, { status: "approved_live", moderationReason: undefined });
    auditAction("Gig approved & published", selected.id, oldStatus, "approved_live", "Meets content & pricing policy");
    toast({ title: "Gig approved & live", description: `${selected.title} is now visible in the marketplace.` });
    setSelectedId(null);
  }
  function requestChanges(reason: string, option: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateGig(selected.id, { status: "changes_requested", moderationReason: option });
    auditAction("Gig — changes requested", selected.id, oldStatus, "changes_requested", `${option}: ${reason}`);
    toast({ title: "Changes requested", description: option });
  }
  function reject(reason: string, option: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateGig(selected.id, { status: "rejected", moderationReason: option });
    auditAction("Gig rejected", selected.id, oldStatus, "rejected", `${option}: ${reason}`);
    toast({ title: "Gig rejected", variant: "destructive" });
  }
  function pauseGig(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateGig(selected.id, { status: "paused", moderationReason: reason });
    auditAction("Gig paused", selected.id, oldStatus, "paused", reason);
    toast({ title: "Gig paused" });
  }
  function escalate(reason: string) {
    if (!selected) return;
    const oldStatus = selected.status;
    updateGig(selected.id, { status: "under_review" });
    auditAction("Gig escalated to Risk", selected.id, oldStatus, "under_review", reason);
    toast({ title: "Escalated to Risk T3" });
  }

  const cols: QueueColumn<GigDraft>[] = [
    { key: "id", header: "Gig ref", render: (g) => <span className="font-mono text-xs font-medium">{g.id}</span> },
    { key: "title", header: "Title", render: (g) => <span className="line-clamp-1">{g.title}</span> },
    { key: "pro", header: "Pro", render: (g) => <span className="text-xs">{g.proName}</span>, hideOnMobile: true },
    { key: "cat", header: "Category", render: (g) => <Badge variant="outline" className="text-xs">{g.category}</Badge>, hideOnMobile: true },
    { key: "fee", header: "Pro fee", render: (g) => <span className="tabular-nums">{formatINR(g.proFee)}</span> },
    { key: "status", header: "Status", render: (g) => <StatusBadge tone={statusMeta(g.status).tone}>{statusMeta(g.status).label}</StatusBadge> },
    { key: "submitted", header: "Submitted", render: (g) => <span className="text-xs text-muted-foreground">{timeAgo(g.createdAt)}</span>, hideOnMobile: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gig moderation (v0.2)"
        description="Review gig submissions: creator profile, category, pricing, deliverables, exclusions, evidence, content checks. Coming in v0.2 — fully built for demo."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <SectionCard>
        <QueueTable columns={cols} rows={queue} onRowClick={(g) => setSelectedId(g.id)} emptyMessage="No gigs awaiting moderation." />
      </SectionCard>

      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">Gig review · <span className="font-mono text-base">{selected.id}</span></SheetTitle>
                <SheetDescription>{selected.proName} · Submitted {timeAgo(selected.createdAt)}</SheetDescription>
              </SheetHeader>
              <div className="px-4 space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</StatusBadge>
                  <Badge variant="outline" className="text-xs">{selected.category}</Badge>
                  {selected.moderationReason && <Badge variant="outline" className="text-xs border-amber-300 text-amber-700"><AlertTriangle className="size-3" />{selected.moderationReason}</Badge>}
                </div>

                <div className="h-32 rounded-md" style={{ backgroundColor: selected.coverImageColor }} />

                <SectionCard title="Gig preview">
                  <div className="space-y-2 text-sm">
                    <div><div className="text-xs text-muted-foreground">Title</div><div className="font-medium">{selected.title}</div></div>
                    <div><div className="text-xs text-muted-foreground">Short description</div><div>{selected.shortDescription}</div></div>
                    <div><div className="text-xs text-muted-foreground">Detailed description</div><div className="text-muted-foreground">{selected.detailedDescription}</div></div>
                    <Row label="Pro fee" value={<span className="font-semibold tabular-nums">{formatINR(selected.proFee)}</span>} />
                    <Row label="Delivery timeline" value={selected.deliveryTimeline} />
                    <Row label="Revisions" value={String(selected.revisions)} />
                    <Row label="Package" value={selected.packageName} />
                    <Row label="Max concurrent orders" value={String(selected.maxConcurrentOrders)} />
                  </div>
                </SectionCard>

                <SectionCard title="Creator profile">
                  <div className="text-sm space-y-1">
                    <Row label="Pro" value={selected.proName} />
                    <Row label="Pro ID" value={<span className="font-mono">{selected.proId}</span>} />
                    <Row label="Tags" value={selected.tags.join(", ")} />
                    <Row label="Deliverable format" value={selected.deliverableFormat} />
                  </div>
                </SectionCard>

                <SectionCard title="Deliverables & exclusions">
                  <div className="space-y-2 text-sm">
                    <div><div className="text-xs text-muted-foreground">Included items</div><ul className="list-disc pl-5">{selected.includedItems.map((i) => <li key={i}>{i}</li>)}</ul></div>
                    <div><div className="text-xs text-muted-foreground">Exclusions</div><ul className="list-disc pl-5">{selected.exclusions.map((i) => <li key={i}>{i}</li>)}</ul></div>
                    <div><div className="text-xs text-muted-foreground">Buyer requirements</div><ul className="list-disc pl-5">{selected.buyerRequirements.map((i) => <li key={i}>{i}</li>)}</ul></div>
                  </div>
                </SectionCard>

                <SectionCard title="Evidence & content checks">
                  <div className="space-y-2 text-sm">
                    <div><div className="text-xs text-muted-foreground">Linked evidence</div>{selected.evidence.length ? <ul className="list-disc pl-5">{selected.evidence.map((i) => <li key={i}>{i}</li>)}</ul> : <span className="text-muted-foreground">No evidence linked</span>}</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" />Circumvention scan: no phone/email/payment links detected</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" />Pricing consistency: within band</div>
                    <div className="flex items-center gap-2">{selected.includedItems.length > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />}Deliverable list present</div>
                  </div>
                </SectionCard>

                <SectionCard title="Moderation history">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {audit.filter((a) => a.entityId === selected.id).map((e) => <AuditRow key={e.id} event={e} />)}
                    {audit.filter((a) => a.entityId === selected.id).length === 0 && <p className="text-sm text-muted-foreground">No prior moderation events.</p>}
                  </div>
                </SectionCard>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
                {!canModerateGigs(currentRole) ? (
                  <PermissionDenied action="Moderate gig" allowedRoles={["admin_support", "ops_manager"]} />
                ) : (
                  <>
                    <Button className="flex-1 min-h-[44px]" onClick={approve}><CheckCircle2 className="size-4" /> Approve & publish</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("changes")}><FileSearch className="size-4" /> Request changes</Button>
                    <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("reject")}><XCircle className="size-4" /> Reject</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("pause")}><PauseCircle className="size-4" /> Pause gig</Button>
                    <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setActionDialog("escalate")}><ShieldAlert className="size-4" /> Escalate to Risk</Button>
                  </>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ReasonDialog open={actionDialog === "changes"} onOpenChange={(o) => !o && setActionDialog(null)} title="Request changes" confirmLabel="Request changes" options={GIG_MODERATION_REASONS} requireOption onConfirm={(r, o) => requestChanges(r, o ?? "Unclear scope")} />
      <ReasonDialog open={actionDialog === "reject"} onOpenChange={(o) => !o && setActionDialog(null)} title="Reject gig" confirmLabel="Reject" destructive options={GIG_MODERATION_REASONS} requireOption onConfirm={(r, o) => reject(r, o ?? "Unsupported claim")} />
      <ReasonDialog open={actionDialog === "pause"} onOpenChange={(o) => !o && setActionDialog(null)} title="Pause gig" confirmLabel="Pause" onConfirm={(r) => pauseGig(r)} />
      <ReasonDialog open={actionDialog === "escalate"} onOpenChange={(o) => !o && setActionDialog(null)} title="Escalate to Risk" confirmLabel="Escalate" onConfirm={(r) => escalate(r)} />
    </div>
  );
}

// ===================== 10. AdminNotes =====================

export function AdminNotes() {
  const { adminNotes, currentRole } = useQQ();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin notes & permissions"
        description="v0.1 implementation assumptions + the permission matrix that governs every admin action."
        status={<Badge variant="outline"><RolePill role={currentRole} /></Badge>}
      />

      <SectionCard title="Implementation assumptions (v0.1)" description="Hard constraints for this prototype. Do not display contradicting features.">
        <ul className="space-y-2 text-sm">
          {adminNotes.map((n, i) => (
            <li key={i} className="flex items-start gap-2">
              <ListChecks className="size-4 mt-0.5 text-primary shrink-0" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Admin notes (store)" description="Read-only list sourced from the Zustand store (`adminNotes`).">
        <Card className="p-4 space-y-2 text-sm">
          {adminNotes.map((n, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md border border-border px-3 py-2">
              <Badge variant="outline" className="text-[10px] font-mono">{i + 1}</Badge>
              <span>{n}</span>
            </div>
          ))}
        </Card>
      </SectionCard>

      <SectionCard title="Permission matrix" description="Each admin action is gated by role. Support T1, Finance T2, Risk T3, Ops Manager — no single role can do everything.">
        <PermissionMatrix />
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
          <Card className="p-3">
            <div className="font-medium flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" />Maker-checker</div>
            <p className="text-xs text-muted-foreground mt-1">All money movement requires Maker (Finance T2) confirmation. Above ₹25,000 requires separate Checker authorization. Ops Manager must not bypass without documented authorization.</p>
          </Card>
          <Card className="p-3">
            <div className="font-medium flex items-center gap-2"><Lock className="size-4 text-amber-600" />Masked by default</div>
            <p className="text-xs text-muted-foreground mt-1">PAN, account, IFSC are masked by default. Reveal requires authorized role + reason + audit event. General tables use beneficiary tokens — never raw bank details.</p>
          </Card>
          <Card className="p-3">
            <div className="font-medium flex items-center gap-2"><Hourglass className="size-4 text-primary" />SLA enforcement</div>
            <p className="text-xs text-muted-foreground mt-1">Each queue has its own SLA. Approaching → breached → escalation-due states surface in the unified SLA queue. Disputes escalate to Ops Manager at 14 days.</p>
          </Card>
          <Card className="p-3">
            <div className="font-medium flex items-center gap-2"><ScrollText className="size-4 text-primary" />Immutable audit</div>
            <p className="text-xs text-muted-foreground mt-1">Every admin action — money movement, suspension, masked reveal, dispute decision — is recorded with admin ID, role, previous & next state, reason, and timestamp.</p>
          </Card>
        </div>
      </SectionCard>

      <SectionCard title="v0.1 specific constraints" description="These are non-negotiable in this prototype.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><Wallet className="size-4 text-muted-foreground" />No wallet</div><p className="text-xs text-muted-foreground mt-1">No in-platform balance. Surplus/overpayment cannot be auto-credited.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><Landmark className="size-4 text-muted-foreground" />No escrow</div><p className="text-xs text-muted-foreground mt-1">No automated escrow. Payments verified manually by Finance.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><Banknote className="size-4 text-muted-foreground" />Manual payouts</div><p className="text-xs text-muted-foreground mt-1">No auto-payout API. Finance exports batches and processes via bank.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><BadgeCheck className="size-4 text-emerald-600" />14% beta fee</div><p className="text-xs text-muted-foreground mt-1">Buyer fee fixed at 14% for controlled beta. 13% standard and earned-rate ladder are future — must NOT be shown as active.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><Receipt className="size-4 text-emerald-600" />0% Pro commission</div><p className="text-xs text-muted-foreground mt-1">Pro fee and Buyer fee are always separate line items. Net payout = Pro fee (minus statutory withholding if applied).</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><ListChecks className="size-4 text-primary" />Max 4 milestones</div><p className="text-xs text-muted-foreground mt-1">Due to manual payment verification overhead in v0.1.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><FileCheck2 className="size-4 text-amber-600" />Taxes: Finance-only</div><p className="text-xs text-muted-foreground mt-1">Shown as "Calculated by Finance if applicable". Never hardcode TDS/GST/TCS rates.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><UserCog className="size-4 text-muted-foreground" />Role switcher = demo only</div><p className="text-xs text-muted-foreground mt-1">Restricted to prototype mode for demo/QA. Not a production feature.</p></Card>
          <Card className="p-3"><div className="font-medium flex items-center gap-2"><AlertOctagon className="size-4 text-destructive" />No off-platform payments</div><p className="text-xs text-muted-foreground mt-1">Circumvention detection in messages; flagged to Trust & Safety.</p></Card>
        </div>
      </SectionCard>
    </div>
  );
}
