"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Alert, AlertDescription, AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PageHeader, EmptyState, SectionCard, QQProgress, MaskedField, AuditRow, ActivityTimeline, AlertBanner,
} from "@/components/qq/shared";
import { StatusBadge, statusMeta } from "@/components/qq/shared/StatusBadge";
import { FeeBreakdown } from "@/components/qq/shared/FeeBreakdown";
import {
  ProfileCard, BriefCard, ProposalCard, PortfolioItemCard,
  MilestoneStepper, PaymentTracker, ContractMilestoneList,
} from "@/components/qq/shared/cards";
import { VideoGigCard } from "@/components/qq/shared/VideoGigCard";
import { DeliveryVault } from "@/components/qq/shared/DeliveryVault";
import type { VaultItem as VaultItemType, VaultState as VaultStateType } from "@/lib/qq/types";
import { EvidenceDropzone } from "@/components/qq/shared/EvidenceDropzone";
import {
  formatINR, buyerFee, buyerTotal, budgetBand, BUDGET_BANDS, CATEGORIES,
  DECLINE_REASONS, PAYMENT_REJECTION_REASONS, DISPUTE_CATEGORIES,
  detectCircumvention, genId, timeAgo, formatDate, formatDateTime, hoursSince,
} from "@/lib/qq/format";
import type {
  Brief, Proposal, Contract, PaymentEvidence, Milestone, BuyerProfile,
  BriefVisibility, DisputeCategory, PaymentMethod, GigDraft, ProProfile, AuditEvent,
} from "@/lib/qq/types";
import {
  AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Banknote, Bell,
  Briefcase, Building2, Calendar, CheckCircle2, ChevronRight, Circle, Clock,
  Copy, CreditCard, FileText, Gavel, Info, Link2, Loader2, Lock,
  Mail, MessageSquare, Pencil, Plus, RefreshCw, Send, Shield,
  ShieldAlert, ShieldCheck, Sparkles, Star, Upload, UserCog, Users,
  Wallet, X, XCircle, Eye, EyeOff, Ban, RotateCcw, Hand, FileCheck, Camera,
  FileSearch, IndianRupee, Scale, ChevronLeft, Image as ImageIcon,
  Paperclip, Search, SlidersHorizontal, Tag, Clock4, Hash, Rocket,
} from "lucide-react";

// ---------- helpers ----------
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function avatarColor(seed?: string) {
  if (!seed) return "#475569";
  const colors: Record<string, string> = {
    "PRO-2088": "#7C3AED",
    "PRO-2099": "#0891B2",
    "PRO-2101": "#DB2777",
    "PRO-2102": "#CA8A04",
    "BUY-1042": "#0F766E",
    "BUY-1050": "#15803D",
  };
  return colors[seed] ?? "#475569";
}

function StickyCtaBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-14 md:bottom-0 z-20 -mx-4 sm:mx-0 border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {children}
      </div>
    </div>
  );
}

