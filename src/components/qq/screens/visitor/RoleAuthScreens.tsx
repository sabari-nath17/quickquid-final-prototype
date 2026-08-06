"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, User, Mail, Linkedin, Chrome, ArrowRight, ArrowLeft, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import type { Role } from "@/lib/qq/types";

export function RoleSelectionScreen() {
  const { signInAs, navigate, consent, setConsent } = useQQ();
  const [intent, setIntent] = React.useState<"buyer" | "pro" | null>(null);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);
  const [oauthError, setOauthError] = React.useState(false);
  const { toast } = useToast();

  function choose(intent: "buyer" | "pro") {
    setIntent(intent);
  }

  function oauth(provider: string) {
    setOauthError(false);
    setOauthLoading(provider);
    setTimeout(() => {
      setOauthLoading(null);
      // simulate rare OAuth error
      if (provider === "linkedin" && Math.random() > 0.8) {
        setOauthError(true);
        return;
      }
      navigate("auth");
    }, 1100);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background font-bold">Q</div>
          <span className="font-semibold">QuickQuid</span>
          <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">v0.1 · trust-first marketplace</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("support")}>Help</Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">What are you here to do?</h1>
            <p className="text-muted-foreground">Choose how you want to use QuickQuid. You can switch roles anytime from the demo panel.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <IntentCard
              active={intent === "buyer"}
              onClick={() => choose("buyer")}
              icon={<Briefcase className="size-5" />}
              title="I want to hire"
              desc="Find trusted professionals for your work."
              tone="emerald"
            />
            <IntentCard
              active={intent === "pro"}
              onClick={() => choose("pro")}
              icon={<User className="size-5" />}
              title="I want to work"
              desc="0% QuickQuid commission. Keep 100% of your agreed professional fee."
              tone="violet"
            />
          </div>

          {intent && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Create your {intent === "buyer" ? "Buyer" : "Pro"} account</h2>
                <Button variant="ghost" size="sm" onClick={() => setIntent(null)}><ArrowLeft className="size-3.5" /> Back</Button>
              </div>
              <p className="text-sm text-muted-foreground">Sign in to continue. Selecting a role sets your account role and routes to account creation.</p>

              <div className="grid sm:grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => oauth("google")} disabled={!!oauthLoading}>
                  {oauthLoading === "google" ? <Loader2 className="size-4 animate-spin" /> : <Chrome className="size-4" />} Google
                </Button>
                <Button variant="outline" onClick={() => oauth("linkedin")} disabled={!!oauthLoading}>
                  {oauthLoading === "linkedin" ? <Loader2 className="size-4 animate-spin" /> : <Linkedin className="size-4" />} LinkedIn
                </Button>
                <Button variant="outline" onClick={() => oauth("email")} disabled={!!oauthLoading}>
                  {oauthLoading === "email" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Email
                </Button>
              </div>

              {oauthError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 mt-0.5" />
                  <div>OAuth sign-in failed. Try another method or continue with email.</div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); navigate("auth"); }} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" required />
                </div>
                <Button type="submit" className="w-full">Continue with email <ArrowRight className="size-4" /></Button>
              </form>

              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={consent.terms}
                    onCheckedChange={(v) => setConsent({ terms: v === true })}
                    className="mt-0.5"
                  />
                  <span>I agree to the QuickQuid Terms of Service, including the <strong>14% beta Buyer Fee</strong> and <strong>0% QuickQuid platform commission</strong> for Pros.</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={consent.privacy}
                    onCheckedChange={(v) => setConsent({ privacy: v === true })}
                    className="mt-0.5"
                  />
                  <span>I have read the Privacy Notice and understand how information submitted for verification is used, stored, and accessed.</span>
                </label>
                {intent === "pro" && (
                  <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={consent.workRelationship}
                      onCheckedChange={(v) => setConsent({ workRelationship: v === true })}
                      className="mt-0.5"
                    />
                    <span>I understand that QuickQuid is a marketplace platform and that I am responsible for the accuracy of my profile, work, taxes, insurance, and applicable statutory obligations. The final relationship and terms are governed by the applicable QuickQuid agreement and law.</span>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <a className="hover:underline" href="#">Terms of Service</a>
                <a className="hover:underline" href="#">Privacy Notice</a>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Already have an account?</span>
                <Button variant="link" size="sm" className="px-1" onClick={() => { signInAs(intent === "buyer" ? "BUY-1042" : "PRO-2088"); toast({ title: "Signed in" }); }}>Sign in</Button>
              </div>
            </Card>
          )}

          {!intent && (
            <div className="grid sm:grid-cols-3 gap-3 text-center">
              <TrustStat icon={<ShieldCheck className="size-4" />} label="Identity reviewed" />
              <TrustStat icon={<CheckCircle2 className="size-4" />} label="Manual payment verification" />
              <TrustStat icon={<User className="size-4" />} label="0% Pro commission" />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        QuickQuid v0.1 prototype · No wallet, no automated escrow · Payouts manually processed
      </footer>
    </div>
  );
}

function IntentCard({ active, onClick, icon, title, desc, tone }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; tone: "emerald" | "violet" }) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border-2 p-5 transition-all hover:shadow-md ${active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}
    >
      <div className={`inline-flex size-10 items-center justify-center rounded-md ${tone === "emerald" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"}`}>
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      {active && <div className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium">Selected <ArrowRight className="size-3.5" /></div>}
    </button>
  );
}

function TrustStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm">
      <span className="text-emerald-600">{icon}</span> {label}
    </div>
  );
}

export function AuthScreen() {
  const { navigate, signInAs } = useQQ();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"signin" | "create">("create");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // simulate duplicate email for a known address
      if (email.toLowerCase() === "ops@northstarlabs.example") {
        setMode("signin");
        setError("This email is already in use. Sign in instead, or use the demo accounts.");
        return;
      }
      toast({ title: "Account created", description: "Welcome to QuickQuid. Complete your profile to get started." });
      navigate("readiness");
    }, 900);
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="flex h-16 items-center px-4 sm:px-6 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate("role_selection")}><ArrowLeft className="size-4" /> Back</Button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">{mode === "create" ? "Create your account" : "Sign in"}</h1>
            <p className="text-sm text-muted-foreground">Continue with email. We’ll set up your role next.</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email</Label>
              <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            {error && <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive"><AlertCircle className="size-4 mt-0.5 shrink-0" />{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : mode === "create" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <div className="flex items-center justify-between text-sm">
            <button className="text-muted-foreground hover:underline" onClick={() => { setMode(mode === "create" ? "signin" : "create"); setError(""); }}>
              {mode === "create" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Demo accounts (one-click)</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => signInAs("BUY-1042")}>Northstar Labs (Buyer)</Button>
              <Button variant="outline" size="sm" onClick={() => signInAs("PRO-2088")}>Akhil Menon (Pro)</Button>
              <Button variant="outline" size="sm" onClick={() => signInAs("FIN-F01")}>Finance T2</Button>
              <Button variant="outline" size="sm" onClick={() => signInAs("RSK-R01")}>Risk T3</Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
