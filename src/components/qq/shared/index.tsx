"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Inbox, RefreshCw, Loader2, Eye, EyeOff, Clock, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function PageHeader({
  title,
  description,
  status,
  children,
  breadcrumb,
}: {
  title: string;
  description?: string;
  status?: React.ReactNode;
  children?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {breadcrumb}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {status}
          </div>
          {description && <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  illustration,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  illustration?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-14 text-center", className)}>
      {illustration ?? (
        <div className="relative">
          <svg width="80" height="64" viewBox="0 0 80 64" fill="none" className="text-muted-foreground/30">
            <rect x="8" y="14" width="64" height="44" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="40" cy="34" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M36 34h8M40 30v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-background border border-border p-1.5 shadow-sm">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
      )}
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {actions && <div className="mt-4 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="p-6 border-destructive/30">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-destructive/10 p-2">
          <AlertTriangle className="size-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-destructive">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
              <RefreshCw className="size-3.5" /> Retry
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      <Loader2 className="size-4 mr-2 animate-spin" /> {label}
    </div>
  );
}

export function QQSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  );
}

export function SLATimer({
  openedAt,
  targetHours,
  breachedAtHours,
  escalateAtHours,
}: {
  openedAt: string;
  targetHours: number;
  breachedAtHours?: number;
  escalateAtHours?: number;
}) {
  const elapsed = Math.floor((Date.now() - new Date(openedAt).getTime()) / 3600000);
  const breach = breachedAtHours ?? targetHours;
  const escalate = escalateAtHours ?? breach * 2;
  let tone: "success" | "pending" | "warning" | "critical" = "success";
  if (elapsed >= escalate) tone = "critical";
  else if (elapsed >= breach) tone = "warning";
  else if (elapsed >= breach * 0.7) tone = "pending";
  const label =
    elapsed >= escalate ? `Escalation due (>${escalate}h)`
    : elapsed >= breach ? `SLA breached (>${breach}h)`
    : `${elapsed}h / ${targetHours}h elapsed`;
  return (
    <StatusBadge tone={tone} icon>
      <Clock className="size-3.5" /> {label}
    </StatusBadge>
  );
}

export function QQProgress({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "success" | "warning" }) {
  const color = tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : "bg-primary";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function MaskedField({
  label,
  value,
  masked,
  canReveal,
  onReveal,
  onUnmask,
}: {
  label: string;
  value: string;
  masked: boolean;
  canReveal?: boolean;
  onReveal?: () => void;
  onUnmask?: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
        <code className="text-sm font-mono">{value}</code>
        {canReveal && (
          <Button type="button" variant="ghost" size="sm" onClick={masked ? onReveal : onUnmask}>
            {masked ? <><Eye className="size-3.5" /> Reveal</> : <><EyeOff className="size-3.5" /> Mask</>}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ReadinessChecklist({
  items,
}: {
  items: { label: string; done: boolean; note?: string }[];
}) {
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Readiness</span>
        <span className="text-sm text-muted-foreground tabular-nums">{done}/{items.length} · {pct}%</span>
      </div>
      <QQProgress value={pct} tone={pct === 100 ? "success" : pct >= 50 ? "primary" : "warning"} className="mb-3" />
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-start gap-2 text-sm">
            <span className={cn("mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border", i.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border")}>
              {i.done && <CheckSmall />}
            </span>
            <span className={i.done ? "text-foreground" : "text-muted-foreground"}>
              {i.label}
              {i.note && <span className="block text-xs text-muted-foreground">{i.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CheckSmall() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-bold tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </Card>
  );
}

type BannerTone = "info" | "action" | "warning" | "critical";
const bannerStyles: Record<BannerTone, { wrap: string; icon: string; title: string }> = {
  info: { wrap: "border-sky-300 bg-sky-50 dark:bg-sky-950/40 dark:border-sky-800", icon: "text-sky-600 dark:text-sky-400", title: "text-sky-900 dark:text-sky-100" },
  action: { wrap: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800", icon: "text-emerald-600 dark:text-emerald-400", title: "text-emerald-900 dark:text-emerald-100" },
  warning: { wrap: "border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800", icon: "text-amber-600 dark:text-amber-400", title: "text-amber-900 dark:text-amber-100" },
  critical: { wrap: "border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-800", icon: "text-red-600 dark:text-red-400", title: "text-red-900 dark:text-red-100" },
};

export function AlertBanner({
  tone = "info",
  icon: Icon,
  title,
  children,
  actions,
  className,
}: {
  tone?: BannerTone;
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const s = bannerStyles[tone];
  const DefaultIcon = tone === "critical" ? ShieldAlert : tone === "warning" ? AlertTriangle : tone === "action" ? CheckCircle2 : Info;
  const I = Icon ?? DefaultIcon;
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3.5", s.wrap, className)}>
      <I className={cn("size-5 shrink-0 mt-0.5", s.icon)} />
      <div className="flex-1 min-w-0">
        {title && <div className={cn("text-sm font-semibold", s.title)}>{title}</div>}
        {children && <div className={cn("text-sm mt-0.5", "text-foreground/80")}>{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AuditRow({ event }: { event: { id: string; adminId: string; adminRole: string; action: string; entity: string; entityId: string; oldStatus?: string; newStatus?: string; timestamp: string; reason?: string; maskedReveal?: boolean } }) {
  return (
    <div className="grid grid-cols-12 gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/30">
      <div className="col-span-12 sm:col-span-3 font-medium">{event.action}{event.maskedReveal && <span className="ml-1 text-xs text-amber-600">(masked reveal)</span>}</div>
      <div className="col-span-6 sm:col-span-2 text-muted-foreground">{event.entity} <span className="font-mono text-xs">{event.entityId}</span></div>
      <div className="col-span-6 sm:col-span-2 text-muted-foreground">{event.oldStatus ?? "—"} → {event.newStatus ?? "—"}</div>
      <div className="col-span-6 sm:col-span-2 text-muted-foreground">{event.adminId} · {event.adminRole}</div>
      <div className="col-span-6 sm:col-span-2 text-muted-foreground">{new Date(event.timestamp).toLocaleString("en-IN")}</div>
      {event.reason && <div className="col-span-12 text-xs text-muted-foreground">Reason: {event.reason}</div>}
    </div>
  );
}
