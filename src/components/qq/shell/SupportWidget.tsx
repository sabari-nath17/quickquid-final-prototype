"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQQ } from "@/lib/qq/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  HelpCircle, X, Upload, Paperclip, Image as ImageIcon, FileText, Trash2,
  Highlighter, AlertCircle, CheckCircle2, Loader2, ChevronRight,
} from "lucide-react";
import { genId, formatDateTime } from "@/lib/qq/format";

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: "screenshot" | "file";
  status: "uploading" | "done" | "error";
  color?: string;
}

export function SupportWidget() {
  const { supportWidgetOpen, setSupportWidget, currentUserId, users, contracts, payments, payouts, kyc, proposals, gigs, createTicket, navigate } = useQQ();
  const { toast } = useToast();
  const [category, setCategory] = React.useState("payment");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachedFile[]>([]);
  const [highlightMode, setHighlightMode] = React.useState(false);
  const [selectedContractId, setSelectedContractId] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const screenshotInputRef = React.useRef<HTMLInputElement>(null);

  const user = users.find((u) => u.id === currentUserId);
  const myContracts = contracts.filter((c) => c.buyerId === currentUserId || c.proId === currentUserId);
  const myPayments = payments.filter((p) => myContracts.some((c) => c.id === p.contractId));
  const myPayouts = payouts.filter((p) => p.proId === currentUserId || myContracts.some((c) => c.id === p.contractId));
  const myKyc = kyc.find((k) => k.userId === currentUserId);
  const myProposals = proposals.filter((p) => p.proId === currentUserId);
  const myGigs = gigs.filter((g) => g.proId === currentUserId);

  const selectedContract = myContracts.find((c) => c.id === selectedContractId);
  const selectedPayment = myPayments.find((p) => p.contractId === selectedContractId);

  function addFiles(files: FileList | null, type: "screenshot" | "file") {
    if (!files) return;
    Array.from(files).forEach((f, i) => {
      const id = `att-${Date.now()}-${i}`;
      const sizeStr = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`;
      const entry: AttachedFile = { id, name: f.name, size: sizeStr, type, status: "uploading" };
      setAttachments((prev) => [...prev, entry]);
      // Simulate upload
      setTimeout(() => {
        setAttachments((prev) => prev.map((a) => a.id === id ? { ...a, status: "done", color: ["#7C3AED", "#0891B2", "#CA8A04", "#DB2777"][i % 4] } : a));
      }, 800 + Math.random() * 600);
    });
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function buildContextLog() {
    const log: string[] = [];
    log.push(`USER: ${user?.name ?? "Unknown"} (${user?.id ?? "—"})`);
    log.push(`ROLE: ${user?.role ?? "—"}`);
    log.push(`EMAIL: ${user?.email ?? "—"}`);
    log.push(`TIME: ${new Date().toISOString()}`);
    log.push(`CATEGORY: ${category}`);
    log.push("");

    if (selectedContract) {
      log.push(`CONTRACT: ${selectedContract.id}`);
      log.push(`  Title: ${selectedContract.briefTitle}`);
      log.push(`  Status: ${selectedContract.status.replace(/_/g, " ")}`);
      log.push(`  Buyer: ${selectedContract.buyerName} (${selectedContract.buyerId})`);
      log.push(`  Pro: ${selectedContract.proName} (${selectedContract.proId})`);
      log.push(`  Pro fee: ₹${selectedContract.totalProFee.toLocaleString("en-IN")}`);
      log.push(`  Milestones: ${selectedContract.milestones.length}`);
      selectedContract.milestones.forEach((m, i) => {
        log.push(`    M${i + 1}: ${m.description} — ${m.status.replace(/_/g, " ")} — ₹${m.proFee.toLocaleString("en-IN")}`);
      });
      log.push("");
    }

    if (selectedPayment) {
      log.push(`PAYMENT: ${selectedPayment.id}`);
      log.push(`  Contract: ${selectedPayment.contractId}`);
      log.push(`  Milestone: ${selectedPayment.milestoneLabel}`);
      log.push(`  Amount: ₹${selectedPayment.amountDue.toLocaleString("en-IN")}`);
      log.push(`  UTR: ${selectedPayment.utr}`);
      log.push(`  Method: ${selectedPayment.method}`);
      log.push(`  Status: ${selectedPayment.status.replace(/_/g, " ")}`);
      log.push(`  Submitted: ${formatDateTime(selectedPayment.submittedAt)}`);
      if (selectedPayment.resolvedAt) log.push(`  Resolved: ${formatDateTime(selectedPayment.resolvedAt)}`);
      log.push("");
    }

    if (myPayouts.length > 0) {
      log.push(`PAYOUTS (${myPayouts.length}):`);
      myPayouts.slice(0, 5).forEach((p) => {
        log.push(`  ${p.id}: ${p.milestoneLabel} — ₹${p.netPayout.toLocaleString("en-IN")} — ${p.status.replace(/_/g, " ")}`);
      });
      log.push("");
    }

    if (myKyc) {
      log.push(`KYC: ${myKyc.id}`);
      log.push(`  Status: ${myKyc.status.replace(/_/g, " ")}`);
      log.push(`  Submitted: ${formatDateTime(myKyc.submittedAt)}`);
      if (myKyc.rejectionReason) log.push(`  Rejection: ${myKyc.rejectionReason}`);
      log.push("");
    }

    if (myProposals.length > 0) {
      log.push(`PROPOSALS: ${myProposals.length} total`);
      myProposals.slice(0, 3).forEach((p) => {
        log.push(`  ${p.id}: ${p.briefTitle} — ${p.status.replace(/_/g, " ")} — ₹${p.proposedFee.toLocaleString("en-IN")}`);
      });
      log.push("");
    }

    if (myGigs.length > 0) {
      log.push(`GIGS: ${myGigs.length} total`);
      myGigs.slice(0, 3).forEach((g) => {
        log.push(`  ${g.id}: ${g.title} — ${g.status.replace(/_/g, " ")}`);
      });
      log.push("");
    }

    return log.join("\n");
  }

  function submit() {
    if (!user) { toast({ title: "Sign in to submit a ticket", variant: "destructive" }); return; }
    if (!subject.trim() || !description.trim()) { toast({ title: "Subject and description required", variant: "destructive" }); return; }
    if (attachments.some((a) => a.status === "uploading")) { toast({ title: "Wait for uploads to finish", variant: "destructive" }); return; }

    setSubmitting(true);
    const contextLog = buildContextLog();
    const fileNames = attachments.map((a) => `${a.type}: ${a.name} (${a.size})`);

    const ticket = {
      id: genId("TKT"),
      userId: user.id,
      userName: user.name,
      category: category as any,
      subject: subject.trim(),
      description: description.trim(),
      attachedContext: {
        contractId: selectedContractId || myContracts[0]?.id,
        paymentReference: selectedPayment?.id || myPayments[0]?.id,
        status: selectedPayment?.status.replace(/_/g, " ") || (selectedContract?.status.replace(/_/g, " ")),
        latestEvent: selectedPayment?.submittedAt || selectedContract?.createdAt,
        contextLog,
        attachments: fileNames,
        userRole: user.role,
        userEmail: user.email,
      },
      status: "submitted" as const,
      createdAt: new Date().toISOString(),
      messages: [{ from: "user" as const, text: description.trim(), at: new Date().toISOString() }],
    };
    createTicket(ticket);
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: "Ticket submitted", description: `${ticket.id} created with ${attachments.length} attachment(s). Admin will see full context logs.` });
      setSubject(""); setDescription(""); setCategory("payment"); setAttachments([]); setSelectedContractId("");
      setSupportWidget(false);
      navigate("support");
    }, 600);
  }

  function resetForm() {
    setSubject(""); setDescription(""); setCategory("payment"); setAttachments([]); setSelectedContractId(""); setHighlightMode(false);
  }

  return (
    <>
      <button
        onClick={() => setSupportWidget(true)}
        className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background shadow-lg px-3.5 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
        aria-label="Help"
      >
        <HelpCircle className="size-3.5" /> Help
      </button>
      <Sheet open={supportWidgetOpen} onOpenChange={(open) => { setSupportWidget(open); if (!open) resetForm(); }}>
        <SheetContent className="w-full sm:max-w-[480px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><HelpCircle className="size-4" /> Get help</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto scroll-area-thin space-y-4 p-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="cat">Category <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment issue</SelectItem>
                  <SelectItem value="contract">Contract issue</SelectItem>
                  <SelectItem value="verification">Verification / KYC</SelectItem>
                  <SelectItem value="payout">Payout issue</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="bug">Bug / UI issue</SelectItem>
                  <SelectItem value="priority">Priority boost</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Related contract selector */}
            {myContracts.length > 0 && (
              <div className="space-y-1.5">
                <Label>Related contract (optional)</Label>
                <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                  <SelectTrigger><SelectValue placeholder="Select a contract for context" /></SelectTrigger>
                  <SelectContent>
                    {myContracts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.briefTitle} ({c.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="subj">Subject <span className="text-destructive">*</span></Label>
              <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of the issue" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="desc">Describe the issue <span className="text-destructive">*</span></Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What happened? What were you trying to do? What do you need?" />
            </div>

            {/* Screenshot upload */}
            <div className="space-y-2">
              <Label>Add a screenshot</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-10"
                  onClick={() => screenshotInputRef.current?.click()}
                >
                  <ImageIcon className="size-3.5" /> Capture / upload screenshot
                </Button>
                <Button
                  type="button"
                  variant={highlightMode ? "default" : "outline"}
                  size="sm"
                  className="h-10"
                  onClick={() => setHighlightMode(!highlightMode)}
                  title="Toggle highlight mode"
                >
                  <Highlighter className="size-3.5" />
                </Button>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files, "screenshot")}
                />
              </div>
              {highlightMode && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Highlighter className="size-3" />
                  Highlight mode on — after upload, tap a screenshot to mark the problem area. The highlighted version is attached.
                </p>
              )}
            </div>

            {/* Additional file upload */}
            <div className="space-y-2">
              <Label>Attach files (optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-10 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-3.5" /> Add files (PDF, docs, logs — max 25MB each)
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files, "file")}
              />
            </div>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                <Label>Attachments ({attachments.length})</Label>
                <ul className="space-y-1.5">
                  {attachments.map((att) => (
                    <li key={att.id} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                      {att.status === "uploading" ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : att.status === "done" ? (
                        att.type === "screenshot" ? <ImageIcon className="size-4 text-primary" /> : <FileText className="size-4 text-muted-foreground" />
                      ) : (
                        <AlertCircle className="size-4 text-destructive" />
                      )}
                      <span className="flex-1 truncate">{att.name}</span>
                      <Badge variant="outline" className="text-[10px]">{att.type}</Badge>
                      <span className="text-xs text-muted-foreground">{att.size}</span>
                      <button onClick={() => removeAttachment(att.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Auto-attached context preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-3.5 text-success" />
                Auto-attached for Admin
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>User: {user?.name} ({user?.id}) · {user?.role}</div>
                <div>Email: {user?.email}</div>
                {selectedContract && <div>Contract: {selectedContract.id} — {selectedContract.status.replace(/_/g, " ")}</div>}
                {selectedPayment && <div>Payment: {selectedPayment.id} — {selectedPayment.status.replace(/_/g, " ")}</div>}
                {myPayouts.length > 0 && <div>Payouts: {myPayouts.length} on file</div>}
                {myKyc && <div>KYC: {myKyc.status.replace(/_/g, " ")}</div>}
                {myProposals.length > 0 && <div>Proposals: {myProposals.length}</div>}
                {myGigs.length > 0 && <div>Gigs: {myGigs.length}</div>}
              </div>
              <div className="text-[10px] text-muted-foreground italic">
                Full context log (user ID, role, email, contract milestones, payment UTR, payout refs, KYC status, proposal/gig history) is attached to the ticket for Admin review.
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="ghost" onClick={() => setSupportWidget(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting || !subject.trim() || !description.trim()} className="flex-1">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <><HelpCircle className="size-4" /> Submit ticket with {attachments.length} attachment(s)</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
