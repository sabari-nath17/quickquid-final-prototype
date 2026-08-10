"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, Circle, AlertCircle, ChevronRight, RotateCcw,
  Info, ShieldCheck, Clock, Target,
} from "lucide-react";
import type { GuestReadinessDraft, ReadinessCategory } from "@/lib/qq/types";

const READINESS_AREAS = [
  { key: "outcome", label: "Outcome and category", why: "Makes the request understandable and matchable" },
  { key: "scope", label: "Scope", why: "Prevents hidden or moving work" },
  { key: "inputs", label: "Inputs and dependencies", why: "Identifies whether work can start" },
  { key: "budget", label: "Budget", why: "Prevents unfinanceable matching" },
  { key: "timeline", label: "Timeline", why: "Supports a realistic Commit Date later" },
  { key: "decision", label: "Decision and feedback", why: "Makes Buyer responsibility explicit" },
  { key: "acceptance", label: "Acceptance", why: "Establishes what 'done' means" },
] as const;

interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  chips?: string[];
}

export function GuestReadinessChat() {
  const { guestDraft, setGuestDraft, navigate } = useQQ();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  function rebuildConversation(draft: GuestReadinessDraft) {
    const msgs: ChatMessage[] = [];
    msgs.push({ id: "m0", role: "user", text: draft.originalRequest });
    // Always show opening AI response
    msgs.push({ id: "a0", role: "ai", text: `Got it — you need ${draft.originalRequest.toLowerCase()}. I'll help turn that into a project a professional can confidently accept. First, do you need the design, the frontend build, or both?`, chips: ["Design only", "Frontend build only", "Design + frontend build", "Not sure"] });
    if (draft.conversationStep >= 1 && draft.category) {
      const catLabel = draft.category === "UI_UX_AND_FRONTEND" ? "Design + frontend build" : draft.category === "UI_UX" ? "Design only" : "Frontend build only";
      msgs.push({ id: "u1", role: "user", text: catLabel });
      msgs.push({ id: "a1", role: "ai", text: `I'll treat this as a ${draft.category === "UI_UX_AND_FRONTEND" ? "combined UI/UX and frontend" : draft.category === "UI_UX" ? "UI/UX" : "frontend"} project. What must be handed over at the end?` });
    }
    if (draft.conversationStep >= 3 && draft.deliverables.length > 0) {
      msgs.push({ id: "u2", role: "user", text: `Deliverables: ${draft.deliverables.join(", ")}` });
      if (draft.exclusions.length > 0) {
        msgs.push({ id: "u2b", role: "user", text: `Exclusions: ${draft.exclusions.join(", ")}` });
      }
      msgs.push({ id: "a2", role: "ai", text: "What is already available, and who owns anything that is still missing?" });
    }
    if (draft.conversationStep >= 4 && draft.inputs.length > 0) {
      msgs.push({ id: "u3", role: "user", text: draft.inputs.map(i => `${i.name}: ${i.state}`).join("; ") });
      msgs.push({ id: "a3", role: "ai", text: draft.inputs.some(i => i.state === "MISSING") ? "The project can continue, but the final Commit Date will depend on missing inputs arriving on time." : "All inputs are ready. The project can start immediately once matched.", chips: ["₹25,000–₹50,000", "₹50,000–₹80,000", "₹80,000+", "I need guidance"] });
    }
    if (draft.conversationStep >= 5 && draft.budgetBand) {
      msgs.push({ id: "u4", role: "user", text: `Budget: ${draft.budgetBand}` });
      msgs.push({ id: "a4", role: "ai", text: `You mentioned ${draft.targetDate ? draft.targetDate : "a timeline"}. What date is this needed, and what happens on that date?` });
    }
    if (draft.conversationStep >= 6 && draft.targetDate) {
      msgs.push({ id: "u5", role: "user", text: `Target: ${draft.targetDate}. ${draft.deadlineReason}` });
      msgs.push({ id: "a5", role: "ai", text: `I'll record ${draft.targetDate} as the target date. This is an input to a later Commit Date forecast, not a guarantee.`, chips: ["I approve — within 24 hours", "I approve — within 48 hours", "A teammate approves", "Multiple approvers"] });
    }
    if (draft.conversationStep >= 7 && draft.decisionMaker) {
      msgs.push({ id: "u6", role: "user", text: `${draft.decisionMaker} — ${draft.feedbackWindow}` });
      msgs.push({ id: "a6", role: "ai", text: "Last step: what must be true for you to accept the work?" });
    }
    if (draft.conversationStep >= 8 && draft.acceptanceCriteria.length > 0) {
      msgs.push({ id: "u7", role: "user", text: `Acceptance: ${draft.acceptanceCriteria.join("; ")}` });
      msgs.push({ id: "a7", role: "ai", text: "Your request is now prepared for QuickQuid review. Check the summary before creating an account and saving it." });
    }
    setMessages(msgs);
  }

  // Initialize from guest draft or create new
  React.useEffect(() => {
    if (!guestDraft) {
      navigate("role_selection");
      return;
    }
    rebuildConversation(guestDraft);
  }, []);

  // Save to sessionStorage on every draft change
  React.useEffect(() => {
    if (guestDraft) {
      try { sessionStorage.setItem("qq_guest_readiness_draft", JSON.stringify(guestDraft)); } catch { /* ignore */ }
    }
  }, [guestDraft]);

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function updateDraft(patch: Partial<GuestReadinessDraft>) {
    if (!guestDraft) return;
    const next = { ...guestDraft, ...patch };
    setGuestDraft(next);
  }

  function handleChip(chip: string) {
    handleResponse(chip);
  }

  function handleResponse(text: string) {
    if (!guestDraft) return;
    const step = guestDraft.conversationStep;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };

    if (step === 0) {
      // Category selection
      const cat: ReadinessCategory = text === "Design only" ? "UI_UX" : text === "Frontend build only" ? "FRONTEND" : text === "Design + frontend build" ? "UI_UX_AND_FRONTEND" : "OTHER";
      updateDraft({ category: cat, conversationStep: 1, completedAreas: [...new Set([...guestDraft.completedAreas, "outcome"])] });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: `I'll treat this as a ${cat === "UI_UX_AND_FRONTEND" ? "combined UI/UX and frontend" : cat === "UI_UX" ? "UI/UX" : "frontend"} project. What must be handed over at the end?` }]);
    } else if (step === 1) {
      // Deliverables (user types or chips)
      const deliverables = text.split(",").map(s => s.trim()).filter(Boolean);
      updateDraft({ deliverables, conversationStep: 2 });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: "Is anything explicitly outside this project?" }]);
    } else if (step === 2) {
      // Exclusions
      const exclusions = text.split(",").map(s => s.trim()).filter(Boolean);
      updateDraft({ exclusions, conversationStep: 3, completedAreas: [...new Set([...guestDraft.completedAreas, "scope"])] });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: "What is already available, and who owns anything that is still missing?" }]);
    } else if (step === 3) {
      // Inputs — for prototype, use demo data
      const inputs = [
        { name: "Brand logo and colours", state: "READY" as const },
        { name: "Final page copy", state: "MISSING" as const, owner: "BUYER" as const, dueText: "within two days" },
        { name: "Product screenshots", state: "READY" as const },
        { name: "Domain or deployment access", state: "MISSING" as const, owner: "BUYER" as const, dueText: "before build handoff" },
        { name: "Analytics ID", state: "OUT_OF_SCOPE" as const },
      ];
      updateDraft({ inputs, conversationStep: 4, completedAreas: [...new Set([...guestDraft.completedAreas, "inputs"])] });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: "The project can continue, but the final Commit Date will depend on copy arriving within two days.", chips: ["₹25,000–₹50,000", "₹50,000–₹80,000", "₹80,000+", "I need guidance"] }]);
    } else if (step === 4) {
      // Budget
      updateDraft({ budgetBand: text, conversationStep: 5, completedAreas: [...new Set([...guestDraft.completedAreas, "budget"])] });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: `QuickQuid charges the Buyer and Pro ₹0 during the founding beta. What date is this needed, and what happens on that date?` }]);
    } else if (step === 5) {
      // Timeline
      updateDraft({ targetDate: text.split(".")[0].trim(), deadlineReason: text, conversationStep: 6, completedAreas: [...new Set([...guestDraft.completedAreas, "timeline"])] });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: `I'll record this as the target date. This is an input to a later Commit Date forecast, not a guarantee.`, chips: ["I approve — within 24 hours", "I approve — within 48 hours", "A teammate approves", "Multiple approvers"] }]);
    } else if (step === 6) {
      // Decision maker
      const parts = text.split("—");
      updateDraft({ decisionMaker: parts[0]?.trim() || text, feedbackWindow: parts[1]?.trim() || "", conversationStep: 7, completedAreas: [...new Set([...guestDraft.completedAreas, "decision"])] });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: "Last step: what must be true for you to accept the work?" }]);
    } else if (step === 7) {
      // Acceptance
      const criteria = text.split(",").map(s => s.trim()).filter(Boolean);
      const allAreas = ["outcome", "scope", "inputs", "budget", "timeline", "decision", "acceptance"];
      updateDraft({ acceptanceCriteria: criteria, conversationStep: 8, completedAreas: allAreas, status: "PREPARED" });
      setMessages(prev => [...prev, userMsg, { id: `a-${Date.now()}`, role: "ai", text: "Your request is now prepared for QuickQuid review. Check the summary before creating an account and saving it." }]);
      setTimeout(() => navigate("readiness_summary"), 1500);
    }
    setInput("");
  }

  function startOver() {
    if (!confirm("Start over? This will clear your current readiness draft.")) return;
    sessionStorage.removeItem("qq_guest_readiness_draft");
    setGuestDraft(null);
    navigate("role_selection");
  }

  if (!guestDraft) return null;

  const completedCount = guestDraft.completedAreas.length;
  const isComplete = guestDraft.status === "PREPARED";
  const currentStep = guestDraft.conversationStep;
  const showInput = currentStep < 8;
  const showChips = messages.length > 0 && messages[messages.length - 1].chips;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("role_selection")} className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background font-bold text-sm">Q</div>
            <span className="font-semibold text-sm hidden sm:inline">QuickQuid</span>
          </button>
          <Separator />
          <span className="text-sm font-medium">Project readiness</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]"><Clock className="size-2.5" /> Guest session</Badge>
          <Button variant="ghost" size="sm" onClick={startOver}><RotateCcw className="size-3.5" /> Start over</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("role_selection")}><ArrowLeft className="size-3.5" /> Exit</Button>
        </div>
      </header>

      {/* Trust note */}
      <div className="border-b border-border bg-info/5 px-4 py-2 text-center text-xs text-info">
        <Info className="size-3 inline mr-1" />
        AI is helping structure your brief. QuickQuid reviews readiness before matching. No account or project has been created yet.
      </div>

      {/* Main content */}
      <div className="flex-1 grid lg:grid-cols-[60%_40%]">
        {/* Chat area */}
        <div className="flex flex-col border-r border-border">
          <div className="flex-1 overflow-y-auto scroll-area-thin p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "ai" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", m.role === "ai" ? "bg-muted text-foreground" : "bg-foreground text-background")}>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            {showChips && messages[messages.length - 1].chips && (
              <div className="flex flex-wrap gap-2 pl-2">
                {messages[messages.length - 1].chips!.map((chip) => (
                  <button key={chip} onClick={() => handleChip(chip)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {showInput && (
            <div className="border-t border-border p-3 bg-card elev-1">
              <div className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer…" onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) handleResponse(input.trim()); }} className="flex-1 h-11" />
                <Button onClick={() => input.trim() && handleResponse(input.trim())} className="h-11 px-5">Send</Button>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="border-t border-border p-3 bg-card">
              <Button className="w-full h-12" onClick={() => navigate("readiness_summary")}>View project summary <ChevronRight className="size-4" /></Button>
            </div>
          )}
        </div>

        {/* Readiness panel */}
        <div className="hidden lg:block bg-muted/20 overflow-y-auto scroll-area-thin">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Readiness checklist</h3>
              <Badge variant="outline" className="tabular-nums">{completedCount} of 7</Badge>
            </div>
            {READINESS_AREAS.map((area) => {
              const done = guestDraft.completedAreas.includes(area.key);
              return (
                <div key={area.key} className={cn("rounded-lg border p-3 transition-colors", done ? "border-success/30 bg-success/5" : "border-border bg-card")}>
                  <div className="flex items-start gap-2">
                    {done ? <CheckCircle2 className="size-4 mt-0.5 text-success shrink-0" /> : <Circle className="size-4 mt-0.5 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>{area.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{done ? "Answered" : "Missing"}</div>
                      {!done && <div className="text-[10px] text-muted-foreground mt-1 italic">{area.why}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="rounded-md bg-info/5 border border-info/20 px-3 py-2 text-xs text-info">
              <ShieldCheck className="size-3 inline mr-1" />
              QuickQuid fee ₹0 during founding beta. No real money is accepted or held.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="lg:hidden sticky bottom-0 border-t border-border bg-card px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{completedCount} of 7 ready</span>
        <div className="flex-1 mx-3 h-1.5 rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(completedCount / 7) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-4 w-px bg-border" />;
}
