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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  EmptyState,
  SectionCard,
  ErrorState,
  BackButton,
  QuickQuidVerifiedBadge,
} from "@/components/qq/shared";
import { StatusBadge, statusMeta } from "@/components/qq/shared/StatusBadge";
import { FeeBreakdown } from "@/components/qq/shared/FeeBreakdown";
import { PortfolioGallery } from "@/components/qq/shared/PortfolioGallery";
import {
  buyerFee,
  buyerTotal,
  formatINR,
  formatDate,
  formatDateTime,
  timeAgo,
  genId,
} from "@/lib/qq/format";
import {
  HelpCircle,
  Plus,
  ArrowLeft,
  Send,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Flag,
  Briefcase,
  Star,
  Clock,
  Mail,
  Bell,
  Smartphone,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Ban,
  FileText,
  Banknote,
  Scale,
  Eye,
  Bookmark,
  Save,
  Info,
  Github,
  ExternalLink,
} from "lucide-react";
import type {
  SupportTicket,
  TicketStatus,
  NotificationItem,
  TrustSafetyCase,
} from "@/lib/qq/types";
import { externalProfileHandle, externalProviderLabel } from "@/lib/qq/external";

/* =========================================================================
   1. SupportScreen — Screen 99.2
   ========================================================================= */

const TICKET_STATUS_FLOW: { key: TicketStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "assigned", label: "Assigned" },
  { key: "waiting_user", label: "Waiting for user" },
  { key: "waiting_admin", label: "Waiting for Admin" },
  { key: "resolved", label: "Resolved" },
];

const TICKET_CATEGORY_LABEL: Record<SupportTicket["category"], string> = {
  payment: "Payment issue",
  contract: "Contract issue",
  verification: "Verification",
  payout: "Payout",
  dispute: "Dispute",
  bug: "Bug",
  other: "Other",
};

function ticketStatusTone(status: TicketStatus) {
  const m: Record<TicketStatus, "neutral" | "pending" | "success" | "warning" | "info" | "critical"> = {
    submitted: "neutral",
    assigned: "info",
    waiting_user: "warning",
    waiting_admin: "pending",
    resolved: "success",
    reopened: "critical",
  };
  return m[status];
}

