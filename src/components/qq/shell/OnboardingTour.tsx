"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Command, Users, ShieldCheck, Moon, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, X,
} from "lucide-react";
import type { Role } from "@/lib/qq/types";

const TOUR_KEY = "quickquid-tour-completed-v1";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to QuickQuid",
    body: "A trust-first freelance & gig marketplace. This is a clickable prototype — every screen, state, and workflow is real and connected. Let's take 60 seconds to orient you.",
    cta: "Start the tour",
  },
  {
    icon: Users,
    title: "Switch roles anytime",
    body: "Use the avatar button at the bottom-left of the sidebar to switch between 6 demo accounts: Buyer (Northstar Labs), Pro (Akhil Menon), Admin Support T1, Finance T2, Risk T3, and Ops Manager. Each role sees a completely different app.",
    cta: "Next",
  },
  {
    icon: Command,
    title: "Press ⌘K for the command palette",
    body: "Jump to any screen, brief, or contract instantly. Switch roles, toggle dark mode, normalize SLA timestamps, or reset demo data — all from one searchable palette.",
    cta: "Next",
  },
  {
    icon: ShieldCheck,
    title: "Locked business rules",
    body: "0% Pro commission (always a ₹0 line). 0% Buyer fee shown before payment. Payments processed via the integrated payment system. Max 4 milestones. Taxes = 'Calculated by Finance if applicable'.",
    cta: "Next",
  },
  {
    icon: Moon,
    title: "Dark mode + persistence",
    body: "Toggle dark mode with the sun/moon icon in the header. All your changes (briefs, proposals, payment evidence) persist across reloads via localStorage. Use Admin → Admin notes → 'Reset demo data' to start fresh.",
    cta: "Got it",
  },
];

export function OnboardingTour() {
  const { currentRole, view, setCommandOpen } = useQQ();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  // Show tour when a signed-in user first lands on a dashboard, if not completed
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentRole === "visitor") return;
    const isDashboard = ["buyer_dashboard", "pro_dashboard", "admin_operations"].includes(view);
    const completed = localStorage.getItem(TOUR_KEY);
    if (isDashboard && !completed) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [currentRole, view]);

  function dismiss() {
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem(TOUR_KEY, "1");
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-[440px] p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <DialogTitle className="sr-only">{s.title}</DialogTitle>
        <DialogDescription className="sr-only">{s.body}</DialogDescription>
        {/* Progress header */}
        <div className="flex items-center gap-1 px-4 pt-4">
          {STEPS.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Icon className="size-7 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-bold tracking-tight">{s.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </div>
        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={dismiss}>Skip tour</Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={prev}>
                <ArrowLeft className="size-3.5" /> Back
              </Button>
            )}
            {step === 2 ? (
              <Button size="sm" onClick={() => { dismiss(); setCommandOpen(true); }}>
                Try ⌘K <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={next}>
                {step === STEPS.length - 1 ? <><CheckCircle2 className="size-3.5" /> Got it</> : <>{s.cta} <ArrowRight className="size-3.5" /></>}
              </Button>
            )}
          </div>
        </div>
        {/* Step counter */}
        <div className="bg-muted/30 px-4 py-1.5 text-center text-[10px] text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
