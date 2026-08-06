"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQQ } from "@/lib/qq/store";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/qq/format";
import { Bell, CheckCheck, CheckCircle2, Clock, Banknote, Scale, ShieldCheck, MessageSquare, AlertTriangle, FileText } from "lucide-react";
import type { NotificationItem } from "@/lib/qq/types";

const iconFor: Record<NotificationItem["type"], React.ComponentType<{ className?: string }>> = {
  proposal_received: FileText,
  payment_submitted: Clock,
  payment_confirmed: CheckCircle2,
  payment_rejected: AlertTriangle,
  payout_processed: Banknote,
  payout_queued: Banknote,
  dispute_update: Scale,
  dispute_opened: Scale,
  kyc_result: ShieldCheck,
  contract_accepted: CheckCircle2,
  deliverable_submitted: FileText,
  message: MessageSquare,
  sla_warning: AlertTriangle,
};

export function NotificationDrawer() {
  const { notificationDrawerOpen, setNotificationDrawer, navigate, markNotificationRead, markAllRead, notifications, currentUserId } = useQQ();
  const items = React.useMemo(
    () => notifications.filter((n) => n.userId === currentUserId),
    [notifications, currentUserId],
  );
  return (
    <Sheet open={notificationDrawerOpen} onOpenChange={setNotificationDrawer}>
      <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2"><Bell className="size-4" /> Notifications</SheetTitle>
          {items.length > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck className="size-3.5" /> Mark all read</Button>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = iconFor[n.type];
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => { if (n.link) { const [view, qs] = n.link.split("?"); const params: Record<string, string> = {}; qs?.split("&").forEach((p) => { const [k, v] = p.split("="); params[k] = v; }); navigate(view as any, params); } markNotificationRead(n.id); setNotificationDrawer(false); }}
                      className={cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/40", !n.read && "bg-primary/5")}
                    >
                      <div className={cn("mt-0.5 rounded-full p-1.5", n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{n.title}</span>
                          {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
