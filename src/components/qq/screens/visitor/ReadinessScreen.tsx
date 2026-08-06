"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ReadinessChecklist, PageHeader, SectionCard, MaskedField } from "@/components/qq/shared";
import { StatusBadge } from "@/components/qq/shared/StatusBadge";
import { EvidenceDropzone } from "@/components/qq/shared/EvidenceDropzone";
import { genId, maskAccount, maskIfsc, maskPan } from "@/lib/qq/format";
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileText, Wallet, ShieldCheck, ArrowRight, Info, AlertCircle } from "lucide-react";
import type { KycSubmission } from "@/lib/qq/types";

export function ReadinessScreen() {
  const { currentRole, currentUserId, proProfiles, buyerProfiles, kyc, navigate, setKycModal, updateKyc, addAudit } = useQQ();
  const isPro = currentRole === "pro";
  const isBuyer = currentRole === "buyer";
  const proProfile = proProfiles.find((p) => p.userId === currentUserId);
  const buyerProfile = buyerProfiles.find((b) => b.userId === currentUserId);
  const myKyc = kyc.find((k) => k.userId === currentUserId);

  const proItems = [
    { label: "Account created", done: !!currentUserId },
    { label: "Personal profile", done: isPro ? !!proProfile?.bio : !!buyerProfile?.companyDescription, note: "Complete your profile so the right people can evaluate you quickly." },
    { label: "Identity review", done: myKyc?.status === "approved", note: myKyc?.status === "under_review" ? "Under Admin review. Target: 24 hours." : myKyc?.status === "rejected" ? `Rejected: ${myKyc.rejectionReason}` : undefined },
    { label: "Category evidence", done: isPro ? (proProfile?.portfolioItems.length ?? 0) > 0 : true },
    { label: "Payout details", done: isPro ? proProfile?.payoutReadiness === "approved" : true, note: isPro && proProfile?.payoutReadiness === "approved" ? "Approved payout details on file" : "Add payout details before applying for paid work" },
    { label: "Admin review", done: isPro ? proProfile?.payoutReadiness === "approved" : true },
    { label: "Proposal access", done: isPro ? proProfile?.payoutReadiness === "approved" : true, note: "Your profile is visible, but proposal access may remain limited until the required review steps are complete." },
  ];

  const buyerItems = [
    { label: "Account created", done: !!currentUserId },
    { label: "Profile ready for briefs", done: !!buyerProfile?.companyDescription },
    { label: "Organization / billing details", done: !!buyerProfile?.orgDetails, note: "Required before funding a milestone. Billing address and GSTIN stay private." },
    { label: "Payment instructions acknowledged", done: !!buyerProfile?.orgDetails, note: "Manual payment via UTR/transaction reference." },
    { label: "Create a brief", done: false, note: "Start with a clear brief or find a professional directly." },
  ];

  const items = isPro ? proItems : buyerItems;
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const blocked = isPro ? proProfile?.payoutReadiness !== "approved" : !buyerProfile?.orgDetails;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Readiness dashboard"
        description="Complete these steps to unlock the full QuickQuid experience. We do not block browsing or drafting behind full KYC — only high-risk actions are gated."
        status={<StatusBadge tone={pct === 100 ? "success" : pct >= 50 ? "pending" : "warning"} icon>{pct === 100 ? "Ready" : `${pct}% complete`}</StatusBadge>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title={isPro ? "Pro readiness" : "Buyer readiness"} description="Role-specific tasks. High-risk actions are gated until complete.">
            <ReadinessChecklist items={items} />
            <div className="mt-4 flex flex-wrap gap-2">
              {isPro ? (
                <>
                  {!proProfile?.payoutReadiness || proProfile.payoutReadiness !== "approved" ? (
                    <Button onClick={() => setKycModal(true)}><ShieldCheck className="size-4" /> Add verification & payout details</Button>
                  ) : (
                    <Button onClick={() => navigate("pro_profile")}>Edit profile</Button>
                  )}
                  <Button variant="outline" onClick={() => navigate("pro_briefs")}>Browse briefs</Button>
                  {proProfile?.payoutReadiness === "approved" && <Button variant="outline" onClick={() => navigate("pro_dashboard")}>Go to dashboard <ArrowRight className="size-4" /></Button>}
                </>
              ) : (
                <>
                  <Button onClick={() => navigate("buyer_profile")}>Complete profile</Button>
                  <Button variant="outline" onClick={() => navigate("buyer_brief_new")}>Create a brief</Button>
                  <Button variant="outline" onClick={() => navigate("buyer_talent")}>Search talent</Button>
                </>
              )}
            </div>
          </SectionCard>

          {isPro && myKyc && (
            <SectionCard title="Verification status">
              <KycStatusCard kyc={myKyc} onResubmit={() => setKycModal(true)} />
            </SectionCard>
          )}

          {isPro && proProfile?.payoutReadiness === "approved" && (
            <SectionCard title="Payout details" description="Approved payout details. Editing pauses new proposals pending re-verification.">
              <div className="grid sm:grid-cols-2 gap-3">
                <MaskedField label="Beneficiary name" value={proProfile.payoutDetails?.beneficiaryName ?? "—"} masked={false} />
                <MaskedField label="Bank" value={proProfile.payoutDetails?.bankName ?? "—"} masked={false} />
                <MaskedField label="Account number" value={proProfile.payoutDetails?.accountNumberMasked ?? "—"} masked canReveal onReveal={() => { addAudit({ adminId: currentUserId ?? "", adminRole: "pro", action: "Masked reveal", entity: "Payout details", entityId: currentUserId ?? "", reason: "Self-view" }); }} onUnmask={() => {}} />
                <MaskedField label="IFSC" value={proProfile.payoutDetails?.ifscMasked ?? "—"} masked canReveal onReveal={() => {}} onUnmask={() => {}} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setKycModal(true)}>Update payout details</Button>
                <span className="text-xs text-muted-foreground self-center">Status changes to Pending Admin Re-verification on save.</span>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="What stays private">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> PAN, bank account, IFSC are masked by default.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> Billing address & GSTIN never appear on public profile.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> Reveal of sensitive data requires a reason and creates an audit event.</li>
              <li className="flex items-start gap-2"><ShieldCheck className="size-4 mt-0.5 text-emerald-600" /> No wallet, no automated escrow in v0.1.</li>
            </ul>
          </SectionCard>

          {blocked && (
            <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 mt-0.5 text-amber-600" />
                <div className="text-sm">
                  <div className="font-medium text-amber-800 dark:text-amber-300">{isPro ? "Payout readiness required" : "Billing details required"}</div>
                  <p className="text-amber-700 dark:text-amber-400 mt-1">{isPro ? "Add payout details before applying for paid-work proposals. QuickQuid needs approved payout details before you can submit." : "Add organization/billing details before funding an accepted milestone."}</p>
                  <Button size="sm" className="mt-2" onClick={() => isPro ? setKycModal(true) : navigate("buyer_profile")}>{isPro ? "Add payout details" : "Add billing details"}</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <KycModal />
    </div>
  );
}

function KycStatusCard({ kyc, onResubmit }: { kyc: KycSubmission; onResubmit: () => void }) {
  const { navigate } = useQQ();
  if (kyc.status === "approved") {
    return (
      <div className="flex items-start gap-3">
        <CheckCircle2 className="size-5 text-emerald-600 mt-0.5" />
        <div>
          <div className="font-medium">Verification approved</div>
          <p className="text-sm text-muted-foreground">Your identity and payout details are verified. You can submit paid-work proposals.</p>
        </div>
      </div>
    );
  }
  if (kyc.status === "under_review") {
    return (
      <div className="flex items-start gap-3">
        <Clock className="size-5 text-amber-600 mt-0.5" />
        <div>
          <div className="font-medium">Under Admin review</div>
          <p className="text-sm text-muted-foreground">Your verification is under Admin review. Typical review target: 24 hours.</p>
          {kyc.riskFlag && (
            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              <AlertCircle className="size-3 inline mr-1" /> Risk signal: {kyc.riskFlag.signal}. This is a signal, not a decision.
            </div>
          )}
        </div>
      </div>
    );
  }
  if (kyc.status === "rejected") {
    return (
      <div className="flex items-start gap-3">
        <XCircle className="size-5 text-destructive mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-destructive">Verification rejected</div>
          <p className="text-sm text-muted-foreground">We could not verify this submission. Reason: {kyc.rejectionReason ?? "Document unclear"}.</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={onResubmit}>Resubmit</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("support")}>Contact Support</Button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function KycModal() {
  const { kycModalOpen, setKycModal, currentUserId, users, kyc, updateKyc, updateProProfile, proProfiles, addAudit } = useQQ();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [pan, setPan] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");
  const [beneficiary, setBeneficiary] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [docName, setDocName] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const user = users.find((u) => u.id === currentUserId);
  const existing = kyc.find((k) => k.userId === currentUserId);
  const steps = ["Identity", "Professional details", "Payout details"];

  React.useEffect(() => {
    if (kycModalOpen) {
      setStep(0);
      if (existing) {
        setBeneficiary(existing.beneficiaryName);
        setBankName(existing.bankName || "");
      }
    }
  }, [kycModalOpen]);

  function submit() {
    if (!user || !consent) { toast({ title: "Please provide consent", variant: "destructive" }); return; }
    setSubmitting(true);
    setTimeout(() => {
      const id = existing?.id ?? genId("KYC");
      const sub: KycSubmission = {
        id,
        userId: user.id,
        userName: user.name,
        role: user.role,
        identityDocName: docName || "id_document.jpg",
        identityDocStatus: "uploaded",
        panMasked: maskPan(pan || "ABCDE1234F"),
        accountNumberMasked: maskAccount(account || "1234567890"),
        ifscMasked: maskIfsc(ifsc || "HDFC0001234"),
        beneficiaryName: beneficiary || user.name,
        status: "under_review",
        submittedAt: new Date().toISOString(),
      };
      updateKyc(id, sub);
      if (user.role === "pro") {
        updateProProfile(user.id, { payoutReadiness: "under_review", payoutDetails: { beneficiaryName: beneficiary || user.name, accountNumberMasked: maskAccount(account || "1234567890"), ifscMasked: maskIfsc(ifsc || "HDFC0001234"), bankName: bankName || "HDFC Bank" } });
      }
      addAudit({ adminId: user.id, adminRole: user.role, action: "KYC submitted", entity: "KYC", entityId: id, newStatus: "under_review" });
      setSubmitting(false);
      setKycModal(false);
      toast({ title: "Verification submitted", description: "Under Admin review. Typical target: 24 hours." });
    }, 1000);
  }

  return (
    <Dialog open={kycModalOpen} onOpenChange={setKycModal}>
      <DialogContent className="max-w-[560px] max-h-[720px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verification & payout details</DialogTitle>
          <DialogDescription>Three steps: identity, professional details, payout. All sensitive data is masked by default.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i < step ? <CheckCircle2 className="size-4" /> : i + 1}</div>
              <span className={`text-xs ${i <= step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Identity document (Aadhaar / PAN / Passport)</Label>
              <EvidenceDropzone label="Drop ID document or click to upload" accept="JPG, PNG, PDF · max 10MB" onUploaded={(f) => setDocName(f.name)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pan">PAN (masked after submit)</Label>
              <Input id="pan" value={pan} onChange={(e) => setPan(e.target.value)} placeholder="ABCDE1234F" maxLength={10} />
              <p className="text-xs text-muted-foreground">PAN is masked as AB•••••CD by default. Reveal requires reason + audit.</p>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="prof">Professional headline</Label>
              <Input id="prof" defaultValue={user?.headline ?? ""} placeholder="e.g. Product Designer and UX Researcher" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat">Primary category</Label>
              <Select defaultValue="Product Design">
                <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Design">Product Design</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="UX Research">UX Research</SelectItem>
                  <SelectItem value="Frontend Engineering">Frontend Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Short bio (min 100 chars)</Label>
              <Textarea id="bio" rows={3} placeholder="Describe your expertise…" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ben">Beneficiary name</Label>
              <Input id="ben" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="As per bank record" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="acct">Account number</Label>
                <Input id="acct" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="1234567890" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ifsc">IFSC</Label>
                <Input id="ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="HDFC0001234" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank">Bank name</Label>
              <Input id="bank" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="HDFC Bank" />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              <span>I consent to QuickQuid verifying these details and storing them masked for payout processing. I understand payout is processed manually in v0.1.</span>
            </label>
          </div>
        )}

        <DialogFooter className="flex-row justify-between">
          <Button variant="ghost" onClick={() => setKycModal(false)}>Cancel</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit for review"}</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
