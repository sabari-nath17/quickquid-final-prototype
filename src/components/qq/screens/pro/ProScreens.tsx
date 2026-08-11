"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, Wallet, Briefcase, Send, Eye, AlertTriangle,
  CheckCircle2, Clock, XCircle, ShieldCheck, Info, ArrowRight, ArrowLeft,
  Plus, Pencil, Pause, Copy, Archive, MessageSquare, Star, Sparkles,
  ExternalLink, ChevronRight, ChevronLeft, Loader2, AlertCircle, Banknote,
  Lock, Flag, History, Gavel, Award, X, Save, EyeOff, Inbox, Tag, Globe,
  Calendar, UserCog, BellOff, FileWarning, ListChecks, RefreshCw, Filter,
} from "lucide-react";
import {
  PageHeader, EmptyState, SectionCard, MaskedField, QQProgress, ActivityTimeline, useNavigationGuard, QuickQuidVerifiedBadge,
} from "@/components/qq/shared";
import { VaultDeliverable, type VaultFile, type VaultState } from "@/components/qq/shared/VaultDeliverable";
import { DeliveryVault } from "@/components/qq/shared/DeliveryVault";
import { PriorityBoostPanel } from "@/components/qq/shared/PriorityBoostPanel";
import type { VaultItem as VaultItemType, VaultState as VaultStateType } from "@/lib/qq/types";
import { PortfolioGallery } from "@/components/qq/shared/PortfolioGallery";
import { StatusBadge, statusMeta } from "@/components/qq/shared/StatusBadge";
import { FeeBreakdown } from "@/components/qq/shared/FeeBreakdown";
import {
  BriefCard, MilestoneStepper, ContractMilestoneList, PortfolioItemCard,
} from "@/components/qq/shared/cards";
import { EvidenceDropzone } from "@/components/qq/shared/EvidenceDropzone";
import {
  formatINR, buyerFee, buyerTotal, budgetBand, BUDGET_BANDS, CATEGORIES,
  DECLINE_REASONS, GIG_MODERATION_REASONS, DISPUTE_CATEGORIES, genId, timeAgo,
  formatDate, formatDateTime, hoursSince, maskAccount, maskIfsc, detectCircumvention,
} from "@/lib/qq/format";
import type {
  ProProfile, Brief, Proposal, Contract, Milestone, Payout, Dispute, Review,
  GigDraft, PortfolioItem, DeliveryVersion, VerificationStatus, ProposalStatus,
  ContractStatus, MilestoneStatus, DisputeCategory, PaymentEvidence, AuditEvent, KycSubmission, ExternalProfileProvider, ExternalProfileLink,
} from "@/lib/qq/types";
import { EXTERNAL_PROFILE_OPTIONS, externalProviderLabel, normalizeExternalProfileUrl } from "@/lib/qq/external";

// ============================================================
// Shared helpers
// ============================================================

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function avatarColor(userId?: string) {
  if (userId === "PRO-2088") return "#7C3AED";
  if (userId === "PRO-2099") return "#0891B2";
  if (userId === "PRO-2101") return "#DB2777";
  if (userId === "PRO-2102") return "#CA8A04";
  return "#475569";
}

const PROPOSAL_LIMIT = 10;

