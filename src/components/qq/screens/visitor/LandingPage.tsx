"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight, CheckCircle2, Zap, Target, ShieldCheck, FileCheck, GitBranch,
  Clock, AlertTriangle, Sparkles, TrendingUp, Users, Briefcase, Search,
  Lock, Eye, Layers, ChevronDown, Rocket, MessageSquare,
} from "lucide-react";

export function LandingPage() {
  const { navigate, signInAs, setGuestDraft } = useQQ();
  const [prompt, setPrompt] = React.useState("");
  const [emptyError, setEmptyError] = React.useState(false);

  function makeReady() {
    if (!prompt.trim()) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    // Create guest draft and open readiness chat — NOT brief creation
    const draft = {
      originalRequest: prompt.trim(),
      workingTitle: "",
      category: "OTHER" as const,
      outcome: "",
      deliverables: [] as string[],
      exclusions: [] as string[],
      inputs: [],
      budgetBand: "",
      targetDate: "",
      deadlineReason: "",
      decisionMaker: "",
      feedbackWindow: "",
      acceptanceCriteria: [] as string[],
      completedAreas: [] as string[],
      conversationStep: 0,
      status: "IN_PROGRESS" as const,
    };
    setGuestDraft(draft);
    try { sessionStorage.setItem("qq_guest_readiness_draft", JSON.stringify(draft)); } catch { /* ignore */ }
    navigate("guest_readiness_chat");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Announcement bar */}
      <div className="bg-foreground text-background text-center text-xs py-1.5 px-4">
        Founding beta in Kochi · QuickQuid fee ₹0 during beta
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/quickquid-logo.svg" alt="QuickQuid" className="h-8 w-auto" />
            <span className="font-semibold">QuickQuid</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#buyers" className="hover:text-foreground transition-colors">For Buyers</a>
            <a href="#pros" className="hover:text-foreground transition-colors">For Pros</a>
            <a href="#showcase" className="hover:text-foreground transition-colors">Explore work</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("auth")}>Sign in</Button>
            <Button size="sm" onClick={makeReady}>Submit a project</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — split layout: thesis left, sample execution record right */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
              {/* Left: thesis + prompt */}
              <div>
                <Badge variant="outline" className="mb-4 text-[10px] tracking-widest uppercase text-muted-foreground border-border">THE EXECUTION MARKETPLACE</Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]">
                  Most marketplaces help you hire.<br />
                  <span className="text-muted-foreground">QuickQuid helps the work get finished.</span>
                </h1>
                <p className="mt-5 text-base text-muted-foreground max-w-lg leading-relaxed">
                  Start with a project that is ready to execute. See why a Pro fits, confirm real capacity, lock the scope and accept delivery against a clear definition of done.
                </p>

                {/* Project prompt */}
                <div className="mt-6">
                  <label htmlFor="project-prompt" className="block text-left text-sm font-medium mb-1.5">What needs to get finished?</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="project-prompt"
                      value={prompt}
                      onChange={(e) => { setPrompt(e.target.value); setEmptyError(false); }}
                      placeholder="Example: Design and build a responsive launch page before 28 February."
                      className="flex-1 h-12"
                      aria-invalid={emptyError}
                      onKeyDown={(e) => { if (e.key === "Enter") makeReady(); }}
                    />
                    <Button size="lg" onClick={makeReady} className="h-12 px-6 whitespace-nowrap">Check project readiness <ArrowRight className="size-4" /></Button>
                  </div>
                  {emptyError && (
                    <p className="mt-1.5 text-xs text-destructive" role="alert">Describe the outcome you need before we check readiness.</p>
                  )}
                  <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <Button variant="link" size="sm" className="px-0 text-muted-foreground" onClick={() => signInAs("PRO-2088")}>Join as a founding Pro →</Button>
                    <p className="text-xs text-muted-foreground">Private beta for selected digital projects</p>
                  </div>
                </div>

                {/* Quick examples */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {["Product UI/UX", "Frontend build", "Mobile feature", "Backend workflow", "AI/ML implementation"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setPrompt(ex); makeReady(); }}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: sample execution record */}
              <div className="relative">
                <Card className="p-5 elev-2 border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sample project record</div>
                    <Badge className="bg-[#0B8F63] text-white text-[10px]">In delivery</Badge>
                  </div>

                  {/* Execution Spine */}
                  <div className="relative pl-8 space-y-3">
                    <div className="spine-line" />
                    {[
                      { label: "Ready", detail: "7/7 requirements confirmed", tone: "success" },
                      { label: "Proof Match", detail: "2 comparable portal projects", tone: "success" },
                      { label: "Capacity", detail: "18 hours/week confirmed", tone: "success" },
                      { label: "Commit Date", detail: "28 Feb · forecast", tone: "info" },
                      { label: "Demo escrow", detail: "Q₹25,000 locked", tone: "info" },
                      { label: "Delivery", detail: "1 of 3 milestones accepted", tone: "warning" },
                    ].map((event) => (
                      <div key={event.label} className="relative flex items-start gap-3">
                        <div className={cn("spine-node", event.tone === "success" && "bg-[#0B8F63] text-white", event.tone === "info" && "bg-[#4E62D8] text-white", event.tone === "warning" && "bg-[#B46D0A] text-white")}>
                          {event.tone === "success" ? "✓" : event.tone === "info" ? "→" : "!"}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-sm font-medium">{event.label}</div>
                          <div className="text-xs text-muted-foreground font-mono">{event.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Pro</span>
                      <span className="font-medium">Akhil Menon</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">QuickQuid fee</span>
                      <span className="font-medium font-mono">₹0</span>
                    </div>
                  </div>
                </Card>
                <p className="mt-2 text-center text-[10px] text-muted-foreground italic">Illustrative project record · No real customer or payment claim</p>
              </div>
            </div>

            {/* Execution strip — full width below */}
            <div className="mt-12 rounded-lg border border-border bg-card p-3 overflow-x-auto">
              <div className="flex items-center gap-2 text-xs font-medium whitespace-nowrap justify-center">
                <span className="text-muted-foreground">ROUGH REQUEST</span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <span className="text-foreground">READY PROJECT</span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <span className="text-foreground">PROOF + CAPACITY MATCH</span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <span className="text-foreground">CONTROLLED DELIVERY</span>
                <ArrowRight className="size-3 text-muted-foreground" />
                <span className="text-[#0B8F63] font-semibold">ACCEPTED WORK</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="border-b border-border py-16 px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">A great professional can still fail inside a badly prepared project.</h2>
            <p className="mt-4 text-muted-foreground text-center max-w-2xl mx-auto">
              Unclear inputs. Moving scope. Hidden dependencies. Overloaded talent. Slow feedback. A delivery that looks complete until the handoff begins.
            </p>
            <p className="mt-2 text-muted-foreground text-center max-w-2xl mx-auto">
              Most hiring journeys focus on finding a person. QuickQuid also prepares and controls the work around them.
            </p>

            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <Card className="p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Most marketplaces ask:</div>
                <p className="text-lg font-medium">Who can do this?</p>
              </Card>
              <Card className="p-5 border-primary/30">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">QuickQuid also asks:</div>
                <ul className="space-y-1.5 text-sm">
                  {[
                    "Is the project ready to begin?",
                    "Has this Pro delivered a comparable outcome?",
                    "Do they have the capacity to commit?",
                    "What does each side owe—and by when?",
                    "What happens when scope or dependencies change?",
                    "What exactly must be true before the work is accepted?",
                  ].map((q) => (
                    <li key={q} className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-600 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-b border-border py-16 px-4 bg-muted/20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">How QuickQuid Works</h2>
            <p className="mt-2 text-muted-foreground text-center">The match is one step. Execution is the product.</p>

            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { num: "1", icon: Target, title: "Make the project Ready", body: "Before matching starts, QuickQuid checks the outcome, required inputs, budget, timeline, decision-maker, feedback window and acceptance criteria.", callout: "If the work is not ready, it does not enter matching." },
                { num: "2", icon: Search, title: "Match proof and capacity", body: "See why a Pro fits the exact type of project—not just a list of skills. Relevant work evidence is reviewed and current capacity is checked before a commitment is made.", callout: "A strong profile is not the same as a strong fit." },
                { num: "3", icon: FileCheck, title: "Lock the working agreement", body: "The Buyer and Pro agree on deliverables, responsibilities, input dates, checkpoints, response windows, AI-use rules and what counts as done. The delivery forecast is calculated from those commitments.", callout: "Everyone works from the same agreement." },
                { num: "4", icon: CheckCircle2, title: "Run the work to Done", body: "The first proof confirms direction early. Scope changes are recorded before they affect the work. Material delays have an owner and forecast impact. Final delivery includes the agreed files, evidence and handoff items.", callout: "Acceptance is based on the agreement—not memory, chat history or guesswork." },
              ].map((step) => (
                <Card key={step.num} className="p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">{step.num}</div>
                    <step.icon className="size-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{step.body}</p>
                  <div className="mt-3 rounded-md bg-primary/5 border border-primary/20 px-2.5 py-1.5 text-xs font-medium text-primary">
                    {step.callout}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The Difference */}
        <section className="border-b border-border py-16 px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">The Difference</h2>
            <p className="mt-2 text-muted-foreground text-center">Freelancing where the project is accountable—not just the professional.</p>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Typical informal hiring journey</th>
                    <th className="text-left px-4 py-3 font-medium text-primary">QuickQuid execution journey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Browse profiles and ratings", "Start with a Ready project"],
                    ["Match broad skills", "Match comparable proof"],
                    ["Assume availability", "Confirm weekly capacity"],
                    ["Agree details across chat", "Accept one shared Pact"],
                    ["Treat the deadline as a promise", "Use a dependency-aware Commit Date"],
                    ["Absorb changes informally", "Approve a Change Card"],
                    ["Debate who caused a delay", "Record the delay and its owner"],
                    ["Decide what \"done\" means at the end", "Agree the Definition of Done upfront"],
                  ].map(([typical, quickquid]) => (
                    <tr key={typical} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-muted-foreground">{typical}</td>
                      <td className="px-4 py-2.5 font-medium">{quickquid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Work Showcase */}
        <section id="showcase" className="border-b border-border py-16 px-4 bg-muted/20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">See the work. Then see how it was delivered.</h2>
            <p className="mt-4 text-muted-foreground text-center max-w-2xl mx-auto">
              A portfolio shows what the result looked like. A QuickQuid project record also shows the brief, the agreed scope, delivery evidence, approved changes and whether the outcome was accepted.
            </p>

            {/* Example project card */}
            <Card className="mt-8 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]">HOW A QUICKQUID PROJECT WORKS — EXAMPLE</Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Outcome</div>
                  <div className="font-medium">Partner onboarding portal — design + handoff</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Relevant proof</div>
                  <div className="font-medium">Partner Portal Case Study · Ops Console Refresh</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Planned vs. actual delivery</div>
                  <div className="font-medium">8 weeks planned · 7.5 weeks actual</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Approved scope changes</div>
                  <div className="font-medium">1 change (added dark mode tokens)</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Acceptance result</div>
                  <div className="font-medium text-emerald-600">Accepted on first pass</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Handoff evidence</div>
                  <div className="font-medium">Figma file · Design tokens JSON · Handoff docs</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground italic">Until real beta projects are completed, this is an illustrative example. No invented customers, ratings, earnings or outcome claims.</p>
            </Card>

            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => navigate("buyer_talent")}>Explore completed work <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        </section>

        {/* AI */}
        <section className="border-b border-border py-16 px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">AI should remove ambiguity—not accountability.</h2>
            <p className="mt-4 text-muted-foreground text-center max-w-2xl mx-auto">
              AI can help strengthen a rough brief, surface missing inputs, suggest clearer acceptance criteria and organize project updates. It does not independently hire a Pro, approve a scope change, accept delivery or decide a dispute.
            </p>
            <p className="mt-2 text-center font-medium">The rule is simple: AI assists the workflow. People own the outcome.</p>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {[
                { phase: "Before the project", icon: Target, items: ["Improve brief clarity", "Surface missing inputs", "Suggest acceptance criteria"] },
                { phase: "During the project", icon: GitBranch, items: ["Summarize approved changes", "Highlight unresolved blockers", "Keep decisions easy to follow"] },
                { phase: "At delivery", icon: CheckCircle2, items: ["Check that required evidence is present", "Compare the handoff with agreed criteria", "Prepare the record for human review"] },
              ].map((col) => (
                <Card key={col.phase} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <col.icon className="size-4 text-primary" />
                    <h3 className="font-semibold text-sm">{col.phase}</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Buyers */}
        <section id="buyers" className="border-b border-border py-16 px-4 bg-muted/20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">For Buyers</h2>
            <p className="mt-2 text-muted-foreground text-center">Stop buying a profile and hoping for an outcome.</p>
            <p className="mt-4 text-muted-foreground text-center max-w-2xl mx-auto">
              Start with a project that is ready to execute. Understand why a Pro fits, know whether they have capacity, see what is blocking progress and review delivery against criteria agreed before the work began.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {["Clearer brief before hiring", "Evidence behind the match", "Shared responsibilities and response windows", "Visible scope changes and delays", "Delivery files and acceptance evidence in one place"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="size-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Button onClick={makeReady}>Submit a project <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        </section>

        {/* For Pros */}
        <section id="pros" className="border-b border-border py-16 px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">For Pros</h2>
            <p className="mt-2 text-muted-foreground text-center">Good professionals deserve good projects.</p>
            <p className="mt-4 text-muted-foreground text-center max-w-2xl mx-auto">
              QuickQuid is designed to protect focused work: clearer briefs, realistic commitments, named Buyer responsibilities, documented changes and a delivery process that recognizes the complete handoff—not just the final upload.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {["Know what is expected before accepting", "Commit against real capacity", "Get feedback within agreed windows", "Keep new requests out of the active scope until approved", "Build an execution record from accepted work"].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="size-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => signInAs("PRO-2088")}>Apply as a founding Pro <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        </section>

        {/* What QuickQuid Measures */}
        <section className="border-b border-border py-12 px-4 bg-muted/20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">What QuickQuid Measures</h2>
            <p className="mt-2 text-muted-foreground">Activity is not the outcome. Accepted work is.</p>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              QuickQuid is designed to learn from paid projects, accepted completion, first-pass acceptance, planned versus actual time, delays by cause, disputes and repeat engagement. These measures will be published only after real beta projects produce enough evidence.
            </p>
          </div>
        </section>

        {/* Beta Pricing */}
        <section className="border-b border-border py-12 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">Beta Pricing</h2>
            <p className="mt-2 text-muted-foreground text-center">QuickQuid fee: ₹0 during the founding beta.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Card className="p-5 text-center">
                <div className="text-sm text-muted-foreground mb-1">Buyer</div>
                <div className="text-2xl font-bold">₹0</div>
                <div className="text-xs text-muted-foreground mt-1">QuickQuid fee</div>
              </Card>
              <Card className="p-5 text-center">
                <div className="text-sm text-muted-foreground mb-1">Pro</div>
                <div className="text-2xl font-bold">₹0</div>
                <div className="text-xs text-muted-foreground mt-1">QuickQuid fee</div>
              </Card>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center max-w-md mx-auto">
              Payment-provider charges and applicable taxes may still apply. Founding-beta pricing is temporary and may change after the beta.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border py-16 px-4 bg-muted/20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-8">FAQ</h2>
            <div className="space-y-4">
              {[
                { q: "What kinds of projects can I submit?", a: "The private beta accepts selected digital projects across UI/UX, frontend, backend, mobile and AI/ML. Every request is reviewed for fit and readiness before matching." },
                { q: "How is a Pro selected?", a: "QuickQuid considers evidence from comparable work, project fit and current capacity. A generic skills list or profile rating is not enough on its own." },
                { q: "Is the delivery date guaranteed?", a: "No. The Commit Date is a forecast based on readiness, capacity, dependencies and agreed response windows. When something material changes, the forecast and reason are updated." },
                { q: "What happens if the scope changes?", a: "The new request is recorded before work continues. The Buyer and Pro agree whether it changes the price, changes the delivery forecast or moves to a later milestone." },
                { q: "How does QuickQuid use AI?", a: "AI may assist with clarity, summaries and completeness checks. People remain responsible for matching, commitments, approvals, acceptance, disputes and safety decisions." },
                { q: "What does the ₹0 fee mean?", a: "QuickQuid charges neither the Buyer nor the Pro a platform fee during the founding beta. Payment-provider charges and taxes may apply. This is beta pricing, not a permanent promise." },
              ].map((faq) => (
                <details key={faq.q} className="group rounded-lg border border-border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer font-medium text-sm hover:bg-muted/30 transition-colors">
                    {faq.q}
                    <ChevronDown className="size-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <div className="px-4 pb-3 text-sm text-muted-foreground">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your next project should not begin with a gamble.</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Make it Ready. Match the proof. Run the work with a shared record. Accept what was actually agreed.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={makeReady} className="h-12 px-8">Check project readiness <ArrowRight className="size-4" /></Button>
              <Button size="lg" variant="outline" onClick={() => signInAs("PRO-2088")} className="h-12 px-8">Join as a founding Pro</Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">QuickQuid — built for the work after the match.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/quickquid-logo.svg" alt="QuickQuid" className="h-6 w-auto" />
            <span className="font-medium">QuickQuid</span>
            <span>· Founding beta in Kochi</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#buyers" className="hover:text-foreground">For Buyers</a>
            <a href="#pros" className="hover:text-foreground">For Pros</a>
            <button onClick={() => navigate("support")} className="hover:text-foreground">Support</button>
            <button onClick={() => navigate("auth")} className="hover:text-foreground">Sign in</button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-3 text-center text-[10px] text-muted-foreground">
          QuickQuid fee ₹0 during beta · Payments via integrated payment system · Payment-provider charges and taxes may apply
        </div>
      </footer>
    </div>
  );
}
