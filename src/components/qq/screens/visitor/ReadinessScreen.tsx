"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ReadinessChecklist, PageHeader, SectionCard, MaskedField } from "@/components/qq/shared";
import { StatusBadge } from "@/components/qq/shared/StatusBadge";
import { EvidenceDropzone } from "@/components/qq/shared/EvidenceDropzone";
import { genId, maskAccount, maskIfsc, maskPan } from "@/lib/qq/format";
import { CheckCircle2, Clock, AlertTriangle, XCircle, FileText, Wallet, ShieldCheck, ArrowRight, Info, AlertCircle } from "lucide-react";
import type { KycSubmission } from "@/lib/qq/types";

export function ReadinessScreen() {
  const { currentRole, currentUserId, proProfiles, buyerProfiles, kyc, navigate, setKycModal, addAudit } = useQQ();
  const isPro = currentRole === "pro";
  const proProfile = proProfiles.find((p) => p.userId === currentUserId);
  const buyerProfile = buyerProfiles.find((b) => b.userId === currentUserId);
  const myKyc = kyc.find((k) => k.userId === currentUserId);

  React.useEffect(() => {
    if (currentRole === "visitor") navigate("role_selection", undefined, { replace: true });
  }, [currentRole, navigate]);

  if (currentRole === "visitor") return null;

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
    { label: "Client verification", done: myKyc?.status === "approved", note: myKyc?.status === "under_review" ? "Authorized signatory and organization evidence are under Admin review." : "A verified client badge is shown only after Admin approval." },
    { label: "Payment instructions acknowledged", done: !!buyerProfile?.orgDetails, note: "Manual payment via UTR/transaction reference." },
    { label: "Create a brief", done: false, note: "Start with a clear brief or find a professional directly." },
  ];

  const items = isPro ? proItems : buyerItems;
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  const blocked = isPro ? proProfile?.payoutReadiness !== "approved" : !buyerProfile?.orgDetails || myKyc?.status !== "approved";

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
                  {!proProfile?.skills.length ? (
                    <Button onClick={() => navigate("pro_profile")}><ShieldCheck className="size-4" /> Add skills before verification</Button>
                  ) : !proProfile?.payoutReadiness || proProfile.payoutReadiness !== "approved" ? (
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
                  {myKyc?.status !== "approved" && <Button variant="outline" onClick={() => setKycModal(true)}><ShieldCheck className="size-4" /> Verify client account</Button>}
                  <Button variant="outline" onClick={() => navigate("buyer_brief_new")}>Create a brief</Button>
                  <Button variant="outline" onClick={() => navigate("buyer_talent")}>Search talent</Button>
                </>
              )}
            </div>
          </SectionCard>

          {myKyc && (
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
                  <div className="font-medium text-amber-800 dark:text-amber-300">{isPro ? "Payout readiness required" : "Client readiness required"}</div>
                  <p className="text-amber-700 dark:text-amber-400 mt-1">{isPro ? "Add payout details and skill evidence before applying for paid-work proposals." : "Add organization/billing details and submit authorized-signatory evidence before funding an accepted milestone."}</p>
                  <Button size="sm" className="mt-2" onClick={() => setKycModal(true)}>{isPro ? "Add verification details" : "Verify client account"}</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
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
          <p className="text-sm text-muted-foreground">{kyc.role === "pro" ? "Your identity, skill evidence, and payout details are approved." : "Your authorized signatory and organization details are approved. Your client account now shows QuickQuid Verified."}</p>
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
          <p className="text-sm text-muted-foreground">Your {kyc.role === "pro" ? "identity and skill evidence" : "client and organization evidence"} is under Admin review. Typical review target: 24 hours.</p>
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
  const { kycModalOpen, setKycModal, currentUserId, users, kyc, updateKyc, updateProProfile, updateBuyerProfile, updateUserVerification, proProfiles, buyerProfiles, addAudit } = useQQ();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [pan, setPan] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");
  const [beneficiary, setBeneficiary] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [docName, setDocName] = React.useState("");
  const [skillEvidenceName, setSkillEvidenceName] = React.useState("");
  const [organizationName, setOrganizationName] = React.useState("");
  const [organizationEvidenceName, setOrganizationEvidenceName] = React.useState("");
  const [billingAddress, setBillingAddress] = React.useState("");
  const [billingContact, setBillingContact] = React.useState("");
  const [gstin, setGstin] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const user = users.find((u) => u.id === currentUserId);
  const existing = kyc.find((k) => k.userId === currentUserId);
  const proProfile = proProfiles.find((p) => p.userId === currentUserId);
  const buyerProfile = buyerProfiles.find((p) => p.userId === currentUserId);
  const isPro = user?.role === "pro";
  const steps = isPro ? ["Identity", "Skills & evidence", "Payout details"] : ["Signatory", "Organization", "Billing details"];
  const stepReady = step === 0
    ? !!(docName || existing?.identityDocName) && (pan.trim().length === 10 || !!existing?.panMasked)
    : step === 1
      ? isPro
        ? !!proProfile?.skills.length && !!(skillEvidenceName || existing?.skillVerifications?.some((item) => item.evidence))
        : !!organizationName.trim() && !!(organizationEvidenceName || existing?.organizationEvidenceName)
      : !!beneficiary.trim() && !!(account.trim() || existing?.accountNumberMasked) && !!(ifsc.trim() || existing?.ifscMasked) && !!bankName.trim() && (isPro || (!!billingAddress.trim() && !!billingContact.trim())) && consent;

  React.useEffect(() => {
    if (kycModalOpen) {
      setStep(0);
      if (existing) {
        setBeneficiary(existing.beneficiaryName);
      }
      if (proProfile?.payoutDetails?.bankName) {
        setBankName(proProfile.payoutDetails.bankName);
      }
      setOrganizationName(existing?.organizationName ?? buyerProfile?.orgDetails?.companyName ?? buyerProfile?.displayName ?? "");
      setOrganizationEvidenceName(existing?.organizationEvidenceName ?? "");
      setBillingAddress(buyerProfile?.orgDetails?.billingAddress ?? "");
      setBillingContact(buyerProfile?.orgDetails?.billingContact ?? user?.email ?? "");
      setGstin(buyerProfile?.orgDetails?.gstin ?? "");
    }
  }, [kycModalOpen, existing, proProfile, buyerProfile, user]);

  function submit() {
    if (!user || !stepReady) { toast({ title: "Complete the required verification fields", variant: "destructive" }); return; }
    setSubmitting(true);
    setTimeout(() => {
      const id = existing?.id ?? genId("KYC");
      const submittedAt = new Date().toISOString();
      const skillVerifications = isPro ? (proProfile?.skills.slice(0, 4) ?? []).map((skill) => ({
        skill,
        evidence: skillEvidenceName || "Portfolio and profile evidence",
        status: "under_review" as const,
        submittedAt,
      })) : undefined;
      const sub: KycSubmission = {
        id,
        userId: user.id,
        userName: user.name,
        role: user.role,
        verificationType: isPro ? "professional" : "client",
        identityDocName: docName || existing?.identityDocName || "",
        identityDocStatus: "uploaded",
        panMasked: pan ? maskPan(pan) : existing?.panMasked ?? "",
        accountNumberMasked: account ? maskAccount(account) : existing?.accountNumberMasked ?? "",
        ifscMasked: ifsc ? maskIfsc(ifsc) : existing?.ifscMasked ?? "",
        beneficiaryName: beneficiary || user.name,
        organizationName: isPro ? undefined : organizationName || buyerProfile?.displayName || user.name,
        organizationEvidenceName: isPro ? undefined : organizationEvidenceName || existing?.organizationEvidenceName,
        skillVerifications,
        status: "under_review",
        submittedAt,
      };
      updateKyc(id, sub);
      updateUserVerification(user.id, "under_review");
      if (isPro) {
        updateProProfile(user.id, {
          payoutReadiness: "under_review",
          skillVerifications,
          payoutDetails: { beneficiaryName: beneficiary || user.name, accountNumberMasked: account ? maskAccount(account) : existing?.accountNumberMasked ?? "", ifscMasked: ifsc ? maskIfsc(ifsc) : existing?.ifscMasked ?? "", bankName },
        });
      } else {
        updateBuyerProfile(user.id, {
          orgDetails: {
            companyName: organizationName || buyerProfile?.displayName || user.name,
            billingAddress: billingAddress || "Billing address pending confirmation",
            billingContact: billingContact || user.email,
            gstin: gstin || undefined,
          },
        });
      }
      addAudit({ adminId: user.id, adminRole: user.role, action: isPro ? "Professional verification submitted" : "Client verification submitted", entity: "KYC", entityId: id, newStatus: "under_review" });
      setSubmitting(false);
      setKycModal(false);
      toast({ title: "Verification submitted", description: "Under Admin review. Typical target: 24 hours." });
    }, 1000);
  }

  return (
    <Dialog open={kycModalOpen} onOpenChange={setKycModal}>
      <DialogContent className="max-w-[560px] max-h-[720px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isPro ? "Professional verification" : "Client verification"}</DialogTitle>
          <DialogDescription>{isPro ? "Submit identity, skill evidence, and payout details for Admin review." : "Submit authorized-signatory, organization, and billing details for Admin review."} Sensitive data stays masked.</DialogDescription>
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
            {isPro ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="prof">Professional headline</Label>
                  <Input id="prof" defaultValue={user?.headline ?? ""} placeholder="e.g. Product Designer and UX Researcher" />
                </div>
                <div className="space-y-1.5">
                  <Label>Skills submitted for verification</Label>
                  <div className="flex flex-wrap gap-1.5">{(proProfile?.skills.slice(0, 4) ?? []).map((skill) => <span key={skill} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs">{skill}</span>)}</div>
                </div>
                <div className="space-y-1.5">
                  <Label>Skill evidence</Label>
                  <EvidenceDropzone label="Upload case study, work sample, or repository evidence" accept="PDF, JPG, PNG, ZIP · max 25MB" onUploaded={(file) => setSkillEvidenceName(file.name)} />
                  <p className="text-xs text-muted-foreground">Admin reviews each submitted skill separately. One approved skill plus approved identity unlocks the QuickQuid Verified tick.</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Legal organization name</Label>
                  <Input id="org-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Company or individual legal name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization evidence</Label>
                  <EvidenceDropzone label="Upload incorporation, GST, or business registration" accept="PDF, JPG, PNG · max 10MB" onUploaded={(file) => setOrganizationEvidenceName(file.name)} />
                  <p className="text-xs text-muted-foreground">This document is reviewed privately and never shown on the public buyer profile.</p>
                </div>
              </>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ben">{isPro ? "Beneficiary name" : "Account holder / legal entity"}</Label>
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
            {!isPro && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="billing-address">Billing address</Label>
                  <Textarea id="billing-address" value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} rows={2} placeholder="Registered billing address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label htmlFor="billing-contact">Billing contact</Label><Input id="billing-contact" value={billingContact} onChange={(event) => setBillingContact(event.target.value)} placeholder="finance@company.com" /></div>
                  <div className="space-y-1.5"><Label htmlFor="gstin">GSTIN (optional)</Label><Input id="gstin" value={gstin} onChange={(event) => setGstin(event.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
                </div>
              </>
            )}
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              <span>I consent to QuickQuid verifying these details and storing sensitive values masked. {isPro ? "I understand payout is processed manually in v0.1." : "I confirm I am authorized to enroll this client account."}</span>
            </label>
          </div>
        )}

        <DialogFooter className="flex-row justify-between">
          <Button variant="ghost" onClick={() => setKycModal(false)}>Cancel</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!stepReady}>Continue</Button>
            ) : (
              <Button onClick={submit} disabled={submitting || !stepReady}>{submitting ? "Submitting…" : "Submit for review"}</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