// =================================================================
// 1. BuyerDashboard — Screen 02
// =================================================================
export function BuyerDashboard() {
  const {
    currentUserId, contracts, briefs, proposals, payments, payouts,
    navigate, users, proProfiles, audit,
  } = useQQ();

  const myContracts = contracts.filter((c) => c.buyerId === currentUserId);
  const myBriefs = briefs.filter((b) => b.buyerId === currentUserId);
  const myProposals = proposals.filter((p) =>
    myBriefs.some((b) => b.id === p.briefId) && p.status === "pending",
  );
  const myPayments = payments.filter((p) =>
    myContracts.some((c) => c.id === p.contractId),
  );
  const pendingPayments = myPayments.filter(
    (p) => p.status === "under_admin_verification" || p.status === "payment_evidence_submitted",
  );

  // Action banner: payment evidence required
  const actionContracts = myContracts.filter(
    (c) => c.status === "offer_accepted_pending_funding" || c.milestones.some(
      (m) => m.status === "funding_pending",
    ),
  );
  const rejectedPayments = myPayments.filter((p) => p.status === "payment_rejected");

  const stats = [
    { label: "Active briefs", value: myBriefs.filter((b) => b.status === "active" || b.status === "approaching_inactivity").length, icon: FileText },
    { label: "Pending proposals", value: myProposals.length, icon: Send },
    { label: "Contracts", value: myContracts.length, icon: Briefcase },
    { label: "Pending payments", value: pendingPayments.length, icon: Wallet },
  ];

  if (myContracts.length === 0 && myBriefs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Buyer dashboard"
          description="Your projects, briefs, and payments in one place."
        />
        <EmptyState
          icon={Briefcase}
          title="No active projects yet"
          description="Start with a clear brief or find a professional directly."
          actions={
            <>
              <Button onClick={() => navigate("buyer_brief_new")}>
                <Plus className="size-4" /> Post a brief
              </Button>
              <Button variant="outline" onClick={() => navigate("buyer_talent")}>
                <Users className="size-4" /> Search talent
              </Button>
            </>
          }
        />
        <QuickStats stats={stats} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer dashboard"
        description="Your projects, briefs, and payments in one place."
        status={<StatusBadge tone="info" icon={false}>Buyer · BUY-{(currentUserId ?? "").slice(-4)}</StatusBadge>}
      >
        <Button onClick={() => navigate("buyer_brief_new")}><Plus className="size-4" /> Post a brief</Button>
        <Button variant="outline" onClick={() => navigate("buyer_talent")}><Users className="size-4" /> Search talent</Button>
      </PageHeader>

      {/* Action required banner */}
      {(actionContracts.length > 0 || rejectedPayments.length > 0) && (
        <AlertBanner
          tone="warning"
          icon={AlertTriangle}
          title="Action required"
          actions={
            rejectedPayments.length > 0 ? (
              <Button size="sm" onClick={() => navigate("buyer_payment", { contractId: rejectedPayments[0].contractId })}>
                Resubmit evidence
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("buyer_payment", { contractId: actionContracts[0].id })}>
                Submit evidence <ArrowRight className="size-3.5" />
              </Button>
            )
          }
        >
          {rejectedPayments.length > 0 ? (
            <>Payment evidence <span className="font-mono">{rejectedPayments[0].id}</span> was rejected. Resubmit to unlock milestone funding.</>
          ) : actionContracts.length > 0 ? (
            <>Submit payment evidence for <span className="font-mono">{actionContracts[0].id}</span> so the Pro can begin Milestone 1 work.</>
          ) : null}
        </AlertBanner>
      )}

      <QuickStats stats={stats} />

      {/* Active engagements */}
      <SectionCard
        title="Active engagements"
        description="Contracts you have with Pros. Click to open the workroom."
      >
        {myContracts.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No active projects yet"
            description="Start with a clear brief or find a professional directly."
            actions={
              <>
                <Button onClick={() => navigate("buyer_brief_new")}><Plus className="size-4" /> Post a brief</Button>
                <Button variant="outline" onClick={() => navigate("buyer_talent")}><Users className="size-4" /> Search talent</Button>
              </>
            }
          />
        ) : (
          <div className="space-y-3">
            {myContracts.map((c) => {
              const currentMilestone = c.milestones.find((m) => m.id === c.currentMilestoneId) ?? c.milestones[0];
              const pro = users.find((u) => u.id === c.proId);
              const lastAudit = useQQ.getState().audit.filter((a) => a.entityId === c.id).slice(0, 1)[0];
              const contractPayments = myPayments.filter((p) => p.contractId === c.id);
              const lastUpdate = contractPayments[0]?.submittedAt ?? c.createdAt;
              const meta = statusMeta(c.status);
              return (
                <Card key={c.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("buyer_contract", { contractId: c.id })}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="size-10 rounded-md" style={{ backgroundColor: avatarColor(c.proId) }}>
                        <AvatarFallback className="rounded-md text-white text-xs font-medium">{initials(c.proName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{c.briefTitle}</h3>
                          <StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>{c.proName}</span>
                          <span>·</span>
                          <span className="font-mono">{c.id}</span>
                          <span>·</span>
                          <span>Milestone {currentMilestone?.index ?? 1}: {currentMilestone?.label ?? "—"}</span>
                          <span>·</span>
                          <span>Updated {timeAgo(lastUpdate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6 text-sm">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pro fee</div>
                        <div className="font-semibold tabular-nums">{formatINR(c.totalProFee)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Buyer fee</div>
                        <div className="font-semibold tabular-nums">{formatINR(buyerFee(c.totalProFee))}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Buyer total</div>
                        <div className="font-semibold tabular-nums">{formatINR(buyerTotal(c.totalProFee))}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Next action</div>
                        <div className="text-xs font-medium">
                          {c.status === "offer_accepted_pending_funding" ? (
                            <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); navigate("buyer_payment", { contractId: c.id }); }}>Submit payment →</button>
                          ) : currentMilestone?.status === "submitted" || currentMilestone?.status === "in_review" ? (
                            <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); navigate("buyer_contract", { contractId: c.id }); }}>Review milestone →</button>
                          ) : (
                            <button className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); navigate("buyer_contract", { contractId: c.id }); }}>Open workroom →</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Recent briefs */}
      <SectionCard
        title="Your briefs"
        description="Open briefs attract proposals. Private briefs are invite-only."
        actions={<Button size="sm" variant="outline" onClick={() => navigate("buyer_brief_new")}><Plus className="size-3.5" /> New brief</Button>}
      >
        {myBriefs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No briefs yet"
            description="Post a brief to receive proposals from verified Pros."
            actions={<Button onClick={() => navigate("buyer_brief_new")}><Plus className="size-4" /> Post a brief</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
            {myBriefs.slice(0, 6).map((b) => (
              <BriefCard
                key={b.id}
                brief={b}
                showApply={false}
                onOpen={() => navigate("buyer_brief_detail", { briefId: b.id })}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Recent activity" description="Latest events across your briefs, contracts, and payments.">
        <ActivityTimeline
          events={buildBuyerTimeline(myContracts, myBriefs, payments, audit, currentUserId ?? "")}
          emptyMessage="No activity yet. Post a brief or browse talent to get started."
        />
      </SectionCard>
    </div>
  );
}

function buildBuyerTimeline(contracts: Contract[], briefs: Brief[], payments: PaymentEvidence[], audit: AuditEvent[], userId: string) {
  const events: { id: string; tone?: "info" | "success" | "warning" | "critical" | "neutral"; title: string; description?: string; timestamp: string; actor?: string }[] = [];
  const myContractIds = new Set(contracts.map((c) => c.id));
  const myBriefIds = new Set(briefs.map((b) => b.id));
  payments.filter((p) => myContractIds.has(p.contractId)).forEach((p) => {
    events.push({
      id: p.id,
      tone: p.status === "payment_confirmed" ? "success" : p.status === "payment_rejected" ? "critical" : "warning",
      title: `Payment ${p.status.replace(/_/g, " ")}`,
      description: `${p.id} · ${p.milestoneLabel} · ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p.amountDue)} via ${p.method}`,
      timestamp: p.submittedAt,
      actor: `UTR ${p.utr}`,
    });
  });
  contracts.forEach((c) => {
    events.push({
      id: c.id,
      tone: c.status === "completed" ? "success" : c.status === "disputed" ? "critical" : "info",
      title: `Contract ${c.id} ${c.status.replace(/_/g, " ")}`,
      description: `${c.briefTitle} · ${c.proName}`,
      timestamp: c.createdAt,
    });
  });
  briefs.forEach((b) => {
    events.push({
      id: b.id,
      tone: b.status === "approaching_inactivity" ? "warning" : "info",
      title: `Brief ${b.id} ${b.status.replace(/_/g, " ")}`,
      description: b.title,
      timestamp: b.createdAt,
    });
  });
  audit.filter((a) => myContractIds.has(a.entityId) || myBriefIds.has(a.entityId)).slice(0, 5).forEach((a) => {
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

function QuickStats({ stats }: { stats: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span>
            <div className="rounded-md bg-primary/10 p-1.5">
              <s.icon className="size-3.5 text-primary" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">{s.value}</div>
        </Card>
      ))}
    </div>
  );
}

// =================================================================
// 2. BuyerProfile — Screen 01.8 + 01.11 + 01.12
// =================================================================
export function BuyerProfile() {
  const {
    currentUserId, buyerProfiles, updateBuyerProfile, addAudit, navigate,
  } = useQQ();
  const { toast } = useToast();
  const profile = buyerProfiles.find((b) => b.userId === currentUserId);

  const [displayName, setDisplayName] = React.useState(profile?.displayName ?? "");
  const [logoColor, setLogoColor] = React.useState(profile?.logoColor ?? "#0F766E");
  const [companyDescription, setCompanyDescription] = React.useState(profile?.companyDescription ?? "");
  const [industry, setIndustry] = React.useState(profile?.industry ?? "");
  const [website, setWebsite] = React.useState(profile?.website ?? "");
  const [hiringCategories, setHiringCategories] = React.useState<string[]>(profile?.hiringCategories ?? []);
  const [publicVisibility, setPublicVisibility] = React.useState(profile?.publicVisibility ?? true);
  const [profileDirty, setProfileDirty] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);

  // Org/billing state
  const [orgCompanyName, setOrgCompanyName] = React.useState(profile?.orgDetails?.companyName ?? "");
  const [billingAddress, setBillingAddress] = React.useState(profile?.orgDetails?.billingAddress ?? "");
  const [gstin, setGstin] = React.useState(profile?.orgDetails?.gstin ?? "");
  const [billingContact, setBillingContact] = React.useState(profile?.orgDetails?.billingContact ?? "");
  const [orgDirty, setOrgDirty] = React.useState(false);
  const [savingOrg, setSavingOrg] = React.useState(false);
  const [gstinError, setGstinError] = React.useState("");

  React.useEffect(() => {
    if (!profileDirty) {
      const eq =
        displayName === (profile?.displayName ?? "") &&
        logoColor === (profile?.logoColor ?? "#0F766E") &&
        companyDescription === (profile?.companyDescription ?? "") &&
        industry === (profile?.industry ?? "") &&
        website === (profile?.website ?? "") &&
        JSON.stringify(hiringCategories) === JSON.stringify(profile?.hiringCategories ?? []);
      if (!eq) setProfileDirty(true);
    }
  }, [displayName, logoColor, companyDescription, industry, website, hiringCategories, profile, profileDirty]);

  React.useEffect(() => {
    if (!orgDirty) {
      const eq =
        orgCompanyName === (profile?.orgDetails?.companyName ?? "") &&
        billingAddress === (profile?.orgDetails?.billingAddress ?? "") &&
        gstin === (profile?.orgDetails?.gstin ?? "") &&
        billingContact === (profile?.orgDetails?.billingContact ?? "");
      if (!eq) setOrgDirty(true);
    }
  }, [orgCompanyName, billingAddress, gstin, billingContact, profile, orgDirty]);

  function validateGstin(v: string) {
    setGstin(v);
    if (!v) { setGstinError(""); return; }
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!re.test(v)) setGstinError("GSTIN format: 22ABCDE1234F1Z5");
    else setGstinError("");
  }

  function saveProfile() {
    if (!currentUserId) return;
    setSavingProfile(true);
    setTimeout(() => {
      updateBuyerProfile(currentUserId, {
        displayName, logoColor, companyDescription, industry, website, hiringCategories, publicVisibility,
      });
      addAudit({ adminId: currentUserId, adminRole: "buyer", action: "Buyer profile updated", entity: "BuyerProfile", entityId: currentUserId });
      setSavingProfile(false);
      setProfileDirty(false);
      toast({ title: "Profile saved", description: "Public profile updated." });
    }, 700);
  }

  function saveOrg() {
    if (!currentUserId) return;
    if (gstinError) { toast({ title: "Fix GSTIN format", variant: "destructive" }); return; }
    if (!orgCompanyName || !billingAddress || !billingContact) {
      toast({ title: "Required fields missing", description: "Company name, billing address, and contact are required.", variant: "destructive" });
      return;
    }
    setSavingOrg(true);
    setTimeout(() => {
      updateBuyerProfile(currentUserId, {
        orgDetails: {
          companyName: orgCompanyName,
          billingAddress,
          gstin: gstin || undefined,
          billingContact,
        },
      });
      addAudit({ adminId: currentUserId, adminRole: "buyer", action: "Billing details updated", entity: "BuyerProfile", entityId: currentUserId });
      setSavingOrg(false);
      setOrgDirty(false);
      toast({ title: "Billing details saved", description: "Billing address and GSTIN are kept private." });
    }, 700);
  }

  if (!profile) {
    return <EmptyState icon={UserCog} title="No profile loaded" description="Sign in as a buyer to edit your profile." />;
  }

  const orgStatus: "saved" | "invalid" | "incomplete" | "unsaved" =
    gstinError ? "invalid" :
    !orgCompanyName || !billingAddress || !billingContact ? "incomplete" :
    orgDirty ? "unsaved" : "saved";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyer profile"
        description="Edit your public profile and private billing details. Only information marked Public appears in discovery."
        status={<StatusBadge tone={publicVisibility ? "success" : "paused"} icon={false}>{publicVisibility ? "Public" : "Hidden"}</StatusBadge>}
      >
        <Button variant="outline" onClick={() => navigate("buyer_dashboard")}><ArrowLeft className="size-4" /> Dashboard</Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile editor */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Public profile"
            description="This appears in brief detail and discovery. Do not add phone numbers, personal email addresses, or direct payment links to your public profile."
            actions={profileDirty ? <StatusBadge tone="warning" icon={false}>Unsaved</StatusBadge> : <StatusBadge tone="success" icon={false}>Saved</StatusBadge>}
          >
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-name">Display name <span className="text-destructive">*</span></Label>
                  <Input id="bp-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Northstar Labs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="bp-industry"><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {["B2B SaaS", "Retail", "Fintech", "Healthcare", "Education", "Media", "Manufacturing", "Other"].map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Logo color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={logoColor} onChange={(e) => setLogoColor(e.target.value)} className="size-10 rounded border border-border cursor-pointer" />
                  <Avatar className="size-10 rounded-md" style={{ backgroundColor: logoColor }}>
                    <AvatarFallback className="rounded-md text-white font-medium">{initials(displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground font-mono">{logoColor}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-desc">Company description</Label>
                <Textarea
                  id="bp-desc" rows={4}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Brief description of your company and the work you typically hire for."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bp-web">Website</Label>
                <Input id="bp-web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" />
              </div>

              <div className="space-y-1.5">
                <Label>Hiring categories</Label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted/30">
                      <Checkbox
                        checked={hiringCategories.includes(cat)}
                        onCheckedChange={(v) => {
                          setHiringCategories((prev) => v ? [...prev, cat] : prev.filter((c) => c !== cat));
                        }}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <Switch checked={publicVisibility} onCheckedChange={setPublicVisibility} />
                  <div>
                    <div className="text-sm font-medium">Show in discovery</div>
                    <div className="text-xs text-muted-foreground">Only information marked Public appears in discovery.</div>
                  </div>
                </div>
                <StatusBadge tone={publicVisibility ? "success" : "paused"} icon={false}>{publicVisibility ? "Public" : "Hidden"}</StatusBadge>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : <><Save className="size-4" /> Save profile</>}
                </Button>
                {profileDirty && (
                  <Button variant="ghost" onClick={() => {
                    setDisplayName(profile.displayName);
                    setLogoColor(profile.logoColor ?? "#0F766E");
                    setCompanyDescription(profile.companyDescription);
                    setIndustry(profile.industry);
                    setWebsite(profile.website ?? "");
                    setHiringCategories(profile.hiringCategories);
                    setProfileDirty(false);
                  }}>Discard</Button>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Org/billing editor */}
          <SectionCard
            title="Organization & billing details"
            description="Keep billing address and GSTIN private. Required before funding a milestone."
            actions={<BillingStatusBadge state={orgStatus} />}
          >
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Company legal name <span className="text-destructive">*</span></Label>
                  <Input id="org-name" value={orgCompanyName} onChange={(e) => setOrgCompanyName(e.target.value)} placeholder="Northstar Labs Pvt Ltd" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-contact">Billing contact <span className="text-destructive">*</span></Label>
                  <Input id="org-contact" value={billingContact} onChange={(e) => setBillingContact(e.target.value)} placeholder="billing@yourcompany.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-addr">Billing address <span className="text-destructive">*</span></Label>
                <Textarea id="org-addr" rows={2} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Full billing address" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-gstin">GSTIN (optional)</Label>
                <Input
                  id="org-gstin" value={gstin}
                  onChange={(e) => validateGstin(e.target.value.toUpperCase())}
                  placeholder="32ABCDE1234F1Z5" maxLength={15}
                  className={gstinError ? "border-destructive" : ""}
                />
                {gstinError && <p className="text-xs text-destructive">{gstinError}</p>}
                <p className="text-xs text-muted-foreground">GSTIN is masked in admin views and never appears on your public profile.</p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 flex items-start gap-2">
                <Lock className="size-4 mt-0.5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300">Billing address, GSTIN, and contact are private. They are only used for invoices and finance reconciliation.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={saveOrg} disabled={savingOrg || !!gstinError}>
                  {savingOrg ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : <><Save className="size-4" /> Save billing details</>}
                </Button>
                {orgDirty && (
                  <Button variant="ghost" onClick={() => {
                    setOrgCompanyName(profile.orgDetails?.companyName ?? "");
                    setBillingAddress(profile.orgDetails?.billingAddress ?? "");
                    setGstin(profile.orgDetails?.gstin ?? "");
                    setBillingContact(profile.orgDetails?.billingContact ?? "");
                    setOrgDirty(false);
                    setGstinError("");
                  }}>Discard</Button>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Public preview */}
        <div className="space-y-4">
          <SectionCard title="Public preview" description="What Pros see when they view your briefs.">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 rounded-md" style={{ backgroundColor: logoColor }}>
                  <AvatarFallback className="rounded-md text-white font-medium">{initials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{displayName || "—"}</h3>
                  <p className="text-xs text-muted-foreground">{industry || "Industry not set"}</p>
                  {website && (
                    <a href={website} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Link2 className="size-3" /> {website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-4">{companyDescription || "No description yet."}</p>
              {hiringCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {hiringCategories.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                {publicVisibility ? "Visible in discovery" : "Hidden from discovery"}
              </div>
            </Card>
          </SectionCard>

          <SectionCard title="Profile rules">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600 shrink-0" /> Display name and description appear publicly.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600 shrink-0" /> Billing address and GSTIN never appear in discovery.</li>
              <li className="flex items-start gap-2"><XCircle className="size-4 mt-0.5 text-destructive shrink-0" /> Do not add phone numbers, personal email addresses, or direct payment links to your public profile.</li>
              <li className="flex items-start gap-2"><Info className="size-4 mt-0.5 text-muted-foreground shrink-0" /> Only information marked Public appears in discovery.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Save({ className }: { className?: string }) {
  return <Shield className={className} />;
}

function BillingStatusBadge({ state }: { state: "saved" | "invalid" | "incomplete" | "unsaved" }) {
  switch (state) {
    case "saved": return <StatusBadge tone="success" icon={false}>Saved</StatusBadge>;
    case "invalid": return <StatusBadge tone="critical" icon={false}>Invalid</StatusBadge>;
    case "incomplete": return <StatusBadge tone="warning" icon={false}>Incomplete</StatusBadge>;
    case "unsaved": return <StatusBadge tone="pending" icon={false}>Unsaved</StatusBadge>;
  }
}

// =================================================================
// 3. BuyerTalent — Screen 03.1 + 03.2 + 04.1 + 04.2 + 04.3 + 4.8
// =================================================================
export function BuyerTalent() {
  const {
    proProfiles, gigs, currentUserId, briefs, navigate, addAudit, priorityBoosts,
  } = useQQ();
  const { toast } = useToast();
  const [mode, setMode] = React.useState<"talent" | "gigs">("talent");
  const [selectedProId, setSelectedProId] = React.useState<string | null>(null);
  const [selectedGigId, setSelectedGigId] = React.useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteBriefId, setInviteBriefId] = React.useState("");
  const [inviteMessage, setInviteMessage] = React.useState("");
  const [inviteSending, setInviteSending] = React.useState(false);
  const [inviteSentFor, setInviteSentFor] = React.useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterBand, setFilterBand] = React.useState<string>("all");
  const [filterAvailability, setFilterAvailability] = React.useState<string>("all");
  const [filterEvidence, setFilterEvidence] = React.useState<string>("all");

  const visiblePros = proProfiles.filter((p) => p.publicVisibility);

  const filteredPros = visiblePros.filter((p) => {
    if (filterCategory !== "all" && p.primaryCategory !== filterCategory) return false;
    if (filterAvailability === "available" && p.availability !== "available_now") return false;
    if (filterAvailability === "paused" && p.availability !== "paused") return false;
    if (filterEvidence === "reviewed" && !p.trustSignals.includes("Portfolio reviewed")) return false;
    if (filterEvidence === "identity" && !p.trustSignals.includes("Identity reviewed")) return false;
    if (filterBand !== "all") {
      const f = p.feeFrom ?? 0;
      if (filterBand === "Under ₹20,000" && f >= 20000) return false;
      if (filterBand === "₹20,000 - ₹55,000" && (f < 20000 || f > 55000)) return false;
      if (filterBand === "₹55,001 - ₹1,00,000" && (f <= 55000 || f > 100000)) return false;
      if (filterBand === "Above ₹1,00,000" && f <= 100000) return false;
    }
    return true;
  });

  const liveGigs = gigs.filter((g) => g.status === "approved_live");
  const filteredGigs = liveGigs.filter((g) => {
    if (filterCategory !== "all" && g.category !== filterCategory) return false;
    if (filterBand !== "all") {
      const f = g.proFee;
      if (filterBand === "Under ₹20,000" && f >= 20000) return false;
      if (filterBand === "₹20,000 - ₹55,000" && (f < 20000 || f > 55000)) return false;
      if (filterBand === "₹55,001 - ₹1,00,000" && (f <= 55000 || f > 100000)) return false;
      if (filterBand === "Above ₹1,00,000" && f <= 100000) return false;
    }
    return true;
  });

  // Priority boost: split promoted + organic
  const promotedGigIds = new Set(
    priorityBoosts
      .filter((pb) => pb.paymentStatus === "active" && filteredGigs.some((g) => g.id === pb.gigId))
      .map((pb) => pb.gigId)
  );
  const promotedGigs = filteredGigs.filter((g) => promotedGigIds.has(g.id));
  const organicGigs = filteredGigs.filter((g) => !promotedGigIds.has(g.id));

  const myPrivateBriefs = briefs.filter((b) => b.buyerId === currentUserId && b.visibility === "private");
  const myOpenBriefs = briefs.filter((b) => b.buyerId === currentUserId);

  const selectedPro = proProfiles.find((p) => p.userId === selectedProId);
  const selectedGig = gigs.find((g) => g.id === selectedGigId);

  function sendInvite() {
    if (!selectedPro || !inviteBriefId) {
      toast({ title: "Select a brief", variant: "destructive" });
      return;
    }
    setInviteSending(true);
    setTimeout(() => {
      addAudit({
        adminId: currentUserId ?? "",
        adminRole: "buyer",
        action: "Invited Pro to brief",
        entity: "Brief",
        entityId: inviteBriefId,
        reason: `${selectedPro.displayName} · ${inviteMessage ? inviteMessage.slice(0, 80) : "no message"}`,
      });
      setInviteSending(false);
      setInviteSentFor(selectedPro.userId);
      setInviteOpen(false);
      setInviteMessage("");
      toast({ title: "Invite sent", description: `${selectedPro.displayName} has been invited to the brief.` });
    }, 800);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find talent"
        description="Browse verified professionals or live gigs. Invite a Pro to a private brief, or request a gig to start a contract."
      />

      <Tabs value={mode} onValueChange={(v) => setMode(v as "talent" | "gigs")}>
        <TabsList className="w-full sm:w-auto h-10 p-1">
          <TabsTrigger value="talent" className="gap-1.5 text-sm font-medium"><Users className="size-4" /> Talent</TabsTrigger>
          <TabsTrigger value="gigs" className="gap-1.5 text-sm font-medium"><Sparkles className="size-4" /> Gigs</TabsTrigger>
        </TabsList>

        <TabsContent value="talent" className="mt-4">
          {selectedPro ? (
            <TalentDetailPane
              pro={selectedPro}
              myBriefs={myOpenBriefs}
              onBack={() => setSelectedProId(null)}
              onInvite={() => { setInviteSentFor(null); setInviteOpen(true); }}
              inviteSent={inviteSentFor === selectedPro.userId}
            />
          ) : (
            <div className="grid lg:grid-cols-[260px_1fr] gap-4">
              <TalentFilters
                category={filterCategory} setCategory={setFilterCategory}
                band={filterBand} setBand={setFilterBand}
                availability={filterAvailability} setAvailability={setFilterAvailability}
                evidence={filterEvidence} setEvidence={setFilterEvidence}
              />
              <div>
                {filteredPros.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No matches yet"
                    description="Try a broader category or budget range."
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredPros.map((p) => (
                      <ProfileCard key={p.userId} profile={p} onClick={() => { setSelectedProId(p.userId); setInviteSentFor(null); }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gigs" className="mt-4">
          {selectedGig ? (
            <GigDetailPane
              gig={selectedGig}
              onBack={() => setSelectedGigId(null)}
              onRequest={() => navigate("buyer_payment", { gigId: selectedGig.id })}
            />
          ) : (
            <div className="grid lg:grid-cols-[260px_1fr] gap-4">
              <TalentFilters
                category={filterCategory} setCategory={setFilterCategory}
                band={filterBand} setBand={setFilterBand}
                availability={filterAvailability} setAvailability={setFilterAvailability}
                evidence={filterEvidence} setEvidence={setFilterEvidence}
                hideAvailability
              />
              <div>
                {filteredGigs.length === 0 ? (
                  <EmptyState
                    icon={Sparkles}
                    title="No live gigs yet"
                    description="Try a broader category or budget range. Gigs are reviewed before going live."
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Promoted / Priority section */}
                    {promotedGigs.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                          <Rocket className="size-3.5" /> Promoted gigs
                          <span className="text-muted-foreground font-normal normal-case tracking-normal">· Pro paid for visibility</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                          {promotedGigs.map((g, idx) => (
                            <div key={g.id} className="relative">
                              <div className="absolute -top-2 left-3 z-10 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-medium text-white flex items-center gap-1 shadow-sm">
                                <Rocket className="size-2.5" /> Priority
                              </div>
                              <VideoGigCard
                                gig={g}
                                hasVideo={idx % 2 === 0}
                                views={g.views}
                                requests={g.requests}
                                rating={g.rating}
                                onOpen={() => setSelectedGigId(g.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Organic section */}
                    <div>
                      {promotedGigs.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          All gigs
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                        {organicGigs.map((g, idx) => (
                          <VideoGigCard
                            key={g.id}
                            gig={g}
                            hasVideo={idx % 2 === 0}
                            views={g.views}
                            requests={g.requests}
                            rating={g.rating}
                            onOpen={() => setSelectedGigId(g.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite to Brief modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Invite {selectedPro?.displayName} to a brief</DialogTitle>
            <DialogDescription>Select a private brief to send. The Pro receives an invitation and can submit a proposal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-brief">Select brief <span className="text-destructive">*</span></Label>
              <Select value={inviteBriefId} onValueChange={setInviteBriefId}>
                <SelectTrigger id="inv-brief"><SelectValue placeholder="Choose a brief" /></SelectTrigger>
                <SelectContent>
                  {myPrivateBriefs.length === 0 ? (
                    <SelectItem value="none" disabled>No private briefs available</SelectItem>
                  ) : (
                    myPrivateBriefs.map((b) => <SelectItem key={b.id} value={b.id}>{b.title} ({b.id})</SelectItem>)
                  )}
                </SelectContent>
              </Select>
              {myPrivateBriefs.length === 0 && (
                <p className="text-xs text-amber-700">No private briefs. Create one first to invite Pros directly.</p>
              )}
            </div>
            {inviteBriefId && inviteBriefId !== "none" && (
              <ScopePreviewCard brief={myOpenBriefs.find((b) => b.id === inviteBriefId)} />
            )}
            <div className="space-y-1.5">
              <Label htmlFor="inv-msg">Optional message</Label>
              <Textarea
                id="inv-msg" rows={3}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Brief context or why you reached out."
              />
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
              Circumvention policy: do not share phone, email, or payment links in messages.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite} disabled={inviteSending || !inviteBriefId || inviteBriefId === "none"}>
              {inviteSending ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <><Send className="size-4" /> Send invite</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TalentFilters({
  category, setCategory, band, setBand, availability, setAvailability,
  evidence, setEvidence, hideAvailability,
}: {
  category: string; setCategory: (v: string) => void;
  band: string; setBand: (v: string) => void;
  availability: string; setAvailability: (v: string) => void;
  evidence: string; setEvidence: (v: string) => void;
  hideAvailability?: boolean;
}) {
  return (
    <Card className="p-4 h-fit lg:sticky lg:top-20 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="size-4" /> Filters
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Budget band</Label>
        <Select value={band} onValueChange={setBand}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any budget</SelectItem>
            {BUDGET_BANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {!hideAvailability && (
        <div className="space-y-1.5">
          <Label className="text-xs">Availability</Label>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="available">Available now</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">Evidence type</Label>
        <Select value={evidence} onValueChange={setEvidence}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any evidence</SelectItem>
            <SelectItem value="identity">Identity reviewed</SelectItem>
            <SelectItem value="reviewed">Portfolio reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="ghost" size="sm" className="w-full" onClick={() => {
        setCategory("all"); setBand("all"); setAvailability("all"); setEvidence("all");
      }}>
        <RefreshCw className="size-3.5" /> Reset filters
      </Button>
    </Card>
  );
}

function ScopePreviewCard({ brief }: { brief?: Brief }) {
  if (!brief) return null;
  return (
    <Card className="p-3 bg-muted/30">
      <div className="text-xs font-medium mb-1">Scope preview</div>
      <div className="text-sm font-medium">{brief.title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{brief.category} · {formatINR(brief.budget)} · {brief.timeline}</div>
      <div className="mt-2 text-xs text-muted-foreground">
        <div><strong className="text-foreground">Deliverables:</strong> {brief.deliverables.join(", ")}</div>
        {brief.exclusions.length > 0 && <div className="mt-0.5"><strong className="text-foreground">Exclusions:</strong> {brief.exclusions.join("; ")}</div>}
      </div>
    </Card>
  );
}

function TalentDetailPane({
  pro, myBriefs, onBack, onInvite, inviteSent,
}: {
  pro: ProProfile; myBriefs: Brief[]; onBack: () => void; onInvite: () => void; inviteSent: boolean;
}) {
  const proFeeSample = pro.feeFrom ?? 25000;
  const privateBriefs = myBriefs.filter((b) => b.visibility === "private");
  const unavailable = pro.availability === "paused";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="size-4" /> Back to talent</Button>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4 min-w-0">
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <Avatar className="size-16 rounded-md" style={{ backgroundColor: avatarColor(pro.userId) }}>
                <AvatarFallback className="rounded-md text-white text-lg font-medium">{initials(pro.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold">{pro.displayName}</h1>
                <p className="text-sm text-muted-foreground">{pro.headline}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{pro.rating}</span>
                  <span className="inline-flex items-center gap-1"><Briefcase className="size-3" />{pro.completedProjects} projects</span>
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" />{pro.responseTime}</span>
                  <span className="inline-flex items-center gap-1"><Tag className="size-3" />{pro.primaryCategory}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pro.trustSignals.map((t) => (
                    <Badge key={t} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      <ShieldCheck className="size-3" /> {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <SectionCard title="About" description="Background and approach.">
            <p className="text-sm text-muted-foreground">{pro.bio}</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">Skills</div><div className="font-medium">{pro.skills.join(", ")}</div></div>
              <div><div className="text-xs text-muted-foreground">Languages</div><div className="font-medium">{pro.languages.join(", ")}</div></div>
              <div><div className="text-xs text-muted-foreground">Preferred project size</div><div className="font-medium">{pro.preferredProjectSize}</div></div>
              <div><div className="text-xs text-muted-foreground">Preferred timeline</div><div className="font-medium">{pro.preferredTimeline}</div></div>
              <div><div className="text-xs text-muted-foreground">Time zone</div><div className="font-medium">{pro.timeZone}</div></div>
              <div><div className="text-xs text-muted-foreground">Payout readiness</div><div className="font-medium capitalize">{pro.payoutReadiness.replace(/_/g, " ")}</div></div>
            </div>
          </SectionCard>

          {pro.portfolioItems.length > 0 && (
            <SectionCard title="Portfolio" description="Reviewed evidence of past work.">
              <div className="grid sm:grid-cols-2 gap-3">
                {pro.portfolioItems.map((item) => (
                  <PortfolioItemCard key={item.id} item={item} featured={item.featured} />
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Sticky commercial pane */}
        <div className="space-y-3 lg:sticky lg:top-20 h-fit">
          <FeeBreakdown proFee={proFeeSample} />
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="text-2xl font-semibold tabular-nums">{formatINR(pro.feeFrom ?? 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">Buyer total before tax · Pro keeps 100%</div>
          </Card>
          <div className="space-y-2">
            {inviteSent ? (
              <Alert>
                <CheckCircle2 className="size-4" />
                <AlertTitle>Invite sent</AlertTitle>
                <AlertDescription>{pro.displayName} has been invited. You'll be notified when a proposal arrives.</AlertDescription>
              </Alert>
            ) : unavailable ? (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertTitle>Pro is paused</AlertTitle>
                <AlertDescription>This Pro is not accepting new work right now. You can still send an invite for future consideration.</AlertDescription>
              </Alert>
            ) : privateBriefs.length === 0 ? (
              <Alert>
                <Info className="size-4" />
                <AlertTitle>No private briefs</AlertTitle>
                <AlertDescription>Create a private brief first to invite this Pro directly.</AlertDescription>
              </Alert>
            ) : null}
            <Button className="w-full" onClick={onInvite} disabled={privateBriefs.length === 0 && !inviteSent}>
              <Send className="size-4" /> {inviteSent ? "Re-invite" : "Invite to brief"}
            </Button>
            <Button variant="outline" className="w-full"><MessageSquare className="size-4" /> Message (requires active contract)</Button>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Lock className="size-3 inline mr-1" /> Direct messaging is unlocked only after a contract is active. Phone, email, and payment links are blocked until then.
          </div>
        </div>
      </div>
    </div>
  );
}

function GigDetailPane({ gig, onBack, onRequest }: { gig: GigDraft; onBack: () => void; onRequest: () => void }) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="size-4" /> Back to gigs</Button>
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden">
            <div className="h-32 w-full" style={{ backgroundColor: gig.coverImageColor }} />
            <div className="p-4 sm:p-6">
              <Badge variant="outline" className="mb-2">{gig.category}</Badge>
              <h1 className="text-xl font-semibold">{gig.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{gig.shortDescription}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="size-5 rounded"><AvatarFallback className="rounded bg-primary/10 text-primary text-[10px]">{initials(gig.proName)}</AvatarFallback></Avatar>
                <span>{gig.proName}</span>
              </div>
            </div>
          </Card>

          <SectionCard title="What's included">
            <ul className="space-y-1.5 text-sm">
              {gig.includedItems.map((i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-600 mt-0.5" /> {i}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="What's not included">
            <ul className="space-y-1.5 text-sm">
              {gig.exclusions.map((i) => (
                <li key={i} className="flex items-start gap-2"><XCircle className="size-4 text-muted-foreground mt-0.5" /> {i}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Detailed description">
            <p className="text-sm text-muted-foreground">{gig.detailedDescription}</p>
          </SectionCard>

          <SectionCard title="Requirements from you">
            <ul className="space-y-1.5 text-sm">
              {gig.buyerRequirements.map((r) => (
                <li key={r} className="flex items-start gap-2"><Info className="size-4 text-muted-foreground mt-0.5" /> {r}</li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Commercial pane */}
        <div className="space-y-3 lg:sticky lg:top-20 h-fit">
          <FeeBreakdown proFee={gig.proFee} />
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Delivery</div>
                <div className="font-semibold">{gig.deliveryTimeline}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Revisions</div>
                <div className="font-semibold">{gig.revisions}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Format</div>
                <div className="font-semibold">{gig.deliverableFormat}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Package</div>
                <div className="font-semibold">{gig.packageName}</div>
              </div>
            </div>
          </Card>
          <Button className="w-full" onClick={onRequest}>
            <CreditCard className="size-4" /> Request this gig
          </Button>
          <p className="text-xs text-muted-foreground">Requesting this gig routes to the payment evidence flow. Pro begins work only after funding confirmation.</p>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// 4. BuyerBriefNew — Screen 05
// =================================================================
export function BuyerBriefNew() {
  const {
    currentUserId, buyerProfiles, upsertBrief, navigate, addAudit,
  } = useQQ();
  const { toast } = useToast();
  const profile = buyerProfiles.find((b) => b.userId === currentUserId);

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [objective, setObjective] = React.useState("");
  const [deliverables, setDeliverables] = React.useState<string[]>([""]);
  const [acceptanceCriteria, setAcceptanceCriteria] = React.useState<string[]>([""]);
  const [exclusions, setExclusions] = React.useState<string[]>([""]);
  const [budget, setBudget] = React.useState(50000);
  const [timeline, setTimeline] = React.useState("4 weeks");
  const [visibility, setVisibility] = React.useState<BriefVisibility>("open");
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishing, setPublishing] = React.useState(false);
  const [draftId] = React.useState<string>(() => genId("BRF"));

  const lowBudget = budget < 20000 && budget > 0;

  // Autosave effect
  React.useEffect(() => {
    if (!title && !objective) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      try {
        const draft: Brief = {
          id: draftId,
          buyerId: currentUserId ?? "",
          buyerName: profile?.displayName ?? "—",
          title: title || "Untitled brief",
          category, objective,
          deliverables: deliverables.filter(Boolean),
          acceptanceCriteria: acceptanceCriteria.filter(Boolean),
          exclusions: exclusions.filter(Boolean),
          budget, timeline, visibility,
          status: "draft",
          createdAt: new Date().toISOString(),
          applicants: 0,
        };
        upsertBrief(draft);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [title, category, objective, deliverables, acceptanceCriteria, exclusions, budget, timeline, visibility]);

  function publish() {
    if (!title || !objective) {
      toast({ title: "Title and objective are required", variant: "destructive" });
      return;
    }
    if (deliverables.filter(Boolean).length === 0) {
      toast({ title: "Add at least one deliverable", variant: "destructive" });
      return;
    }
    setPublishing(true);
    setTimeout(() => {
      const brief: Brief = {
        id: draftId,
        buyerId: currentUserId ?? "",
        buyerName: profile?.displayName ?? "—",
        title, category, objective,
        deliverables: deliverables.filter(Boolean),
        acceptanceCriteria: acceptanceCriteria.filter(Boolean),
        exclusions: exclusions.filter(Boolean),
        budget, timeline, visibility,
        status: "active",
        createdAt: new Date().toISOString(),
        applicants: 0,
      };
      upsertBrief(brief);
      addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Brief published", entity: "Brief", entityId: brief.id, newStatus: "active" });
      setPublishing(false);
      toast({ title: "Brief published", description: visibility === "private" ? "Private brief — invite Pros directly." : "Open brief — visible in discovery." });
      navigate("buyer_brief_detail", { briefId: brief.id });
    }, 800);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create a brief"
        description="A clear brief helps Pros submit accurate proposals. Be specific about scope, deliverables, and exclusions."
      >
        <Button variant="outline" onClick={() => navigate("buyer_dashboard")}><ArrowLeft className="size-4" /> Cancel</Button>
      </PageHeader>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4 min-w-0">
          <AutosaveIndicator state={saveState} onRetry={() => setSaveState("idle")} />

          <Accordion type="multiple" defaultValue={["basics", "scope", "budget", "timeline", "visibility"]} className="space-y-3">
            <AccordionItem value="basics" className="border border-border rounded-md px-4">
              <AccordionTrigger className="py-4"><span className="flex items-center gap-2"><FileText className="size-4" /> Basics</span></AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="space-y-1.5">
                  <Label htmlFor="b-title">Title <span className="text-destructive">*</span></Label>
                  <Input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build a secure partner onboarding portal" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-cat">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="b-cat"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b-tl">Timeline</Label>
                    <Input id="b-tl" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 6 weeks" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-obj">Objective <span className="text-destructive">*</span></Label>
                  <Textarea id="b-obj" rows={3} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What does success look like? What problem are you solving?" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="scope" className="border border-border rounded-md px-4">
              <AccordionTrigger className="py-4"><span className="flex items-center gap-2"><Briefcase className="size-4" /> Scope</span></AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <MultiInput
                  label="Deliverables" hint="What tangible things will the Pro hand over?"
                  values={deliverables} onChange={setDeliverables}
                  placeholder="e.g. Onboarding flow"
                />
                <MultiInput
                  label="Acceptance criteria" hint="How will you know each deliverable is done?"
                  values={acceptanceCriteria} onChange={setAcceptanceCriteria}
                  placeholder="e.g. WCAG 2.1 AA"
                />
                <MultiInput
                  label="Exclusions"
                  hint="What is explicitly outside this project? Example: No SEO optimization."
                  values={exclusions} onChange={setExclusions}
                  placeholder="e.g. No backend development"
                />
                <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <Info className="size-3 inline mr-1" /> Max 4 milestones per contract in v0.1 due to manual payment verification. Keep deliverables aligned with up to 4 phases.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="budget" className="border border-border rounded-md px-4">
              <AccordionTrigger className="py-4"><span className="flex items-center gap-2"><IndianRupee className="size-4" /> Budget</span></AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="space-y-1.5">
                  <Label htmlFor="b-budget">Pro fee budget (INR)</Label>
                  <Input id="b-budget" type="number" min={0} step={1000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                  <div className="text-xs text-muted-foreground">Band: {budgetBand(budget)}</div>
                </div>
                {lowBudget && (
                  <Alert>
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Budget may be below typical expectations</AlertTitle>
                    <AlertDescription>This budget may be below typical expectations for this category. Pros may pass or counter with a higher fee.</AlertDescription>
                  </Alert>
                )}
                <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <Info className="size-3 inline mr-1" /> This is the Pro fee. A 14% beta Buyer fee applies on top. Taxes calculated by Finance if applicable.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timeline" className="border border-border rounded-md px-4">
              <AccordionTrigger className="py-4"><span className="flex items-center gap-2"><Calendar className="size-4" /> Timeline</span></AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="space-y-1.5">
                  <Label htmlFor="b-timeline">Timeline</Label>
                  <Input id="b-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 8 weeks" />
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Open briefs that go 14 days without activity are flagged as approaching inactivity and may be archived after 30 days. You can republish anytime.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="visibility" className="border border-border rounded-md px-4">
              <AccordionTrigger className="py-4"><span className="flex items-center gap-2"><Eye className="size-4" /> Visibility</span></AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as BriefVisibility)}>
                  <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/30">
                    <RadioGroupItem value="open" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Open brief</div>
                      <p className="text-xs text-muted-foreground mt-0.5">Appears in public feed. Any verified Pro can submit a proposal.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/30">
                    <RadioGroupItem value="private" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Private brief</div>
                      <p className="text-xs text-muted-foreground mt-0.5">Doesn't appear in public feed. Only Pros you invite can see and apply.</p>
                    </div>
                  </label>
                </RadioGroup>
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <Info className="size-3 inline mr-1" /> Private briefs don't appear in public feed. Use them for direct invitations.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <StickyCtaBar>
            <AutosaveIndicator state={saveState} onRetry={() => setSaveState("idle")} compact />
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={() => navigate("buyer_dashboard")}>Discard</Button>
              <Button onClick={publish} disabled={publishing}>
                {publishing ? <><Loader2 className="size-4 animate-spin" /> Publishing…</> : <><Send className="size-4" /> Publish brief</>}
              </Button>
            </div>
          </StickyCtaBar>
        </div>

        {/* Live preview */}
        <div className="space-y-3 lg:sticky lg:top-20 h-fit">
          <SectionCard title="Live preview" description="What Pros will see.">
            <BriefPreviewCard
              brief={{
                id: draftId,
                buyerId: currentUserId ?? "",
                buyerName: profile?.displayName ?? "—",
                title: title || "Untitled brief",
                category, objective: objective || "Add an objective to attract the right Pros.",
                deliverables: deliverables.filter(Boolean),
                acceptanceCriteria: acceptanceCriteria.filter(Boolean),
                exclusions: exclusions.filter(Boolean),
                budget, timeline, visibility,
                status: "draft",
                createdAt: new Date().toISOString(),
                applicants: 0,
              }}
            />
          </SectionCard>
          <FeeBreakdown proFee={budget} />
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Buyer total (Pro fee + 14% buyer fee)</div>
            <div className="text-2xl font-semibold tabular-nums">{formatINR(buyerTotal(budget))}</div>
            <div className="text-xs text-muted-foreground mt-1">Taxes calculated by Finance if applicable.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AutosaveIndicator({ state, onRetry, compact }: { state: "idle" | "saving" | "saved" | "error"; onRetry: () => void; compact?: boolean }) {
  if (state === "idle") return null;
  if (compact) {
    return (
      <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        {state === "saving" && <><Loader2 className="size-3 animate-spin" /> Saving…</>}
        {state === "saved" && <><CheckCircle2 className="size-3 text-emerald-600" /> Saved just now</>}
        {state === "error" && <><AlertCircle className="size-3 text-destructive" /> Unable to save. <button onClick={onRetry} className="text-primary hover:underline">Retry.</button></>}
      </div>
    );
  }
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
        {state === "saving" && <><Loader2 className="size-3.5 animate-spin" /> Saving…</>}
        {state === "saved" && <><CheckCircle2 className="size-3.5 text-emerald-600" /> Saved just now</>}
        {state === "error" && <><AlertCircle className="size-3.5 text-destructive" /> Unable to save. <button onClick={onRetry} className="text-primary hover:underline">Retry.</button></>}
      </div>
    </Card>
  );
}

function MultiInput({
  label, hint, values, onChange, placeholder,
}: {
  label: string; hint?: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  function update(i: number, v: string) {
    onChange(values.map((x, idx) => idx === i ? v : x));
  }
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input value={v} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} />
            <Button
              type="button" variant="ghost" size="icon"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              disabled={values.length === 1}
            ><X className="size-4" /></Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...values, ""])}>
        <Plus className="size-3.5" /> Add another
      </Button>
    </div>
  );
}

function BriefPreviewCard({ brief }: { brief: Brief }) {
  return (
    <Card className="p-4">
      <Badge variant="outline" className="mb-2">{brief.category}</Badge>
      <h3 className="font-semibold">{brief.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{brief.objective}</p>
      <div className="mt-3 space-y-2 text-xs">
        {brief.deliverables.length > 0 && (
          <div><div className="text-muted-foreground">Deliverables</div><div>{brief.deliverables.join(", ")}</div></div>
        )}
        {brief.exclusions.length > 0 && (
          <div><div className="text-muted-foreground">Exclusions</div><div>{brief.exclusions.join("; ")}</div></div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
        <div><div className="text-muted-foreground">Budget</div><div className="font-semibold">{formatINR(brief.budget)}</div></div>
        <div><div className="text-muted-foreground">Timeline</div><div className="font-semibold">{brief.timeline}</div></div>
        <div><div className="text-muted-foreground">Visibility</div><div className="font-semibold capitalize">{brief.visibility}</div></div>
      </div>
    </Card>
  );
}

// =================================================================
// 5. BuyerBriefDetail — Screen 06.1 + 06.2 + 06.4 + 06.7
// =================================================================
export function BuyerBriefDetail() {
  const {
    viewParams, briefs, proposals, updateProposal, createContract,
    updateContract, currentUserId, navigate, addAudit, users, proProfiles,
  } = useQQ();
  const { toast } = useToast();
  const brief = briefs.find((b) => b.id === viewParams.briefId);
  const briefProposals = proposals.filter((p) => p.briefId === viewParams.briefId);
  const [selectedId, setSelectedId] = React.useState<string | null>(briefProposals[0]?.id ?? null);
  const [declineOpen, setDeclineOpen] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState(DECLINE_REASONS[0]);
  const [declineNote, setDeclineNote] = React.useState("");
  const [counterValue, setCounterValue] = React.useState<number | null>(null);
  const [offerOpen, setOfferOpen] = React.useState(false);

  if (!brief) {
    return (
      <EmptyState icon={FileText} title="Brief not found" description="This brief may have been removed." actions={<Button onClick={() => navigate("buyer_dashboard")}>Back to dashboard</Button>} />
    );
  }

  const selected = proposals.find((p) => p.id === selectedId);
  const meta = statusMeta(brief.status);

  function shortlist(p: Proposal) {
    updateProposal(p.id, { status: "shortlisted" });
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Proposal shortlisted", entity: "Proposal", entityId: p.id, newStatus: "shortlisted" });
    toast({ title: `${p.proName} shortlisted` });
  }

  function decline(p: Proposal) {
    updateProposal(p.id, { status: "declined", declineReason, privateNote: declineNote || undefined });
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Proposal declined", entity: "Proposal", entityId: p.id, newStatus: "declined", reason: declineReason });
    setDeclineOpen(false);
    setDeclineNote("");
    toast({ title: `${p.proName} declined`, description: declineReason });
  }

  function createOfferFromProposal(p: Proposal, feeOverride?: number) {
    if (!brief) return;
    const b = brief;
    const fee = feeOverride ?? p.proposedFee;
    const contractId = genId("QQ");
    const milestones: Milestone[] = [
      {
        id: "M-1", index: 1, label: "M1", description: "Discovery & kickoff",
        proFee: Math.round(fee * 0.4), status: "funding_pending",
        acceptanceCriteria: b.acceptanceCriteria.slice(0, 1) || ["Sign-off recorded"],
        versions: [],
      },
      {
        id: "M-2", index: 2, label: "M2", description: "Delivery",
        proFee: Math.round(fee * 0.6), status: "not_started",
        acceptanceCriteria: b.acceptanceCriteria.slice(1) || ["Delivery accepted"],
        versions: [],
      },
    ];
    const contract: Contract = {
      id: contractId,
      buyerId: b.buyerId,
      buyerName: b.buyerName,
      proId: p.proId,
      proName: p.proName,
      briefId: b.id,
      briefTitle: b.title,
      scope: b.objective,
      exclusions: b.exclusions,
      timeline: b.timeline,
      totalProFee: fee,
      revisions: 2,
      milestones,
      status: "offer_sent",
      createdAt: new Date().toISOString(),
      cancellationTerms: "Either party may request cancellation. Refund is governed by work-start status and Finance review. No automatic refund.",
      currentMilestoneId: "M-1",
    };
    createContract(contract);
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Offer created", entity: "Contract", entityId: contractId, newStatus: "offer_sent", reason: `From proposal ${p.id}` });
    setOfferOpen(false);
    toast({ title: "Offer sent", description: `${p.proName} will be notified to accept or counter.` });
    navigate("buyer_contract", { contractId });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={brief.title}
        description={`Brief ${brief.id} · ${brief.category}`}
        status={<StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>}
        breadcrumb={
          <Button variant="ghost" size="sm" onClick={() => navigate("buyer_dashboard")} className="mb-1">
            <ChevronLeft className="size-3.5" /> Dashboard
          </Button>
        }
      >
        <Button variant="outline" onClick={() => navigate("buyer_brief_new")}><Pencil className="size-3.5" /> Edit brief</Button>
      </PageHeader>

      {/* Brief expiry states */}
      {(brief.status === "approaching_inactivity" || brief.status === "archived" || brief.status === "republished") && (
        <Alert>
          <Clock4 className="size-4" />
          <AlertTitle>
            {brief.status === "approaching_inactivity" && "Brief approaching inactivity"}
            {brief.status === "archived" && "Brief archived"}
            {brief.status === "republished" && "Brief republished"}
          </AlertTitle>
          <AlertDescription className="flex items-center gap-2 flex-wrap">
            {brief.status === "approaching_inactivity" && "This brief has had no activity for over 14 days. Republish to refresh, or edit to attract new proposals."}
            {brief.status === "archived" && "This brief is no longer accepting proposals. Republish to reopen."}
            {brief.status === "republished" && "Brief has been republished. New proposals may arrive soon."}
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => navigate("buyer_brief_new")}><Pencil className="size-3.5" /> Edit</Button>
              <Button size="sm" onClick={() => {
                const next = { ...brief, status: "active" as const, createdAt: new Date().toISOString() };
                useQQ.getState().upsertBrief(next);
                toast({ title: "Brief republished" });
              }}><RefreshCw className="size-3.5" /> Republish</Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("support")}>Contact Support</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ATS-lite split */}
      <div className="grid lg:grid-cols-[40%_60%] gap-4">
        {/* Applicant list */}
        <SectionCard title={`Applicants (${briefProposals.length})`} description="Sorted by most recent.">
          {briefProposals.length === 0 ? (
            <EmptyState icon={Users} title="No proposals yet" description="Open briefs typically receive proposals within 24-48 hours." />
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {briefProposals.map((p) => {
                const m = statusMeta(p.status);
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedId(p.id); setCounterValue(null); }}
                    className={cn(
                      "w-full text-left rounded-md border p-3 transition-colors",
                      selectedId === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8 rounded-md"><AvatarFallback className="rounded-md text-xs" style={{ backgroundColor: avatarColor(p.proId), color: "white" }}>{initials(p.proName)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.proName}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.proHeadline}</div>
                      </div>
                      <StatusBadge tone={m.tone} icon={false}>{m.label}</StatusBadge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{formatINR(p.proposedFee)}</span>
                      <span className="text-muted-foreground">{timeAgo(p.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Selected applicant detail */}
        <SectionCard title="Applicant detail">
          {!selected ? (
            <EmptyState icon={FileSearch} title="Select an applicant" description="Choose an applicant from the list to see their proposal, evidence, and fee breakdown." />
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="size-12 rounded-md"><AvatarFallback className="rounded-md text-white" style={{ backgroundColor: avatarColor(selected.proId) }}>{initials(selected.proName)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{selected.proName}</h3>
                    <StatusBadge tone={statusMeta(selected.status).tone} icon={false}>{statusMeta(selected.status).label}</StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.proHeadline}</p>
                  <p className="text-xs text-muted-foreground mt-1">Submitted {formatDateTime(selected.createdAt)}</p>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Cover letter</div>
                <p className="text-sm">{selected.coverLetter}</p>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Delivery approach</div>
                <p className="text-sm text-muted-foreground">{selected.deliveryApproach}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div><div className="text-xs text-muted-foreground">Availability</div><div className="font-medium text-sm">{selected.availability}</div></div>
                <div>
                  <div className="text-xs text-muted-foreground">Proposed fee</div>
                  <div className="font-semibold text-sm">{formatINR(selected.proposedFee)}</div>
                </div>
              </div>

              {selected.evidence.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Evidence shared</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.evidence.map((e) => (
                      <Badge key={e} variant="secondary" className="text-xs"><FileCheck className="size-3" /> {e}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <FeeBreakdown proFee={counterValue ?? selected.proposedFee} />

              {/* Counter-offer panel */}
              <Card className="p-4 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="size-4 text-primary" />
                  <span className="text-sm font-medium">Counter-offer simulator</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Pro proposed {formatINR(selected.proposedFee)}. You can accept or counter with a different fee. Buyer fee and total recalculate instantly.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setCounterValue(selected.proposedFee)}>Accept {formatINR(selected.proposedFee)}</Button>
                  <Button size="sm" variant="outline" onClick={() => setCounterValue(Math.round(selected.proposedFee * 1.06))}>Counter {formatINR(Math.round(selected.proposedFee * 1.06))}</Button>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Custom:</span>
                    <Input
                      type="number" className="w-28 h-8"
                      placeholder={String(selected.proposedFee)}
                      value={counterValue ?? ""}
                      onChange={(e) => setCounterValue(e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                  {counterValue !== null && counterValue !== selected.proposedFee && (
                    <Badge variant="outline" className="text-xs">Counter: {formatINR(counterValue)}</Badge>
                  )}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {selected.status !== "shortlisted" && selected.status !== "declined" && (
                  <Button variant="outline" onClick={() => shortlist(selected)}>
                    <CheckCircle2 className="size-4" /> Shortlist
                  </Button>
                )}
                {selected.status !== "declined" && (
                  <Button variant="ghost" onClick={() => { setDeclineReason(DECLINE_REASONS[0]); setDeclineOpen(true); }}>
                    <XCircle className="size-4" /> Decline
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("buyer_messages", { contractId: "" })}>
                  <MessageSquare className="size-4" /> Message
                </Button>
                <Button onClick={() => setOfferOpen(true)} className="ml-auto">
                  <Send className="size-4" /> Create offer
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Decline modal */}
      <Dialog open={declineOpen} onOpenChange={setDeclineOpen}>
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Decline proposal</DialogTitle>
            <DialogDescription>Select a reason. The Pro will see the reason but not your private note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <RadioGroup value={declineReason} onValueChange={setDeclineReason}>
                {DECLINE_REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={r} /> {r}
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dn">Private note (optional)</Label>
              <Textarea id="dn" rows={2} value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} placeholder="Internal note, not shared with the Pro." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeclineOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selected && decline(selected)}>Decline proposal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create offer modal */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create offer for {selected?.proName}</DialogTitle>
            <DialogDescription>This sends an offer to the Pro. They can accept or counter. No payment is due until they accept and you fund milestone 1.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <FeeBreakdown proFee={counterValue ?? selected.proposedFee} />
              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Info className="size-3 inline mr-1" /> Max 4 milestones. Default offer uses 2 milestones (40/60). The Pro may propose a different split.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOfferOpen(false)}>Cancel</Button>
            <Button onClick={() => selected && createOfferFromProposal(selected, counterValue ?? undefined)}>
              <Send className="size-4" /> Send offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =================================================================
// 6. BuyerContract — Screen 08 + 10 + 11 (buyer side)
// =================================================================
export function BuyerContract() {
  const {
    viewParams, contracts, payments, payouts, disputes, reviews,
    updateContract, updateMilestone, queuePayout, openDispute, addReview,
    requestRefund, addAudit, currentUserId, navigate, addMessage, scopeChanges,
    addScopeChange, updateScopeChange, briefs, buyerProfiles, proProfiles,
  } = useQQ();
  const { toast } = useToast();
  const contract = contracts.find((c) => c.id === viewParams.contractId);

  const [acceptOpen, setAcceptOpen] = React.useState(false);
  const [acceptMilestoneId, setAcceptMilestoneId] = React.useState<string | null>(null);
  const [disputeOpen, setDisputeOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [rehireOpen, setRehireOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("workroom");

  if (!contract) {
    return <EmptyState icon={Briefcase} title="Contract not found" description="It may have been removed." actions={<Button onClick={() => navigate("buyer_dashboard")}>Back to dashboard</Button>} />;
  }

  const contractPayments = payments.filter((p) => p.contractId === contract.id);
  const contractPayouts = payouts.filter((p) => p.contractId === contract.id);
  const contractDisputes = disputes.filter((d) => d.contractId === contract.id);
  const contractScopeChanges = scopeChanges.filter((s) => s.contractId === contract.id);
  const currentMilestone = contract.milestones.find((m) => m.id === contract.currentMilestoneId) ?? contract.milestones[0];
  const meta = statusMeta(contract.status);
  const fundingPending = contract.status === "offer_accepted_pending_funding" || currentMilestone?.status === "funding_pending";
  const isCompleted = contract.status === "completed";
  const isDisputed = contract.status === "disputed";
  const myReview = reviews.find((r) => r.contractId === contract.id && r.fromUserId === currentUserId);

  function acceptMilestone() {
    if (!acceptMilestoneId) return;
    updateMilestone(contract!.id, acceptMilestoneId, { status: "accepted", acceptedAt: new Date().toISOString() });
    // Queue payout
    const m = contract!.milestones.find((x) => x.id === acceptMilestoneId);
    if (m) {
      const payout = {
        id: genId("PO"),
        contractId: contract!.id,
        proId: contract!.proId,
        proName: contract!.proName,
        milestoneLabel: m.label,
        proFee: m.proFee,
        commission: 0,
        netPayout: m.proFee,
        status: "queued" as const,
        beneficiaryToken: "BNF-" + contract!.proId.slice(-4),
        queuedAt: new Date().toISOString(),
        slipAvailable: false,
      };
      queuePayout(payout);
      addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Milestone accepted, payout queued", entity: "Milestone", entityId: acceptMilestoneId, newStatus: "payout_queued" });
      addMessage({
        id: genId("MSG"), contractId: contract!.id, from: "system", fromName: "QuickQuid",
        text: `Milestone ${m.label} accepted by Buyer. Payout ${payout.id} queued for Admin processing.`,
        at: new Date().toISOString(),
      });
    }
    setAcceptOpen(false);
    setAcceptMilestoneId(null);
    toast({ title: "Milestone accepted", description: "Payout queued for Admin processing." });
  }

  function submitReview(rating: number, comment: string, images: { id: string; color: string; label?: string }[]) {
    const review = {
      id: genId("REV"), contractId: contract!.id, fromUserId: currentUserId ?? "",
      fromName: contract!.buyerName, toRole: "pro" as const, rating, comment,
      visible: false, bothSubmitted: false, createdAt: new Date().toISOString(),
      images: images.length > 0 ? images : undefined,
    };
    addReview(review);
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Review submitted", entity: "Review", entityId: review.id });
    setReviewOpen(false);
    toast({ title: "Review submitted", description: images.length > 0 ? `Review with ${images.length} photo${images.length !== 1 ? "s" : ""} submitted. Visible after both parties submit.` : "Reviews are double-blind — visible only after both parties submit." });
  }

  function submitDispute(d: {
    category: DisputeCategory; affectedMilestone: string; narrative: string;
    requestedResolution: string; desiredOutcome: string; evidence: string[];
  }) {
    const dispute = {
      id: genId("DSP"), contractId: contract!.id, raisedBy: "buyer" as const,
      raisedByName: contract!.buyerName, category: d.category, affectedMilestone: d.affectedMilestone,
      requestedResolution: d.requestedResolution, narrative: d.narrative, evidence: d.evidence,
      desiredOutcome: d.desiredOutcome, status: "opened" as const,
      createdAt: new Date().toISOString(), slaOpenedAt: new Date().toISOString(),
    };
    openDispute(dispute);
    updateContract(contract!.id, { status: "disputed" });
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Dispute opened", entity: "Dispute", entityId: dispute.id, newStatus: "opened" });
    setDisputeOpen(false);
    toast({ title: "Dispute opened", description: "Risk team has been notified. SLA: 72h to acknowledge." });
    setActiveTab("dispute");
  }

  function submitCancellation(reason: string) {
    const refund = {
      id: genId("RF"), contractId: contract!.id, buyerId: contract!.buyerId,
      buyerName: contract!.buyerName, amount: contract!.totalProFee,
      reason, status: "requested" as const, beneficiaryToken: "BNF-" + contract!.buyerId.slice(-4),
      createdAt: new Date().toISOString(),
    };
    requestRefund(refund);
    updateContract(contract!.id, { status: "cancelled" });
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Cancellation requested", entity: "Contract", entityId: contract!.id, newStatus: "cancelled", reason });
    setCancelOpen(false);
    toast({ title: "Cancellation requested", description: "Refund is governed by work-start status. No automatic refund." });
  }

  function rehire() {
    if (!currentUserId) return;
    const newBriefId = genId("BRF");
    const rehireBrief: Brief = {
      id: newBriefId, buyerId: currentUserId, buyerName: contract!.buyerName,
      title: `Rehire ${contract!.proName}: ${contract!.briefTitle}`,
      category: "Product Design", objective: `Private brief to rehire ${contract!.proName} for follow-on work based on contract ${contract!.id}.`,
      deliverables: ["TBD with Pro"], acceptanceCriteria: ["TBD"],
      exclusions: contract!.exclusions, budget: contract!.totalProFee,
      timeline: contract!.timeline, visibility: "private", status: "active",
      createdAt: new Date().toISOString(), applicants: 0,
    };
    useQQ.getState().upsertBrief(rehireBrief);
    addAudit({ adminId: currentUserId, adminRole: "buyer", action: "Rehire brief created", entity: "Brief", entityId: newBriefId, reason: `From contract ${contract!.id}` });
    setRehireOpen(false);
    toast({ title: `Rehire brief created`, description: `Private brief ${newBriefId} with ${contract!.proName} preselected.` });
    navigate("buyer_brief_detail", { briefId: newBriefId });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.briefTitle}
        description={`Contract ${contract.id} · ${contract.proName}`}
        status={<StatusBadge tone={meta.tone} icon={false}>{meta.label}</StatusBadge>}
        breadcrumb={<Button variant="ghost" size="sm" onClick={() => navigate("buyer_dashboard")} className="mb-1"><ChevronLeft className="size-3.5" /> Dashboard</Button>}
      >
        <Button variant="outline" onClick={() => navigate("buyer_messages", { contractId: contract.id })}><MessageSquare className="size-4" /> Messages</Button>
        {!isCompleted && !isDisputed && (
          <Button variant="outline" onClick={() => setRehireOpen(true)}><RefreshCw className="size-4" /> Rehire {contract.proName.split(" ")[0]}</Button>
        )}
      </PageHeader>

      {/* Funding interlock banner */}
      {fundingPending && (
        <Alert>
          <Lock className="size-4" />
          <AlertTitle>Funding interlock</AlertTitle>
          <AlertDescription className="flex items-center gap-2 flex-wrap">
            Work may not begin until QuickQuid confirms the required payment evidence for Milestone 1.
            <Button size="sm" className="ml-auto" onClick={() => navigate("buyer_payment", { contractId: contract.id })}>
              <Banknote className="size-3.5" /> Submit payment evidence
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Pro inactivity escalation */}
      {currentMilestone?.status === "work_active" && hoursSince(currentMilestone.submittedAt ?? contract.createdAt) > 72 && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertTitle>Pro inactivity</AlertTitle>
          <AlertDescription className="flex items-center gap-2 flex-wrap">
            No submission on the active milestone for over 72 hours. You can escalate to Support.
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("support")}>Escalate to Support</Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="workroom">Workroom</TabsTrigger>
          <TabsTrigger value="offer">Offer sheet</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="dispute">Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value="workroom" className="mt-4 space-y-4">
          {/* Milestone timeline + acceptance checklist */}
          <SectionCard
            title="Milestone progress"
            description="Max 4 milestones per contract in v0.1."
            actions={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="size-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>v0.1 cap: 4 milestones per contract due to manual payment verification.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          >
            <div className="space-y-4">
              {contract.milestones.map((m) => {
                const mMeta = statusMeta(m.status);
                const mPayment = contractPayments.find((p) => p.milestoneId === m.id);
                return (
                  <Card key={m.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">{m.label}</Badge>
                          <h4 className="font-medium">{m.description}</h4>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Pro fee: {formatINR(m.proFee)} · Buyer total: {formatINR(buyerTotal(m.proFee))}</div>
                      </div>
                      <StatusBadge tone={mMeta.tone} icon={false}>{mMeta.label}</StatusBadge>
                    </div>
                    <div className="mt-3"><MilestoneStepper milestone={m} /></div>

                    {/* Acceptance checklist */}
                    {m.acceptanceCriteria.length > 0 && (
                      <div className="mt-3 rounded-md border border-border p-3">
                        <div className="text-xs font-medium mb-2">Acceptance checklist</div>
                        <ul className="space-y-1.5 text-sm">
                          {m.acceptanceCriteria.map((c) => {
                            const done = m.status === "accepted" || m.status === "payout_queued" || m.status === "payout_processed";
                            return (
                              <li key={c} className="flex items-start gap-2">
                                {done ? <CheckCircle2 className="size-4 text-emerald-600 mt-0.5" /> : <Circle className="size-4 text-muted-foreground mt-0.5" />}
                                <span className={done ? "text-foreground" : "text-muted-foreground"}>{c}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Production Delivery Vault — buyer review view */}
                    {(() => {
                      const paymentConfirmed = m.status !== "funding_pending" && m.status !== "not_started";
                      const disputeActive = contract.status === "disputed";
                      const vaultState: VaultStateType = disputeActive ? "disputed"
                        : m.versions.length === 0 ? "empty"
                        : m.status === "accepted" || m.status === "payout_queued" || m.status === "payout_processed" ? "accepted"
                        : m.versions.some(v => v.status === "rejected") && m.versions[m.versions.length - 1]?.status === "in_review" ? "resubmitted"
                        : m.versions[m.versions.length - 1]?.status === "in_review" ? "submitted_for_review"
                        : m.versions[m.versions.length - 1]?.status === "rejected" ? "revision_requested"
                        : "submitted_for_review";

                      const vaultItems: VaultItemType[] = m.versions.map((v, idx) => ({
                        vault_item_id: v.id,
                        contract_id: contract.id,
                        milestone_id: m.id,
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
                        replaces_vault_item_id: idx > 0 ? m.versions[idx - 1].id : undefined,
                        retention_hold_status: disputeActive ? "active" : "none",
                        activity_log: [{ action: `v${v.version} submitted`, by: "pro", at: v.timestamp, note: v.changeNote }],
                      }));

                      return (
                        <div className="mt-3">
                          <DeliveryVault
                            contractId={contract.id}
                            milestoneId={m.id}
                            milestoneLabel={m.label}
                            milestoneDescription={m.description}
                            proFee={m.proFee}
                            state={vaultState}
                            items={vaultItems}
                            currentVersion={vaultItems[vaultItems.length - 1]}
                            acceptanceCriteria={m.acceptanceCriteria}
                            userRole="buyer"
                            paymentConfirmed={paymentConfirmed}
                            disputeActive={disputeActive}
                            onBuyerAccept={(versionId) => {
                              updateMilestone(contract.id, m.id, { status: "accepted", acceptedAt: new Date().toISOString() });
                              queuePayout({
                                id: genId("PO"), contractId: contract.id, proId: contract.proId, proName: contract.proName,
                                milestoneLabel: m.label, proFee: m.proFee, commission: 0, netPayout: m.proFee,
                                status: "queued", beneficiaryToken: `BNF-${contract.proId}`, queuedAt: new Date().toISOString(),
                                slipAvailable: false,
                              });
                              addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Milestone accepted → Payout queued", entity: "Milestone", entityId: m.id, oldStatus: m.status, newStatus: "accepted" });
                              toast({ title: "Milestone accepted", description: "Payout queued for Admin processing." });
                            }}
                            onBuyerRequestRevision={(versionId, reason, criterion) => {
                              toast({ title: "Revision requested", description: `Pro notified to revise v${m.versions[m.versions.length - 1]?.version}. Reason: ${reason.slice(0, 60)}…` });
                            }}
                            onContactSupport={() => navigate("support")}
                          />
                        </div>
                      );
                    })()}

                    {/* Version history */}
                    {m.versions.length > 0 && (
                      <details className="mt-2 group">
                        <summary className="cursor-pointer text-xs text-primary hover:underline">Version history ({m.versions.length})</summary>
                        <ul className="mt-2 space-y-1 text-xs">
                          {m.versions.map((v) => (
                            <li key={v.id} className="flex items-center justify-between rounded border border-border px-2 py-1">
                              <span>v{v.version} · {v.changeNote}</span>
                              <span className="text-muted-foreground">{formatDate(v.timestamp)} · {v.status}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {/* Revision form */}
                    {(m.status === "in_review") && (
                      <RevisionForm
                        onSubmit={(note) => {
                          updateMilestone(contract.id, m.id, { status: "work_active", deliveryNote: note });
                          addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Revision requested", entity: "Milestone", entityId: m.id, reason: note });
                          toast({ title: "Revision requested", description: "Pro notified to revise the deliverable." });
                        }}
                      />
                    )}

                    {/* Accept milestone button */}
                    {(m.status === "submitted" || m.status === "in_review") && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          updateMilestone(contract.id, m.id, { status: "in_review" });
                          toast({ title: "Marked as in review" });
                        }}>Request revisions</Button>
                        <Button size="sm" onClick={() => { setAcceptMilestoneId(m.id); setAcceptOpen(true); }}>
                          <CheckCircle2 className="size-4" /> Accept milestone
                        </Button>
                      </div>
                    )}
                    {mPayment && (
                      <div className="mt-3 pt-2 border-t border-border text-xs text-muted-foreground">
                        Payment reference: <span className="font-mono">{mPayment.id}</span> · {mPayment.status.replace(/_/g, " ")}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </SectionCard>

          {/* Scope changes */}
          {contractScopeChanges.length > 0 && (
            <SectionCard title="Scope changes" description="Requested changes with fee/timeline deltas.">
              <div className="space-y-2">
                {contractScopeChanges.map((sc) => (
                  <Card key={sc.id} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{sc.requestedChange}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {sc.feeDelta !== 0 && <span>Fee Δ {formatINR(sc.feeDelta)} · </span>}
                          <span>Timeline Δ {sc.timelineDelta} · </span>
                          <span>By {sc.proposedBy}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Criteria impact: {sc.criteriaImpact}</div>
                      </div>
                      <StatusBadge tone={statusMeta(sc.status).tone} icon={false}>{sc.status.replace(/_/g, " ")}</StatusBadge>
                    </div>
                  </Card>
                ))}
              </div>
            </SectionCard>
          )}
        </TabsContent>

        <TabsContent value="offer" className="mt-4">
          <OfferSheet contract={contract} />
        </TabsContent>

        <TabsContent value="completion" className="mt-4 space-y-4">
          {isCompleted ? (
            <>
              <SectionCard title="Contract completion" description="Accepted milestones, fees, and tax/payout status.">
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Accepted milestones</div>
                      <div className="font-semibold">{contract.milestones.filter((m) => m.status === "accepted" || m.status === "payout_queued" || m.status === "payout_processed").length}/{contract.milestones.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Pro fee</div>
                      <div className="font-semibold tabular-nums">{formatINR(contract.totalProFee)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Buyer fee (14%)</div>
                      <div className="font-semibold tabular-nums">{formatINR(buyerFee(contract.totalProFee))}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Buyer total</div>
                      <div className="font-semibold tabular-nums">{formatINR(buyerTotal(contract.totalProFee))}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Tax status</div>
                      <div className="text-sm font-medium">Calculated by Finance if applicable</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Payout status</div>
                      <div className="text-sm font-medium">
                        {contractPayouts.length > 0 ? (
                          contractPayouts.every((p) => p.status === "processed") ? "All payouts processed" : `${contractPayouts.filter((p) => p.status === "processed").length}/${contractPayouts.length} processed`
                        ) : "No payouts queued"}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Defect window */}
              <SectionCard title="Defect window" description="You can report defects within 7 days of milestone acceptance.">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>Defect window: 7 days from each milestone acceptance. After that, milestones are considered final.</span>
                </div>
              </SectionCard>

              {/* Enterprise TDS capture overlay (future) */}
              <Card className="p-4 border-dashed border-border bg-muted/20">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">Future</Badge>
                  <div>
                    <div className="text-sm font-medium">Enterprise TDS capture</div>
                    <p className="text-xs text-muted-foreground mt-1">Enterprise buyers will be able to capture TDS certificates and map them to payouts. Tax configuration pending approval.</p>
                  </div>
                </div>
              </Card>

              {/* Invoice/tax mapping summary */}
              <SectionCard title="Invoice & tax mapping" description="Summary for finance reconciliation.">
                <div className="space-y-2 text-sm">
                  {contractPayouts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <div>
                        <div className="font-medium">{p.milestoneLabel} payout · {p.id}</div>
                        <div className="text-xs text-muted-foreground">Pro fee {formatINR(p.proFee)} · Commission {formatINR(p.commission)} · Net {formatINR(p.netPayout)}</div>
                      </div>
                      <StatusBadge tone={statusMeta(p.status).tone} icon={false}>{p.status.replace(/_/g, " ")}</StatusBadge>
                    </div>
                  ))}
                  {contractPayouts.length === 0 && <div className="text-sm text-muted-foreground">No payouts yet for this contract.</div>}
                </div>
              </SectionCard>

              {/* Review */}
              <SectionCard title="Private review (double-blind)" description="Reviews are visible only after both parties submit.">
                {myReview ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Your rating:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("size-4", i < myReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{myReview.comment}</p>
                    {myReview.images && myReview.images.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {myReview.images.map((img) => (
                          <div key={img.id} className="size-12 rounded-md border border-border" style={{ background: `linear-gradient(135deg, ${img.color}, ${img.color}aa)` }} title={img.label} />
                        ))}
                        <span className="text-[10px] text-muted-foreground self-center ml-1">{myReview.images.length} photo{myReview.images.length !== 1 ? "s" : ""} attached</span>
                      </div>
                    )}
                    <StatusBadge tone={myReview.bothSubmitted ? "success" : "pending"} icon={false}>{myReview.bothSubmitted ? "Visible (both submitted)" : "Hidden — waiting for Pro's review"}</StatusBadge>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Submit a private review of {contract.proName}. It stays hidden until they submit theirs.</p>
                    <Button onClick={() => setReviewOpen(true)}><Star className="size-4" /> Write a review</Button>
                  </div>
                )}
              </SectionCard>
            </>
          ) : (
            <EmptyState
              icon={FileCheck}
              title="Contract not yet completed"
              description="Completion summary, defect window, and reviews appear after all milestones are accepted."
            />
          )}
        </TabsContent>

        <TabsContent value="dispute" className="mt-4 space-y-4">
          {contractDisputes.length > 0 ? (
            <SectionCard title="Active disputes">
              <div className="space-y-3">
                {contractDisputes.map((d) => (
                  <Card key={d.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{DISPUTE_CATEGORIES.find((c) => c.value === d.category)?.label ?? d.category}</Badge>
                          <span className="font-mono text-xs">{d.id}</span>
                        </div>
                        <p className="text-sm mt-2">{d.narrative}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          Affected: {d.affectedMilestone ?? "—"} · Desired: {d.desiredOutcome} · Opened {formatDate(d.slaOpenedAt)}
                        </div>
                      </div>
                      <StatusBadge tone={statusMeta(d.status).tone} icon={false}>{d.status.replace(/_/g, " ")}</StatusBadge>
                    </div>
                    {d.counterclaim && (
                      <div className="mt-3 rounded-md border border-border p-2 text-xs">
                        <div className="font-medium text-muted-foreground">Pro counterclaim</div>
                        <p className="mt-0.5">{d.counterclaim}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Disputes" description="If something goes wrong, you can open a dispute. Risk team will mediate.">
              <EmptyState
                icon={Scale}
                title="No disputes"
                description="Open a dispute if the Pro misses acceptance criteria, timeline, or communication expectations."
                actions={<Button variant="outline" onClick={() => setDisputeOpen(true)}><Gavel className="size-4" /> Open a dispute</Button>}
              />
            </SectionCard>
          )}

          {/* Mutual cancellation */}
          <SectionCard title="Mutual cancellation" description="Either party may request cancellation. Refund is governed by work-start status and Finance review. No automatic refund.">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Cancellation policy: {contract.cancellationTerms}</p>
              <Button variant="outline" onClick={() => setCancelOpen(true)} disabled={isCompleted}><Ban className="size-4" /> Request cancellation</Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Accept milestone modal */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Accept milestone?</DialogTitle>
            <DialogDescription>
              Confirm that this milestone meets the agreed acceptance criteria. After acceptance, the payout will be queued for Admin processing.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Info className="size-3 inline mr-1" /> Acceptance is final within the 7-day defect window. The Pro receives the payout after Admin processing — payouts are not instant.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAcceptOpen(false)}>Cancel</Button>
            <Button onClick={acceptMilestone}><CheckCircle2 className="size-4" /> Accept & queue payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute modal */}
      <DisputeDialog open={disputeOpen} onOpenChange={setDisputeOpen} contract={contract} onSubmit={submitDispute} />

      {/* Cancellation modal */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Request mutual cancellation</DialogTitle>
            <DialogDescription>Refund is governed by work-start status. No automatic refund. Finance will review your request.</DialogDescription>
          </DialogHeader>
          <CancellationForm
            contract={contract}
            onSubmit={submitCancellation}
            onCancel={() => setCancelOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Review modal */}
      <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} proName={contract.proName} onSubmit={submitReview} />

      {/* Rehire modal */}
      <Dialog open={rehireOpen} onOpenChange={setRehireOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Rehire {contract.proName}?</DialogTitle>
            <DialogDescription>This creates a private brief with {contract.proName} preselected. They'll be invited to submit a proposal.</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Private brief · Budget {formatINR(contract.totalProFee)} · Timeline {contract.timeline}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRehireOpen(false)}>Cancel</Button>
            <Button onClick={rehire}><RefreshCw className="size-4" /> Create rehire brief</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferSheet({ contract }: { contract: Contract }) {
  return (
    <SectionCard title="Immutable offer sheet" description="This offer sheet is locked once the contract is created. Any change requires a new contract or scope change.">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3 text-sm">
          <div><div className="text-xs text-muted-foreground">Buyer</div><div className="font-medium">{contract.buyerName}</div></div>
          <div><div className="text-xs text-muted-foreground">Pro</div><div className="font-medium">{contract.proName}</div></div>
          <div><div className="text-xs text-muted-foreground">Brief</div><div className="font-medium">{contract.briefTitle} ({contract.briefId})</div></div>
          <div><div className="text-xs text-muted-foreground">Scope</div><div className="font-medium">{contract.scope}</div></div>
          <div>
            <div className="text-xs text-muted-foreground">Exclusions</div>
            <ul className="mt-0.5 text-sm">
              {contract.exclusions.map((e) => <li key={e} className="flex items-start gap-1.5"><XCircle className="size-3.5 text-muted-foreground mt-0.5" /> {e}</li>)}
            </ul>
          </div>
          <div><div className="text-xs text-muted-foreground">Timeline</div><div className="font-medium">{contract.timeline}</div></div>
        </div>
        <div className="space-y-3">
          <FeeBreakdown proFee={contract.totalProFee} />
          <Card className="p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Revisions included</span>
              <span className="font-semibold">{contract.revisions}</span>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Milestones (max 4)</div>
            <div className="space-y-1 text-sm">
              {contract.milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <span>{m.label} · {m.description}</span>
                  <span className="font-medium tabular-nums">{formatINR(m.proFee)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Cancellation terms</div>
            <p className="text-xs">{contract.cancellationTerms}</p>
          </Card>
        </div>
      </div>
    </SectionCard>
  );
}

function RevisionForm({ onSubmit }: { onSubmit: (note: string) => void }) {
  const [note, setNote] = React.useState("");
  return (
    <div className="mt-3 rounded-md border border-border p-3">
      <div className="text-xs font-medium mb-2">Request a revision</div>
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What needs to change to meet acceptance criteria?" />
      <Button size="sm" className="mt-2" onClick={() => { if (note.trim()) { onSubmit(note); setNote(""); } }}>
        <RefreshCw className="size-3.5" /> Send revision request
      </Button>
    </div>
  );
}

function DisputeDialog({
  open, onOpenChange, contract, onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; contract: Contract;
  onSubmit: (d: { category: DisputeCategory; affectedMilestone: string; narrative: string; requestedResolution: string; desiredOutcome: string; evidence: string[] }) => void;
}) {
  const [category, setCategory] = React.useState<DisputeCategory>("scope");
  const [affectedMilestone, setAffectedMilestone] = React.useState(contract.milestones[0]?.id ?? "");
  const [narrative, setNarrative] = React.useState("");
  const [requestedResolution, setRequestedResolution] = React.useState("");
  const [desiredOutcome, setDesiredOutcome] = React.useState("");
  const [evidence, setEvidence] = React.useState<string[]>([]);

  function submit() {
    if (!narrative || !requestedResolution) return;
    onSubmit({ category, affectedMilestone, narrative, requestedResolution, desiredOutcome, evidence });
    setNarrative(""); setRequestedResolution(""); setDesiredOutcome(""); setEvidence([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Open a dispute</DialogTitle>
          <DialogDescription>Risk team will acknowledge within 72 hours. Be specific — provide evidence where possible.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category <span className="text-destructive">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DisputeCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISPUTE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Affected milestone</Label>
            <Select value={affectedMilestone} onValueChange={setAffectedMilestone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {contract.milestones.map((m) => <SelectItem key={m.id} value={m.id}>{m.label} · {m.description}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dn">Narrative <span className="text-destructive">*</span></Label>
            <Textarea id="dn" rows={3} value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="Describe what happened." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="drr">Requested resolution <span className="text-destructive">*</span></Label>
            <Input id="drr" value={requestedResolution} onChange={(e) => setRequestedResolution(e.target.value)} placeholder="e.g. Partial refund - ₹7,000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="do">Desired outcome</Label>
            <Input id="do" value={desiredOutcome} onChange={(e) => setDesiredOutcome(e.target.value)} placeholder="e.g. Revised deliverable + refund" />
          </div>
          <div className="space-y-1.5">
            <Label>Evidence</Label>
            <EvidenceDropzone label="Drop evidence files" accept="JPG, PNG, PDF · max 10MB" multiple onUploaded={(f) => setEvidence((prev) => [...prev, f.name])} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={!narrative || !requestedResolution}><Gavel className="size-4" /> Open dispute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancellationForm({ contract, onSubmit, onCancel }: { contract: Contract; onSubmit: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = React.useState("");
  const workStarted = contract.milestones.some((m) => m.status === "work_active" || m.status === "submitted" || m.status === "in_review" || m.status === "accepted");
  return (
    <div className="space-y-3">
      <Alert>
        <AlertTriangle className="size-4" />
        <AlertTitle>{workStarted ? "Work has started" : "Work has not started"}</AlertTitle>
        <AlertDescription>
          {workStarted
            ? "Because work has started, refund is governed by work-start status and Finance review. No automatic refund."
            : "If no work has started, you may be eligible for a refund less any processing costs. Finance will review."}
        </AlertDescription>
      </Alert>
      <div className="space-y-1.5">
        <Label htmlFor="cr">Reason <span className="text-destructive">*</span></Label>
        <Textarea id="cr" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you cancelling?" />
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={() => reason && onSubmit(reason)} disabled={!reason}>Request cancellation</Button>
      </DialogFooter>
    </div>
  );
}

function ReviewDialog({ open, onOpenChange, proName, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; proName: string; onSubmit: (rating: number, comment: string, images: { id: string; color: string; label?: string }[]) => void }) {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [images, setImages] = React.useState<{ id: string; color: string; label?: string }[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const palette = ["#7C3AED", "#0891B2", "#CA8A04", "#DB2777", "#0EA5E9"];

  function addImages(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5 - images.length);
    arr.forEach((f, i) => {
      setImages((prev) => [...prev, { id: `ri-${Date.now()}-${i}`, color: palette[(images.length + i) % palette.length], label: f.name }]);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Review {proName}</DialogTitle>
          <DialogDescription>Double-blind: your review is hidden until {proName} submits theirs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)} className="p-1" aria-label={`${i + 1} star`}>
                  <Star className={cn("size-6", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rc">Comment</Label>
            <Textarea id="rc" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What went well? What could be better?" />
          </div>
          <div className="space-y-1.5">
            <Label>Photos of delivered work (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div key={img.id} className="relative size-14 overflow-hidden rounded-md border border-border group" style={{ background: `linear-gradient(135deg, ${img.color}, ${img.color}aa)` }}>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((x) => x.id !== img.id))}
                    className="absolute top-0.5 right-0.5 rounded bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove photo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex size-14 flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Camera className="size-4" />
                  <span className="text-[9px] mt-0.5">Add</span>
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Up to 5 photos. Visible in your review (like Fiverr's Live Portfolio).</p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(rating, comment, images)} disabled={!comment}><Star className="size-4" /> Submit review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =================================================================
// 7. BuyerPayment — Screen 09.1 + 09.4 + 09.7 + 09.8 + 09.9
// =================================================================
export function BuyerPayment() {
  const {
    viewParams, contracts, payments, refunds, submitPaymentEvidence,
    updatePayment, addAudit, navigate, currentUserId, buyerProfiles, gigs,
  } = useQQ();
  const { toast } = useToast();

  const gig = gigs.find((g) => g.id === viewParams.gigId);
  const contractId = viewParams.contractId ?? contracts[0]?.id;
  const contract = contracts.find((c) => c.id === contractId);
  const existingPayments = payments.filter((p) => p.contractId === contractId);
  const latestPayment = existingPayments[0];

  const [utr, setUtr] = React.useState("");
  const [amount, setAmount] = React.useState(0);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = React.useState<PaymentMethod>("NEFT");
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [overUnderOpen, setOverUnderOpen] = React.useState(false);

  if (!contract && !gig) {
    return <EmptyState icon={Banknote} title="Nothing to pay for" description="Open a contract or gig to submit payment evidence." actions={<Button onClick={() => navigate("buyer_dashboard")}>Dashboard</Button>} />;
  }

  // Determine amount due
  const amountDue = gig ? gig.proFee : (contract?.milestones.find((m) => m.id === contract.currentMilestoneId)?.proFee ?? contract?.totalProFee ?? 0);
  const milestoneLabel = gig ? "Gig fee" : (contract?.milestones.find((m) => m.id === contract.currentMilestoneId)?.label ?? "M1");

  // Rejected state?
  const isRejected = latestPayment?.status === "payment_rejected";
  const isUnderReview = latestPayment?.status === "under_admin_verification" || latestPayment?.status === "payment_evidence_submitted";

  function submit() {
    if (!utr || !amount) {
      toast({ title: "UTR and amount required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const payment: PaymentEvidence = {
        id: genId("PAY"),
        contractId: contractId ?? "GIG",
        milestoneId: contract?.currentMilestoneId ?? "GIG",
        milestoneLabel,
        amountDue,
        amountReceived: amount,
        utr,
        method,
        date: new Date(date).toISOString(),
        status: "under_admin_verification",
        targetReviewHours: 24,
        screenshot: screenshot ?? undefined,
        submittedAt: new Date().toISOString(),
      };
      submitPaymentEvidence(payment);
      addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Payment evidence submitted", entity: "Payment", entityId: payment.id, newStatus: "under_admin_verification" });
      setSubmitting(false);
      toast({ title: "Evidence submitted", description: `${payment.id} · Under Admin verification. Target: 24h.` });
      if (contract) navigate("buyer_contract", { contractId: contract.id });
      else navigate("buyer_dashboard");
    }, 800);
  }

  // Over/under payment state (only when latest payment was rejected for amount mismatch)
  const received = 35000;
  const expected = amountDue;
  const surplus = received - expected;
  const showOverUnder = isRejected && latestPayment?.rejectionReason === "Amount mismatch";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit payment evidence"
        description="Manual payment verification. Submit UTR or transaction reference first; screenshots are optional."
        breadcrumb={<Button variant="ghost" size="sm" onClick={() => navigate(contract ? "buyer_contract" : "buyer_dashboard", contract ? { contractId: contract.id } : undefined)} className="mb-1"><ChevronLeft className="size-3.5" /> Back</Button>}
      />

      <AlertBanner tone="info" icon={Info} title="How to submit payment evidence">
        Submit the UTR or transaction reference first. Supporting screenshots are optional and may contain sensitive information.
      </AlertBanner>

      {/* Rejected recovery */}
      {isRejected && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Payment evidence rejected</AlertTitle>
          <AlertDescription className="flex items-center gap-2 flex-wrap">
            Reference <span className="font-mono">{latestPayment.id}</span> · Reason: {latestPayment.rejectionReason}
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => navigate("support")}>Contact Support</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Approved payment instructions */}
        <SectionCard title="Approved payment instructions" description="Pay this exact amount to the platform account. Reference: contract + milestone.">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Contract</span>
              <span className="font-mono">{contract?.id ?? gig?.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Milestone</span>
              <span className="font-medium">{milestoneLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pro fee</span>
              <span className="font-medium tabular-nums">{formatINR(amountDue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Buyer fee (14%)</span>
              <span className="font-medium tabular-nums">{formatINR(buyerFee(amountDue))}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">Amount due (Buyer total)</span>
              <span className="font-semibold tabular-nums">{formatINR(buyerTotal(amountDue))}</span>
            </div>
            <Alert>
              <Info className="size-4" />
              <AlertDescription>Pay the Buyer total ({formatINR(buyerTotal(amountDue))}) via NEFT/IMPS/RTGS/UPI to the platform account. Use the UTR/transaction reference as proof.</AlertDescription>
            </Alert>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Lock className="size-3 inline mr-1" /> Platform bank account details are shared via secure channel. Do not share this reference outside QuickQuid.
            </div>
          </div>
        </SectionCard>

        {/* Evidence form */}
        <SectionCard title="Payment evidence" description="UTR/transaction reference is required.">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="utr">UTR / Transaction reference <span className="text-destructive">*</span></Label>
              <Input id="utr" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. UTR982341771" className="font-mono" />
              <p className="text-xs text-muted-foreground">Found on your bank statement or UPI app receipt.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amt">Amount paid (INR) <span className="text-destructive">*</span></Label>
                <Input id="amt" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder={String(amountDue)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dt">Payment date</Label>
                <Input id="dt" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mth">Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger id="mth"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["NEFT", "IMPS", "RTGS", "UPI"] as PaymentMethod[]).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Optional screenshot</Label>
              <EvidenceDropzone
                label="Drop payment screenshot or click to upload"
                accept="JPG, PNG, PDF · max 10MB"
                onUploaded={(f) => setScreenshot(f.name)}
              />
              <p className="text-xs text-muted-foreground">May contain sensitive information. Stored encrypted, accessed only by Finance during verification.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Payment tracker */}
      {latestPayment && (
        <SectionCard title="Payment tracker" description={`Reference ${latestPayment.id} · submitted ${formatDate(latestPayment.submittedAt)}`}>
          <PaymentTracker payment={latestPayment} />
          <div className="mt-3 text-xs text-muted-foreground">
            Target review: {latestPayment.targetReviewHours}h · Status: {latestPayment.status.replace(/_/g, " ")}
          </div>
        </SectionCard>
      )}

      {/* Over/under payment resolver */}
      {showOverUnder && (
        <SectionCard title="Over/under payment resolver" description={`Received ${formatINR(received)}, expected ${formatINR(expected)} → ${surplus >= 0 ? "surplus" : "shortfall"} ${formatINR(Math.abs(surplus))}`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Button variant="outline" onClick={() => toast({ title: "Held for next milestone", description: `Surplus ${formatINR(surplus)} will be applied to the next milestone.` })}>
              <Clock className="size-4" /> Hold for next milestone
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Applied to current milestone", description: `Surplus ${formatINR(surplus)} applied.` })}>
              <CheckCircle2 className="size-4" /> Apply to milestone
            </Button>
            <Button variant="outline" onClick={() => navigate("support")}>
              <RotateCcw className="size-4" /> Manual refund
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Resubmission required", description: "Reject and resubmit with the correct amount." })}>
              <XCircle className="size-4" /> Reject & resubmit
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Chargeback queue states */}
      {latestPayment?.status === "escalated" && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Chargeback / escalation</AlertTitle>
          <AlertDescription>This payment has been escalated. Finance will contact you within 24h.</AlertDescription>
        </Alert>
      )}

      {/* Cancel & refund */}
      <SectionCard title="Cancel & refund" description="Refund is governed by contract policy and work-start status.">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2"><Info className="size-4 mt-0.5 text-muted-foreground" /> Contract cancellation policy: {contract?.cancellationTerms ?? "Governing cancellation policy applies."}</div>
          <div className="flex items-start gap-2"><Info className="size-4 mt-0.5 text-muted-foreground" /> Work-start status: {contract?.milestones.some((m) => m.status === "work_active" || m.status === "submitted" || m.status === "in_review") ? "Work has started — partial refund may apply" : "Work not started — full refund may apply (subject to Finance review)"}</div>
          <div className="flex items-start gap-2"><XCircle className="size-4 mt-0.5 text-destructive" /> We do not guarantee a refund. All refunds are processed manually and reviewed by Finance.</div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => navigate("buyer_contract", { contractId: contract?.id ?? "" })}><Ban className="size-3.5" /> Request cancellation</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("support")}>Contact Support</Button>
          </div>
        </div>
      </SectionCard>

      <StickyCtaBar>
        <div className="text-sm text-muted-foreground">
          {amount > 0 ? (
            <>Submitting <span className="font-mono text-foreground">{genId("PAY")}</span> · {formatINR(amount)} via {method}</>
          ) : (
            <>Enter UTR and amount to submit</>
          )}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="outline" onClick={() => navigate(contract ? "buyer_contract" : "buyer_dashboard", contract ? { contractId: contract.id } : undefined)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !utr || !amount}>
            {submitting ? <><Loader2 className="size-4 animate-spin" /> Submitting…</> : <><Send className="size-4" /> Submit evidence</>}
          </Button>
        </div>
      </StickyCtaBar>
    </div>
  );
}

// =================================================================
// 8. BuyerMessages — Screen 07
// =================================================================
export function BuyerMessages() {
  const {
    viewParams, contracts, messages, addMessage, scopeChanges,
    addScopeChange, updateScopeChange, currentUserId, navigate, addAudit,
  } = useQQ();
  const { toast } = useToast();
  const myContracts = contracts.filter((c) => c.buyerId === currentUserId);
  const [selectedContractId, setSelectedContractId] = React.useState(
    viewParams.contractId && viewParams.contractId !== "" ? viewParams.contractId : myContracts[0]?.id ?? "",
  );
  const [draft, setDraft] = React.useState("");
  const [attachment, setAttachment] = React.useState<{ name: string; size: number; status: "uploading" | "done" | "error"; reason?: string } | null>(null);
  const [scopeModalOpen, setScopeModalOpen] = React.useState(false);
  const [circumventionWarning, setCircumventionWarning] = React.useState<string | null>(null);
  const [reportFpOpen, setReportFpOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const selectedContract = contracts.find((c) => c.id === selectedContractId);
  const contractMessages = messages.filter((m) => m.contractId === selectedContractId).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const contractScopeChanges = scopeChanges.filter((s) => s.contractId === selectedContractId);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [contractMessages.length]);

  function validateAttachment(file: File) {
    const over = file.size > 25 * 1024 * 1024;
    const exe = /\.(exe|bat|cmd|sh|msi|dll|app)$/i.test(file.name);
    if (over) {
      setAttachment({ name: file.name, size: file.size, status: "error", reason: "File too large (max 25MB)" });
      return false;
    }
    if (exe) {
      setAttachment({ name: file.name, size: file.size, status: "error", reason: "Executables are blocked" });
      return false;
    }
    setAttachment({ name: file.name, size: file.size, status: "uploading" });
    setTimeout(() => {
      setAttachment({ name: file.name, size: file.size, status: "done" });
    }, 900);
    return true;
  }

  function send() {
    if (!draft.trim() || !selectedContractId) return;
    const flags = detectCircumvention(draft);
    if (flags.length > 0) {
      setCircumventionWarning(`Detected: ${flags.join(", ")}. Please keep payment and contract communication on QuickQuid until the contract is active.`);
      return;
    }
    const msg = {
      id: genId("MSG"),
      contractId: selectedContractId,
      from: "buyer" as const,
      fromName: selectedContract?.buyerName ?? "You",
      text: draft.trim(),
      at: new Date().toISOString(),
    };
    addMessage(msg);
    setDraft("");
    if (attachment?.status === "done") setAttachment(null);
  }

  function proposeScopeChange(sc: { requestedChange: string; feeDelta: number; timelineDelta: string; criteriaImpact: string; reason: string }) {
    if (!selectedContractId) return;
    addScopeChange({
      id: genId("SC"),
      contractId: selectedContractId,
      requestedChange: sc.requestedChange,
      feeDelta: sc.feeDelta,
      timelineDelta: sc.timelineDelta,
      criteriaImpact: sc.criteriaImpact,
      reason: sc.reason,
      status: "pending",
      proposedBy: "buyer",
      at: new Date().toISOString(),
    });
    addAudit({ adminId: currentUserId ?? "", adminRole: "buyer", action: "Scope change proposed", entity: "Contract", entityId: selectedContractId });
    setScopeModalOpen(false);
    toast({ title: "Scope change proposed", description: "Pro has been notified to accept, decline, or counter." });
  }

  if (myContracts.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No active contracts"
        description="Messaging is unlocked once you have an active contract with a Pro."
        actions={<Button onClick={() => navigate("buyer_dashboard")}>Go to dashboard</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Contextual workspace. Scope, fees, and milestones are pinned for reference."
      >
        <Select value={selectedContractId} onValueChange={setSelectedContractId}>
          <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select contract" /></SelectTrigger>
          <SelectContent>
            {myContracts.map((c) => <SelectItem key={c.id} value={c.id}>{c.briefTitle} ({c.id})</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>

      <Alert>
        <ShieldAlert className="size-4" />
        <AlertTitle>Admin Support may review this workspace</AlertTitle>
        <AlertDescription>Admin Support may review this workspace if a dispute is filed. Keep communication professional and on-platform.</AlertDescription>
      </Alert>

      {circumventionWarning && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Circumvention policy reminder</AlertTitle>
          <AlertDescription className="flex items-center gap-2 flex-wrap">
            Please keep payment and contract communication on QuickQuid until the contract is active.
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => { setDraft(""); setCircumventionWarning(null); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => setReportFpOpen(true)}>Report false positive</Button>
              <Button size="sm" variant="ghost" onClick={() => navigate("support")}>Support</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-[60%_40%] gap-4">
        {/* Chat */}
        <Card className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-medium">{selectedContract?.briefTitle}</div>
              <div className="text-xs text-muted-foreground">with {selectedContract?.proName} · {selectedContract?.id}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setScopeModalOpen(true)}>
              <FileText className="size-3.5" /> Propose scope change
            </Button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[440px]">
            {contractMessages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-12">No messages yet. Start the conversation.</div>
            ) : (
              contractMessages.map((m) => {
                const mine = m.from === "buyer";
                const sys = m.from === "system";
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      sys ? "bg-muted text-muted-foreground text-center w-full" :
                      mine ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}>
                      {!sys && <div className="text-xs font-medium mb-0.5 opacity-80">{m.fromName}</div>}
                      <div>{m.text}</div>
                      <div className={cn("text-[10px] mt-1", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatDateTime(m.at)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Attachment preview */}
          {attachment && (
            <div className="border-t border-border px-3 py-2">
              <div className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs">
                {attachment.status === "uploading" && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                {attachment.status === "done" && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                {attachment.status === "error" && <AlertCircle className="size-3.5 text-destructive" />}
                <Paperclip className="size-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{attachment.name}</span>
                {attachment.reason && <span className="text-destructive">{attachment.reason}</span>}
                <Button variant="ghost" size="icon" className="size-6" onClick={() => setAttachment(null)}><X className="size-3" /></Button>
              </div>
            </div>
          )}
          {/* Composer */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <label className="cursor-pointer" title="Attach file (max 25MB, no executables)">
                <input
                  type="file" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAttachment(f); }}
                />
                <span className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-muted"><Paperclip className="size-4" /></span>
              </label>
              <Textarea
                rows={2} value={draft} onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${selectedContract?.proName ?? ""}…`}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                className="flex-1 resize-none"
              />
              <Button onClick={send} disabled={!draft.trim()}><Send className="size-4" /></Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Max 25MB · executables blocked · phone, email, and payment links are blocked until the contract is active.</p>
          </div>
        </Card>

        {/* Immutable brief & scope summary */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <SectionCard title="Brief & scope summary" description="Immutable reference. Locked for the contract.">
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Fee</div>
                <div className="font-medium">
                  Pro {formatINR(selectedContract?.totalProFee ?? 0)} · Buyer fee {formatINR(buyerFee(selectedContract?.totalProFee ?? 0))} · Total {formatINR(buyerTotal(selectedContract?.totalProFee ?? 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Timeline</div>
                <div className="font-medium">{selectedContract?.timeline}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Deliverables</div>
                <ul className="text-sm mt-0.5">
                  {selectedContract?.milestones.map((m) => <li key={m.id} className="flex items-start gap-1.5"><CheckCircle2 className="size-3.5 text-muted-foreground mt-0.5" /> {m.description}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Exclusions</div>
                <ul className="text-sm mt-0.5">
                  {selectedContract?.exclusions.map((e) => <li key={e} className="flex items-start gap-1.5"><XCircle className="size-3.5 text-muted-foreground mt-0.5" /> {e}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Acceptance criteria</div>
                <ul className="text-sm mt-0.5">
                  {selectedContract?.milestones.flatMap((m) => m.acceptanceCriteria).map((c, i) => <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="size-3.5 text-muted-foreground mt-0.5" /> {c}</li>)}
                </ul>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Revisions</div>
                <div className="font-medium">{selectedContract?.revisions}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Status</div>
                <StatusBadge tone={statusMeta(selectedContract?.status ?? "").tone} icon={false}>{selectedContract?.status.replace(/_/g, " ")}</StatusBadge>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground flex items-start gap-1.5">
                <Lock className="size-3.5 mt-0.5" />
                Scope is locked once the contract is active. Use scope changes to propose amendments.
              </div>
            </div>
          </SectionCard>

          {contractScopeChanges.length > 0 && (
            <SectionCard title="Scope changes" description={`${contractScopeChanges.length} proposed`}>
              <div className="space-y-2">
                {contractScopeChanges.map((sc) => (
                  <Card key={sc.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{sc.requestedChange}</div>
                      <StatusBadge tone={statusMeta(sc.status).tone} icon={false}>{sc.status.replace(/_/g, " ")}</StatusBadge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Fee Δ {formatINR(sc.feeDelta)} · Timeline Δ {sc.timelineDelta} · By {sc.proposedBy}
                    </div>
                    {sc.status === "pending" && sc.proposedBy === "pro" && (
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { updateScopeChange(sc.id, { status: "accepted" }); toast({ title: "Scope change accepted" }); }}>
                          <CheckCircle2 className="size-3.5" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { updateScopeChange(sc.id, { status: "declined" }); toast({ title: "Scope change declined" }); }}>
                          <XCircle className="size-3.5" /> Decline
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { updateScopeChange(sc.id, { status: "changes_requested" }); toast({ title: "Requested changes" }); }}>
                          Request changes
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Scope change modal */}
      <ScopeChangeModal open={scopeModalOpen} onOpenChange={setScopeModalOpen} onSubmit={proposeScopeChange} />

      {/* Report false positive */}
      <Dialog open={reportFpOpen} onOpenChange={setReportFpOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Report false positive</DialogTitle>
            <DialogDescription>If you believe the circumvention filter incorrectly flagged your message, our team will review it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea rows={3} placeholder="Explain why this is a false positive." />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setReportFpOpen(false)}>Cancel</Button>
              <Button onClick={() => { setReportFpOpen(false); setCircumventionWarning(null); toast({ title: "Reported for review" }); }}>Submit report</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScopeChangeModal({
  open, onOpenChange, onSubmit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSubmit: (sc: { requestedChange: string; feeDelta: number; timelineDelta: string; criteriaImpact: string; reason: string }) => void;
}) {
  const [requestedChange, setRequestedChange] = React.useState("");
  const [feeDelta, setFeeDelta] = React.useState(0);
  const [timelineDelta, setTimelineDelta] = React.useState("0");
  const [criteriaImpact, setCriteriaImpact] = React.useState("None");
  const [reason, setReason] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Propose scope change</DialogTitle>
          <DialogDescription>Scope changes require Pro acceptance. Include fee and timeline impact.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="sc-change">Requested change <span className="text-destructive">*</span></Label>
            <Textarea id="sc-change" rows={2} value={requestedChange} onChange={(e) => setRequestedChange(e.target.value)} placeholder="e.g. Add 5 more interview rounds to milestone 2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sc-fee">Fee delta (INR)</Label>
              <Input id="sc-fee" type="number" value={feeDelta} onChange={(e) => setFeeDelta(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Positive increases Pro fee. Negative decreases.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sc-tl">Timeline delta</Label>
              <Input id="sc-tl" value={timelineDelta} onChange={(e) => setTimelineDelta(e.target.value)} placeholder="e.g. +1 week" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-crit">Acceptance criteria impact</Label>
            <Input id="sc-crit" value={criteriaImpact} onChange={(e) => setCriteriaImpact(e.target.value)} placeholder="e.g. Adds 2 new criteria" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sc-reason">Reason</Label>
            <Textarea id="sc-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this change needed?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { if (requestedChange) { onSubmit({ requestedChange, feeDelta, timelineDelta, criteriaImpact, reason }); setRequestedChange(""); setReason(""); } }} disabled={!requestedChange}>
            <Send className="size-4" /> Propose change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
