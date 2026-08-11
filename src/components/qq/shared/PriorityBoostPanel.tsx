"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Rocket, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Eye,
  MousePointerClick, Send, Info, AlertTriangle,
} from "lucide-react";
import { StatusBadge, statusMeta } from "./StatusBadge";
import { formatINR } from "@/lib/qq/format";
import type { PriorityBoost, PriorityDuration } from "@/lib/qq/types";

const DURATION_OPTIONS: { value: PriorityDuration; label: string; fee: number }[] = [
  { value: 3, label: "3 days", fee: 800 },
  { value: 7, label: "7 days", fee: 1500 },
  { value: 14, label: "14 days", fee: 2500 },
];

interface PriorityBoostPanelProps {
  gigId: string;
  gigTitle: string;
  proId: string;
  proName: string;
  boost?: PriorityBoost;
  onSubmit: (pb: PriorityBoost) => void;
  onNavigateToAdmin?: () => void;
}

export function PriorityBoostPanel({ gigId, gigTitle, proId, proName, boost, onSubmit, onNavigateToAdmin }: PriorityBoostPanelProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [duration, setDuration] = React.useState<PriorityDuration>(7);
  const [utr, setUtr] = React.useState("");
  const [method, setMethod] = React.useState("NEFT");
  const [note, setNote] = React.useState("");

  const selectedOption = DURATION_OPTIONS.find((d) => d.value === duration)!;
  const meta = boost ? statusMeta(boost.paymentStatus) : null;

  function handleSubmit() {
    if (!utr.trim()) return;
    const pb: PriorityBoost = {
      id: `PB-${Date.now().toString(36).toUpperCase()}`,
      gigId,
      proId,
      proName,
      priorityFee: selectedOption.fee,
      duration,
      paymentReference: utr.trim(),
      paymentMethod: method,
      paymentStatus: "payment_evidence_submitted",
      createdAt: new Date().toISOString(),
      analytics: { views: 0, clicks: 0, requests: 0 },
    };
    onSubmit(pb);
    setShowForm(false);
    setUtr("");
    setNote("");
  }

  // Active priority with countdown
  if (boost && boost.paymentStatus === "active") {
    const end = new Date(boost.priorityEnd!).getTime();
    const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
    return (
      <Card className="p-4 border-violet-200 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
              <Rocket className="size-4.5" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                Priority active
                <Badge className="bg-violet-500 text-white text-[10px]"><Rocket className="size-2.5" /> Promoted</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{formatINR(boost.priorityFee)} · {boost.duration} days · ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <StatusBadge tone="success"><CheckCircle2 className="size-3" /> Active</StatusBadge>
        </div>
        {boost.analytics && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md bg-background border border-border p-2">
              <div className="text-muted-foreground flex items-center gap-1"><Eye className="size-3" /> Views</div>
              <div className="font-bold text-base tabular-nums">{boost.analytics.views}</div>
            </div>
            <div className="rounded-md bg-background border border-border p-2">
              <div className="text-muted-foreground flex items-center gap-1"><MousePointerClick className="size-3" /> Clicks</div>
              <div className="font-bold text-base tabular-nums">{boost.analytics.clicks}</div>
            </div>
            <div className="rounded-md bg-background border border-border p-2">
              <div className="text-muted-foreground flex items-center gap-1"><Send className="size-3" /> Requests</div>
              <div className="font-bold text-base tabular-nums">{boost.analytics.requests}</div>
            </div>
          </div>
        )}
        <div className="mt-2 text-[10px] text-muted-foreground">Priority fee is a marketing fee, not deducted from your professional fee. 0% commission unchanged.</div>
      </Card>
    );
  }

  // Under verification
  if (boost && (boost.paymentStatus === "payment_evidence_submitted" || boost.paymentStatus === "under_admin_verification")) {
    return (
      <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              <Clock className="size-4.5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Priority payment under review</div>
              <div className="text-xs text-muted-foreground">{formatINR(boost.priorityFee)} · {boost.duration} days · UTR: {boost.paymentReference}</div>
            </div>
          </div>
          <StatusBadge tone="pending">Under review</StatusBadge>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Your priority payment is being processed via the integrated payment system. Your gig stays in organic results meanwhile.</div>
      </Card>
    );
  }

  // Expired
  if (boost && boost.paymentStatus === "expired") {
    return (
      <Card className="p-4 border-muted">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Clock className="size-4.5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Priority expired</div>
              <div className="text-xs text-muted-foreground">Your gig has returned to organic ranking.</div>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}><Rocket className="size-3.5" /> Boost again</Button>
        </div>
        {boost.analytics && (
          <div className="mt-2 text-[10px] text-muted-foreground">Total during priority: {boost.analytics.views} views, {boost.analytics.requests} requests.</div>
        )}
      </Card>
    );
  }

  // Rejected
  if (boost && boost.paymentStatus === "rejected") {
    return (
      <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              <XCircle className="size-4.5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-red-800 dark:text-red-300">Priority payment rejected</div>
              <div className="text-xs text-red-700 dark:text-red-400">{boost.rejectionReason ?? "Payment could not be verified."}</div>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>Resubmit</Button>
        </div>
      </Card>
    );
  }

  // Form
  if (showForm) {
    return (
      <Card className="p-4 border-violet-200">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="size-4 text-violet-600" />
          <h3 className="font-semibold text-sm">Boost "{gigTitle}" in Buyer feed</h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-left transition-all",
                    duration === opt.value ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-border hover:border-violet-300",
                  )}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{formatINR(opt.fee)}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Priority fee ({selectedOption.label})</span><span className="font-semibold">{formatINR(selectedOption.fee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">QuickQuid commission</span><span className="font-semibold">₹0</span></div>
            <div className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-1">This is a marketing fee, not deducted from your professional fee. Your gig fee stays 100% yours.</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="utr">UTR / Transaction reference *</Label>
              <Input id="utr" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="UTR123456789" />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="IMPS">IMPS</SelectItem>
                  <SelectItem value="RTGS">RTGS</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" className="ml-auto" onClick={handleSubmit} disabled={!utr.trim()}>
              <Send className="size-3.5" /> Submit priority payment
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default: no priority
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
            <Rocket className="size-4.5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Boost this gig</div>
            <div className="text-xs text-muted-foreground">Get higher placement in Buyer discovery. From {formatINR(800)} for 3 days.</div>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}><Rocket className="size-3.5" /> Boost</Button>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
        <Info className="size-3" /> Marketing fee only. 0% commission unchanged. Pro fee stays 100% yours.
      </div>
    </Card>
  );
}
