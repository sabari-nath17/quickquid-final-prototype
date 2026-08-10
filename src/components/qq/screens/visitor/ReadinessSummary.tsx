"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, RotateCcw, Edit3, Save, Info, ShieldCheck } from "lucide-react";

export function ReadinessSummary() {
  const { guestDraft, setGuestDraft, navigate, signInAs, setBuyerOnboardingComplete } = useQQ();
  const [mode, setMode] = React.useState<"summary" | "auth" | "onboarding">("summary");
  const [email, setEmail] = React.useState("");
  const [authMode, setAuthMode] = React.useState<"create" | "signin">("create");
  const [onboarding, setOnboarding] = React.useState({ fullName: "", company: "", title: "", businessType: "Startup", city: "Kochi", terms: false });

  if (!guestDraft) {
    navigate("role_selection");
    return null;
  }

  function startAuth() { setMode("auth"); }
  function startOver() {
    if (!confirm("Start over? This will clear your readiness draft.")) return;
    sessionStorage.removeItem("qq_guest_readiness_draft");
    setGuestDraft(null);
    navigate("role_selection");
  }

  function handleAuth() {
    // Prototype: simulate account creation → onboarding
    if (authMode === "signin") {
      // Sign in with existing buyer demo account
      signInAs("BUY-1042");
      setBuyerOnboardingComplete(true);
      restoreProject();
    } else {
      setMode("onboarding");
    }
  }

  function handleOnboarding() {
    if (!onboarding.fullName || !onboarding.company || !onboarding.terms) return;
    // Prototype: sign in as Northstar Labs (demo buyer)
    signInAs("BUY-1042");
    setBuyerOnboardingComplete(true);
    restoreProject();
  }

  function restoreProject() {
    // Update draft status and navigate to brief creation with prefilled data
    if (guestDraft) {
      const updated = { ...guestDraft, status: "SAVED_AS_DRAFT" as const };
      setGuestDraft(updated);
      sessionStorage.removeItem("qq_guest_readiness_draft");
    }
    navigate("buyer_brief_new", {
      prefill: guestDraft?.outcome || guestDraft?.originalRequest || "",
      title: guestDraft?.workingTitle || "",
    });
  }

  if (mode === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-6 space-y-4 elev-2">
          <div>
            <h1 className="text-xl font-bold">{authMode === "create" ? "Save your prepared project" : "Welcome back"}</h1>
            <p className="text-sm text-muted-foreground mt-1">{authMode === "create" ? "Create a Buyer account to keep this draft and continue." : "Sign in to continue with your prepared project."}</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email</Label>
              <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <Button className="w-full h-11" onClick={handleAuth} disabled={!email.includes("@")}>
              {authMode === "create" ? "Continue with email" : "Sign in"}
            </Button>
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setAuthMode(authMode === "create" ? "signin" : "create")}>
            {authMode === "create" ? "Already have an account? Sign in" : "New to QuickQuid? Create an account"}
          </button>
          <Separator />
          <div className="space-y-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Prototype shortcuts</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => { signInAs("BUY-1042"); setBuyerOnboardingComplete(true); restoreProject(); }}>Northstar Labs (Buyer)</Button>
              <Button variant="outline" size="sm" onClick={() => { signInAs("BUY-1050"); setBuyerOnboardingComplete(true); restoreProject(); }}>Verdant Retail (Buyer)</Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMode("summary")}><ArrowLeft className="size-3.5" /> Back to summary</Button>
        </Card>
      </div>
    );
  }

  if (mode === "onboarding") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-6 space-y-4 elev-2">
          <div>
            <h1 className="text-xl font-bold">Complete your Buyer profile</h1>
            <p className="text-sm text-muted-foreground mt-1">A few details before we restore your prepared project.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fn">Full name *</Label>
              <Input id="fn" value={onboarding.fullName} onChange={(e) => setOnboarding({ ...onboarding, fullName: e.target.value })} placeholder="Sarah Lee" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co">Company or organization *</Label>
              <Input id="co" value={onboarding.company} onChange={(e) => setOnboarding({ ...onboarding, company: e.target.value })} placeholder="Northstar Labs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ti">Work role or title (optional)</Label>
              <Input id="ti" value={onboarding.title} onChange={(e) => setOnboarding({ ...onboarding, title: e.target.value })} placeholder="Product Lead" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="bt">Business type</Label>
                <select id="bt" value={onboarding.businessType} onChange={(e) => setOnboarding({ ...onboarding, businessType: e.target.value })} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option>Startup</option><option>Agency</option><option>SME</option><option>Individual</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ci">City</Label>
                <Input id="ci" value={onboarding.city} onChange={(e) => setOnboarding({ ...onboarding, city: e.target.value })} />
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={onboarding.terms} onChange={(e) => setOnboarding({ ...onboarding, terms: e.target.checked })} className="mt-0.5 size-4 rounded border-border accent-foreground" />
              <span>I accept the prototype terms and privacy notice. I understand this is a simulation with no real money.</span>
            </label>
          </div>
          <Button className="w-full h-11" onClick={handleOnboarding} disabled={!onboarding.fullName || !onboarding.company || !onboarding.terms}>
            Save profile and restore project
          </Button>
        </Card>
      </div>
    );
  }

  // Summary view
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("guest_readiness_chat")} className="flex items-center gap-2">
            <img src="/quickquid-logo.svg" alt="QuickQuid" className="h-7 w-auto" />
            <span className="font-semibold text-sm">QuickQuid</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">Prepared project summary</span>
        </div>
        <Button variant="ghost" size="sm" onClick={startOver}><RotateCcw className="size-3.5" /> Start over</Button>
      </header>

      <div className="mx-auto max-w-2xl w-full px-4 py-8 space-y-6">
        <div className="rounded-lg border border-success/30 bg-success/5 p-4 flex items-start gap-3">
          <CheckCircle2 className="size-5 text-success mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-sm">Prepared for QuickQuid review</div>
            <p className="text-xs text-muted-foreground mt-0.5">Your request has been structured into a project brief. Create an account to save it as a private draft.</p>
          </div>
        </div>

        <Card className="p-5 space-y-4 elev-1">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Working title</div>
            <div className="font-medium mt-0.5">{guestDraft.workingTitle || guestDraft.originalRequest}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Category</div>
              <div className="font-medium mt-0.5">{guestDraft.category === "UI_UX_AND_FRONTEND" ? "UI/UX + Frontend" : guestDraft.category === "UI_UX" ? "UI/UX" : "Frontend"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Budget</div>
              <div className="font-medium mt-0.5">{guestDraft.budgetBand || "Not specified"}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Outcome</div>
            <div className="font-medium mt-0.5">{guestDraft.outcome || guestDraft.originalRequest}</div>
          </div>
          {guestDraft.deliverables.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground">Deliverables</div>
              <ul className="mt-1 space-y-0.5">
                {guestDraft.deliverables.map((d) => <li key={d} className="text-sm flex items-start gap-1.5"><CheckCircle2 className="size-3 mt-0.5 text-success shrink-0" /> {d}</li>)}
              </ul>
            </div>
          )}
          {guestDraft.exclusions.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground">Exclusions</div>
              <p className="text-sm mt-0.5">{guestDraft.exclusions.join(", ")}</p>
            </div>
          )}
          {guestDraft.inputs.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground">Inputs and dependencies</div>
              <ul className="mt-1 space-y-0.5">
                {guestDraft.inputs.map((i) => (
                  <li key={i.name} className="text-sm flex items-center justify-between">
                    <span>{i.name}</span>
                    <Badge variant="outline" className={i.state === "READY" ? "text-success" : i.state === "MISSING" ? "text-warning" : "text-muted-foreground"}>{i.state.replace(/_/g, " ")}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {guestDraft.targetDate && (
            <div>
              <div className="text-xs text-muted-foreground">Target timing</div>
              <div className="font-medium mt-0.5">{guestDraft.targetDate}. {guestDraft.deadlineReason}</div>
            </div>
          )}
          {guestDraft.decisionMaker && (
            <div>
              <div className="text-xs text-muted-foreground">Decision and feedback</div>
              <div className="font-medium mt-0.5">{guestDraft.decisionMaker} — {guestDraft.feedbackWindow}</div>
            </div>
          )}
          {guestDraft.acceptanceCriteria.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground">Acceptance criteria</div>
              <ul className="mt-1 space-y-0.5">
                {guestDraft.acceptanceCriteria.map((c) => <li key={c} className="text-sm flex items-start gap-1.5"><CheckCircle2 className="size-3 mt-0.5 text-success shrink-0" /> {c}</li>)}
              </ul>
            </div>
          )}
        </Card>

        <div className="rounded-md bg-info/5 border border-info/20 px-3 py-2 text-xs text-info flex items-start gap-2">
          <Info className="size-3.5 mt-0.5 shrink-0" />
          <span>Nothing has been published. Your project will remain a private draft until you review and submit it.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="lg" className="h-12 flex-1" onClick={startAuth}>Create account and save project</Button>
          <Button variant="outline" size="lg" className="h-12" onClick={() => navigate("guest_readiness_chat")}><Edit3 className="size-4" /> Edit answers</Button>
        </div>
      </div>
    </div>
  );
}
