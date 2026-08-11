"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Clock, AlertTriangle, ShieldAlert, XCircle, Info,
  PauseCircle, FileSearch, Send, Lock, Eye, EyeOff, Loader2, Ban,
} from "lucide-react";

type Tone =
  | "success" | "pending" | "warning" | "critical" | "info" | "neutral"
  | "locked" | "paused" | "rejected";

const toneStyles: Record<Tone, string> = {
  success: "bg-[#EDFBF4] text-[#087350] border-[#9EE5C7] dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  pending: "bg-[#FFF7E4] text-[#8A5B06] border-[#F0D288] dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  warning: "bg-[#FFF0EC] text-[#B93628] border-[#F8B6A9] dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
  critical: "bg-red-600 text-white border-red-700 dark:bg-red-900 dark:text-red-50 dark:border-red-800 font-semibold",
  info: "bg-[#EEF1FF] text-[#233CC4] border-[#BFC9FF] dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
  neutral: "bg-[#F0F0EB] text-[#555B57] border-[#D9DAD3] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  locked: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  paused: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  rejected: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
};

const toneIcon: Record<Tone, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  pending: Clock,
  warning: AlertTriangle,
  critical: ShieldAlert,
  info: Info,
  neutral: Info,
  locked: Lock,
  paused: PauseCircle,
  rejected: XCircle,
};

export function StatusBadge({
  tone = "neutral",
  children,
  icon = true,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}) {
  const Icon = toneIcon[tone];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", toneStyles[tone], className)}>
      {icon && <Icon className="size-3.5" />}
      {children}
    </Badge>
  );
}

// Map domain status strings to tone + label
export function statusMeta(status: string): { tone: Tone; label: string } {
  const s = status.toLowerCase().replace(/_/g, " ");
  if (/(approved|confirmed|processed|accepted|cleared|funded|live|restored|resolved|submitted and reviewed|ready)/.test(s))
    return { tone: "success", label: status.replace(/_/g, " ") };
  if (/(under|pending|queued|awaiting|submitted|in review|in_review|under review|processing)/.test(s))
    return { tone: "pending", label: status.replace(/_/g, " ") };
  if (/(approaching|warning|sla|expiring|inactive|pending settlement|pending_reverification)/.test(s))
    return { tone: "warning", label: status.replace(/_/g, " ") };
  if (/(rejected|failed|dishonoured|escalated|suspended|breached|deadlock|chargeback)/.test(s))
    return { tone: /(critical|suspended|breached|deadlock|chargeback)/.test(s) ? "critical" : "rejected", label: status.replace(/_/g, " ") };
  if (/(paused|withdrawn|expired|archived|inactive|hidden)/.test(s))
    return { tone: "paused", label: status.replace(/_/g, " ") };
  if (/(locked|frozen)/.test(s)) return { tone: "locked", label: status.replace(/_/g, " ") };
  if (/(draft|not started)/.test(s)) return { tone: "neutral", label: status.replace(/_/g, " ") };
  return { tone: "info", label: status.replace(/_/g, " ") };
}

export type { Tone };