function InterlockCard({
  tone = "warning", title, body, primary, secondary, icon: Icon = AlertTriangle,
}: {
  tone?: "warning" | "critical" | "info";
  title: string; body: string;
  primary?: React.ReactNode; secondary?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const toneCls =
    tone === "critical"
      ? "border-red-200 bg-red-50 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200"
      : tone === "info"
      ? "border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-950/30 dark:border-sky-900 dark:text-sky-200"
      : "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200";
  const iconCls = tone === "critical" ? "text-red-600" : tone === "info" ? "text-sky-600" : "text-amber-600";
  return (
    <Card className={cn("border p-4", toneCls)}>
      <div className="flex items-start gap-2.5">
        <Icon className={cn("size-4 mt-0.5 shrink-0", iconCls)} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{title}</div>
          <p className="mt-1 text-xs opacity-90">{body}</p>
          {(primary || secondary) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {primary}
              {secondary}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function StatCard({
  label, value, icon: Icon, tone = "default",
}: {
  label: string; value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={cn("mt-1 text-xl font-semibold tabular-nums", tone === "success" && "text-emerald-600 dark:text-emerald-400", tone === "warning" && "text-amber-600 dark:text-amber-400")}>{value}</div>
        </div>
        <div className={cn("rounded-md p-2", tone === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : tone === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  );
}

function useMyProProfile(): ProProfile | undefined {
  const { proProfiles, currentUserId } = useQQ();
  return proProfiles.find((p) => p.userId === currentUserId);
}

function useMyContracts(): Contract[] {
  const { contracts, currentUserId } = useQQ();
  return contracts.filter((c) => c.proId === currentUserId);
}

function hasFundingPending(contracts: Contract[]): boolean {
  return contracts.some((c) => c.milestones.some((m) => m.status === "funding_pending"));
}

// ============================================================
// 1. ProDashboard
// ============================================================

export function ProDashboard() {
  const { currentUserId, navigate, proposals, payouts, contracts, setKycModal, audit, payments, kyc } = useQQ();
  const profile = useMyProProfile();
  const myContracts = useMyContracts();
  const { toast } = useToast();

  const activeEngagements = myContracts.filter((c) =>
    ["offer_sent", "offer_accepted_pending_funding", "active", "disputed"].includes(c.status)
  );

  const activeProposals = proposals.filter(
    (p) => p.proId === currentUserId && (p.status === "pending" || p.status === "shortlisted")
  );

  const pendingPayouts = payouts.filter(
    (p) => p.proId === currentUserId && ["queued", "maker_confirmed", "checker_authorized", "processing"].includes(p.status)
  );

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthEarnings = payouts
    .filter((p) => p.proId === currentUserId && p.status === "processed" && p.processedAt &&
      new Date(p.processedAt).getMonth() === thisMonth && new Date(p.processedAt).getFullYear() === thisYear)
    .reduce((sum, p) => sum + p.netPayout, 0);

  const payoutReady = profile?.payoutReadiness === "approved";
  const showFundingBanner = hasFundingPending(myContracts);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pro dashboard"
        description="0% QuickQuid commission. Keep 100% of your agreed professional fee."
        status={<StatusBadge tone="success" icon>Pro · {profile?.displayName ?? "—"}</StatusBadge>}
      >
        <Button variant="outline" onClick={() => navigate("pro_briefs")}><Briefcase className="size-4" /> Browse briefs</Button>
        <Button onClick={() => navigate("pro_proposals")}><FileText className="size-4" /> My proposals</Button>
      </PageHeader>

      {showFundingBanner && (
        <div className="sticky top-16 z-20 -mx-1">
          <InterlockCard
            tone="warning"
            icon={AlertTriangle}
            title="Payment verification pending. Do not begin work until QuickQuid confirms funding."
            body="An accepted milestone is being processed via the integrated payment system. You will be notified once funding is confirmed."
            primary={<Button size="sm" onClick={() => navigate("pro_contract", { contractId: myContracts.find((c) => c.milestones.some((m) => m.status === "funding_pending"))?.id ?? "" })}><Eye className="size-3.5" /> View contract</Button>}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active proposals" value={activeProposals.length} icon={FileText} tone={activeProposals.length >= PROPOSAL_LIMIT ? "warning" : "default"} />
        <StatCard label="Active contracts" value={activeEngagements.length} icon={Briefcase} />
        <StatCard label="Pending payouts" value={pendingPayouts.length} icon={Wallet} tone={pendingPayouts.length > 0 ? "warning" : "default"} />
        <StatCard label="This month (net)" value={formatINR(monthEarnings)} icon={Banknote} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard
            title="Active engagements"
            description="Contracts where you are the engaged Pro. Funding-pending milestones are gated."
            actions={<Button size="sm" variant="ghost" onClick={() => navigate("pro_briefs")}><Plus className="size-3.5" /> Find work</Button>}
          >
            {activeEngagements.length === 0 ? (
              <EmptyState
                title="No active engagements yet"
                description="Browse open briefs and submit your first proposal to begin. We will surface accepted contracts here."
                icon={Briefcase}
                actions={<Button onClick={() => navigate("pro_briefs")}><Briefcase className="size-4" /> Browse briefs</Button>}
              />
            ) : (
              <div className="space-y-2">
                {activeEngagements.map((c) => {
                  const cm = c.milestones.find((m) => m.id === c.currentMilestoneId) ?? c.milestones[0];
                  const m = statusMeta(c.status);
                  const fundingPending = c.milestones.some((ms) => ms.status === "funding_pending");
                  return (
                    <div
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate("pro_contract", { contractId: c.id })}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("pro_contract", { contractId: c.id }); } }}
                      className="w-full text-left rounded-lg border border-border bg-card p-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{c.briefTitle}</h3>
                            <StatusBadge tone={m.tone} icon={false}>{m.label}</StatusBadge>
                            {fundingPending && <StatusBadge tone="warning">Funding pending</StatusBadge>}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Buyer · {c.buyerName} · Contract <span className="font-mono">{c.id}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Current milestone · <span className="font-medium text-foreground">{cm?.label ?? "—"}</span> ({cm ? formatINR(cm.proFee) : "—"})
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground">Pro fee</div>
                          <div className="font-semibold tabular-nums">{formatINR(c.totalProFee)}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">Updated {timeAgo(c.createdAt)}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-end">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">Open workroom <ArrowRight className="size-3.5" /></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Proposal limit" description={`You can have up to ${PROPOSAL_LIMIT} active proposals at a time.`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{activeProposals.length} of {PROPOSAL_LIMIT} active</span>
                <span className="tabular-nums text-xs text-muted-foreground">{Math.round((activeProposals.length / PROPOSAL_LIMIT) * 100)}%</span>
              </div>
              <QQProgress value={(activeProposals.length / PROPOSAL_LIMIT) * 100} tone={activeProposals.length >= PROPOSAL_LIMIT ? "warning" : "primary"} />
              {activeProposals.length >= PROPOSAL_LIMIT && (
                <p className="text-xs text-amber-700 dark:text-amber-400">You have reached your current active proposal limit. Withdraw an existing proposal or wait for a decision.</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate("pro_proposals")}>Manage proposals</Button>
                <Button size="sm" variant="ghost" onClick={() => navigate("pro_briefs")} disabled={activeProposals.length >= PROPOSAL_LIMIT}>Browse briefs</Button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          {!payoutReady && (
            <InterlockCard
              tone="warning"
              icon={Wallet}
              title="Add payout details before applying"
              body="QuickQuid needs approved payout details before you can submit a paid-work proposal."
              primary={<Button size="sm" onClick={() => setKycModal(true)}><ShieldCheck className="size-3.5" /> Add payout details</Button>}
              secondary={<Button size="sm" variant="ghost" onClick={() => navigate("readiness")}>Cancel</Button>}
            />
          )}

          {payoutReady && (
            <SectionCard title="Payout readiness" description="Approved payout details on file.">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Payout details approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Eligible to submit paid-work proposals</span>
                </div>
                <div className="text-xs text-muted-foreground">Bank: {profile?.payoutDetails?.bankName ?? "—"} · Account {profile?.payoutDetails?.accountNumberMasked ?? "—"}</div>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate("pro_payouts")}><Wallet className="size-3.5" /> View payouts</Button>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Profile completion" description="Your profile is visible, but proposal access may remain limited until the required review steps are complete.">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {profile?.bio ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />}
                <span>Bio & headline</span>
              </div>
              <div className="flex items-center gap-2">
                {(profile?.portfolioItems.length ?? 0) > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />}
                <span>Portfolio items ({profile?.portfolioItems.length ?? 0})</span>
              </div>
              <div className="flex items-center gap-2">
                {payoutReady ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />}
                <span>Payout details approved</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => navigate("pro_profile")}>Edit profile <ArrowRight className="size-3.5" /></Button>
          </SectionCard>

          <SectionCard title="0% QuickQuid commission">
            <p className="text-sm text-muted-foreground">Keep 100% of your agreed professional fee. The Buyer sees the applicable 0% QuickQuid fee before payment.</p>
            <div className="mt-2 text-xs text-muted-foreground">Payouts are processed via the integrated payment system.</div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Recent activity" description="Latest events across your proposals, contracts, payouts, and milestones.">
        <ActivityTimeline
          events={buildProTimeline(myContracts, proposals, payouts, payments, audit, kyc, currentUserId ?? "")}
          emptyMessage="No activity yet. Browse briefs or submit a proposal to get started."
        />
      </SectionCard>
    </div>
  );
}

function buildProTimeline(
  contracts: Contract[],
  proposals: Proposal[],
  payouts: Payout[],
  payments: PaymentEvidence[],
  audit: AuditEvent[],
  kyc: KycSubmission[],
  userId: string,
) {
  const events: { id: string; tone?: "info" | "success" | "warning" | "critical" | "neutral"; title: string; description?: string; timestamp: string; actor?: string }[] = [];
  const myContractIds = new Set(contracts.map((c) => c.id));

  // Proposals
  proposals.filter((p) => p.proId === userId).forEach((p) => {
    events.push({
      id: p.id,
      tone: p.status === "shortlisted" ? "success" : p.status === "declined" ? "critical" : "info",
      title: `Proposal ${p.status.replace(/_/g, " ")}`,
      description: `${p.id} · ${p.briefTitle} · ${formatINR(p.proposedFee)}`,
      timestamp: p.createdAt,
    });
  });

  // Contracts
  contracts.forEach((c) => {
    const fundingPending = c.milestones.some((m) => m.status === "funding_pending");
    events.push({
      id: c.id,
      tone: c.status === "completed" ? "success" : c.status === "disputed" ? "critical" : fundingPending ? "warning" : "info",
      title: `Contract ${c.id} ${c.status.replace(/_/g, " ")}`,
      description: `${c.briefTitle} · ${c.buyerName}`,
      timestamp: c.createdAt,
    });
  });

  // Payouts
  payouts.filter((p) => p.proId === userId).forEach((p) => {
    events.push({
      id: p.id,
      tone: p.status === "processed" ? "success" : p.status === "failed" ? "critical" : "info",
      title: `Payout ${p.status.replace(/_/g, " ")}`,
      description: `${p.id} · ${p.milestoneLabel} · ${formatINR(p.netPayout)}${p.reference ? " · " + p.reference : ""}`,
      timestamp: p.processedAt ?? p.queuedAt,
    });
  });

  // Payment confirmations on my contracts
  payments.filter((p) => myContractIds.has(p.contractId)).forEach((p) => {
    events.push({
      id: p.id,
      tone: p.status === "payment_confirmed" ? "success" : p.status === "payment_rejected" ? "critical" : "warning",
      title: `Payment ${p.status.replace(/_/g, " ")}`,
      description: `${p.id} · ${p.milestoneLabel} · ${formatINR(p.amountDue)}`,
      timestamp: p.resolvedAt ?? p.submittedAt,
    });
  });

  // KYC events
  kyc.filter((k) => k.userId === userId).forEach((k) => {
    events.push({
      id: k.id,
      tone: k.status === "approved" ? "success" : k.status === "rejected" ? "critical" : "warning",
      title: `Verification ${k.status.replace(/_/g, " ")}`,
      description: k.rejectionReason ?? "Identity and payout details review",
      timestamp: k.resolvedAt ?? k.submittedAt,
    });
  });

  // Audit events for my entities
  audit.filter((a) => myContractIds.has(a.entityId)).slice(0, 5).forEach((a) => {
    events.push({
      id: a.id,
      tone: a.maskedReveal ? "warning" : "neutral",
      title: a.action,
      description: `${a.entity} ${a.entityId}${a.reason ? " · " + a.reason : ""}`,
      timestamp: a.timestamp,
      actor: a.adminId,
    });
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
}

// ============================================================
// 2. ProProfile
// ============================================================

const AVATAR_COLORS = ["#7C3AED", "#0891B2", "#DB2777", "#CA8A04", "#0F766E", "#9F1239", "#15803D", "#475569"];
const RESPONSE_TIMES = ["Under 1 hour", "Under 2 hours", "Under 4 hours", "Under 6 hours", "Under 1 day", "Under 2 days"];
const PROJECT_SIZES = ["Under ₹20,000", "₹20,000 - ₹55,000", "₹40,000 - ₹1,50,000", "₹60,000 - ₹2,00,000", "Above ₹2,00,000"];
const TIMELINES = ["Under 1 week", "1 - 4 weeks", "4 - 8 weeks", "4 - 12 weeks", "6 - 16 weeks", "Above 16 weeks"];
const TIME_ZONES = ["IST (UTC+5:30)", "GST (UTC+4)", "GMT (UTC+0)", "EST (UTC-5)", "PST (UTC-8)"];
const LANGUAGES = ["English", "Hindi", "Malayalam", "Tamil", "Kannada", "Bengali", "Marathi", "Gujarati"];

export function ProProfile() {
  const { currentUserId, updateProProfile, setKycModal, navigate, addAudit, kyc } = useQQ();
  const profile = useMyProProfile();
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"profile" | "payout" | "preview">("profile");
  const [previewMode, setPreviewMode] = React.useState<"buyer" | "pro">("buyer");
  const [skillsDraft, setSkillsDraft] = React.useState("");
  const [newPortfolioTitle, setNewPortfolioTitle] = React.useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = React.useState("");
  const [newPortfolioUrl, setNewPortfolioUrl] = React.useState("");
  const [newPortfolioCategory, setNewPortfolioCategory] = React.useState(CATEGORIES[0]);
  const [externalProvider, setExternalProvider] = React.useState<ExternalProfileProvider>("github");
  const [externalUrl, setExternalUrl] = React.useState("");

  // payout editor local state
  const [beneficiary, setBeneficiary] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [payoutEditing, setPayoutEditing] = React.useState(false);

  React.useEffect(() => {
    if (profile?.payoutDetails) {
      setBeneficiary(profile.payoutDetails.beneficiaryName);
      setBankName(profile.payoutDetails.bankName);
    }
  }, [profile?.payoutDetails]);

  if (!profile) {
    return <EmptyState title="No profile found" description="Switch to a Pro demo account to view this screen." icon={UserCog} />;
  }

  function patch(p: Partial<ProProfile>) {
    if (!currentUserId) return;
    updateProProfile(currentUserId, p);
  }

  function addSkill() {
    const v = skillsDraft.trim();
    if (!v) return;
    if (profile!.skills.includes(v)) { toast({ title: "Already added", variant: "destructive" }); return; }
    patch({ skills: [...profile!.skills, v] });
    setSkillsDraft("");
  }

  function removeSkill(s: string) {
    patch({ skills: profile!.skills.filter((x) => x !== s) });
  }

  function addPortfolioItem() {
    if (!newPortfolioTitle.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const item: PortfolioItem = {
      id: genId("PF"),
      title: newPortfolioTitle.trim(),
      description: newPortfolioDesc.trim(),
      category: newPortfolioCategory,
      type: "case_study",
      url: newPortfolioUrl.trim() || undefined,
    };
    patch({ portfolioItems: [...profile!.portfolioItems, item] });
    setNewPortfolioTitle(""); setNewPortfolioDesc(""); setNewPortfolioUrl("");
    toast({ title: "Portfolio item added" });
  }

  function removePortfolioItem(id: string) {
    patch({ portfolioItems: profile!.portfolioItems.filter((p) => p.id !== id) });
  }

  function addExternalLink() {
    const url = normalizeExternalProfileUrl(externalUrl, externalProvider);
    if (!url) {
      toast({ title: "Use a valid public HTTPS profile URL", description: "Contact, payment, messaging, and unsupported host links are not accepted.", variant: "destructive" });
      return;
    }
    const links = profile!.externalLinks ?? [];
    if (links.some((link) => link.url === url)) {
      toast({ title: "Link already added", variant: "destructive" });
      return;
    }
    const link: ExternalProfileLink = { provider: externalProvider, url, status: "self_declared" };
    patch({ externalLinks: [...links, link] });
    setExternalUrl("");
    toast({ title: `${externalProviderLabel(externalProvider)} link added`, description: "It will be included in the next Admin onboarding snapshot." });
  }

  function removeExternalLink(url: string) {
    patch({ externalLinks: (profile!.externalLinks ?? []).filter((link) => link.url !== url) });
  }

  function toggleFeatured(id: string) {
    patch({
      portfolioItems: profile!.portfolioItems.map((p) =>
        p.id === id ? { ...p, featured: !p.featured } : p
      ),
    });
  }

  function savePayout() {
    if (!beneficiary.trim() || !account.trim() || !ifsc.trim() || !bankName.trim()) {
      toast({ title: "All payout fields are required", variant: "destructive" });
      return;
    }
    patch({
      payoutReadiness: "pending_reverification",
      payoutDetails: {
        beneficiaryName: beneficiary.trim(),
        accountNumberMasked: maskAccount(account.trim()),
        ifscMasked: maskIfsc(ifsc.trim()),
        bankName: bankName.trim(),
      },
    });
    addAudit({
      adminId: currentUserId ?? "",
      adminRole: "pro",
      action: "Payout details updated",
      entity: "ProProfile",
      entityId: currentUserId ?? "",
      oldStatus: "approved",
      newStatus: "pending_reverification",
      reason: "Pro edited payout details — paused pending re-verification",
    });
    setPayoutEditing(false);
    toast({
      title: "Payout details submitted for re-verification",
      description: "New paid-work proposals are paused until an Admin re-verifies.",
    });
  }

  function toggleAvailability() {
    const next = profile!.availability === "available_now" ? "paused" : "available_now";
    patch({ availability: next });
    if (next === "paused") {
      toast({ title: "Availability paused", description: "Your profile is hidden from Available Now results. Existing contracts are unaffected." });
    } else {
      toast({ title: "Available for new work" });
    }
  }

  function togglePublicVisibility() {
    patch({ publicVisibility: !profile!.publicVisibility });
    toast({ title: profile!.publicVisibility ? "Profile hidden" : "Profile published" });
  }

  function saveDraft() {
    toast({ title: "Draft saved", description: "Only information marked Public appears in discovery." });
  }
  function publish() {
    patch({ publicVisibility: true });
    toast({ title: "Profile published", description: "Only information marked Public appears in discovery." });
  }
  function unpublish() {
    patch({ publicVisibility: false });
    toast({ title: "Profile unpublished", description: "Your profile is now hidden from discovery." });
  }

  const payoutStatus = profile.payoutReadiness;
  const featured = profile.portfolioItems.find((p) => p.featured);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("pro_dashboard")} className="shrink-0">
          <ChevronLeft className="size-4" /> Dashboard
        </Button>
        <PageHeader
          title="Pro profile"
          description="Complete your profile so the right people can evaluate you quickly. Only information marked Public appears in discovery."
          status={<StatusBadge tone={profile.publicVisibility ? "success" : "paused"} icon>{profile.publicVisibility ? "Public" : "Hidden"}</StatusBadge>}
        >
          <Button variant="outline" onClick={saveDraft}><Save className="size-4" /> Save draft</Button>
          <Button
            onClick={() => {
              const ready = !!profile.headline.trim() && !!profile.bio.trim() && !!profile.primaryCategory && profile.skills.length > 0 && profile.portfolioItems.length > 0 && (profile.externalLinks?.length ?? 0) > 0;
              if (!ready) {
                toast({ title: "Complete Pro onboarding first", description: "Add your headline, bio, category, skills, portfolio item, and at least one public proof link before submitting for Admin review.", variant: "destructive" });
                return;
              }
              setKycModal(true);
            }}
            disabled={profile.onboardingStatus === "under_review" || profile.onboardingStatus === "approved"}
          >
            <ShieldCheck className="size-4" /> {profile.onboardingStatus === "approved" ? "Onboarding approved" : profile.onboardingStatus === "under_review" ? "Admin review pending" : "Submit onboarding"}
          </Button>
          {profile.publicVisibility ? (
            <Button variant="outline" onClick={unpublish}>Unpublish</Button>
          ) : (
            <Button onClick={publish}>Publish</Button>
          )}
          <Button variant="ghost" onClick={() => navigate("support")}><Flag className="size-4" /> Report</Button>
        </PageHeader>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="profile">Profile editor</TabsTrigger>
          <TabsTrigger value="payout">Payout details</TabsTrigger>
          <TabsTrigger value="preview">Public preview</TabsTrigger>
        </TabsList>

        {/* ---------- Profile editor ---------- */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <SectionCard title="Identity & display" description="Do not add phone numbers, personal email addresses, or direct payment links to your public profile.">
                <div className="space-y-3">
                  <div>
                    <Label>Avatar color</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => patch({})}
                          className={cn("size-8 rounded-full border-2", profile.userId === currentUserId ? "ring-2 ring-offset-2 ring-primary" : "")}
                          style={{ backgroundColor: c, borderColor: c === "#7C3AED" ? "#7C3AED" : "transparent" }}
                          aria-label={`Color ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="displayName">Public display name</Label>
                      <Input id="displayName" value={profile.displayName} onChange={(e) => patch({ displayName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="headline">Headline</Label>
                      <Input id="headline" value={profile.headline} onChange={(e) => patch({ headline: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" rows={4} value={profile.bio} onChange={(e) => patch({ bio: e.target.value })} placeholder="Describe your expertise…" />
                    <p className="text-xs text-muted-foreground">{profile.bio.length} characters · appears publicly</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Categories & skills">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Primary category</Label>
                    <Select value={profile.primaryCategory} onValueChange={(v) => patch({ primaryCategory: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Secondary category</Label>
                    <Select value={profile.secondaryCategory ?? "none"} onValueChange={(v) => patch({ secondaryCategory: v === "none" ? undefined : v })}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {CATEGORIES.filter((c) => c !== profile.primaryCategory).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Label htmlFor="skill">Skills</Label>
                  <div className="flex gap-2">
                    <Input id="skill" value={skillsDraft} onChange={(e) => setSkillsDraft(e.target.value)} placeholder="Add a skill, e.g. Figma" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                    <Button type="button" onClick={addSkill}><Plus className="size-4" /> Add</Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <button onClick={() => removeSkill(s)} aria-label={`Remove ${s}`}><X className="size-3" /></button>
                      </Badge>
                    ))}
                    {profile.skills.length === 0 && <span className="text-xs text-muted-foreground">No skills added yet.</span>}
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Connected proof" description="Public work links help Buyers and Admin compare evidence. QuickQuid never asks for passwords here; production OAuth/API sync must run through a server-side adapter.">
                <div className="space-y-3">
                  {(profile.externalLinks ?? []).map((link) => (
                    <div key={link.url} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium"><Globe className="size-3.5 text-primary" /> {link.label ?? externalProviderLabel(link.provider)} {link.isDemo && <Badge variant="outline" className="text-[10px]">Demo fixture</Badge>} {link.status === "reviewed" && <Badge variant="outline" className="text-[10px]">Admin reviewed</Badge>}</div>
                        <a href={link.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-primary hover:underline">{link.url}</a>
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeExternalLink(link.url)} aria-label={`Remove ${externalProviderLabel(link.provider)} link`}><X className="size-3.5" /></Button>
                    </div>
                  ))}
                  <div className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                    <Select value={externalProvider} onValueChange={(value) => setExternalProvider(value as ExternalProfileProvider)}>
                      <SelectTrigger aria-label="Proof provider"><SelectValue /></SelectTrigger>
                      <SelectContent>{EXTERNAL_PROFILE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://github.com/username" aria-label="Public proof URL" />
                    <Button type="button" variant="outline" onClick={addExternalLink}><Plus className="size-4" /> Add link</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Supported now: URL capture and public GitHub repository preview. LinkedIn, Behance, Dribbble, and website connections are stored as reviewable links; OAuth tokens and private data are intentionally out of this frontend prototype.</p>
                </div>
              </SectionCard>

              <SectionCard title="Portfolio" description="Add case studies, links, or images. Mark one item as Featured to control what shows first.">
                <div className="space-y-2">
                  {profile.portfolioItems.map((p) => (
                    <div key={p.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">{p.title}</h4>
                            {p.featured && <Badge className="bg-amber-50 text-amber-700 border-amber-200">Featured</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.category}</p>
                          <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                          {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="size-3" /> {p.url}</a>}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="ghost" onClick={() => toggleFeatured(p.id)}>{p.featured ? "Unfeature" : "Feature"}</Button>
                          <Button size="sm" variant="ghost" onClick={() => removePortfolioItem(p.id)}><X className="size-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {profile.portfolioItems.length === 0 && <p className="text-sm text-muted-foreground">No portfolio items yet.</p>}
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Add portfolio item</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Input placeholder="Title" value={newPortfolioTitle} onChange={(e) => setNewPortfolioTitle(e.target.value)} />
                    <Select value={newPortfolioCategory} onValueChange={setNewPortfolioCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Textarea rows={2} placeholder="Short description" value={newPortfolioDesc} onChange={(e) => setNewPortfolioDesc(e.target.value)} />
                  <Input placeholder="Optional URL (https://…)" value={newPortfolioUrl} onChange={(e) => setNewPortfolioUrl(e.target.value)} />
                  <Button size="sm" onClick={addPortfolioItem}><Plus className="size-3.5" /> Add portfolio item</Button>
                </div>
              </SectionCard>

              <SectionCard title="Preferences">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Response time</Label>
                    <Select value={profile.responseTime} onValueChange={(v) => patch({ responseTime: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RESPONSE_TIMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred project size</Label>
                    <Select value={profile.preferredProjectSize} onValueChange={(v) => patch({ preferredProjectSize: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PROJECT_SIZES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred timeline</Label>
                    <Select value={profile.preferredTimeline} onValueChange={(v) => patch({ preferredTimeline: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TIMELINES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time zone</Label>
                    <Select value={profile.timeZone} onValueChange={(v) => patch({ timeZone: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TIME_ZONES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((l) => {
                      const active = profile.languages.includes(l);
                      return (
                        <button
                          key={l}
                          onClick={() => patch({ languages: active ? profile.languages.filter((x) => x !== l) : [...profile.languages, l] })}
                          className={cn("rounded-full border px-2.5 py-1 text-xs", active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted")}
                        >{l}</button>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Availability & visibility">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                    <div>
                      <div className="font-medium text-sm">Available for new work</div>
                      <p className="text-xs text-muted-foreground">
                        {profile.availability === "available_now"
                          ? "Your profile is shown in Available Now results."
                          : "Paused. Your profile is hidden from Available Now results. Existing contracts are unaffected."}
                      </p>
                    </div>
                    <Switch checked={profile.availability === "available_now"} onCheckedChange={toggleAvailability} aria-label="Toggle availability" />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                    <div>
                      <div className="font-medium text-sm">Public visibility</div>
                      <p className="text-xs text-muted-foreground">Only information marked Public appears in discovery.</p>
                    </div>
                    <Switch checked={profile.publicVisibility} onCheckedChange={togglePublicVisibility} aria-label="Toggle public visibility" />
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard title="Profile completion interlock">
                <p className="text-sm text-muted-foreground">Your profile is visible, but proposal access may remain limited until the required review steps are complete.</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" /> Display name & headline</li>
                  <li className="flex items-center gap-2">{profile.bio.length > 50 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Bio (min 50 chars)</li>
                  <li className="flex items-center gap-2">{profile.portfolioItems.length > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Portfolio item</li>
                  <li className="flex items-center gap-2">{payoutStatus === "approved" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Payout details approved</li>
                </ul>
              </SectionCard>

              <SectionCard title="What stays private">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> PAN, bank account, IFSC are never shown publicly.</li>
                  <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> Billing address is never shown publicly.</li>
                  <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> Risk flags and internal notes are not shown.</li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        {/* ---------- Payout details ---------- */}
        <TabsContent value="payout" className="space-y-4">
          <SectionCard
            title="Payout details"
            description="Editing pauses new proposals pending Admin re-verification. Status changes to Pending Admin Re-verification on save."
            actions={payoutStatus === "approved" && !payoutEditing ? <Button size="sm" variant="outline" onClick={() => setPayoutEditing(true)}><Pencil className="size-3.5" /> Edit</Button> : undefined}
          >
            <div className="mb-4">
              <StatusBadge tone={payoutStatus === "approved" ? "success" : payoutStatus === "pending_reverification" || payoutStatus === "under_review" ? "pending" : payoutStatus === "rejected" ? "rejected" : "neutral"} icon>
                Payout readiness · {payoutStatus.replace(/_/g, " ")}
              </StatusBadge>
            </div>

            {payoutStatus === "approved" && !payoutEditing && (
              <div className="grid sm:grid-cols-2 gap-3">
                <MaskedField label="Beneficiary name" value={profile.payoutDetails?.beneficiaryName ?? "—"} masked={false} />
                <MaskedField label="Bank" value={profile.payoutDetails?.bankName ?? "—"} masked={false} />
                <MaskedField label="Account number" value={profile.payoutDetails?.accountNumberMasked ?? "—"} masked canReveal onReveal={() => addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Masked reveal", entity: "Payout details", entityId: currentUserId ?? "", reason: "Self-view" })} onUnmask={() => {}} />
                <MaskedField label="IFSC" value={profile.payoutDetails?.ifscMasked ?? "—"} masked canReveal onReveal={() => addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Masked reveal", entity: "Payout details", entityId: currentUserId ?? "", reason: "Self-view" })} onUnmask={() => {}} />
              </div>
            )}

            {payoutStatus === "approved" && payoutEditing && (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ben">Beneficiary name</Label>
                    <Input id="ben" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bnk">Bank name</Label>
                    <Input id="bnk" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="acct">Account number</Label>
                    <Input id="acct" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="1234567890" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ifs">IFSC</Label>
                    <Input id="ifs" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="HDFC0001234" />
                  </div>
                </div>
                <InterlockCard tone="warning" icon={AlertTriangle} title="Saving will pause new proposals" body="Status will change to Pending Admin Re-verification. Existing contracts are unaffected." />
                <div className="flex gap-2">
                  <Button onClick={savePayout}>Save & submit for re-verification</Button>
                  <Button variant="ghost" onClick={() => setPayoutEditing(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {(payoutStatus === "pending_reverification" || payoutStatus === "under_review") && (
              <InterlockCard tone="warning" icon={Clock} title="Pending Admin re-verification" body="Your payout details are under Admin review. New paid-work proposals are paused until re-verified." />
            )}

            {payoutStatus === "rejected" && (
              <InterlockCard tone="critical" icon={XCircle} title="Payout details rejected" body="We could not verify the previous submission. Re-submit to restore proposal access." primary={<Button size="sm" onClick={() => setKycModal(true)}>Re-submit</Button>} />
            )}

            {(payoutStatus === "not_started" || payoutStatus === "draft" || payoutStatus === "submitted") && (
              <InterlockCard tone="warning" icon={Wallet} title="Add payout details before applying" body="QuickQuid needs approved payout details before you can submit a paid-work proposal." primary={<Button size="sm" onClick={() => setKycModal(true)}><ShieldCheck className="size-3.5" /> Add payout details</Button>} secondary={<Button size="sm" variant="ghost" onClick={() => navigate("readiness")}>Cancel</Button>} />
            )}
          </SectionCard>
        </TabsContent>

        {/* ---------- Public preview ---------- */}
        <TabsContent value="preview" className="space-y-4">
          <SectionCard
            title="Public preview"
            description="This is how Buyers discover your profile. PAN, bank, address, risk flags, and internal notes are never shown."
            actions={
              <div className="flex rounded-md border border-border p-0.5 text-xs">
                <button onClick={() => setPreviewMode("buyer")} className={cn("rounded px-2.5 py-1", previewMode === "buyer" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Buyer view</button>
                <button onClick={() => setPreviewMode("pro")} className={cn("rounded px-2.5 py-1", previewMode === "pro" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Pro view</button>
              </div>
            }
          >
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-muted/40 to-background">
                <div className="flex items-start gap-3">
                  <Avatar className="size-16 rounded-md" style={{ backgroundColor: avatarColor(currentUserId ?? undefined) }}>
                    <AvatarFallback className="rounded-md text-white font-semibold text-lg">{initials(profile.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-semibold">{profile.displayName}</h2>
                      {profile.payoutReadiness === "approved" && profile.skillVerifications?.some((item) => item.status === "approved") && <QuickQuidVerifiedBadge />}
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.headline}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusBadge tone={profile.availability === "available_now" ? "success" : "paused"} icon={false}>{profile.availability === "available_now" ? "Available now" : "Paused"}</StatusBadge>
                      <StatusBadge tone="info" icon={false}><Star className="size-3 fill-amber-400 text-amber-400" /> {profile.rating}</StatusBadge>
                      <StatusBadge tone="neutral" icon={false}>{profile.completedProjects} projects</StatusBadge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Briefcase className="size-3" /> {profile.primaryCategory}{profile.secondaryCategory ? ` · ${profile.secondaryCategory}` : ""}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {profile.responseTime}</span>
                  <span className="inline-flex items-center gap-1"><Globe className="size-3" /> {profile.timeZone}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Identity reviewed", "Portfolio reviewed", profile.availability === "available_now" ? "Available now" : null, `Completed ${profile.completedProjects} projects`].filter(Boolean).map((t) => (
                    <Badge key={t as string} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                      <ShieldCheck className="size-3" /> {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-5 space-y-5">
                <section>
                  <h3 className="text-sm font-semibold mb-1">About</h3>
                  <p className="text-sm text-muted-foreground">{profile.bio || "No bio yet."}</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-1">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.length === 0 ? <span className="text-sm text-muted-foreground">No skills yet.</span> : profile.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </section>

                {(profile.externalLinks?.length ?? 0) > 0 && <section><h3 className="text-sm font-semibold mb-1">Connected proof & synced previews</h3><div className="grid gap-2 sm:grid-cols-2">{(profile.externalLinks ?? []).map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="rounded-md border border-border p-2.5 text-xs hover:border-primary/50"><div className="font-medium">{link.label ?? externalProviderLabel(link.provider)} {link.isDemo && <Badge variant="outline" className="ml-1 text-[9px]">Demo</Badge>}</div><div className="mt-0.5 truncate text-muted-foreground">{link.url}</div></a>)}</div>{(profile.externalProfilePreviews ?? []).length > 0 && <div className="mt-2 grid gap-2 sm:grid-cols-2">{(profile.externalProfilePreviews ?? []).map((preview) => <a key={`${preview.provider}-${preview.title}`} href={preview.url} target="_blank" rel="noreferrer" className="rounded-md border border-dashed border-border p-2.5 text-xs hover:border-primary/50"><div className="flex items-center justify-between gap-2"><span className="font-medium">{externalProviderLabel(preview.provider)}</span><span className="text-[10px] text-muted-foreground">{preview.source === "demo_fixture" ? "Demo sync" : "Synced"}</span></div><div className="mt-1 font-medium">{preview.title}</div><div className="mt-0.5 line-clamp-2 text-muted-foreground">{preview.description}</div></a>)}</div>}</section>}

                <section>
                  <h3 className="text-sm font-semibold mb-1">Selected work</h3>
                  {profile.portfolioItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No portfolio items yet.</p>
                  ) : (
                    <PortfolioGallery
                      items={(featured ? [featured, ...profile.portfolioItems.filter((p) => !p.featured)] : profile.portfolioItems).slice(0, 6).map((p) => ({
                        id: p.id,
                        type: p.type === "case_study" ? "image" : p.type === "link" ? "link" : "image",
                        title: p.title,
                        description: p.description,
                        url: p.url,
                        imageUrl: p.imageUrl,
                        color: p.id === featured?.id ? "#7C3AED" : ["#0891B2", "#CA8A04", "#DB2777", "#0EA5E9"][parseInt(p.id.replace(/\D/g, "") || "0") % 4],
                        featured: p.featured,
                      }))}
                    />
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-1">Reviews</h3>
                  <p className="text-sm text-muted-foreground">Reviews appear after a contract completes the double-blind review window.</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-1">Work history</h3>
                  <p className="text-sm text-muted-foreground">{profile.completedProjects} completed projects · {profile.responseTime} average response time.</p>
                </section>
              </div>
            </div>

            {previewMode === "pro" && (
              <InterlockCard tone="info" icon={Info} title="Pro view" body="You are viewing your own profile. Buyers see an identical layout but with private fields hidden." />
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 3. ProBriefs
// ============================================================

export function ProBriefs() {
  const { briefs, currentUserId, navigate, proposals } = useQQ();
  const profile = useMyProProfile();
  const { toast } = useToast();
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterBand, setFilterBand] = React.useState<string>("all");
  const [filterAvail, setFilterAvail] = React.useState<string>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const payoutReady = profile?.payoutReadiness === "approved";

  const myAppliedBriefIds = new Set(proposals.filter((p) => p.proId === currentUserId).map((p) => p.briefId));

  const filtered = briefs.filter((b) => {
    if (b.status === "archived") return false;
    if (filterCategory !== "all" && b.category !== filterCategory) return false;
    if (filterBand !== "all" && budgetBand(b.budget) !== filterBand) return false;
    if (filterAvail === "open" && b.visibility !== "open") return false;
    if (filterAvail === "private" && b.visibility !== "private") return false;
    return true;
  });

  const selected = briefs.find((b) => b.id === selectedId);

  function applyToBrief(b: Brief) {
    if (!payoutReady) {
      toast({ title: "Payout details required", description: "Add payout details before applying for paid work.", variant: "destructive" });
      return;
    }
    if (myAppliedBriefIds.has(b.id)) {
      toast({ title: "Already applied", description: "You already have a proposal on this brief." });
      return;
    }
    navigate("pro_proposals", { briefId: b.id });
  }

  if (selected) {
    return <BriefDetail brief={selected} onBack={() => setSelectedId(null)} onApply={() => applyToBrief(selected)} payoutReady={payoutReady} applied={myAppliedBriefIds.has(selected.id)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("pro_dashboard")} className="shrink-0">
          <ChevronLeft className="size-4" /> Dashboard
        </Button>
        <PageHeader
          title="Briefs"
          description="Open briefs from Buyers. We surface budget, timeline, and exclusions up front so you can decide quickly."
          status={<StatusBadge tone="info" icon>{filtered.length} brief{filtered.length === 1 ? "" : "s"}</StatusBadge>}
        />
      </div>

      {!payoutReady && (
        <InterlockCard
          tone="warning"
          icon={Wallet}
          title="Add payout details before applying"
          body="QuickQuid needs approved payout details before you can submit a paid-work proposal. You can still browse briefs."
          primary={<Button size="sm" onClick={() => navigate("readiness")}>Add payout details</Button>}
          secondary={<Button size="sm" variant="ghost" onClick={() => navigate("pro_profile")}>View profile</Button>}
        />
      )}

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] h-8"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterBand} onValueChange={setFilterBand}>
            <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Budget band" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All budgets</SelectItem>
              {BUDGET_BANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAvail} onValueChange={setFilterAvail}>
            <SelectTrigger className="w-[140px] h-8"><SelectValue placeholder="Visibility" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visibility</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          {(filterCategory !== "all" || filterBand !== "all" || filterAvail !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterCategory("all"); setFilterBand("all"); setFilterAvail("all"); }}>Reset</Button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No briefs match your filters"
          description="Try widening the category or budget band. New briefs are posted frequently."
          icon={Briefcase}
          actions={<Button variant="outline" onClick={() => { setFilterCategory("all"); setFilterBand("all"); setFilterAvail("all"); }}>Reset filters</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((b) => (
            <BriefCard
              key={b.id}
              brief={b}
              onOpen={() => setSelectedId(b.id)}
              onApply={() => applyToBrief(b)}
              showApply={payoutReady && !myAppliedBriefIds.has(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BriefDetail({ brief, onBack, onApply, payoutReady, applied }: {
  brief: Brief; onBack: () => void; onApply: () => void; payoutReady: boolean; applied: boolean;
}) {
  const { navigate } = useQQ();
  const fee = buyerFee(brief.budget);
  const total = buyerTotal(brief.budget);
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to briefs
      </button>

      <PageHeader
        title={brief.title}
        description={brief.objective}
        status={<StatusBadge tone={statusMeta(brief.status).tone} icon>{statusMeta(brief.status).label}</StatusBadge>}
      >
        <Button variant="outline" onClick={() => navigate("buyer_messages", { briefId: brief.id })}><MessageSquare className="size-4" /> Ask a question</Button>
        {payoutReady && !applied && <Button onClick={onApply}><Send className="size-4" /> Apply</Button>}
        {applied && <Button variant="outline" disabled>Applied</Button>}
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Narrative" description={`Posted by ${brief.buyerName} · ${timeAgo(brief.createdAt)}`}>
            <p className="text-sm">{brief.objective}</p>
          </SectionCard>

          <SectionCard title="Deliverables">
            <ul className="space-y-1.5 text-sm">
              {brief.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> {d}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Acceptance criteria">
            <ul className="space-y-1.5 text-sm">
              {brief.acceptanceCriteria.map((c) => (
                <li key={c} className="flex items-start gap-2"><ListChecks className="size-4 mt-0.5 text-muted-foreground" /> {c}</li>
              ))}
            </ul>
          </SectionCard>

          {brief.exclusions.length > 0 && (
            <SectionCard title="Exclusions">
              <ul className="space-y-1.5 text-sm">
                {brief.exclusions.map((c) => (
                  <li key={c} className="flex items-start gap-2"><XCircle className="size-4 mt-0.5 text-muted-foreground" /> {c}</li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Commercial terms">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Budget</span><span className="font-semibold">{formatINR(brief.budget)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Budget band</span><span>{budgetBand(brief.budget)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Timeline</span><span>{brief.timeline}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Visibility</span><span className="capitalize">{brief.visibility}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Applicants</span><span>{brief.applicants ?? 0}</span></div>
            </div>
            <Separator className="my-3" />
            <FeeBreakdown proFee={brief.budget} />
          </SectionCard>

          <SectionCard title="Buyer fee (0%)">
            <p className="text-sm text-muted-foreground">The Buyer pays the brief budget plus a 0% fee. Your professional fee stays separate and QuickQuid deducts 0% commission from it.</p>
            <div className="mt-2 text-xs text-muted-foreground">Pro fee {formatINR(brief.budget)} · Buyer fee {formatINR(fee)} · Buyer total {formatINR(total)}</div>
          </SectionCard>

          {!payoutReady && (
            <InterlockCard tone="warning" icon={Wallet} title="Add payout details before applying" body="QuickQuid needs approved payout details before you can submit a paid-work proposal." />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 4. ProProposals
// ============================================================

export function ProProposals() {
  const { proposals, currentUserId, viewParams, navigate, briefs, submitProposal, updateProposal, addAudit } = useQQ();
  const profile = useMyProProfile();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [openProposalId, setOpenProposalId] = React.useState<string | null>(null);

  const myProposals = proposals.filter((p) => p.proId === currentUserId);
  const activeCount = myProposals.filter((p) => p.status === "pending" || p.status === "shortlisted").length;
  const briefId = viewParams.briefId;
  const targetBrief = briefId ? briefs.find((b) => b.id === briefId) : null;

  React.useEffect(() => {
    if (targetBrief) setShowForm(true);
  }, [targetBrief]);

  const payoutReady = profile?.payoutReadiness === "approved";

  function withdraw(id: string) {
    updateProposal(id, { status: "withdrawn" });
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Proposal withdrawn", entity: "Proposal", entityId: id, oldStatus: "pending", newStatus: "withdrawn" });
    toast({ title: "Proposal withdrawn", description: "You can re-apply if the brief is still active." });
  }

  function requestReactivation(id: string) {
    updateProposal(id, { status: "reactivation_requested" });
    toast({ title: "Reactivation requested", description: "Buyer will be notified. You may be re-shortlisted." });
  }

  if (showForm && targetBrief) {
    return (
      <ProposalForm
        brief={targetBrief}
        onCancel={() => { setShowForm(false); navigate("pro_proposals"); }}
        onSubmit={(p) => {
          submitProposal(p);
          addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Proposal submitted", entity: "Proposal", entityId: p.id, newStatus: "pending" });
          toast({ title: "Proposal submitted", description: `${p.proName} → ${targetBrief.title}` });
          setShowForm(false);
          navigate("pro_proposals");
        }}
        payoutReady={payoutReady}
        activeCount={activeCount}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("pro_dashboard")} className="shrink-0">
          <ChevronLeft className="size-4" /> Dashboard
        </Button>
        <PageHeader
          title="My proposals"
          description="Track submitted proposals, expiry, and counter-offers. 0% QuickQuid commission on your fee."
          status={<StatusBadge tone={activeCount >= PROPOSAL_LIMIT ? "warning" : "info"} icon>{activeCount}/{PROPOSAL_LIMIT} active</StatusBadge>}
        >
          <Button variant="outline" onClick={() => navigate("pro_briefs")}><Briefcase className="size-4" /> Browse briefs</Button>
        </PageHeader>
      </div>

      {activeCount >= PROPOSAL_LIMIT && (
        <InterlockCard tone="warning" icon={AlertTriangle} title="Proposal limit reached" body="You have reached your current active proposal limit. Withdraw an existing proposal or wait for a decision." />
      )}

      {!payoutReady && (
        <InterlockCard tone="warning" icon={Wallet} title="Add payout details before applying" body="QuickQuid needs approved payout details before you can submit a paid-work proposal." primary={<Button size="sm" onClick={() => navigate("readiness")}>Add payout details</Button>} />
      )}

      {myProposals.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Browse open briefs and submit your first proposal. Cover letters must be at least 100 characters and include evidence."
          icon={FileText}
          actions={<Button onClick={() => navigate("pro_briefs")}><Briefcase className="size-4" /> Browse briefs</Button>}
        />
      ) : (
        <div className="space-y-2">
          {myProposals.map((p) => {
            const m = statusMeta(p.status);
            const brief = briefs.find((b) => b.id === p.briefId);
            const isOpen = openProposalId === p.id;
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{p.briefTitle}</h3>
                      <StatusBadge tone={m.tone} icon={false}>{m.label}</StatusBadge>
                      <span className="text-xs text-muted-foreground font-mono">{p.id}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Buyer · {brief?.buyerName ?? "—"} · submitted {timeAgo(p.createdAt)}</div>
                    <div className="mt-2 grid sm:grid-cols-3 gap-2 text-sm">
                      <div><div className="text-xs text-muted-foreground">Proposed fee</div><div className="font-semibold">{formatINR(p.proposedFee)}</div></div>
                      <div><div className="text-xs text-muted-foreground">Buyer fee (0%)</div><div className="font-semibold">{formatINR(buyerFee(p.proposedFee))}</div></div>
                      <div><div className="text-xs text-muted-foreground">Buyer total</div><div className="font-semibold">{formatINR(buyerTotal(p.proposedFee))}</div></div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setOpenProposalId(isOpen ? null : p.id)}>
                    {isOpen ? "Hide" : "View"}
                  </Button>
                </div>

                {isOpen && (
                  <div className="mt-3 border-t border-border pt-3 space-y-3 text-sm">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Cover letter</div>
                      <p className="mt-1 text-sm">{p.coverLetter}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Delivery approach</div>
                      <p className="mt-1 text-sm">{p.deliveryApproach}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Evidence</div>
                      {p.evidence.length === 0 ? <p className="text-xs text-muted-foreground">No evidence attached.</p> : (
                        <ul className="mt-1 space-y-1">{p.evidence.map((e) => <li key={e} className="text-xs">· {e}</li>)}</ul>
                      )}
                    </div>

                    {p.status === "expired" && (
                      <InterlockCard tone="warning" icon={Clock} title="This proposal has expired" body="This proposal has expired because the quoted terms are no longer current." primary={<Button size="sm" onClick={() => requestReactivation(p.id)}>Request reactivation</Button>} />
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(p.status === "pending" || p.status === "shortlisted") && <Button size="sm" variant="outline" onClick={() => withdraw(p.id)}>Withdraw</Button>}
                      {p.status === "reactivation_requested" && <StatusBadge tone="pending" icon>Reactivation requested</StatusBadge>}
                      {brief && <Button size="sm" variant="ghost" onClick={() => navigate("pro_briefs")}>View brief</Button>}
                      <Button size="sm" variant="ghost" onClick={() => navigate("buyer_messages", { briefId: p.briefId })}><MessageSquare className="size-3.5" /> Messages</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProposalForm({ brief, onCancel, onSubmit, payoutReady, activeCount }: {
  brief: Brief;
  onCancel: () => void;
  onSubmit: (p: Proposal) => void;
  payoutReady: boolean;
  activeCount: number;
}) {
  const { currentUserId, users, proProfiles } = useQQ();
  const { toast } = useToast();
  const profile = proProfiles.find((p) => p.userId === currentUserId);
  const user = users.find((u) => u.id === currentUserId);

  const [mode, setMode] = React.useState<"accept" | "counter">("accept");
  const [counterFee, setCounterFee] = React.useState(brief.budget.toString());
  const [coverLetter, setCoverLetter] = React.useState("");
  const [deliveryApproach, setDeliveryApproach] = React.useState("");
  const [availability, setAvailability] = React.useState("Available now");
  const [evidence, setEvidence] = React.useState<string[]>(profile?.portfolioItems.slice(0, 2).map((p) => p.title) ?? []);
  const [evidenceLink, setEvidenceLink] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const proposedFee = mode === "accept" ? brief.budget : Math.max(0, Number(counterFee) || 0);
  const fee = buyerFee(proposedFee);
  const total = buyerTotal(proposedFee);

  const atLimit = activeCount >= PROPOSAL_LIMIT;
  const coverShort = coverLetter.trim().length < 100;
  const missingEvidence = evidence.length === 0;
  const invalidLink = evidenceLink.trim() !== "" && !/^https?:\/\//i.test(evidenceLink.trim());

  function addEvidence() {
    if (invalidLink) { toast({ title: "Invalid link", description: "Evidence links must start with http:// or https://", variant: "destructive" }); return; }
    const v = evidenceLink.trim();
    if (!v) return;
    setEvidence([...evidence, v]);
    setEvidenceLink("");
  }

  function togglePortfolioEvidence(title: string) {
    setEvidence(evidence.includes(title) ? evidence.filter((e) => e !== title) : [...evidence, title]);
  }

  function submit() {
    if (!payoutReady) { toast({ title: "Payout details required", variant: "destructive" }); return; }
    if (atLimit) { toast({ title: "Proposal limit reached", description: "Withdraw an existing proposal first.", variant: "destructive" }); return; }
    if (coverShort) { toast({ title: "Cover letter too short", description: "Cover letter must be at least 100 characters.", variant: "destructive" }); return; }
    if (missingEvidence) { toast({ title: "Evidence required", description: "Add at least one portfolio item or link as evidence.", variant: "destructive" }); return; }
    if (proposedFee <= 0) { toast({ title: "Enter a valid fee", variant: "destructive" }); return; }

    const circumvention = detectCircumvention(`${coverLetter} ${deliveryApproach}`);
    if (circumvention.length > 0) {
      toast({ title: "Circumvention detected", description: `Remove: ${circumvention.join(", ")}. QuickQuid prohibits sharing direct contact or payment links.`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const p: Proposal = {
        id: genId("PRP"),
        briefId: brief.id,
        briefTitle: brief.title,
        proId: currentUserId ?? "",
        proName: user?.name ?? profile?.displayName ?? "Pro",
        proHeadline: profile?.headline ?? "",
        proposedFee,
        coverLetter: coverLetter.trim(),
        deliveryApproach: deliveryApproach.trim(),
        availability,
        evidence,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      onSubmit(p);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <button onClick={onCancel} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Cancel
      </button>

      <PageHeader
        title="Submit proposal"
        description={brief.title}
        status={<StatusBadge tone="info" icon>Brief {brief.id}</StatusBadge>}
      />

      {atLimit && (
        <InterlockCard tone="warning" icon={AlertTriangle} title="Proposal limit reached" body="You have reached your current active proposal limit. Withdraw an existing proposal or wait for a decision." />
      )}
      {!payoutReady && (
        <InterlockCard tone="warning" icon={Wallet} title="Payout details required" body="QuickQuid needs approved payout details before you can submit a paid-work proposal." />
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Proposed fee" description="Accept the brief budget or counter with a different professional fee. Buyer fee + total recalculate instantly.">
            <div className="grid sm:grid-cols-2 gap-2">
              <button
                onClick={() => setMode("accept")}
                className={cn("rounded-md border-2 p-3 text-left", mode === "accept" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")}
              >
                <div className="text-sm font-medium">Accept brief budget</div>
                <div className="text-lg font-semibold tabular-nums">{formatINR(brief.budget)}</div>
              </button>
              <button
                onClick={() => setMode("counter")}
                className={cn("rounded-md border-2 p-3 text-left", mode === "counter" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40")}
              >
                <div className="text-sm font-medium">Counter with different fee</div>
                <div className="text-lg font-semibold tabular-nums">{mode === "counter" ? formatINR(proposedFee) : "Set fee"}</div>
              </button>
            </div>
            {mode === "counter" && (
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="fee">Your professional fee (INR)</Label>
                <Input id="fee" type="number" min={0} value={counterFee} onChange={(e) => setCounterFee(e.target.value)} />
                <p className="text-xs text-muted-foreground">QuickQuid deducts 0% commission from your fee. The Buyer pays your fee plus a 0% fee.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Cover letter" description="Min 100 characters. Do not include phone numbers, personal emails, or payment links.">
            <Textarea rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Explain why you're the right Pro for this brief. Reference similar work and how you'd approach it." />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={coverShort ? "text-amber-600" : "text-muted-foreground"}>{coverLetter.trim().length}/100 minimum</span>
              {detectCircumvention(coverLetter).length > 0 && <span className="text-destructive">Circumvention signal: {detectCircumvention(coverLetter).join(", ")}</span>}
            </div>
          </SectionCard>

          <SectionCard title="Delivery approach">
            <Textarea rows={4} value={deliveryApproach} onChange={(e) => setDeliveryApproach(e.target.value)} placeholder="Outline milestones, weekly cadence, and what you need from the Buyer." />
          </SectionCard>

          <SectionCard title="Relevant evidence" description="Attach portfolio items or links. At least one is required.">
            <div className="space-y-2">
              <div className="text-sm font-medium">From your portfolio</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {profile?.portfolioItems.map((p) => (
                  <label key={p.id} className={cn("flex items-start gap-2 rounded-md border p-2 cursor-pointer", evidence.includes(p.title) ? "border-primary bg-primary/5" : "border-border")}>
                    <Checkbox checked={evidence.includes(p.title)} onCheckedChange={() => togglePortfolioEvidence(p.title)} className="mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.category}</div>
                    </div>
                  </label>
                ))}
                {profile?.portfolioItems.length === 0 && <p className="text-xs text-muted-foreground">No portfolio items. Add links below.</p>}
              </div>
              <Separator className="my-2" />
              <div className="text-sm font-medium">External link</div>
              <div className="flex gap-2">
                <Input placeholder="https://…" value={evidenceLink} onChange={(e) => setEvidenceLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEvidence())} />
                <Button type="button" onClick={addEvidence}><Plus className="size-4" /> Add</Button>
              </div>
              {invalidLink && <p className="text-xs text-destructive">Link must start with http:// or https://</p>}
              {evidence.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {evidence.map((e) => (
                    <Badge key={e} variant="secondary" className="gap-1">
                      <ExternalLink className="size-3" /> {e.length > 30 ? e.slice(0, 30) + "…" : e}
                      <button onClick={() => setEvidence(evidence.filter((x) => x !== e))}><X className="size-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
              {missingEvidence && <p className="text-xs text-amber-600">At least one piece of evidence is required.</p>}
            </div>
          </SectionCard>

          <SectionCard title="Availability">
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="w-full sm:w-[260px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Available now", "Available in 1 week", "Available in 2 weeks", "Available next month"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Commercial summary" description="0% QuickQuid commission. Buyer fee 0%.">
            <FeeBreakdown proFee={proposedFee} />
          </SectionCard>

          <SectionCard title="Validation">
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">{!coverShort ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Cover letter ≥ 100 chars</li>
              <li className="flex items-center gap-2">{!missingEvidence ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Evidence attached</li>
              <li className="flex items-center gap-2">{!invalidLink ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-destructive" />} Valid evidence links</li>
              <li className="flex items-center gap-2">{payoutReady ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Payout details approved</li>
              <li className="flex items-center gap-2">{!atLimit ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Under proposal limit</li>
            </ul>
          </SectionCard>

          <div className="sticky bottom-4 flex flex-col gap-2">
            <Button size="lg" onClick={submit} disabled={submitting || coverShort || missingEvidence || invalidLink || atLimit || !payoutReady || proposedFee <= 0}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit proposal
            </Button>
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 5. ProContract
// ============================================================

export function ProContract() {
  const { viewParams, contracts, navigate, updateContract, addMessage, addAudit, currentUserId, disputes, openDispute, reviews, addReview, updateReview, updateMilestone } = useQQ();
  const { toast } = useToast();
  const contract = contracts.find((c) => c.id === viewParams.contractId);
  const [tab, setTab] = React.useState(viewParams.tab === "messages" ? "messages" : "overview");

  // Update tab when viewParams change (e.g., from contract picker)
  React.useEffect(() => {
    if (viewParams.tab === "messages") setTab("messages");
  }, [viewParams.tab]);

  // If no contractId, show a contract picker (Pro Messages entry point)
  if (!viewParams.contractId) {
    const myContracts = contracts.filter((c) => c.proId === currentUserId);
    if (myContracts.length === 0) {
      return (
        <EmptyState
          icon={FileWarning}
          title="No contracts yet"
          description="You'll see contracts here once a Buyer accepts your proposal."
          actions={<Button onClick={() => navigate("pro_briefs")}>Browse briefs</Button>}
        />
      );
    }
    return (
      <div className="space-y-6">
        <PageHeader title="Your contracts" description="Select a contract to open its workroom and messages." />
        <div className="space-y-2">
          {myContracts.map((c) => {
            const meta = statusMeta(c.status);
            const cm = c.milestones.find((m) => m.id === c.currentMilestoneId) ?? c.milestones[0];
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate("pro_contract", { contractId: c.id, tab: "messages" })}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("pro_contract", { contractId: c.id, tab: "messages" }); } }}
                className="w-full text-left rounded-lg border border-border bg-card p-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{c.briefTitle}</h3>
                      <StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Buyer · {c.buyerName} · Contract <span className="font-mono">{c.id}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Current milestone · <span className="font-medium text-foreground">{cm?.label ?? "—"}</span> ({cm ? formatINR(cm.proFee) : "—"})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">Pro fee</div>
                    <div className="font-semibold tabular-nums">{formatINR(c.totalProFee)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <EmptyState
        title="Contract not found"
        description="This contract may have been cancelled or the link is invalid."
        icon={FileWarning}
        actions={<Button onClick={() => navigate("pro_dashboard")}>Back to dashboard</Button>}
      />
    );
  }

  const m = statusMeta(contract.status);
  const fundingPending = contract.milestones.some((ms) => ms.status === "funding_pending");
  const currentMilestone = contract.milestones.find((ms) => ms.id === contract.currentMilestoneId) ?? contract.milestones.find((ms) => ms.status !== "accepted" && ms.status !== "payout_processed") ?? contract.milestones[0];
  const contractDisputes = disputes.filter((d) => d.contractId === contract.id);
  const contractReviews = reviews.filter((r) => r.contractId === contract.id);

  function acceptOffer() {
    updateContract(contract!.id, { status: "offer_accepted_pending_funding" });
    addMessage({ id: genId("MSG"), contractId: contract!.id, from: "system", fromName: "QuickQuid", text: `Pro accepted the offer. Contract ${contract!.id} is now pending funding for M1. Pro should not begin work until payment is confirmed.`, at: new Date().toISOString() });
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Offer accepted", entity: "Contract", entityId: contract!.id, oldStatus: "offer sent", newStatus: "offer accepted pending funding" });
    toast({ title: "Offer accepted", description: "Buyer will be asked to fund M1. Do not begin work until funding is confirmed." });
  }

  function declineOffer(reason: string) {
    updateContract(contract!.id, { status: "cancelled" });
    addMessage({ id: genId("MSG"), contractId: contract!.id, from: "system", fromName: "QuickQuid", text: `Pro declined the offer. Reason: ${reason}. Conversation remains open for renegotiation.`, at: new Date().toISOString() });
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Offer declined", entity: "Contract", entityId: contract!.id, oldStatus: "offer sent", newStatus: "cancelled", reason });
    toast({ title: "Offer declined", description: "You can continue messaging the Buyer." });
    navigate("buyer_messages", { contractId: contract!.id });
  }

  function counterOffer(fee: number) {
    const scale = fee / contract!.totalProFee;
    const milestones = contract!.milestones.map((ms) => ({ ...ms, proFee: Math.round(ms.proFee * scale) }));
    updateContract(contract!.id, { totalProFee: fee, milestones });
    addMessage({ id: genId("MSG"), contractId: contract!.id, from: "system", fromName: "QuickQuid", text: `Pro countered with a revised fee of ${formatINR(fee)}. Buyer fee recalculated at 0% = ${formatINR(buyerFee(fee))}; Buyer total ${formatINR(buyerTotal(fee))}.`, at: new Date().toISOString() });
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Counter-offer sent", entity: "Contract", entityId: contract!.id, newStatus: "offer sent", reason: `Revised fee ${formatINR(fee)}` });
    toast({ title: "Counter-offer sent", description: "Buyer fee and total recalculated instantly." });
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("pro_dashboard")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to dashboard
      </button>

      <PageHeader
        title={contract.briefTitle}
        description={`Contract ${contract.id} · Buyer ${contract.buyerName} · Created ${formatDate(contract.createdAt)}`}
        status={<StatusBadge tone={m.tone} icon>{m.label}</StatusBadge>}
      >
        <Button variant="outline" onClick={() => navigate("buyer_messages", { contractId: contract.id })}><MessageSquare className="size-4" /> Messages</Button>
      </PageHeader>

      {fundingPending && (
        <InterlockCard
          tone="warning"
          icon={AlertTriangle}
          title="Payment verification pending"
          body="Funding is being processed via the integrated payment system. Do not begin work until payment is confirmed."
          primary={<Button size="sm" variant="outline" onClick={() => setTab("workroom")}>View workroom</Button>}
        />
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workroom">Workroom</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="disputes">Disputes {contractDisputes.length > 0 && `(${contractDisputes.length})`}</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="invoice">Invoice & tax</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <SectionCard title="Immutable offer sheet" description="The terms below are fixed once accepted. Changes require a scope-change request.">
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Scope</div>
                    <p className="mt-0.5">{contract.scope}</p>
                  </div>
                  {contract.exclusions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Exclusions</div>
                      <ul className="mt-0.5 space-y-0.5">
                        {contract.exclusions.map((e) => <li key={e} className="flex items-start gap-1.5"><XCircle className="size-3.5 mt-0.5 text-muted-foreground" /> {e}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><div className="text-xs text-muted-foreground">Timeline</div><div className="font-medium">{contract.timeline}</div></div>
                    <div><div className="text-xs text-muted-foreground">Revisions</div><div className="font-medium">{contract.revisions}</div></div>
                    <div><div className="text-xs text-muted-foreground">Milestones</div><div className="font-medium">{contract.milestones.length} of 4 max</div></div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">Cancellation terms</div>
                    <p className="mt-0.5 text-muted-foreground">{contract.cancellationTerms}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Milestones">
                <ContractMilestoneList contract={contract} />
              </SectionCard>

              {contract.status === "offer_sent" && (
                <AcceptDeclineCard
                  onAccept={acceptOffer}
                  onDecline={declineOffer}
                  onCounter={counterOffer}
                  totalProFee={contract.totalProFee}
                />
              )}
            </div>

            <div className="space-y-4">
              <SectionCard title="Pro fee (your take)">
                <div className="text-2xl font-semibold tabular-nums">{formatINR(contract.totalProFee)}</div>
                <div className="mt-1 text-xs text-muted-foreground">0% QuickQuid commission. Payouts are processed via the integrated payment system.</div>
              </SectionCard>

              <SectionCard title="Buyer fee (0%)">
                <FeeBreakdown proFee={contract.totalProFee} />
              </SectionCard>

              {fundingPending && (
                <InterlockCard tone="warning" icon={AlertTriangle} title="Do not begin work until payment is confirmed" body="Milestone M1 funding is being processed via the integrated payment system. You will receive a notification once it is cleared." />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workroom" className="space-y-4">
          <WorkroomTab contract={contract} currentMilestone={currentMilestone} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <ProMessagesTab contract={contract} />
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <DisputesTab contract={contract} disputes={contractDisputes} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsTab contract={contract} reviews={contractReviews} />
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <InvoiceTab contract={contract} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AcceptDeclineCard({ onAccept, onDecline, onCounter, totalProFee }: {
  onAccept: () => void; onDecline: (reason: string) => void; onCounter: (fee: number) => void; totalProFee: number;
}) {
  const [mode, setMode] = React.useState<"choose" | "decline" | "counter">("choose");
  const [declineReason, setDeclineReason] = React.useState(DECLINE_REASONS[0]);
  const [counterFee, setCounterFee] = React.useState(totalProFee.toString());
  const { toast } = useToast();

  return (
    <SectionCard title="Respond to offer" description="Accept, decline, or counter with a revised fee.">
      {mode === "choose" && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAccept}><CheckCircle2 className="size-4" /> Accept offer</Button>
          <Button variant="outline" onClick={() => setMode("counter")}>Counter offer</Button>
          <Button variant="ghost" onClick={() => setMode("decline")}><XCircle className="size-4" /> Decline</Button>
        </div>
      )}
      {mode === "decline" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Select value={declineReason} onValueChange={setDeclineReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DECLINE_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onDecline(declineReason)}>Confirm decline</Button>
            <Button variant="ghost" onClick={() => setMode("choose")}>Back</Button>
          </div>
        </div>
      )}
      {mode === "counter" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ctf">Your counter fee (INR)</Label>
            <Input id="ctf" type="number" min={0} value={counterFee} onChange={(e) => setCounterFee(e.target.value)} />
            <p className="text-xs text-muted-foreground">Buyer fee (0%) {formatINR(buyerFee(Number(counterFee) || 0))} · Buyer total {formatINR(buyerTotal(Number(counterFee) || 0))}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { const v = Number(counterFee); if (v <= 0) { toast({ title: "Enter a valid fee", variant: "destructive" }); return; } onCounter(v); }}>Send counter</Button>
            <Button variant="ghost" onClick={() => setMode("choose")}>Back</Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function WorkroomTab({ contract, currentMilestone }: { contract: Contract; currentMilestone?: Milestone }) {
  const { updateMilestone, addMessage, currentUserId, addAudit, navigate } = useQQ();
  const { toast } = useToast();
  const [activeMilestoneId, setActiveMilestoneId] = React.useState(currentMilestone?.id ?? contract.milestones[0]?.id);
  const [submitOpen, setSubmitOpen] = React.useState(false);
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [versionDrawerFor, setVersionDrawerFor] = React.useState<Milestone | null>(null);

  const ms = contract.milestones.find((m) => m.id === activeMilestoneId) ?? contract.milestones[0];

  if (!ms) return <EmptyState title="No milestones" icon={FileWarning} />;

  const canSubmit = ms.status === "funded" || ms.status === "work_active" || ms.status === "rejected";
  const showRevision = ms.status === "in_review" || ms.status === "rejected";
  const criteriaChecked = ms.acceptanceCriteria.length > 0;

  function submitDeliverable(link: string, note: string) {
    if (!canSubmit) { toast({ title: "Cannot submit", description: "Milestone must be funded first.", variant: "destructive" }); return; }
    if (!criteriaChecked) { toast({ title: "Acceptance criteria pending", description: "Confirm acceptance criteria are met before submitting.", variant: "destructive" }); return; }
    const versionNum = ms.versions.length + 1;
    const v: DeliveryVersion = {
      id: genId("VER"),
      version: versionNum,
      status: "in_review",
      submitter: "pro",
      timestamp: new Date().toISOString(),
      link,
      changeNote: note,
    };
    updateMilestone(contract.id, ms.id, {
      status: "submitted",
      submittedAt: new Date().toISOString(),
      deliveryLink: link,
      deliveryNote: note,
      versions: [...ms.versions, v],
    });
    addMessage({ id: genId("MSG"), contractId: contract.id, from: "system", fromName: "QuickQuid", text: `Pro submitted v${versionNum} for ${ms.label}. Link: ${link}. Note: ${note}`, at: new Date().toISOString() });
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Deliverable submitted", entity: "Milestone", entityId: ms.id, newStatus: "submitted" });
    setSubmitOpen(false);
    toast({ title: `v${versionNum} submitted`, description: "Buyer will review against acceptance criteria." });
  }

  function submitRevision(reason: string, affected: string, feedback: string, _attachments: string[]) {
    const versionNum = ms.versions.length + 1;
    const v: DeliveryVersion = {
      id: genId("VER"),
      version: versionNum,
      status: "in_review",
      submitter: "pro",
      timestamp: new Date().toISOString(),
      link: ms.deliveryLink ?? "—",
      changeNote: `Revision. Reason: ${reason}. Affected: ${affected}. Feedback: ${feedback}`,
    };
    updateMilestone(contract.id, ms.id, {
      status: "submitted",
      submittedAt: new Date().toISOString(),
      versions: [...ms.versions, v],
    });
    addMessage({ id: genId("MSG"), contractId: contract.id, from: "system", fromName: "QuickQuid", text: `Pro submitted revision v${versionNum} for ${ms.label}.`, at: new Date().toISOString() });
    setRevisionOpen(false);
    toast({ title: `Revision v${versionNum} submitted` });
  }

  return (
    <div className="space-y-4">
      {ms.status === "funding_pending" && (
        <div className="sticky top-16 z-20 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-100 px-4 py-2.5 dark:bg-amber-950/60 dark:border-amber-800 shadow-sm">
          <Lock className="size-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0 text-sm">
            <span className="font-semibold text-amber-900 dark:text-amber-200">Waiting for {ms.label} funding ({formatINR(ms.proFee)})</span>
            <span className="text-amber-800 dark:text-amber-300/80 ml-1">— do not begin work until QuickQuid confirms payment.</span>
          </div>
        </div>
      )}
      <SectionCard title="Milestones" description="Max 4 per contract. Workroom gates submit until funding is confirmed.">
        <div className="relative space-y-2 pl-4">
          {/* Vertical connecting line */}
          <div className="absolute left-[1.4rem] top-6 bottom-6 w-px bg-border" aria-hidden />
          {contract.milestones.map((m, idx) => {
            const meta = statusMeta(m.status);
            const isActive = m.id === activeMilestoneId;
            const isFundingPending = m.status === "funding_pending";
            const isDone = ["accepted", "payout_queued", "payout_processed"].includes(m.status);
            return (
              <div key={m.id} className="relative">
                {/* Node on the line */}
                <div className={cn(
                  "absolute -left-4 top-3.5 z-10 flex size-6 items-center justify-center rounded-full border-2 bg-card text-[10px] font-semibold",
                  isDone ? "border-emerald-500 bg-emerald-500 text-white" : isFundingPending ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : isActive ? "border-primary text-primary" : "border-border text-muted-foreground",
                )}>
                  {isDone ? <CheckCircle2 className="size-3.5" /> : isFundingPending ? <Lock className="size-3" /> : m.index}
                </div>
                <button
                  onClick={() => setActiveMilestoneId(m.id)}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 pl-9 transition-all",
                    isActive ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-primary/30",
                    isFundingPending && "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm">{m.label} · {m.description}</span>
                        {isFundingPending && <Lock className="size-3 text-amber-600 shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatINR(m.proFee)}</div>
                    </div>
                    <StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {ms && (
        <SectionCard title={`${ms.label} · ${ms.description}`} description={`Pro fee ${formatINR(ms.proFee)}`}>
          <div className="space-y-4">
            <MilestoneStepper milestone={ms} />

            <div>
              <div className="text-xs font-medium text-muted-foreground">Acceptance criteria</div>
              {ms.acceptanceCriteria.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">No criteria recorded for this milestone.</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm">
                  {ms.acceptanceCriteria.map((c) => <li key={c} className="flex items-start gap-2"><ListChecks className="size-4 mt-0.5 text-muted-foreground" /> {c}</li>)}
                </ul>
              )}
            </div>

            {ms.status === "funding_pending" && (
              <InterlockCard tone="warning" icon={AlertTriangle} title="Payment verification pending" body="Funding is being processed via the integrated payment system. Do not begin work until payment is confirmed." />
            )}

            {ms.status === "accepted" && (
              <InterlockCard tone="info" icon={CheckCircle2} title="Milestone accepted" body="Buyer accepted this deliverable. Payout is processed via the integrated payment system." />
            )}

            {ms.status === "payout_queued" && (
              <InterlockCard tone="info" icon={Clock} title="Payout queued" body="A payout is queued via the integrated payment system. You'll see a slip reference once processed." />
            )}

            {ms.status === "payout_processed" && (
              <InterlockCard tone="info" icon={CheckCircle2} title="Payout processed" body="This milestone's payout has been processed. View the slip in your Payouts tab." />
            )}

            {/* Category-specific delivery vault */}
            <div>
              <div className="text-xs font-medium text-muted-foreground">Category-specific delivery vault</div>
              <div className="mt-1 grid sm:grid-cols-3 gap-2 text-xs">
                <VaultItem label="Staging repo link" value={ms.deliveryLink && ms.deliveryLink.startsWith("http") ? ms.deliveryLink : "—"} />
                <VaultItem label="Figma link" value={ms.deliveryLink && ms.deliveryLink.includes("figma") ? ms.deliveryLink : "—"} />
                <VaultItem label="PDF / docs" value={ms.deliveryLink && ms.deliveryLink.endsWith(".pdf") ? ms.deliveryLink : "—"} />
              </div>
            </div>

            {ms.versions.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">Version history</div>
                  <Button size="sm" variant="ghost" onClick={() => setVersionDrawerFor(ms)}><History className="size-3.5" /> View all</Button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Latest: v{ms.versions[ms.versions.length - 1].version} · {ms.versions[ms.versions.length - 1].status.replace(/_/g, " ")}</div>
              </div>
            )}

            {/* Production Delivery Vault — authoritative record of work submitted */}
            {(() => {
              const paymentConfirmed = ms.status !== "funding_pending" && ms.status !== "not_started";
              const disputeActive = contract.status === "disputed";
              const vaultState: VaultStateType = disputeActive ? "disputed"
                : ms.versions.length === 0 ? "empty"
                : ms.status === "accepted" || ms.status === "payout_queued" || ms.status === "payout_processed" ? "accepted"
                : ms.versions.some(v => v.status === "rejected") && ms.versions[ms.versions.length - 1]?.status === "in_review" ? "resubmitted"
                : ms.versions[ms.versions.length - 1]?.status === "in_review" ? "submitted_for_review"
                : ms.versions[ms.versions.length - 1]?.status === "rejected" ? "revision_requested"
                : "draft_upload";

              const vaultItems: VaultItemType[] = ms.versions.map((v, idx) => ({
                vault_item_id: v.id,
                contract_id: contract.id,
                milestone_id: ms.id,
                submitted_by: "pro",
                submitted_at: v.timestamp,
                version_number: v.version,
                asset_type: v.link.includes("figma") ? "design_link" : v.link.includes("github") ? "repository" : v.link.includes("notion") ? "document_link" : "file",
                file_name_or_link_title: v.link.split("/").pop() || v.link,
                content_type: v.link.includes("figma") ? "Figma design" : v.link.includes("github") ? "Git repository" : v.link.includes("notion") ? "Notion doc" : "File",
                source_type: v.link.includes("figma") ? "design_link" : v.link.includes("github") ? "repository" : v.link.includes("notion") ? "document_link" : "file",
                preview_status: "ready",
                scan_status: "clean",
                access_policy: "contract_parties",
                submission_note: v.changeNote,
                review_status: v.status === "accepted" ? "accepted" : v.status === "rejected" ? "rejected" : v.status === "in_review" ? "in_review" : "submitted",
                revision_reason: v.status === "rejected" ? "Revision requested — see change note" : undefined,
                replaces_vault_item_id: idx > 0 ? ms.versions[idx - 1].id : undefined,
                retention_hold_status: disputeActive ? "active" : "none",
                activity_log: [{ action: `v${v.version} submitted`, by: "pro", at: v.timestamp, note: v.changeNote }],
              }));

              const currentVersion = vaultItems[vaultItems.length - 1];

              return (
                <div className="mt-3">
                  <DeliveryVault
                    contractId={contract.id}
                    milestoneId={ms.id}
                    milestoneLabel={ms.label}
                    milestoneDescription={ms.description}
                    proFee={ms.proFee}
                    state={vaultState}
                    items={vaultItems}
                    currentVersion={currentVersion}
                    acceptanceCriteria={ms.acceptanceCriteria}
                    userRole="pro"
                    paymentConfirmed={paymentConfirmed}
                    disputeActive={disputeActive}
                    onContactSupport={() => navigate("support")}
                  />
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-2">
              {canSubmit && (
                <Button onClick={() => setSubmitOpen(true)} disabled={!criteriaChecked}>
                  <Send className="size-4" /> Submit deliverable
                </Button>
              )}
              {showRevision && (
                <Button variant="outline" onClick={() => setRevisionOpen(true)}><RefreshCw className="size-4" /> Submit revision</Button>
              )}
              {ms.status === "payout_queued" && (
                <Button variant="outline" onClick={() => useQQ.getState().navigate("pro_payouts")}><Wallet className="size-4" /> View payout</Button>
              )}
            </div>
            {!criteriaChecked && canSubmit && (
              <p className="text-xs text-amber-600">Acceptance criteria must be confirmed before you can submit.</p>
            )}
          </div>
        </SectionCard>
      )}

      <SubmitDeliverableDialog open={submitOpen} onOpenChange={setSubmitOpen} onSubmit={submitDeliverable} milestoneLabel={ms.label} />
      <RevisionDialog open={revisionOpen} onOpenChange={setRevisionOpen} onSubmit={submitRevision} milestoneLabel={ms.label} criteria={ms.acceptanceCriteria} />
      <VersionDrawer milestone={versionDrawerFor} onOpenChange={(o) => !o && setVersionDrawerFor(null)} />
    </div>
  );
}

function VaultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-foreground">{value === "—" ? "—" : <a href={value} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1"><ExternalLink className="size-3" /> link</a>}</div>
    </div>
  );
}

function SubmitDeliverableDialog({ open, onOpenChange, onSubmit, milestoneLabel }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onSubmit: (link: string, note: string) => void; milestoneLabel: string;
}) {
  const [link, setLink] = React.useState("");
  const [note, setNote] = React.useState("");
  React.useEffect(() => { if (!open) { setLink(""); setNote(""); } }, [open]);
  const invalid = link.trim() !== "" && !/^https?:\/\//i.test(link.trim());
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Submit deliverable · {milestoneLabel}</DialogTitle>
          <DialogDescription>Attach a delivery link and a short note. The Buyer will review against the acceptance criteria.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="dlink">Delivery link</Label>
            <Input id="dlink" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://figma.com/… or https://github.com/…" />
            {invalid && <p className="text-xs text-destructive">Link must start with http:// or https://</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dnote">Delivery note</Label>
            <Textarea id="dnote" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What does this version deliver? Reference acceptance criteria." />
          </div>
          <InterlockCard tone="info" icon={Info} title="Reminder" body="Do not include direct contact or payment links in the delivery note." />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(link.trim() || "—", note.trim() || "—")} disabled={invalid}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RevisionDialog({ open, onOpenChange, onSubmit, milestoneLabel, criteria }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onSubmit: (reason: string, affected: string, feedback: string, attachments: string[]) => void;
  milestoneLabel: string; criteria: string[];
}) {
  const [reason, setReason] = React.useState("");
  const [affected, setAffected] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [attachments, setAttachments] = React.useState<string[]>([]);
  React.useEffect(() => { if (!open) { setReason(""); setAffected(""); setFeedback(""); setAttachments([]); } }, [open]);
  const ready = reason.trim() && feedback.trim();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Submit revision · {milestoneLabel}</DialogTitle>
          <DialogDescription>Describe what does not meet the agreed acceptance criteria.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rnum">Revision number</Label>
            <Input id="rnum" value={`Revision ${attachments.length + 1}`} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rrsn">Reason</Label>
            <Input id="rrsn" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Buyer requested layout change" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="raff">Affected criterion</Label>
            <Select value={affected} onValueChange={setAffected}>
              <SelectTrigger><SelectValue placeholder="Select criterion" /></SelectTrigger>
              <SelectContent>
                {criteria.length === 0 && <SelectItem value="general">General scope</SelectItem>}
                {criteria.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectItem value="general">General scope</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rfb">Detailed feedback</Label>
            <Textarea id="rfb" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Describe what does not meet the agreed acceptance criteria." />
          </div>
          <div className="space-y-1.5">
            <Label>Attachments</Label>
            <EvidenceDropzone label="Drop attachment or click to upload" onUploaded={(f) => setAttachments([...attachments, f.name])} />
            {attachments.length > 0 && <div className="text-xs text-muted-foreground">{attachments.length} attached</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(reason, affected || "general", feedback, attachments)} disabled={!ready}>Submit revision</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionDrawer({ milestone, onOpenChange }: { milestone: Milestone | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={!!milestone} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Version history · {milestone?.label}</SheetTitle>
          <SheetDescription>All submitted versions of this deliverable.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-2">
          {milestone?.versions.slice().reverse().map((v, idx) => {
            const isLatest = idx === 0;
            const tone = v.status === "accepted" ? "success" : v.status === "in_review" ? "pending" : v.status === "rejected" ? "rejected" : "info";
            return (
              <div key={v.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">v{v.version} {isLatest && <Badge variant="secondary">Current</Badge>}</div>
                  <StatusBadge tone={tone} icon={false}>{v.status.replace(/_/g, " ")}</StatusBadge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">By {v.submitter} · {formatDateTime(v.timestamp)}</div>
                <div className="mt-1 text-xs">{v.changeNote}</div>
                {v.link && v.link !== "—" && <a href={v.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="size-3" /> View</a>}
              </div>
            );
          })}
          {milestone && milestone.versions.length === 0 && <p className="text-sm text-muted-foreground">No versions submitted yet.</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ===== Pro Messages Tab — full conversation with send capability =====
function ProMessagesTab({ contract }: { contract: Contract }) {
  const { messages, addMessage, currentUserId, users, navigate } = useQQ();
  const { toast } = useToast();
  const [draft, setDraft] = React.useState("");
  const [circumventionWarning, setCircumventionWarning] = React.useState<string[] | null>(null);
  const contractMsgs = messages.filter((m) => m.contractId === contract.id).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const buyer = users.find((u) => u.id === contract.buyerId);
  const disputeActive = contract.status === "disputed";

  function send() {
    if (!draft.trim()) return;
    const flags = detectCircumvention(draft);
    if (flags.length > 0) {
      setCircumventionWarning(flags);
      return;
    }
    addMessage({
      id: genId("MSG"),
      contractId: contract.id,
      from: "pro",
      fromName: contract.proName,
      text: draft.trim(),
      at: new Date().toISOString(),
    });
    setDraft("");
    toast({ title: "Message sent" });
  }

  return (
    <div className="grid lg:grid-cols-[60%_40%] gap-4">
      {/* Chat */}
      <Card className="flex flex-col h-[600px]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-medium">{contract.briefTitle}</div>
            <div className="text-xs text-muted-foreground">with {contract.buyerName} · {contract.id}</div>
          </div>
          <StatusBadge tone={disputeActive ? "critical" : "success"} icon={false}>{disputeActive ? "Dispute — chat paused" : "Active"}</StatusBadge>
        </div>

        <div className="flex-1 overflow-y-auto scroll-area-thin p-4 space-y-3">
          {contractMsgs.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation below.</div>
          ) : (
            contractMsgs.map((m) => {
              const isPro = m.from === "pro";
              const isSystem = m.from === "system";
              if (isSystem) {
                return (
                  <div key={m.id} className="flex justify-center">
                    <div className="rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground text-center max-w-md">
                      {m.text}
                      <div className="text-[10px] mt-0.5 opacity-70">{new Date(m.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className={cn("flex", isPro ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", isPro ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <div className="text-[10px] font-medium mb-0.5 opacity-80">{m.fromName}</div>
                    <p>{m.text}</p>
                    <div className={cn("text-[10px] mt-1 opacity-60")}>{new Date(m.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Send area */}
        <div className="border-t border-border p-3">
          {disputeActive ? (
            <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>This contract is under dispute. Direct chat is paused while evidence is reviewed.</span>
            </div>
          ) : (
            <>
              {circumventionWarning && (
                <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-3.5 inline mr-1" />
                  Detected: {circumventionWarning.join(", ")}. Please keep payment and contract communication on QuickQuid until the contract is active.
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setDraft(""); setCircumventionWarning(null); }}>Edit message</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate("support")}>Report false positive</Button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  rows={2}
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
                />
                <Button onClick={send} disabled={!draft.trim()}><Send className="size-4" /></Button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Max 25MB · executables blocked · phone, email, and payment links are blocked until the contract is active.</p>
            </>
          )}
        </div>
      </Card>

      {/* Scope summary */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <SectionCard title="Brief & scope summary" description="Immutable reference. Locked for the contract.">
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Fee</div>
              <div className="font-medium">{formatINR(contract.totalProFee)} · 0% commission</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Timeline</div>
              <div className="font-medium">{contract.timeline}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Deliverables</div>
              <div className="font-medium">{contract.scope}</div>
            </div>
            {contract.exclusions.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground">Exclusions</div>
                <ul className="mt-0.5 space-y-0.5">
                  {contract.exclusions.map((e) => <li key={e} className="flex items-start gap-1.5"><XCircle className="size-3.5 mt-0.5 text-muted-foreground" /> {e}</li>)}
                </ul>
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <StatusBadge tone={statusMeta(contract.status).tone}>{statusMeta(contract.status).label}</StatusBadge>
            </div>
          </div>
        </SectionCard>
        <div className="rounded-md border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-800 p-3 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
          <Info className="size-3.5 mt-0.5 shrink-0" />
          <span>Admin Support may review this workspace if a dispute is filed.</span>
        </div>
      </div>
    </div>
  );
}

function DisputesTab({ contract, disputes }: { contract: Contract; disputes: Dispute[] }) {
  const { openDispute, currentUserId, users, addAudit } = useQQ();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [counterclaimFor, setCounterclaimFor] = React.useState<Dispute | null>(null);

  const pro = users.find((u) => u.id === contract.proId);

  function fileDispute(category: DisputeCategory, milestone: string, narrative: string, evidence: string[], desired: string) {
    const d: Dispute = {
      id: genId("DSP"),
      contractId: contract.id,
      raisedBy: "pro",
      raisedByName: pro?.name ?? "Pro",
      category,
      affectedMilestone: milestone,
      requestedResolution: desired,
      narrative,
      evidence,
      desiredOutcome: desired,
      status: "opened",
      createdAt: new Date().toISOString(),
      slaOpenedAt: new Date().toISOString(),
    };
    openDispute(d);
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Dispute opened", entity: "Dispute", entityId: d.id, newStatus: "opened" });
    setOpen(false);
    toast({ title: "Dispute opened", description: "Risk team will mediate. SLA target: see dispute detail." });
  }

  function submitCounterclaim(d: Dispute, text: string) {
    useQQ.getState().updateDispute(d.id, { counterclaim: text });
    setCounterclaimFor(null);
    toast({ title: "Counterclaim submitted", description: "Risk team will review both narratives." });
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Disputes" description="Open a dispute if work, payment, or communication is blocked. Risk (T3) mediates." actions={<Button size="sm" onClick={() => setOpen(true)}><Gavel className="size-3.5" /> Open dispute</Button>}>
        {disputes.length === 0 ? (
          <EmptyState title="No disputes on this contract" description="Open a dispute if you cannot resolve an issue through messaging." icon={Gavel} />
        ) : (
          <div className="space-y-2">
            {disputes.map((d) => {
              const meta = statusMeta(d.status);
              return (
                <Card key={d.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">{DISPUTE_CATEGORIES.find((c) => c.value === d.category)?.label}</h4>
                        <StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>
                        <span className="text-xs text-muted-foreground font-mono">{d.id}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{d.narrative}</p>
                      {d.counterclaim && (
                        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs dark:bg-amber-950/30 dark:border-amber-900">
                          <div className="font-medium">Counterclaim: {d.counterclaim}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {d.raisedBy === "buyer" && !d.counterclaim && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setCounterclaimFor(d)}><RefreshCw className="size-3.5" /> Submit counterclaim</Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </SectionCard>

      <OpenDisputeDialog open={open} onOpenChange={setOpen} onSubmit={fileDispute} milestones={contract.milestones} />
      <CounterclaimDialog dispute={counterclaimFor} onOpenChange={(o) => !o && setCounterclaimFor(null)} onSubmit={submitCounterclaim} />
    </div>
  );
}

function OpenDisputeDialog({ open, onOpenChange, onSubmit, milestones }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onSubmit: (category: DisputeCategory, milestone: string, narrative: string, evidence: string[], desired: string) => void;
  milestones: Milestone[];
}) {
  const [category, setCategory] = React.useState<DisputeCategory>("scope");
  const [milestone, setMilestone] = React.useState(milestones[0]?.id ?? "");
  const [narrative, setNarrative] = React.useState("");
  const [desired, setDesired] = React.useState("");
  const [evidence, setEvidence] = React.useState<string[]>([]);
  React.useEffect(() => { if (!open) { setCategory("scope"); setNarrative(""); setDesired(""); setEvidence([]); } }, [open]);
  const ready = narrative.trim().length > 20 && desired.trim().length > 5;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Open a dispute</DialogTitle>
          <DialogDescription>Be specific. Risk (T3) will mediate. False or abusive disputes are actionable.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DisputeCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DISPUTE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Affected milestone</Label>
            <Select value={milestone} onValueChange={setMilestone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{milestones.map((m) => <SelectItem key={m.id} value={m.id}>{m.label} · {m.description}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dnarr">What happened</Label>
            <Textarea id="dnarr" rows={4} value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="Describe the issue and timeline." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ddes">Desired resolution</Label>
            <Input id="ddes" value={desired} onChange={(e) => setDesired(e.target.value)} placeholder="e.g. Partial refund of ₹7,000 and revised deliverable" />
          </div>
          <div className="space-y-1.5">
            <Label>Evidence</Label>
            <EvidenceDropzone multiple onUploaded={(f) => setEvidence([...evidence, f.name])} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(category, milestone, narrative, evidence, desired)} disabled={!ready}>Open dispute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CounterclaimDialog({ dispute, onOpenChange, onSubmit }: {
  dispute: Dispute | null; onOpenChange: (o: boolean) => void;
  onSubmit: (d: Dispute, text: string) => void;
}) {
  const [text, setText] = React.useState("");
  React.useEffect(() => { if (!dispute) setText(""); }, [dispute]);
  return (
    <Dialog open={!!dispute} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Submit counterclaim · {dispute?.id}</DialogTitle>
          <DialogDescription>Address the Buyer's allegations factually. Risk (T3) will review both narratives.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border p-2 text-sm">
            <div className="text-xs font-medium text-muted-foreground">Buyer's narrative</div>
            <p className="mt-1">{dispute?.narrative}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cc">Your counterclaim</Label>
            <Textarea id="cc" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="State facts and reference evidence." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => dispute && onSubmit(dispute, text)} disabled={text.trim().length < 20}>Submit counterclaim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewsTab({ contract, reviews }: { contract: Contract; reviews: Review[] }) {
  const { addReview, updateReview, currentUserId, users, addAudit } = useQQ();
  const { toast } = useToast();
  const pro = users.find((u) => u.id === contract.proId);
  const myReview = reviews.find((r) => r.fromUserId === currentUserId && r.toRole === "buyer");
  const buyerReviewOfMe = reviews.find((r) => r.toRole === "pro" && r.contractId === contract.id);
  const [open, setOpen] = React.useState(false);
  const [appealFor, setAppealFor] = React.useState<Review | null>(null);

  const canReview = contract.status === "completed" && !myReview;

  function submitReview(rating: number, comment: string) {
    const r: Review = {
      id: genId("REV"),
      contractId: contract.id,
      fromUserId: currentUserId ?? "",
      fromName: pro?.name ?? "Pro",
      toRole: "buyer",
      rating,
      comment,
      visible: false,
      bothSubmitted: false,
      createdAt: new Date().toISOString(),
    };
    addReview(r);
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Review submitted", entity: "Review", entityId: r.id });
    setOpen(false);
    toast({ title: "Review submitted", description: "Reviews are double-blind — visible once both parties submit." });
  }

  function submitAppeal(review: Review, reason: string, evidence: string) {
    updateReview(review.id, { appeal: { reason, evidence, status: "pending" } });
    setAppealFor(null);
    toast({ title: "Appeal submitted", description: "Outcomes: uphold, remove, clarification, or restore. Negative reviews are not auto-removed." });
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Double-blind reviews" description="Reviews unlock when both Buyer and Pro submit. Neither sees the other's review until both are in.">
        {canReview && (
          <InterlockCard tone="info" icon={Award} title="Submit your review of the Buyer" body="Your review is hidden until the Buyer submits theirs. After both submit, both reviews become visible." primary={<Button size="sm" onClick={() => setOpen(true)}><Award className="size-3.5" /> Review Buyer</Button>} />
        )}
        {myReview && (
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Your review of the Buyer</div>
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("size-4", i < myReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />)}</div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{myReview.comment}</p>
            <div className="mt-1 text-xs text-muted-foreground">{myReview.bothSubmitted ? "Visible to both parties" : "Hidden until Buyer submits"}</div>
          </div>
        )}
        {buyerReviewOfMe && (
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Buyer's review of you</div>
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("size-4", i < buyerReviewOfMe.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />)}</div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{buyerReviewOfMe.comment}</p>
            {buyerReviewOfMe.rating <= 3 && (
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setAppealFor(buyerReviewOfMe)}><Flag className="size-3.5" /> Appeal review</Button>
            )}
          </div>
        )}
        {!myReview && !buyerReviewOfMe && !canReview && (
          <p className="text-sm text-muted-foreground">Reviews unlock when the contract completes.</p>
        )}
      </SectionCard>

      <ReviewDialog open={open} onOpenChange={setOpen} onSubmit={submitReview} toName={contract.buyerName} />
      <AppealDialog review={appealFor} onOpenChange={(o) => !o && setAppealFor(null)} onSubmit={submitAppeal} />
    </div>
  );
}

function ReviewDialog({ open, onOpenChange, onSubmit, toName }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onSubmit: (rating: number, comment: string) => void; toName: string;
}) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  React.useEffect(() => { if (!open) { setRating(5); setComment(""); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Review {toName}</DialogTitle>
          <DialogDescription>Be factual. Your review is hidden until the Buyer submits theirs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} star`}>
                  <Star className={cn("size-7", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rcom">Comment</Label>
            <Textarea id="rcom" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What went well? What could be better?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(rating, comment)} disabled={comment.trim().length < 10}>Submit review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppealDialog({ review, onOpenChange, onSubmit }: {
  review: Review | null; onOpenChange: (o: boolean) => void;
  onSubmit: (review: Review, reason: string, evidence: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  const [evidence, setEvidence] = React.useState("");
  React.useEffect(() => { if (!review) { setReason(""); setEvidence(""); } }, [review]);
  return (
    <Dialog open={!!review} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Appeal review</DialogTitle>
          <DialogDescription>Select the review, submit evidence + reason. Outcomes: uphold, remove, clarification, restore. Negative reviews are not auto-removed.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border p-2 text-sm">
            <div className="text-xs font-medium text-muted-foreground">Review being appealed</div>
            <div className="mt-1 flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("size-4", review && i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />)}</div>
            <p className="mt-1">{review?.comment}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aprs">Reason for appeal</Label>
            <Textarea id="aprs" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why should this review be removed or clarified?" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apev">Evidence (link or description)</Label>
            <Input id="apev" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="https://… or describe evidence" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => review && onSubmit(review, reason, evidence)} disabled={reason.trim().length < 20}>Submit appeal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InvoiceTab({ contract }: { contract: Contract }) {
  const fee = buyerFee(contract.totalProFee);
  const total = buyerTotal(contract.totalProFee);
  return (
    <div className="space-y-4">
      <SectionCard title="Invoice & tax mapping" description="Line items map Pro fee, Buyer fee, and applicable taxes. QuickQuid does not hardcode TDS/GST/TCS rates.">
        <Card className="p-4">
          <div className="space-y-2 text-sm">
            <Row label="Professional services" value={formatINR(contract.totalProFee)} />
            <Row label="QuickQuid Buyer fee (0%)" value={formatINR(fee)} />
            <Row label="Applicable tax" value="Calculated by Finance if applicable" muted />
            <Separator className="my-1" />
            <Row label={<span className="font-semibold">Buyer total before applicable tax</span>} value={<span className="font-semibold">{formatINR(total)}</span>} />
          </div>
        </Card>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>Pro fee and Buyer fee are always separate line items. QuickQuid deducts 0% commission from the Pro fee.</div>
          <div>Tax configuration is pending Finance approval. Do not quote tax rates to the Buyer.</div>
        </div>
      </SectionCard>

      <SectionCard title="IP ownership" description="Final ownership follows the signed agreement and applicable payment terms.">
        <InterlockCard tone="info" icon={ShieldCheck} title="IP ownership follows the signed agreement and applicable payment terms." body="QuickQuid does not automatically transfer IP. Refer to the contract scope and your signed agreement for specifics." />
      </SectionCard>

      <SectionCard title="Payout timing" description="Payouts are manual in v0.1. No wallet, no auto-escrow, no auto-payout.">
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> When Buyer accepts a milestone, payout is queued (not instant).</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> Finance processes payouts through maker-checker.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="size-4 mt-0.5 text-emerald-600" /> Every payout carries an immutable reference ID and slip.</li>
        </ul>
      </SectionCard>
    </div>
  );
}

function Row({ label, value, muted }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span className={muted ? "text-muted-foreground text-right" : "text-foreground text-right tabular-nums"}>{value}</span>
    </div>
  );
}

// ============================================================
// 6. ProPayouts
// ============================================================

export function ProPayouts() {
  const { payouts, currentUserId, navigate } = useQQ();
  const { toast } = useToast();
  const [slipFor, setSlipFor] = React.useState<Payout | null>(null);
  const myPayouts = payouts.filter((p) => p.proId === currentUserId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("pro_dashboard")} className="shrink-0">
          <ChevronLeft className="size-4" /> Dashboard
        </Button>
        <PageHeader
          title="Payouts"
          description="0% QuickQuid commission. Every payout has an immutable reference ID. Payouts are processed manually in v0.1."
          status={<StatusBadge tone="info" icon>{myPayouts.length} payout{myPayouts.length === 1 ? "" : "s"}</StatusBadge>}
        >
          <Button variant="outline" onClick={() => navigate("pro_dashboard")}><LayoutDashboard className="size-4" /> Dashboard</Button>
        </PageHeader>
      </div>

      {myPayouts.length === 0 ? (
        <EmptyState
          title="No payouts yet"
          description="Payouts appear here when Buyers accept milestones. Each payout carries an immutable reference ID and a downloadable slip."
          icon={Wallet}
          actions={<Button onClick={() => navigate("pro_briefs")}><Briefcase className="size-4" /> Find work</Button>}
        />
      ) : (
        <SectionCard title="Payout history" description="Pro fee, commission ₹0, statutory withholding if applicable, bank/provider charge if disclosed, net payout, reference, status, slip available.">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead className="text-right">Pro fee</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Statutory</TableHead>
                  <TableHead className="text-right">Bank charge</TableHead>
                  <TableHead className="text-right">Net payout</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Slip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPayouts.map((p) => {
                  const meta = statusMeta(p.status);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="font-mono text-xs">{p.contractId}</TableCell>
                      <TableCell>{p.milestoneLabel}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatINR(p.proFee)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{formatINR(p.commission)}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.statutoryWithholding ? formatINR(p.statutoryWithholding) : "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.bankCharge ? formatINR(p.bankCharge) : "—"}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{formatINR(p.netPayout)}</TableCell>
                      <TableCell className="font-mono text-xs">{p.reference ?? "—"}</TableCell>
                      <TableCell><StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge></TableCell>
                      <TableCell>
                        {p.slipAvailable ? (
                          <Button size="sm" variant="outline" onClick={() => setSlipFor(p)}><Eye className="size-3.5" /> Slip</Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-2 mt-3">
            {myPayouts.map((p) => {
              const meta = statusMeta(p.status);
              return (
                <Card key={p.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-xs">{p.id}</div>
                    <StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.contractId} · {p.milestoneLabel}</div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    <div><span className="text-muted-foreground">Pro fee:</span> {formatINR(p.proFee)}</div>
                    <div><span className="text-muted-foreground">Net:</span> {formatINR(p.netPayout)}</div>
                    <div><span className="text-muted-foreground">Reference:</span> {p.reference ?? "—"}</div>
                  </div>
                  {p.slipAvailable && <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setSlipFor(p)}><Eye className="size-3.5" /> View slip</Button>}
                  {p.status === "failed" && (
                    <InterlockCard tone="critical" icon={XCircle} title="Payout could not be completed" body="Review your payout details and submit an update for Admin verification." />
                  )}
                </Card>
              );
            })}
          </div>
        </SectionCard>
      )}

      {myPayouts.some((p) => p.status === "failed") && (
        <InterlockCard tone="critical" icon={XCircle} title="Payout could not be completed" body="Review your payout details and submit an update for Admin verification." primary={<Button size="sm" onClick={() => navigate("pro_profile")}>Update payout details</Button>} />
      )}

      <PayoutSlipDialog payout={slipFor} onOpenChange={(o) => !o && setSlipFor(null)} />
    </div>
  );
}

function PayoutSlipDialog({ payout, onOpenChange }: { payout: Payout | null; onOpenChange: (o: boolean) => void }) {
  if (!payout) return null;
  const meta = statusMeta(payout.status);
  return (
    <Dialog open={!!payout} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Payout slip · {payout.id}</DialogTitle>
          <DialogDescription>Immutable payout reference. This slip never hardcodes a TDS rate.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border p-3 space-y-2 text-sm">
            <Row label="Payout ID" value={<span className="font-mono">{payout.id}</span>} />
            <Row label="Contract" value={<span className="font-mono">{payout.contractId}</span>} />
            <Row label="Milestone" value={payout.milestoneLabel} />
            <Row label="Beneficiary token" value={<span className="font-mono">{payout.beneficiaryToken}</span>} />
            <Separator className="my-1" />
            <Row label="Agreed Pro fee" value={formatINR(payout.proFee)} />
            <Row label="QuickQuid commission" value={formatINR(payout.commission)} muted />
            <Row label="Statutory withholding" value={payout.statutoryWithholding ? formatINR(payout.statutoryWithholding) : "Calculated by Finance if applicable"} muted />
            <Row label="Bank / provider charge" value={payout.bankCharge ? formatINR(payout.bankCharge) : "Not disclosed"} muted />
            <Separator className="my-1" />
            <Row label={<span className="font-semibold">Net payout</span>} value={<span className="font-semibold">{formatINR(payout.netPayout)}</span>} />
            <Separator className="my-1" />
            <Row label="Payout reference" value={<span className="font-mono">{payout.reference ?? "Pending"}</span>} />
            <Row label="Queued at" value={formatDateTime(payout.queuedAt)} />
            {payout.processedAt && <Row label="Processed at" value={formatDateTime(payout.processedAt)} />}
            {payout.failureReason && <Row label="Failure reason" value={payout.failureReason} />}
          </div>
          <div className="flex items-center justify-between">
            <StatusBadge tone={meta.tone} icon>{meta.label}</StatusBadge>
            {payout.status === "failed" && (
              <span className="text-xs text-destructive">Payout could not be completed. Review your payout details and submit an update for Admin verification.</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast_dismiss()}>Download slip</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toast_dismiss() {
  // no-op placeholder; the Download button would generate a PDF slip in production
}

// ============================================================
// 7. ProGigs
// ============================================================

export function ProGigs() {
  const { gigs, currentUserId, navigate, updateGig } = useQQ();
  const { toast } = useToast();
  const myGigs = gigs.filter((g) => g.proId === currentUserId);

  function pauseGig(id: string) {
    const g = myGigs.find((x) => x.id === id);
    if (!g) return;
    const next = g.status === "paused" ? "approved_live" : "paused";
    updateGig(id, { status: next, availability: next === "approved_live" });
    toast({ title: next === "paused" ? "Gig paused" : "Gig resumed" });
  }
  function duplicateDraft(id: string) {
    const g = myGigs.find((x) => x.id === id);
    if (!g) return;
    const copy: GigDraft = { ...g, id: genId("GIG"), title: `${g.title} (copy)`, status: "draft", views: 0, requests: 0, createdAt: new Date().toISOString() };
    useQQ.getState().upsertGig(copy);
    toast({ title: "Draft duplicated" });
    navigate("pro_gig_detail", { gigId: copy.id });
  }
  function archiveGig(id: string) {
    updateGig(id, { status: "archived" });
    toast({ title: "Gig archived" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("pro_dashboard")} className="shrink-0">
          <ChevronLeft className="size-4" /> Dashboard
        </Button>
        <PageHeader
          title="Gigs"
          description="Gigs are fixed-scope services Buyers can order directly. 0% QuickQuid commission from your fee."
        >
          <Button onClick={() => navigate("pro_gig_new")}><Plus className="size-4" /> Create gig</Button>
        </PageHeader>
      </div>

      {myGigs.length === 0 ? (
        <EmptyState
          title="No gigs yet"
          description="Create a fixed-scope gig so Buyers can order your service directly. The Buyer sees the applicable 0% QuickQuid fee before payment."
          icon={Sparkles}
          actions={<Button onClick={() => navigate("pro_gig_new")}><Plus className="size-4" /> Create your first gig</Button>}
        />
      ) : (
        <SectionCard title="Your gigs" description="Title, status, views, requests, conversion, active orders, rating summary, last updated, availability.">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Active orders</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myGigs.map((g) => {
                  const meta = statusMeta(g.status);
                  const conv = g.views > 0 ? Math.round((g.requests / g.views) * 100) : 0;
                  const activeOrders = g.status === "approved_live" ? Math.min(g.maxConcurrentOrders, g.requests) : 0;
                  return (
                    <TableRow key={g.id}>
                      <TableCell>
                        <button className="text-left font-medium hover:underline" onClick={() => navigate("pro_gig_detail", { gigId: g.id })}>{g.title}</button>
                        <div className="text-xs text-muted-foreground">{g.category}</div>
                      </TableCell>
                      <TableCell><StatusBadge tone={meta.tone} icon={false}>{meta.label.replace("approved live", "live")}</StatusBadge></TableCell>
                      <TableCell className="text-right tabular-nums">{g.views}</TableCell>
                      <TableCell className="text-right tabular-nums">{g.requests}</TableCell>
                      <TableCell className="text-right tabular-nums">{conv}%</TableCell>
                      <TableCell className="text-right tabular-nums">{activeOrders}/{g.maxConcurrentOrders}</TableCell>
                      <TableCell>{g.rating ? <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {g.rating}</span> : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(g.createdAt)}</TableCell>
                      <TableCell>
                        {g.status === "paused" || g.status === "archived" ? <StatusBadge tone="paused" icon={false}>Off</StatusBadge> : <StatusBadge tone="success" icon={false}>On</StatusBadge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => navigate("pro_gig_detail", { gigId: g.id })}><Eye className="size-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => navigate("pro_gig_new", { gigId: g.id })}><Pencil className="size-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => pauseGig(g.id)}><Pause className="size-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => duplicateDraft(g.id)}><Copy className="size-3.5" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => archiveGig(g.id)}><Archive className="size-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-2 mt-3">
            {myGigs.map((g) => {
              const meta = statusMeta(g.status);
              const conv = g.views > 0 ? Math.round((g.requests / g.views) * 100) : 0;
              return (
                <Card key={g.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{g.title}</div>
                    <StatusBadge tone={meta.tone} icon={false}>{meta.label.replace("approved live", "live")}</StatusBadge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{g.category} · {g.views} views · {g.requests} requests · {conv}% conv.</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => navigate("pro_gig_detail", { gigId: g.id })}><Eye className="size-3.5" /> View</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate("pro_gig_new", { gigId: g.id })}><Pencil className="size-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => pauseGig(g.id)}><Pause className="size-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => duplicateDraft(g.id)}><Copy className="size-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => archiveGig(g.id)}><Archive className="size-3.5" /></Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <Info className="size-3 inline mr-1" />
            Changing price, scope, timeline, or deliverables creates a new version and may require re-review. Existing contracts retain original terms.
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ============================================================
// 8. ProGigNew
// ============================================================

const GIG_STEPS = ["Basics", "Service Scope", "Deliverables", "Pricing", "Requirements", "Preview"] as const;
type GigStep = typeof GIG_STEPS[number];

const GIG_COVER_COLORS = ["#7C3AED", "#0891B2", "#DB2777", "#CA8A04", "#0F766E", "#9F1239", "#15803D"];
const PACKAGE_NAMES = ["Basic", "Standard", "Premium"];

export function ProGigNew() {
  const { currentUserId, users, proProfiles, viewParams, gigs, upsertGig, navigate, goBack, addAudit } = useQQ();
  const { toast } = useToast();
  const user = users.find((u) => u.id === currentUserId);
  const proProfile = proProfiles.find((profile) => profile.userId === currentUserId);
  const editing = viewParams.gigId ? gigs.find((g) => g.id === viewParams.gigId) : undefined;

  const [step, setStep] = React.useState<GigStep>("Basics");
  const [title, setTitle] = React.useState(editing?.title ?? "");
  const [category, setCategory] = React.useState(editing?.category ?? CATEGORIES[0]);
  const [subcategory, setSubcategory] = React.useState(editing?.subcategory ?? "");
  const [tags, setTags] = React.useState<string[]>(editing?.tags ?? []);
  const [tagDraft, setTagDraft] = React.useState("");
  const [shortDesc, setShortDesc] = React.useState(editing?.shortDescription ?? "");
  const [detailedDesc, setDetailedDesc] = React.useState(editing?.detailedDescription ?? "");
  const [included, setIncluded] = React.useState<string[]>(editing?.includedItems ?? []);
  const [includedDraft, setIncludedDraft] = React.useState("");
  const [exclusions, setExclusions] = React.useState<string[]>(editing?.exclusions ?? []);
  const [exclDraft, setExclDraft] = React.useState("");
  const [deliverableFormat, setDeliverableFormat] = React.useState(editing?.deliverableFormat ?? "Figma link");
  const [revisions, setRevisions] = React.useState(editing?.revisions ?? 2);
  const [deliveryTimeline, setDeliveryTimeline] = React.useState(editing?.deliveryTimeline ?? "10 days");
  const [buyerReqs, setBuyerReqs] = React.useState<string[]>(editing?.buyerRequirements ?? []);
  const [buyerReqDraft, setBuyerReqDraft] = React.useState("");
  const [evidence, setEvidence] = React.useState<string[]>(editing?.evidence ?? []);
  const [coverColor, setCoverColor] = React.useState(editing?.coverImageColor ?? GIG_COVER_COLORS[0]);
  const [packageName, setPackageName] = React.useState(editing?.packageName ?? "Standard");
  const [proFee, setProFee] = React.useState(editing?.proFee ?? 25000);
  const [availability, setAvailability] = React.useState(editing?.availability ?? true);
  const [maxConcurrent, setMaxConcurrent] = React.useState(editing?.maxConcurrentOrders ?? 2);
  const [submitting, setSubmitting] = React.useState(false);

  const dirty = !!title || !!shortDesc || !!detailedDesc || tags.length > 0 || included.length > 0 || exclusions.length > 0 || buyerReqs.length > 0 || evidence.length > 0 || proFee !== 25000 || deliveryTimeline !== "10 days";
  useNavigationGuard(dirty, "This gig has unsaved changes. Leave without saving?");

  function addTag() {
    const v = tagDraft.trim().replace(/^#/, "");
    if (!v || tags.includes(v)) return;
    setTags([...tags, v]); setTagDraft("");
  }
  function addIncluded() { const v = includedDraft.trim(); if (!v) return; setIncluded([...included, v]); setIncludedDraft(""); }
  function addExcl() { const v = exclDraft.trim(); if (!v) return; setExclusions([...exclusions, v]); setExclDraft(""); }
  function addBuyerReq() { const v = buyerReqDraft.trim(); if (!v) return; setBuyerReqs([...buyerReqs, v]); setBuyerReqDraft(""); }

  const fee = buyerFee(proFee);
  const total = buyerTotal(proFee);

  function buildGig(status: GigDraft["status"]): GigDraft {
    return {
      id: editing?.id ?? genId("GIG"),
      proId: currentUserId ?? "",
      proName: user?.name ?? "Pro",
      title: title.trim() || "Untitled gig",
      category,
      subcategory: subcategory.trim() || undefined,
      tags,
      shortDescription: shortDesc.trim(),
      detailedDescription: detailedDesc.trim(),
      includedItems: included,
      exclusions,
      deliverableFormat,
      revisions,
      deliveryTimeline,
      buyerRequirements: buyerReqs,
      evidence,
      coverImageColor: coverColor,
      packageName,
      proFee,
      availability,
      maxConcurrentOrders: maxConcurrent,
      status,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      views: editing?.views ?? 0,
      requests: editing?.requests ?? 0,
      rating: editing?.rating,
      moderationReason: editing?.moderationReason,
    };
  }

  function saveDraft() {
    const draft = buildGig("draft");
    upsertGig(draft);
    toast({ title: "Draft saved", description: "You can continue editing from the Gigs tab." });
    navigate("pro_gig_detail", { gigId: draft.id });
  }

  function submitForReview() {
    if (user?.verificationStatus !== "approved" || proProfile?.onboardingStatus !== "approved") {
      toast({ title: "Complete Pro onboarding first", description: "Admin must approve your identity, category, skill evidence, public proof, and payout details before a gig can enter moderation.", variant: "destructive" });
      navigate("readiness");
      return;
    }
    if (!title.trim()) { toast({ title: "Title required", variant: "destructive" }); setStep("Basics"); return; }
    if (!shortDesc.trim()) { toast({ title: "Short description required", variant: "destructive" }); setStep("Basics"); return; }
    if (!category.trim()) { toast({ title: "Category required", variant: "destructive" }); setStep("Basics"); return; }
    if (included.length === 0) { toast({ title: "Add at least one included item", variant: "destructive" }); setStep("Service Scope"); return; }
    if (!deliverableFormat.trim()) { toast({ title: "Deliverable format required", variant: "destructive" }); setStep("Deliverables"); return; }
    if (!deliveryTimeline.trim()) { toast({ title: "Delivery timeline required", variant: "destructive" }); setStep("Deliverables"); return; }
    if (proFee <= 0) { toast({ title: "Enter a valid Pro fee", variant: "destructive" }); setStep("Pricing"); return; }
    if (buyerReqs.length === 0) { toast({ title: "Add at least one Buyer requirement", variant: "destructive" }); setStep("Requirements"); return; }
    if (evidence.length === 0) { toast({ title: "Attach at least one evidence item", variant: "destructive" }); setStep("Requirements"); return; }
    setSubmitting(true);
    setTimeout(() => {
      const g = buildGig("submitted");
      upsertGig(g);
      addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Gig submitted for review", entity: "Gig", entityId: g.id, newStatus: "submitted" });
      setSubmitting(false);
      toast({ title: "Gig submitted for review", description: "QuickQuid will review scope, claims, and pricing." });
      navigate("pro_gig_detail", { gigId: g.id });
    }, 700);
  }

  function back() {
    const idx = GIG_STEPS.indexOf(step);
    if (idx > 0) setStep(GIG_STEPS[idx - 1]);
    else goBack();
  }
  function next() {
    const idx = GIG_STEPS.indexOf(step);
    if (idx < GIG_STEPS.length - 1) setStep(GIG_STEPS[idx + 1]);
  }

  return (
    <div className="space-y-6">
      <button onClick={goBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to gigs
      </button>

      <PageHeader
        title={editing ? "Edit gig" : "Create a gig"}
        description="Describe the result a Buyer will receive. 0% QuickQuid commission from your fee. The Buyer sees the applicable QuickQuid fee before payment."
      />

      {/* Stepper */}
      <Card className="p-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {GIG_STEPS.map((s, i) => {
            const idx = GIG_STEPS.indexOf(step);
            const done = i < idx;
            const active = i === idx;
            return (
              <React.Fragment key={s}>
                <button onClick={() => setStep(s)} className="flex flex-col items-center gap-1 min-w-[80px]">
                  <div className={cn("flex size-7 items-center justify-center rounded-full border text-xs font-medium", done ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
                    {done ? <CheckCircle2 className="size-4" /> : i + 1}
                  </div>
                  <span className={cn("text-[10px]", active ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
                </button>
                {i < GIG_STEPS.length - 1 && <div className={cn("h-0.5 flex-1 min-w-[8px]", done ? "bg-emerald-500" : "bg-border")} />}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {step === "Basics" && (
            <SectionCard title="Basics" description="Describe the result a Buyer will receive.">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gtitle">Title</Label>
                  <Input id="gtitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design system audit & token delivery" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gsub">Subcategory</Label>
                    <Input id="gsub" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g. Design Systems" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gtag">Tags</Label>
                  <div className="flex gap-2">
                    <Input id="gtag" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="Add a tag" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                    <Button type="button" onClick={addTag}><Plus className="size-4" /></Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {tags.map((t) => <Badge key={t} variant="secondary" className="gap-1"><Tag className="size-3" /> {t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="size-3" /></button></Badge>)}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gshort">Short description</Label>
                  <Input id="gshort" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="One-line summary Buyers see in the card" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gdet">Detailed description</Label>
                  <Textarea id="gdet" rows={5} value={detailedDesc} onChange={(e) => setDetailedDesc(e.target.value)} placeholder="Describe the result, your process, and what makes this offering distinctive." />
                </div>
              </div>
            </SectionCard>
          )}

          {step === "Service Scope" && (
            <SectionCard title="Service scope" description="Be precise about what is included and excluded.">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Included items</Label>
                  <div className="flex gap-2">
                    <Input value={includedDraft} onChange={(e) => setIncludedDraft(e.target.value)} placeholder="e.g. Audit report" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIncluded())} />
                    <Button type="button" onClick={addIncluded}><Plus className="size-4" /></Button>
                  </div>
                  {included.length > 0 && (
                    <ul className="space-y-1 mt-1">
                      {included.map((i) => <li key={i} className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-sm"><span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-600" /> {i}</span><button onClick={() => setIncluded(included.filter((x) => x !== i))}><X className="size-3.5" /></button></li>)}
                    </ul>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Exclusions</Label>
                  <div className="flex gap-2">
                    <Input value={exclDraft} onChange={(e) => setExclDraft(e.target.value)} placeholder="e.g. No implementation in code" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExcl())} />
                    <Button type="button" onClick={addExcl}><Plus className="size-4" /></Button>
                  </div>
                  {exclusions.length > 0 && (
                    <ul className="space-y-1 mt-1">
                      {exclusions.map((i) => <li key={i} className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-sm"><span className="flex items-center gap-1.5"><XCircle className="size-3.5 text-muted-foreground" /> {i}</span><button onClick={() => setExclusions(exclusions.filter((x) => x !== i))}><X className="size-3.5" /></button></li>)}
                    </ul>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {step === "Deliverables" && (
            <SectionCard title="Deliverables & timeline">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gfmt">Deliverable format</Label>
                  <Input id="gfmt" value={deliverableFormat} onChange={(e) => setDeliverableFormat(e.target.value)} placeholder="e.g. Figma link + JSON" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="grev">Revisions</Label>
                    <Input id="grev" type="number" min={0} value={revisions} onChange={(e) => setRevisions(Math.max(0, Number(e.target.value) || 0))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gtime">Delivery timeline</Label>
                    <Input id="gtime" value={deliveryTimeline} onChange={(e) => setDeliveryTimeline(e.target.value)} placeholder="e.g. 10 days" />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {step === "Pricing" && (
            <SectionCard title="Pricing" description="Your gig price is the professional fee. QuickQuid does not deduct a platform commission from it. The Buyer sees the applicable QuickQuid fee before payment.">
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Package</Label>
                    <Select value={packageName} onValueChange={setPackageName}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PACKAGE_NAMES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Single package first. Basic/Standard/Premium shown as future.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gfee">Your fee (INR)</Label>
                    <Input id="gfee" type="number" min={0} value={proFee} onChange={(e) => setProFee(Math.max(0, Number(e.target.value) || 0))} />
                  </div>
                </div>
                <FeeBreakdown proFee={proFee} />
                <div className="text-xs text-muted-foreground">
                  Commercial summary: Pro fee {formatINR(proFee)} · commission {formatINR(0)} · Buyer fee 0% {formatINR(fee)} · Buyer total {formatINR(total)}.
                </div>
              </div>
            </SectionCard>
          )}

          {step === "Requirements" && (
            <SectionCard title="Buyer requirements & evidence">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Buyer requirements</Label>
                  <div className="flex gap-2">
                    <Input value={buyerReqDraft} onChange={(e) => setBuyerReqDraft(e.target.value)} placeholder="e.g. Provide Figma access" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBuyerReq())} />
                    <Button type="button" onClick={addBuyerReq}><Plus className="size-4" /></Button>
                  </div>
                  {buyerReqs.length > 0 && (
                    <ul className="space-y-1 mt-1">
                      {buyerReqs.map((i) => <li key={i} className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-sm"><span className="flex items-center gap-1.5"><ListChecks className="size-3.5 text-muted-foreground" /> {i}</span><button onClick={() => setBuyerReqs(buyerReqs.filter((x) => x !== i))}><X className="size-3.5" /></button></li>)}
                    </ul>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Evidence (portfolio items that prove you can deliver)</Label>
                  <EvidenceDropzone multiple onUploaded={(f) => setEvidence([...evidence, f.name])} />
                  {evidence.length > 0 && <div className="text-xs text-muted-foreground">{evidence.length} attached</div>}
                </div>
                <div className="space-y-1.5">
                  <Label>Cover image color</Label>
                  <div className="flex flex-wrap gap-2">
                    {GIG_COVER_COLORS.map((c) => (
                      <button key={c} onClick={() => setCoverColor(c)} className={cn("size-8 rounded-md border-2", coverColor === c ? "border-primary ring-2 ring-primary/20" : "border-transparent")} style={{ backgroundColor: c }} aria-label={`Cover ${c}`} />
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Availability</Label>
                    <div className="flex items-center gap-2 rounded-md border border-border p-2">
                      <Switch checked={availability} onCheckedChange={setAvailability} />
                      <span className="text-sm">{availability ? "Accepting orders" : "Paused"}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gmax">Max concurrent orders</Label>
                    <Input id="gmax" type="number" min={1} value={maxConcurrent} onChange={(e) => setMaxConcurrent(Math.max(1, Number(e.target.value) || 1))} />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {step === "Preview" && (
            <SectionCard title="Preview" description="This is how the gig appears to Buyers (subject to Admin review).">
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="h-32 w-full" style={{ backgroundColor: coverColor }} />
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline">{category}</Badge>
                    <StatusBadge tone="pending" icon={false}>Draft preview</StatusBadge>
                  </div>
                  <h3 className="text-lg font-semibold">{title || "Untitled gig"}</h3>
                  <p className="text-sm text-muted-foreground">{shortDesc || "Add a short description."}</p>
                  <div className="text-xs text-muted-foreground">By {user?.name ?? "Pro"}</div>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Included</div>
                      <ul className="mt-1 space-y-0.5">{included.map((i) => <li key={i} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-600" /> {i}</li>)}</ul>
                      {included.length === 0 && <p className="text-xs text-muted-foreground">No items.</p>}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Exclusions</div>
                      <ul className="mt-1 space-y-0.5">{exclusions.map((i) => <li key={i} className="flex items-center gap-1.5"><XCircle className="size-3.5 text-muted-foreground" /> {i}</li>)}</ul>
                      {exclusions.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div><div className="text-xs text-muted-foreground">Delivery</div><div className="font-medium">{deliveryTimeline}</div></div>
                    <div><div className="text-xs text-muted-foreground">Revisions</div><div className="font-medium">{revisions}</div></div>
                    <div><div className="text-xs text-muted-foreground">Format</div><div className="font-medium">{deliverableFormat}</div></div>
                  </div>
                  <Separator />
                  <FeeBreakdown proFee={proFee} />
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Commercial summary" description="0% QuickQuid commission. Buyer fee 0%.">
            <FeeBreakdown proFee={proFee} compact />
          </SectionCard>
          <SectionCard title="Validation">
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">{title.trim() ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Title</li>
              <li className="flex items-center gap-2">{shortDesc.trim() ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Short description</li>
              <li className="flex items-center gap-2">{category.trim() ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Category</li>
              <li className="flex items-center gap-2">{included.length > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} At least one included item</li>
              <li className="flex items-center gap-2">{deliverableFormat.trim() ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Deliverable format</li>
              <li className="flex items-center gap-2">{deliveryTimeline.trim() ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Delivery timeline</li>
              <li className="flex items-center gap-2">{proFee > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Valid Pro fee</li>
              <li className="flex items-center gap-2">{buyerReqs.length > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Buyer requirements</li>
              <li className="flex items-center gap-2">{evidence.length > 0 ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-muted-foreground" />} Evidence attached</li>
            </ul>
          </SectionCard>
          <SectionCard title="States" description="Gig states: draft, submitted, under review, approved-live, changes requested, rejected, paused, archived.">
            <div className="flex flex-wrap gap-1">
              {["draft", "submitted", "under_review", "approved_live", "changes_requested", "rejected", "paused", "archived"].map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s.replace(/_/g, " ")}</Badge>)}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Sticky CTA bottom bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/95 backdrop-blur p-3 shadow-sm">
        <Button variant="ghost" onClick={back}><ChevronLeft className="size-4" /> Back to edit</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={saveDraft}><Save className="size-4" /> Save draft</Button>
          {step !== "Preview" ? (
            <Button onClick={next}>Continue <ChevronRight className="size-4" /></Button>
          ) : (
            <Button onClick={submitForReview} disabled={submitting}>{submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit for review</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 9. ProGigDetail
// ============================================================

export function ProGigDetail() {
  const { viewParams, gigs, navigate, updateGig, addAudit, currentUserId, users, proProfiles, priorityBoosts, submitPriorityBoost } = useQQ();
  const { toast } = useToast();
  const gig = gigs.find((g) => g.id === viewParams.gigId);
  const [confirmArchive, setConfirmArchive] = React.useState(false);
  const priorityBoost = priorityBoosts.filter((pb) => pb.gigId === viewParams.gigId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const priorityBoostOpen = priorityBoost && ["payment_evidence_submitted", "under_admin_verification", "payment_confirmed", "active"].includes(priorityBoost.paymentStatus);
  const currentUser = users.find((user) => user.id === currentUserId);
  const currentProfile = proProfiles.find((profile) => profile.userId === currentUserId);

  if (!gig) {
    return (
      <EmptyState
        title="Gig not found"
        description="This gig may have been archived."
        icon={FileWarning}
        actions={<Button onClick={() => navigate("pro_gigs")}>Back to gigs</Button>}
      />
    );
  }

  const meta = statusMeta(gig.status);
  const fee = buyerFee(gig.proFee);
  const total = buyerTotal(gig.proFee);

  function submit() {
    if (currentUser?.verificationStatus !== "approved" || currentProfile?.onboardingStatus !== "approved") {
      toast({ title: "Complete Pro onboarding first", description: "Admin approval is required before publishing a gig.", variant: "destructive" });
      navigate("readiness");
      return;
    }
    updateGig(gig!.id, { status: "submitted", moderationReason: undefined });
    addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Gig submitted for review", entity: "Gig", entityId: gig!.id, newStatus: "submitted" });
    toast({ title: "Gig submitted for review", description: "QuickQuid will review your gig." });
  }
  function pause() {
    const next = gig!.status === "paused" ? "approved_live" : "paused";
    updateGig(gig!.id, { status: next, availability: next === "approved_live" });
    toast({ title: next === "paused" ? "Gig paused" : "Gig resumed" });
  }
  function archive() {
    updateGig(gig!.id, { status: "archived" });
    setConfirmArchive(false);
    toast({ title: "Gig archived" });
  }
  function saveDraft() {
    updateGig(gig!.id, { status: "draft" });
    toast({ title: "Saved as draft" });
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("pro_gigs")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to gigs
      </button>

      <PageHeader
        title={gig.title}
        description={gig.shortDescription}
        status={<StatusBadge tone={meta.tone} icon>{meta.label.replace("approved live", "live")}</StatusBadge>}
      >
        <Button variant="outline" onClick={() => navigate("pro_gig_new", { gigId: gig.id })}><Pencil className="size-4" /> Edit</Button>
        {gig.status !== "paused" && gig.status !== "archived" && <Button variant="outline" onClick={pause}><Pause className="size-4" /> Pause</Button>}
        {gig.status === "paused" && <Button variant="outline" onClick={pause}><CheckCircle2 className="size-4" /> Resume</Button>}
        <Button variant="ghost" onClick={() => setConfirmArchive(true)}><Archive className="size-4" /> Archive</Button>
      </PageHeader>

      {(gig.status === "changes_requested" || gig.status === "rejected") && gig.moderationReason && (
        <InterlockCard
          tone={gig.status === "rejected" ? "critical" : "warning"}
          icon={AlertTriangle}
          title={gig.status === "rejected" ? "Gig rejected" : "Changes requested"}
          body={`Moderation reason: ${gig.moderationReason}. Edit and re-submit for review.`}
          primary={<Button size="sm" onClick={() => navigate("pro_gig_new", { gigId: gig.id })}><Pencil className="size-3.5" /> Edit gig</Button>}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Preview" description="This is how the gig appears to Buyers.">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="h-32 w-full" style={{ backgroundColor: gig.coverImageColor }} />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <Badge variant="outline">{gig.category}</Badge>
                    {gig.subcategory && <Badge variant="outline" className="ml-1">{gig.subcategory}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gig.tags.map((t) => <Badge key={t} variant="secondary"><Tag className="size-3" /> {t}</Badge>)}
                  </div>
                </div>
                <h2 className="text-xl font-semibold">{gig.title}</h2>
                <p className="text-sm text-muted-foreground">{gig.shortDescription}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Avatar className="size-5 rounded"><AvatarFallback className="rounded bg-primary/10 text-primary text-[10px]">{initials(gig.proName)}</AvatarFallback></Avatar>
                  <span>{gig.proName}</span>
                  {gig.rating && <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {gig.rating}</span>}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{gig.detailedDescription}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Deliverables</h3>
                    <ul className="space-y-0.5 text-sm">
                      {gig.includedItems.map((i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="size-3.5 mt-0.5 text-emerald-600" /> {i}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Exclusions</h3>
                    <ul className="space-y-0.5 text-sm">
                      {gig.exclusions.map((i) => <li key={i} className="flex items-start gap-1.5"><XCircle className="size-3.5 mt-0.5 text-muted-foreground" /> {i}</li>)}
                      {gig.exclusions.length === 0 && <li className="text-xs text-muted-foreground">None.</li>}
                    </ul>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm border-t border-border pt-3">
                  <div><div className="text-xs text-muted-foreground">Delivery timeline</div><div className="font-medium">{gig.deliveryTimeline}</div></div>
                  <div><div className="text-xs text-muted-foreground">Revisions</div><div className="font-medium">{gig.revisions}</div></div>
                  <div><div className="text-xs text-muted-foreground">Format</div><div className="font-medium">{gig.deliverableFormat}</div></div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-1">Buyer requirements</h3>
                  <ul className="space-y-0.5 text-sm">
                    {gig.buyerRequirements.map((i) => <li key={i} className="flex items-start gap-1.5"><ListChecks className="size-3.5 mt-0.5 text-muted-foreground" /> {i}</li>)}
                    {gig.buyerRequirements.length === 0 && <li className="text-xs text-muted-foreground">None.</li>}
                  </ul>
                </div>

                <div className="border-t border-border pt-3">
                  <h3 className="text-sm font-semibold mb-1">Pricing</h3>
                  <FeeBreakdown proFee={gig.proFee} />
                </div>
              </div>
            </div>
          </SectionCard>

          {gig.status === "approved_live" && currentUser?.verificationStatus === "approved" && currentProfile?.onboardingStatus === "approved" && (
            <SectionCard title="Performance" description="Views, requests, conversion, active orders.">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Views" value={gig.views} icon={Eye} />
                <StatCard label="Requests" value={gig.requests} icon={Send} />
                <StatCard label="Conversion" value={`${gig.views > 0 ? Math.round((gig.requests / gig.views) * 100) : 0}%`} icon={Award} />
                <StatCard label="Active orders" value={`${Math.min(gig.maxConcurrentOrders, gig.requests)}/${gig.maxConcurrentOrders}`} icon={Briefcase} />
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Status & moderation">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current status</span>
                <StatusBadge tone={meta.tone} icon>{meta.label.replace("approved live", "live")}</StatusBadge>
              </div>
              {gig.moderationReason && <div className="text-xs text-muted-foreground">Moderation note: {gig.moderationReason}</div>}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Availability</span>
                <span>{gig.availability ? "On" : "Off"}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {gig.status === "draft" && <Button size="sm" onClick={submit}><Send className="size-3.5" /> Submit for review</Button>}
              {gig.status === "changes_requested" && <Button size="sm" onClick={submit}><RefreshCw className="size-3.5" /> Re-submit for review</Button>}
              {gig.status === "rejected" && <Button size="sm" onClick={() => navigate("pro_gig_new", { gigId: gig.id })}><Pencil className="size-3.5" /> Edit and re-submit</Button>}
              {gig.status === "approved_live" && <Button size="sm" variant="outline" onClick={pause}><Pause className="size-3.5" /> Pause</Button>}
              {gig.status === "paused" && <Button size="sm" onClick={pause}><CheckCircle2 className="size-3.5" /> Resume</Button>}
              <Button size="sm" variant="ghost" onClick={saveDraft}><Save className="size-3.5" /> Save as draft</Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("pro_gig_new", { gigId: gig.id })}><Pencil className="size-3.5" /> Back to edit</Button>
            </div>
          </SectionCard>

          <SectionCard title="Commercial summary">
            <FeeBreakdown proFee={gig.proFee} compact />
            <div className="mt-2 text-xs text-muted-foreground">Pro fee {formatINR(gig.proFee)} · commission {formatINR(0)} · Buyer fee 0% {formatINR(fee)} · Buyer total {formatINR(total)}.</div>
          </SectionCard>

          {gig.status === "approved_live" && (
            <PriorityBoostPanel
              gigId={gig.id}
              gigTitle={gig.title}
              proId={gig.proId}
              proName={gig.proName}
              boost={priorityBoost}
              onSubmit={(pb) => {
                if (priorityBoostOpen || currentUser?.verificationStatus !== "approved" || currentProfile?.onboardingStatus !== "approved") {
                  toast({ title: "Priority boost unavailable", description: "Only one priority request may be open at a time, and the Pro must be fully verified.", variant: "destructive" });
                  return;
                }
                submitPriorityBoost(pb);
                addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Priority boost payment submitted", entity: "PriorityBoost", entityId: pb.id, newStatus: "payment_evidence_submitted", reason: `${formatINR(pb.priorityFee)} for ${pb.duration} days` });
                toast({ title: "Priority payment submitted", description: "Under Admin review." });
              }}
            />
          )}

          {gig.status === "approved_live" && (currentUser?.verificationStatus !== "approved" || currentProfile?.onboardingStatus !== "approved") && (
            <InterlockCard tone="warning" icon={ShieldCheck} title="Verification required before promotion" body="Priority placement is a paid marketing action. Complete Pro onboarding and Admin approval before submitting payment evidence." primary={<Button size="sm" onClick={() => navigate("readiness")}>Open onboarding</Button>} />
          )}

          <InterlockCard tone="info" icon={Info} title="Versioning" body="Changing price, scope, timeline, or deliverables creates a new version and may require re-review. Existing contracts retain original terms." />
        </div>
      </div>

      <Dialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Archive this gig?</DialogTitle>
            <DialogDescription>The gig will be hidden from discovery. Existing contracts retain original terms.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmArchive(false)}>Cancel</Button>
            <Button variant="outline" onClick={archive}><Archive className="size-4" /> Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