export function SupportScreen() {
  const {
    currentUserId,
    users,
    tickets,
    contracts,
    payments,
    payouts,
    createTicket,
    addTicketMessage,
    updateTicket,
    navigate,
    currentRole,
  } = useQQ();
  const { toast } = useToast();

  const myTickets = tickets.filter((t) => t.userId === currentUserId);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");

  const selected = myTickets.find((t) => t.id === selectedId) ?? null;

  // Build auto-attach context from user's most recent contract/payment data
  const user = users.find((u) => u.id === currentUserId);
  const myContracts = contracts.filter(
    (c) => c.buyerId === currentUserId || c.proId === currentUserId,
  );
  const myPayments = payments.filter((p) =>
    myContracts.some((c) => c.id === p.contractId),
  );
  const myPayouts = payouts.filter((p) => p.proId === currentUserId);

  function latestEventForAttach(): string | undefined {
    if (myPayments[0]) return `Evidence submitted ${formatDate(myPayments[0].submittedAt)}`;
    if (myPayouts[0]) return `Payout queued ${formatDate(myPayouts[0].queuedAt)}`;
    if (myContracts[0]) return `Contract ${myContracts[0].status.replace(/_/g, " ")} ${formatDate(myContracts[0].createdAt)}`;
    return undefined;
  }

  function handleCreate(data: {
    category: SupportTicket["category"];
    subject: string;
    description: string;
  }) {
    if (!user) {
      toast({ title: "Sign in to submit a ticket", variant: "destructive" });
      return;
    }
    if (!data.subject.trim() || !data.description.trim()) {
      toast({
        title: "Subject and description required",
        variant: "destructive",
      });
      return;
    }
    const ticket: SupportTicket = {
      id: genId("TKT"),
      userId: user.id,
      userName: user.name,
      category: data.category,
      subject: data.subject.trim(),
      description: data.description.trim(),
      attachedContext: {
        contractId: myContracts[0]?.id,
        paymentReference: myPayments[0]?.id,
        status: myPayments[0]?.status.replace(/_/g, " "),
        latestEvent: latestEventForAttach(),
      },
      status: "submitted",
      createdAt: new Date().toISOString(),
      messages: [
        {
          from: "user",
          text: data.description.trim(),
          at: new Date().toISOString(),
        },
      ],
    };
    createTicket(ticket);
    toast({
      title: "Ticket submitted",
      description: `${ticket.id} created. We will respond shortly.`,
    });
    setIsCreateOpen(false);
    setSelectedId(ticket.id);
  }

  function handleReply() {
    if (!selected || !replyText.trim()) return;
    addTicketMessage(selected.id, "user", replyText.trim());
    // After user replies, status naturally moves back to waiting_admin
    if (selected.status === "waiting_user") {
      updateTicket(selected.id, { status: "waiting_admin" });
    }
    setReplyText("");
    toast({ title: "Reply sent", description: "Support will follow up." });
  }

  function handleReopen() {
    if (!selected) return;
    updateTicket(selected.id, { status: "reopened" });
    addTicketMessage(
      selected.id,
      "user",
      "Ticket reopened by user. Needs further review.",
    );
    toast({
      title: "Ticket reopened",
      description: `${selected.id} reopened. Support has been notified.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support tickets"
        description="Track and reply to your support tickets. New tickets auto-attach your contract ID, payment reference, current status, and latest event so Support can help faster."
        status={
          myTickets.length > 0 ? (
            <StatusBadge tone="info" icon>
              {myTickets.length} ticket{myTickets.length === 1 ? "" : "s"}
            </StatusBadge>
          ) : undefined
        }
      >
        {currentRole === "visitor" && <BackButton label="Back" />}
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" /> Open a new ticket
        </Button>
      </PageHeader>

      {myTickets.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No support tickets yet"
          description="Open one any time from the Help button."
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" /> Open a new ticket
            </Button>
          }
        />
      ) : (
        <div className="grid lg:grid-cols-12 gap-4">
          {/* Ticket list */}
          <div className="lg:col-span-5 space-y-3">
            <SectionCard
              title="Your tickets"
              description="Click a ticket to view the full thread."
            >
              <ul className="divide-y divide-border -mx-2">
                {myTickets.map((t) => {
                  const last = t.messages[t.messages.length - 1];
                  const isActive = t.id === selectedId;
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedId(t.id)}
                        className={cn(
                          "w-full text-left px-2 py-3 hover:bg-muted/40 rounded-md transition-colors",
                          isActive && "bg-muted/60",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {t.id}
                          </span>
                          <StatusBadge
                            tone={ticketStatusTone(t.status)}
                            icon={false}
                          >
                            {t.status.replace(/_/g, " ")}
                          </StatusBadge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {TICKET_CATEGORY_LABEL[t.category]}
                          </Badge>
                          <span className="text-sm font-medium truncate">
                            {t.subject}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{t.owner ?? "Unassigned"}</span>
                          <span>{timeAgo(t.createdAt)}</span>
                        </div>
                        {last && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
                            <span className="font-medium capitalize">
                              {last.from}:
                            </span>{" "}
                            {last.text}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>

          {/* Ticket detail */}
          <div className="lg:col-span-7">
            {selected ? (
              <SectionCard
                title={selected.subject}
                description={`${selected.id} · opened ${formatDate(selected.createdAt)}`}
                actions={
                  <StatusBadge tone={ticketStatusTone(selected.status)} icon>
                    {selected.status.replace(/_/g, " ")}
                  </StatusBadge>
                }
              >
                <TicketStatusTimeline status={selected.status} />

                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div className="font-medium">
                      {TICKET_CATEGORY_LABEL[selected.category]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Owner</div>
                    <div className="font-medium">
                      {selected.owner ?? "Unassigned"}
                    </div>
                  </div>
                </div>

                {selected.attachedContext && (
                  <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-xs">
                    <div className="font-medium text-foreground mb-1">
                      Auto-attached context
                    </div>
                    <ul className="space-y-0.5 text-muted-foreground">
                      {selected.attachedContext.contractId && (
                        <li>
                          Contract:{" "}
                          <span className="font-mono">
                            {selected.attachedContext.contractId}
                          </span>
                        </li>
                      )}
                      {selected.attachedContext.paymentReference && (
                        <li>
                          Payment reference:{" "}
                          <span className="font-mono">
                            {selected.attachedContext.paymentReference}
                          </span>
                        </li>
                      )}
                      {selected.attachedContext.status && (
                        <li>Current status: {selected.attachedContext.status}</li>
                      )}
                      {selected.attachedContext.latestEvent && (
                        <li>Latest event: {selected.attachedContext.latestEvent}</li>
                      )}
                    </ul>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Message thread */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Message thread
                  </div>
                  {selected.messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-2",
                        m.from === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {m.from === "admin" && (
                        <Avatar className="size-7 shrink-0">
                          <AvatarFallback className="bg-foreground/10 text-foreground text-[10px]">
                            Q
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                          m.from === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        <div className="text-[10px] opacity-70 mb-0.5">
                          {m.from === "user" ? "You" : "QuickQuid Support"} ·{" "}
                          {formatDateTime(m.at)}
                        </div>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {selected.status === "resolved" ? (
                  <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 mt-0.5 text-emerald-600" />
                      <div className="flex-1 text-sm">
                        <div className="font-medium text-emerald-800 dark:text-emerald-300">
                          Ticket resolved
                        </div>
                        <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                          If this isn&apos;t fully resolved, you can reopen it and
                          Support will follow up.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={handleReopen}
                        >
                          <RotateCcw className="size-3.5" /> Reopen ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="reply">Reply</Label>
                    <Textarea
                      id="reply"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Add a reply for Support…"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                      >
                        <Send className="size-4" /> Send reply
                      </Button>
                    </div>
                  </div>
                )}
              </SectionCard>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="Select a ticket"
                description="Pick a ticket on the left to view its full thread and timeline."
              />
            )}
          </div>
        </div>
      )}

      <CreateTicketDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
        hasContext={!!myContracts[0]}
        contextPreview={
          myContracts[0]
            ? `${myContracts[0].id}${myPayments[0] ? ` · ${myPayments[0].id}` : ""}`
            : undefined
        }
      />
    </div>
  );
}

function TicketStatusTimeline({ status }: { status: TicketStatus }) {
  // Reopened is a special branch — show as its own lane
  if (status === "reopened") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <RotateCcw className="size-4" /> Reopened
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          The ticket was reopened by the user. It is back in the support queue.
        </p>
      </div>
    );
  }
  const idx = TICKET_STATUS_FLOW.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {TICKET_STATUS_FLOW.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1 min-w-[84px]">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-xs font-medium",
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] text-center leading-tight",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < TICKET_STATUS_FLOW.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 min-w-[12px]",
                  done ? "bg-emerald-500" : "bg-border",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CreateTicketDialog({
  open,
  onOpenChange,
  onCreate,
  hasContext,
  contextPreview,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (data: {
    category: SupportTicket["category"];
    subject: string;
    description: string;
  }) => void;
  hasContext: boolean;
  contextPreview?: string;
}) {
  const [category, setCategory] = React.useState<SupportTicket["category"]>("payment");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setCategory("payment");
      setSubject("");
      setDescription("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Open a new ticket</DialogTitle>
          <DialogDescription>
            Tell us what happened. We auto-attach your contract ID, payment
            reference, current status, and latest event so Support can help
            faster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as SupportTicket["category"])}
            >
              <SelectTrigger id="cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment issue</SelectItem>
                <SelectItem value="contract">Contract issue</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
                <SelectItem value="payout">Payout</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subj">Subject</Label>
            <Input
              id="subj"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What happened? What do you need?"
            />
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">
              Auto-attached context
            </div>
            {hasContext ? (
              <div className="font-mono">{contextPreview}</div>
            ) : (
              <div>No active contracts or payments on your account.</div>
            )}
            <div className="mt-1">
              We never attach sensitive data (PAN, bank account, IFSC) to a
              ticket.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onCreate({ category, subject, description })
            }
            disabled={!subject.trim() || !description.trim()}
          >
            <Send className="size-4" /> Submit ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================================
   2. PublicProfileScreen — Screen 01.12 + 04.1 (public view)
   ========================================================================= */

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PublicProfileScreen() {
  const {
    viewParams,
    proProfiles,
    users,
    reviews,
    contracts,
    currentRole,
    navigate,
    goBack,
    updateTrustCase,
    currentUserId,
  } = useQQ();
  const { toast } = useToast();

  const proId = viewParams.proId ?? "PRO-2088";
  const profile = proProfiles.find((p) => p.userId === proId);
  const user = users.find((u) => u.id === proId);

  const [reportOpen, setReportOpen] = React.useState(false);
  const [githubProjects, setGithubProjects] = React.useState<{ name: string; html_url: string; description?: string; language?: string; stargazers_count?: number; forks_count?: number; topics?: string[]; pushed_at?: string; license?: { name?: string; spdx_id?: string } | null }[]>([]);
  const [githubProfile, setGithubProfile] = React.useState<{ login: string; name?: string; avatar_url?: string; bio?: string; public_repos?: number; followers?: number; html_url?: string } | null>(null);
  const [githubSyncing, setGithubSyncing] = React.useState(false);
  const githubLink = profile?.externalLinks?.find((link) => link.provider === "github");
  const syncedPreviews = profile?.externalProfilePreviews ?? [];

  React.useEffect(() => {
    const handle = githubLink ? externalProfileHandle(githubLink) : null;
    if (!handle || typeof window === "undefined") {
      setGithubProjects([]);
      setGithubProfile(null);
      setGithubSyncing(false);
      return;
    }
    let cancelled = false;
    setGithubSyncing(true);
    Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, { headers: { Accept: "application/vnd.github+json" } }).then((response) => response.ok ? response.json() : null),
      fetch(`https://api.github.com/users/${encodeURIComponent(handle)}/repos?sort=updated&per_page=6`, { headers: { Accept: "application/vnd.github+json" } }).then((response) => response.ok ? response.json() : []),
    ])
      .then(([githubUser, repos]) => {
        if (cancelled) return;
        setGithubProfile(githubUser && typeof githubUser.login === "string" ? githubUser : null);
        if (Array.isArray(repos)) setGithubProjects(repos.filter((repo) => repo && typeof repo.name === "string" && typeof repo.html_url === "string").map((repo) => ({ name: repo.name, html_url: repo.html_url, description: repo.description, language: repo.language, stargazers_count: repo.stargazers_count, forks_count: repo.forks_count, topics: Array.isArray(repo.topics) ? repo.topics.filter((topic: unknown): topic is string => typeof topic === "string").slice(0, 4) : [], pushed_at: repo.pushed_at, license: repo.license })).slice(0, 6));
      })
      .catch(() => { if (!cancelled) { setGithubProjects([]); setGithubProfile(null); } })
      .finally(() => { if (!cancelled) setGithubSyncing(false); });
    return () => { cancelled = true; };
  }, [githubLink?.url]);

  if (!profile || !user) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <ErrorState
          title="Profile not found"
          description="This professional profile is unavailable or has been removed."
        />
      </div>
    );
  }

  const isPaused = profile.availability === "paused";
  const isBooked = profile.availability === "booked";

  // Public reviews for this pro (reviews where toRole === "pro" and visible)
  const proReviews = reviews.filter(
    (r) =>
      r.toRole === "pro" &&
      r.visible &&
      contracts.some((c) => c.id === r.contractId && c.proId === proId),
  );

  // Work history — public contracts (completed) for this pro
  const workHistory = contracts.filter(
    (c) => c.proId === proId && (c.status === "completed" || c.status === "active"),
  );

  const sampleFee = profile.feeFrom ?? 25000;

  function handleReport(reason: string, note: string) {
    // For prototype, create a trust case
    const id = genId("TS");
    const tc: TrustSafetyCase = {
      id,
      complainant:
        users.find((u) => u.id === currentUserId)?.name ?? "Anonymous",
      affectedEntity: `Pro profile ${proId}`,
      allegation: reason + (note ? ` — ${note}` : ""),
      evidence: [],
      urgency: "medium",
      status: "open",
      actionHistory: [
        {
          action: "Case opened from public profile report",
          at: new Date().toISOString(),
          by:
            users.find((u) => u.id === currentUserId)?.name ?? "Anonymous",
        },
      ],
      createdAt: new Date().toISOString(),
    };
    updateTrustCase(id, tc);
    toast({
      title: "Report submitted",
      description:
        "Thank you. Our Trust & Safety team will review the profile. We may follow up if more information is needed.",
    });
    setReportOpen(false);
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="-ml-2"
      >
        <ArrowLeft className="size-4" /> Back to talent
      </Button>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Narrative 66% */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Avatar
                className="size-16 rounded-md shrink-0"
                style={{ backgroundColor: user.avatarColor ?? "#7C3AED" }}
              >
                <AvatarFallback className="rounded-md text-white font-semibold text-lg">
                  {initials(profile.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-semibold tracking-tight">{profile.displayName}</h1>
                      {user.verificationStatus === "approved" && <QuickQuidVerifiedBadge />}
                    </div>
                    <p className="text-muted-foreground">{profile.headline}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="size-3" />
                        {profile.primaryCategory}
                      </span>
                      {profile.secondaryCategory && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="size-3" />
                          {profile.secondaryCategory}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {profile.rating}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {profile.responseTime}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="size-3.5" /> Report profile
                  </Button>
                </div>

                {/* Trust labels (dimensioned) */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <TrustLabel
                    icon={<ShieldCheck className="size-3.5" />}
                    label="Identity reviewed"
                    tone="success"
                  />
                  <TrustLabel
                    icon={<ShieldCheck className="size-3.5" />}
                    label="Portfolio reviewed"
                    tone="success"
                  />
                  <TrustLabel
                    icon={
                      isPaused ? (
                        <Ban className="size-3.5" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )
                    }
                    label={isPaused ? "Paused" : isBooked ? "Booked" : "Available now"}
                    tone={isPaused ? "paused" : isBooked ? "info" : "success"}
                  />
                  <TrustLabel
                    icon={<Briefcase className="size-3.5" />}
                    label={`${profile.completedProjects} projects`}
                    tone="neutral"
                  />
                </div>
              </div>
            </div>

            {isPaused && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 mt-0.5 text-amber-600" />
                  <div className="text-amber-800 dark:text-amber-300">
                    <div className="font-medium">Currently unavailable for new work</div>
                    <p className="mt-0.5">
                      This professional is currently unavailable for new work.
                      Save the profile for later.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* About */}
          {profile.bio && (
            <SectionCard title="About" description={`Languages: ${profile.languages.join(", ")} · ${profile.timeZone}`}>
              <p className="text-sm text-foreground leading-relaxed">
                {profile.bio}
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Preferred project size
                  </div>
                  <div className="font-medium">
                    {profile.preferredProjectSize}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Preferred timeline
                  </div>
                  <div className="font-medium">
                    {profile.preferredTimeline}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response time</div>
                  <div className="font-medium">{profile.responseTime}</div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <SectionCard title="Skills">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => {
                  const approved = profile.skillVerifications?.some((item) => item.skill === s && item.status === "approved");
                  return (
                    <Badge key={s} variant="secondary" className="text-sm gap-1" title={approved ? `${s} · QuickQuid skill verified` : undefined}>
                      {approved && <CheckCircle2 className="size-3 text-[#276EF1]" aria-hidden="true" />}
                      {s}
                    </Badge>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {(profile.externalLinks?.length ?? 0) > 0 && (
            <SectionCard title="Connected proof" description="Public links are self-declared until QuickQuid records a review decision. GitHub repositories are read from the provider's public API when available.">
              <div className="grid gap-2 sm:grid-cols-2">
                {(profile.externalLinks ?? []).map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border border-border p-3 text-sm hover:border-primary/50 hover:bg-muted/30">
                    {link.provider === "github" ? <Github className="size-4" /> : <ExternalLink className="size-4" />}
                    <span className="min-w-0"><span className="flex items-center gap-1.5 font-medium">{link.label ?? externalProviderLabel(link.provider)}{link.isDemo && <Badge variant="outline" className="text-[10px]">Demo fixture</Badge>}</span><span className="block truncate text-xs text-muted-foreground">{link.url}</span></span>
                  </a>
                ))}
              </div>
              {githubLink && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Github className="size-4" /> GitHub projects {githubLink.isDemo && <Badge variant="outline" className="text-[10px]">Demo API fixture</Badge>}{githubSyncing && <span className="text-xs font-normal text-muted-foreground">Syncing public repositories…</span>}</div>
                  {githubLink.isDemo && <p className="mb-2 text-xs text-amber-700 dark:text-amber-300">Synthetic public source for prototype/API demonstration only. Replace with the Pro’s consented GitHub connection before production.</p>}
                  {githubProfile && <div className="mb-3 flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3"><Avatar className="size-10"><AvatarImage src={githubProfile.avatar_url} alt={`${githubProfile.name || githubProfile.login} GitHub avatar`} /><AvatarFallback>{initials(githubProfile.name || githubProfile.login)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 font-medium">{githubProfile.name || githubProfile.login}{githubProfile.html_url && <a href={githubProfile.html_url} target="_blank" rel="noreferrer" className="text-xs font-normal text-primary hover:underline">View GitHub</a>}</div><div className="text-xs text-muted-foreground">@{githubProfile.login}{githubProfile.bio ? ` · ${githubProfile.bio}` : ""}</div><div className="mt-1 text-[10px] text-muted-foreground">{githubProfile.public_repos ?? 0} public repos · {githubProfile.followers ?? 0} followers</div></div></div>}
                  {githubProjects.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {githubProjects.map((repo) => <a key={repo.html_url} href={repo.html_url} target="_blank" rel="noreferrer" className="rounded-md border border-border p-3 hover:border-primary/50"><div className="flex items-start justify-between gap-2"><div className="text-sm font-medium">{repo.name}</div><ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{repo.description || "Public repository"}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground"><span>{repo.language || "Code"}</span><span>★ {repo.stargazers_count ?? 0}</span><span>⑂ {repo.forks_count ?? 0}</span>{repo.license?.spdx_id && <span>{repo.license.spdx_id}</span>}{repo.pushed_at && <span>Updated {timeAgo(repo.pushed_at)}</span>}</div>{repo.topics && repo.topics.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{repo.topics.map((topic) => <Badge key={topic} variant="secondary" className="text-[10px]">{topic}</Badge>)}</div>}</a>)}
                    </div>
                  ) : !githubSyncing ? <p className="text-xs text-muted-foreground">No public repositories were returned. The link remains available for Admin review; private repositories are never requested.</p> : null}
                  {githubProjects.length > 0 && <p className="mt-3 text-[11px] text-muted-foreground">Public repository activity only. A GitHub contribution calendar needs an authenticated GraphQL connection and is not inferred from this public sync.</p>}
                </div>
              )}
              {syncedPreviews.length > 0 && <div className="mt-5 border-t border-border pt-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><ExternalLink className="size-4" /> Other provider sync previews</div><p className="mb-3 text-xs text-muted-foreground">LinkedIn, Behance, Dribbble, and portfolio metadata are shown from the profile’s provider-shaped sync record. Production adapters must replace demo fixtures with consented API responses.</p><div className="grid gap-2 sm:grid-cols-2">{syncedPreviews.map((preview) => <a key={`${preview.provider}-${preview.url}-${preview.title}`} href={preview.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border border-border hover:border-primary/50">{preview.imageUrl && <div className="h-24 bg-muted"><img src={preview.imageUrl} alt="" loading="lazy" className="size-full object-cover" /></div>}<div className="p-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium">{externalProviderLabel(preview.provider)}</span>{preview.source === "demo_fixture" && <Badge variant="outline" className="text-[10px]">Demo sync fixture</Badge>}</div><div className="mt-1 text-sm font-medium">{preview.title}</div>{preview.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{preview.description}</p>}{preview.tags && <div className="mt-2 flex flex-wrap gap-1">{preview.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>}{preview.stats && <div className="mt-2 text-[10px] text-muted-foreground">{preview.stats.join(" · ")}</div>}</div></a>)}</div></div>}
            </SectionCard>
          )}

          {/* Selected work — Portfolio (masonry gallery with lightbox) */}
          {profile.portfolioItems.length > 0 && (
            <SectionCard
              title="Selected work"
              description="Case studies and past projects. Click any item to open the full-screen gallery."
            >
              <PortfolioGallery
                items={profile.portfolioItems.map((item) => ({
                  id: item.id,
                  type: item.type === "case_study" ? "image" : item.type === "link" ? "link" : "image",
                  title: item.title,
                  description: item.description,
                  url: item.url,
                  imageUrl: item.imageUrl,
                  color: item.id === profile.portfolioItems[0]?.id ? "#7C3AED" : ["#0891B2", "#CA8A04", "#DB2777", "#0EA5E9"][parseInt(item.id.replace(/\D/g, "") || "0") % 4],
                  featured: item.featured,
                }))}
              />
            </SectionCard>
          )}

          {/* Reviews */}
          <SectionCard
            title="Reviews"
            description={
              proReviews.length > 0
                ? `${proReviews.length} verified review${proReviews.length === 1 ? "" : "s"}`
                : "Reviews appear here after a contract completes."
            }
          >
            {proReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No public reviews yet. Reviews are only published when both
                parties submit them after a contract.
              </p>
            ) : (
              <ul className="space-y-3">
                {proReviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7 rounded">
                          <AvatarFallback className="rounded bg-muted text-xs">
                            {initials(r.fromName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{r.fromName}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3.5",
                              i < r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {r.comment}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Work history */}
          <SectionCard
            title="Work history"
            description="Contracts completed or in progress on QuickQuid. Sensitive commercial values are not shown publicly."
          >
            {workHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No public work history yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {workHistory.map((c) => {
                  const m = statusMeta(c.status);
                  return (
                    <li
                      key={c.id}
                      className="py-3 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {c.briefTitle}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.buyerName} · {c.timeline}
                        </div>
                      </div>
                      <StatusBadge tone={m.tone} icon={false}>
                        {m.label}
                      </StatusBadge>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Privacy note */}
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-3.5 mt-0.5 text-emerald-600" />
              <div>
                <span className="font-medium text-foreground">
                  What stays private:
                </span>{" "}
                PAN, bank account, IFSC, billing address, GSTIN, KYC documents,
                risk signals, and internal notes are never shown on a public
                profile.
              </div>
            </div>
          </div>
        </div>

        {/* Commercial pane 33% — sticky */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Starts from</div>
                  <div className="text-xl font-semibold">
                    {formatINR(sampleFee)}
                  </div>
                </div>
                <StatusBadge
                  tone={isPaused ? "paused" : isBooked ? "info" : "success"}
                  icon={false}
                >
                  {isPaused ? "Paused" : isBooked ? "Booked" : "Available"}
                </StatusBadge>
              </div>

              <FeeBreakdown proFee={sampleFee} compact />

              <div className="mt-3 text-[11px] text-muted-foreground">
                QuickQuid deducts <strong>0% commission</strong> from this Pro.
                The buyer fee (0%) is added on top of the pro fee.
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <Button
                  className="w-full"
                  disabled={isPaused}
                  onClick={() =>
                    navigate("buyer_brief_new", { proId: profile.userId })
                  }
                >
                  <Briefcase className="size-4" /> Invite to brief
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isPaused}
                  onClick={() => navigate("buyer_messages")}
                >
                  <MessageSquare className="size-4" /> Message
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Profile saved",
                      description: `${profile.displayName} saved to your shortlist.`,
                    });
                  }}
                >
                  <Bookmark className="size-4" /> Save profile
                </Button>
              </div>

              {isPaused && (
                <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                  This professional is currently unavailable for new work. You
                  can still save the profile for later.
                </p>
              )}
            </Card>

            <Card className="p-4 text-xs">
              <div className="font-medium text-foreground mb-2">
                Quick facts
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Completed projects</span>
                  <span className="font-medium text-foreground">
                    {profile.completedProjects}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Rating</span>
                  <span className="font-medium text-foreground">
                    {profile.rating} / 5
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Avg. response</span>
                  <span className="font-medium text-foreground">
                    {profile.responseTime}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Time zone</span>
                  <span className="font-medium text-foreground">
                    {profile.timeZone}
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <ReportProfileDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={handleReport}
        proName={profile.displayName}
      />
    </div>
  );
}

function TrustLabel({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "success" | "info" | "paused" | "neutral";
}) {
  const tones: Record<string, string> = {
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
    info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
    paused:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    neutral:
      "bg-muted text-foreground border-border",
  };
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function ReportProfileDialog({
  open,
  onOpenChange,
  onSubmit,
  proName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (reason: string, note: string) => void;
  proName: string;
}) {
  const [reason, setReason] = React.useState("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setReason("");
      setNote("");
    }
  }, [open]);

  const reasons = [
    "Misrepresented identity or credentials",
    "Circumvention (off-platform payment or contact)",
    "Inappropriate or abusive communication",
    "Spam or duplicate profile",
    "Misleading portfolio work",
    "Other",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Report {proName}</DialogTitle>
          <DialogDescription>
            Help our Trust &amp; Safety team review this profile. Reports are
            confidential. False reports may affect your account standing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Additional note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Share any context that helps the review."
            />
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="size-3.5 mt-0.5" />
              <div>
                Do not include PAN, bank account, IFSC, or any other sensitive
                data in your report. These will be masked if detected.
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(reason, note)}
            disabled={!reason}
          >
            <ShieldAlert className="size-4" /> Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================================
   3. BriefDetailPublic — Screen 04.1 (brief public detail)
   ========================================================================= */

export function BriefDetailPublic() {
  const {
    viewParams,
    briefs,
    currentRole,
    currentUserId,
    users,
    navigate,
    goBack,
  } = useQQ();
  const { toast } = useToast();

  const briefId = viewParams.briefId ?? "BRF-0892";
  const brief = briefs.find((b) => b.id === briefId);
  const buyerVerified = users.some((user) => user.id === brief?.buyerId && user.verificationStatus === "approved");

  if (!brief) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <ErrorState
          title="Brief not found"
          description="This brief is no longer available, has been archived, or you may not have access."
        />
      </div>
    );
  }

  const fee = buyerFee(brief.budget);
  const total = buyerTotal(brief.budget);

  const isOwnBrief = brief.buyerId === currentUserId;
  // CTAs: Pro sees Apply/Save/Message buyer; Buyer sees read-only "View only" if own brief
  const isProViewing = currentRole === "pro";
  const isBuyerViewingOwn = currentRole === "buyer" && isOwnBrief;
  const isBuyerViewingOther = currentRole === "buyer" && !isOwnBrief;
  const m = statusMeta(brief.status);

  function handleApply() {
    if (!isProViewing) return;
    toast({
      title: "Proposal draft started",
      description: `You are applying to ${brief!.id}.`,
    });
    navigate("pro_proposals", { briefId: brief!.id });
  }

  function handleSave() {
    toast({
      title: "Brief saved",
      description: `${brief!.id} saved to your shortlist.`,
    });
  }

  function handleMessageBuyer() {
    navigate("buyer_messages", { contractId: undefined, to: brief!.buyerId });
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="-ml-2"
      >
        <ArrowLeft className="size-4" /> Back to briefs
      </Button>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Narrative 66% */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{brief.category}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {brief.visibility}
                  </Badge>
                  <StatusBadge tone={m.tone} icon={false}>
                    {m.label}
                  </StatusBadge>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {brief.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Posted by{" "}
                  <span className="font-medium text-foreground">
                    {brief.buyerName}
                  </span>{" "}
                  {buyerVerified && <QuickQuidVerifiedBadge compact className="align-middle" />} {" "}
                  · {timeAgo(brief.createdAt)} · {brief.applicants ?? 0}{" "}
                  applicant{(brief.applicants ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </Card>

          <SectionCard title="Overview" description="The objective and outcome the buyer is hiring for.">
            <p className="text-sm text-foreground leading-relaxed">
              {brief.objective}
            </p>
          </SectionCard>

          <SectionCard title="Requirements" description="Deliverables and the acceptance criteria the work will be evaluated against.">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Deliverables</h3>
                <ul className="space-y-1.5">
                  {brief.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-600 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Acceptance criteria</h3>
                <ul className="space-y-1.5">
                  {brief.acceptanceCriteria.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm">
                      <Circle className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          <div className="grid sm:grid-cols-2 gap-4">
            <SectionCard title="Timeline">
              <div className="text-sm">
                <div className="font-medium">{brief.timeline}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From contract acceptance to final delivery. Negotiable in your
                  proposal.
                </p>
              </div>
            </SectionCard>
            <SectionCard title="Exclusions">
              {brief.exclusions.length === 0 ? (
                <p className="text-sm text-muted-foreground">None declared.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {brief.exclusions.map((e) => (
                    <li key={e} className="flex items-start gap-2">
                      <Ban className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Activity" description="Public engagement signals for this brief.">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-semibold">
                  {brief.applicants ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Applicants</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{brief.timeline}</div>
                <div className="text-xs text-muted-foreground">Timeline</div>
              </div>
              <div>
                <div className="text-2xl font-semibold capitalize">
                  {brief.visibility}
                </div>
                <div className="text-xs text-muted-foreground">Visibility</div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Commercial pane 33% */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            <Card className="p-4 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  Professional fee
                </div>
                <div className="text-2xl font-semibold">
                  {formatINR(brief.budget)}
                </div>
              </div>

              <FeeBreakdown proFee={brief.budget} compact />

              <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Professional fee</span>
                  <span className="font-medium text-foreground">
                    {formatINR(brief.budget)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    QuickQuid commission (deducted from Pro)
                  </span>
                  <span className="font-medium text-foreground">
                    {formatINR(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Buyer fee (0%)</span>
                  <span className="font-medium text-foreground">
                    {formatINR(fee)}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Total before any applicable taxes
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatINR(total)}
                  </span>
                </div>
                <div className="text-[10px] pt-1">
                  Applicable taxes: Calculated by Finance if applicable. Never
                  auto-added.
                </div>
              </div>

              <Separator />

              {/* Role-based CTA */}
              {isProViewing ? (
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleApply}>
                    <Send className="size-4" /> Apply
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleSave}>
                      <Save className="size-4" /> Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMessageBuyer}
                    >
                      <MessageSquare className="size-4" /> Message buyer
                    </Button>
                  </div>
                </div>
              ) : isBuyerViewingOwn ? (
                <div className="space-y-2">
                  <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground text-center">
                    <Eye className="size-4 mx-auto mb-1 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      View only
                    </span>
                    <div className="mt-0.5">
                      You can&apos;t apply to your own brief.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate("buyer_brief_detail", { briefId: brief.id })
                    }
                  >
                    Open as owner
                  </Button>
                </div>
              ) : isBuyerViewingOther ? (
                <div className="space-y-2">
                  <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground text-center">
                    <Eye className="size-4 mx-auto mb-1 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      View only
                    </span>
                    <div className="mt-0.5">
                      Buyers can&apos;t apply to briefs. Switch to a Pro account
                      to apply.
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleSave}>
                    <Bookmark className="size-4" /> Save brief
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => navigate("role_selection")}
                  >
                    Sign in to apply
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleSave}>
                    <Bookmark className="size-4" /> Save brief
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-4 text-xs">
              <div className="font-medium text-foreground mb-1">
                Fee transparency
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>· Pro fee and Buyer fee are always shown separately.</li>
                <li>· Pro never pays QuickQuid commission.</li>
                <li>· Buyer fee is 0%.</li>
                <li>· Taxes are calculated by Finance if applicable.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. NotificationsScreen — Screen 99.1 (matrix + inbox)
   ========================================================================= */

interface MatrixRow {
  event: string;
  emailSubject: string;
  emailBody: string;
  pushText: string;
  triggeredBy: string;
}

// CRITICAL COPY RULE:
// - Payout processed: "Payout processed. Reference: XXX" — only when status is processed.
// - Payout queued: "Payout queued for Admin processing" (never "sent").
const NOTIFICATION_MATRIX: MatrixRow[] = [
  {
    event: "KYC approved",
    emailSubject: "Your identity has been verified",
    emailBody:
      "Hi {name}, your identity review is complete. You can now submit paid-work proposals.",
    pushText: "Identity verified. Proposal access unlocked.",
    triggeredBy: "KYC status → approved",
  },
  {
    event: "Contract accepted",
    emailSubject: "Contract {contractId} accepted",
    emailBody:
      "Your contract has been accepted. Funding is pending for the first milestone. Do not begin work until funding is confirmed.",
    pushText: "Contract accepted. Funding pending — do not start work yet.",
    triggeredBy: "Contract status → offer_accepted_pending_funding",
  },
  {
    event: "Payment evidence submitted",
    emailSubject: "Payment evidence submitted for {paymentId}",
    emailBody:
      "Your payment evidence is being processed via the integrated payment system. Work should not begin until funding is confirmed.",
    pushText: "Payment under processing.",
    triggeredBy: "Payment status → payment_evidence_submitted",
  },
  {
    event: "Payment confirmed",
    emailSubject: "Payment confirmed for {paymentId}",
    emailBody:
      "Your payment has been confirmed by Finance against the bank evidence. The milestone is now funded and work may begin.",
    pushText: "Payment confirmed. Milestone funded — work can begin.",
    triggeredBy: "Payment status → payment_confirmed",
  },
  {
    event: "Payment rejected",
    emailSubject: "Payment evidence could not be verified",
    emailBody:
      "We could not verify the payment evidence for {paymentId}. Reason: {reason}. Please re-submit with a corrected UTR or clearer screenshot.",
    pushText: "Payment rejected. Re-submit evidence.",
    triggeredBy: "Payment status → payment_rejected",
  },
  {
    event: "Deliverable submitted",
    emailSubject: "Deliverable submitted for {milestoneLabel}",
    emailBody:
      "A deliverable has been submitted for {milestoneLabel}. Please review within the agreed window or request changes.",
    pushText: "Deliverable submitted. Review pending.",
    triggeredBy: "Milestone status → submitted",
  },
  {
    event: "Payout queued",
    emailSubject: "Payout queued for Admin processing",
    emailBody:
      "Your payout for {milestoneLabel} has been queued for Admin processing. Funds have not yet been transferred. You will receive another notification once the payout is processed.",
    pushText: "Payout queued for Admin processing.",
    triggeredBy: "Payout status → queued",
  },
  {
    event: "Payout processed",
    emailSubject: "Payout processed. Reference: {reference}",
    emailBody:
      "Your payout has been processed. Reference: {reference}. The payout slip is available in your Payouts page.",
    pushText: "Payout processed. Reference: {reference}.",
    triggeredBy: "Payout status → processed",
  },
  {
    event: "Dispute opened",
    emailSubject: "Dispute {disputeId} opened",
    emailBody:
      "A dispute has been opened on contract {contractId}. Our mediation team will review and may request additional evidence.",
    pushText: "Dispute opened. Mediation starting.",
    triggeredBy: "Dispute status → opened",
  },
];

const NOTIF_ICON: Record<
  NotificationItem["type"],
  React.ComponentType<{ className?: string }>
> = {
  proposal_received: FileText,
  payment_submitted: Clock,
  payment_confirmed: CheckCircle2,
  payment_rejected: AlertTriangle,
  payout_processed: Banknote,
  payout_queued: Banknote,
  dispute_update: Scale,
  dispute_opened: Scale,
  kyc_result: ShieldCheck,
  contract_accepted: CheckCircle2,
  deliverable_submitted: FileText,
  message: MessageSquare,
  sla_warning: AlertTriangle,
};

export function NotificationsScreen() {
  const {
    notifications,
    currentUserId,
    currentRole,
    navigate,
    markNotificationRead,
    markAllRead,
  } = useQQ();
  const { toast } = useToast();

  const myNotifs = notifications
    .filter((n) => n.userId === currentUserId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const unread = myNotifs.filter((n) => !n.read).length;

  function handleClick(n: NotificationItem) {
    if (n.link) {
      const [view, qs] = n.link.split("?");
      const params: Record<string, string> = {};
      qs?.split("&").forEach((p) => {
        const [k, v] = p.split("=");
        if (k && v) params[k] = v;
      });
      navigate(view as any, params);
    }
    markNotificationRead(n.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Email & push previews for every triggered event, plus your live notification inbox. We use actual recorded status — we never say 'sent to your bank' before transfer confirmation."
        status={
          unread > 0 ? (
            <StatusBadge tone="warning" icon>
              {unread} unread
            </StatusBadge>
          ) : (
            <StatusBadge tone="success" icon>
              All caught up
            </StatusBadge>
          )
        }
      >
        {currentRole === "visitor" && <BackButton label="Back" />}
        {myNotifs.length > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCircle2 className="size-4" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {/* Email & Push matrix */}
      <SectionCard
        title="Email & Push notification matrix"
        description="Every triggered notification type with its actual copy. Payout 'processed' is only sent once the transfer is confirmed; 'queued' never claims funds were sent."
      >
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Event</th>
                <th className="px-2 py-2 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3" /> Email preview
                  </span>
                </th>
                <th className="px-2 py-2 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Smartphone className="size-3" /> Push preview
                  </span>
                </th>
                <th className="px-2 py-2 font-medium">Triggered by status</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_MATRIX.map((row) => (
                <tr
                  key={row.event}
                  className="border-b border-border align-top hover:bg-muted/30"
                >
                  <td className="px-2 py-3 font-medium whitespace-nowrap">
                    {row.event}
                  </td>
                  <td className="px-2 py-3">
                    <div className="font-medium text-foreground">
                      {row.emailSubject}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {row.emailBody}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-xs text-foreground">
                    {row.pushText}
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {row.triggeredBy}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Copy rule callouts */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-600" />
              <div>
                <span className="font-medium text-emerald-800 dark:text-emerald-300">
                  Copy rule — Payout processed:
                </span>{" "}
                Sent only when status is{" "}
                <code className="font-mono">processed</code>. The email says
                &quot;Payout processed. Reference: XXX&quot; — never before
                transfer confirmation.
              </div>
            </div>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-3.5 mt-0.5 text-amber-600" />
              <div>
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  Copy rule — Payout queued:
                </span>{" "}
                Says &quot;Payout queued for Admin processing&quot; — never
                &quot;sent to your bank.&quot; Funds have not been transferred
                yet.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Inbox */}
      <SectionCard
        title="Your notification inbox"
        description={
          myNotifs.length === 0
            ? "No notifications yet for this account."
            : `${myNotifs.length} notification${myNotifs.length === 1 ? "" : "s"} · ${unread} unread`
        }
        actions={
          myNotifs.length > 0 && unread > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCircle2 className="size-3.5" /> Mark all read
            </Button>
          ) : undefined
        }
      >
        {myNotifs.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When something happens — a contract is accepted, a payment is confirmed, a payout is processed — you'll see it here."
          />
        ) : (
          <ul className="divide-y divide-border -mx-2 max-h-[640px] overflow-y-auto pr-1">
            {myNotifs.map((n) => {
              const Icon = NOTIF_ICON[n.type];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={cn(
                      "flex w-full items-start gap-3 px-2 py-3 text-left hover:bg-muted/40 rounded-md transition-colors",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 rounded-full p-1.5 shrink-0",
                        n.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm truncate",
                            n.read
                              ? "font-medium text-foreground"
                              : "font-semibold text-foreground",
                          )}
                        >
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{timeAgo(n.createdAt)}</span>
                        {n.link && (
                          <span className="inline-flex items-center gap-0.5">
                            <Eye className="size-3" /> Click to open
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
