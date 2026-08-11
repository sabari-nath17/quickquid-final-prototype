"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Briefcase, Users, FileText, Wallet, MessageSquare,
  ShieldCheck, Banknote, RefreshCcw, Scale, ScrollText, FileSearch,
  Bell, Search, HelpCircle, Menu, X, Home, ChevronDown, UserCog,
  Sparkles, ClipboardList, ShieldAlert, ClipboardCheck, Sun, Moon, Clapperboard,
} from "lucide-react";
import type { Role, ViewName } from "@/lib/qq/types";
import { useToast } from "@/hooks/use-toast";
import { BackButton, QuickQuidVerifiedBadge } from "@/components/qq/shared";
import { assetPath } from "@/lib/asset-path";

interface NavItem { label: string; view: ViewName; icon: React.ComponentType<{ className?: string }>; }

const NAV: Record<Role, NavItem[]> = {
  visitor: [],
  buyer: [
    { label: "Dashboard", view: "buyer_dashboard", icon: LayoutDashboard },
    { label: "Talent", view: "buyer_talent", icon: Users },
    { label: "Briefs", view: "buyer_brief_new", icon: FileText },
    { label: "Messages", view: "buyer_messages", icon: MessageSquare },
    { label: "Profile", view: "buyer_profile", icon: UserCog },
    { label: "Support", view: "support", icon: HelpCircle },
  ],
  pro: [
    { label: "Dashboard", view: "pro_dashboard", icon: LayoutDashboard },
    { label: "Briefs", view: "pro_briefs", icon: Briefcase },
    { label: "Proposals", view: "pro_proposals", icon: FileText },
    { label: "Messages", view: "pro_contract", icon: MessageSquare },
    { label: "Gigs", view: "pro_gigs", icon: Sparkles },
    { label: "Payouts", view: "pro_payouts", icon: Wallet },
    { label: "Profile", view: "pro_profile", icon: UserCog },
    { label: "Support", view: "support", icon: HelpCircle },
  ],
  admin_support: [
    { label: "Operations", view: "admin_operations", icon: LayoutDashboard },
    { label: "KYC queue", view: "admin_kyc", icon: ClipboardCheck },
    { label: "Gig moderation", view: "admin_gig_moderation", icon: Sparkles },
    { label: "Support", view: "support", icon: HelpCircle },
    { label: "Audit log", view: "admin_audit", icon: ScrollText },
    { label: "Admin notes", view: "admin_notes", icon: ClipboardList },
  ],
  finance: [
    { label: "Operations", view: "admin_operations", icon: LayoutDashboard },
    { label: "Payments", view: "admin_payments", icon: Banknote },
    { label: "Payouts", view: "admin_payouts", icon: Wallet },
    { label: "Refunds", view: "admin_refunds", icon: RefreshCcw },
    { label: "Audit log", view: "admin_audit", icon: ScrollText },
    { label: "Admin notes", view: "admin_notes", icon: ClipboardList },
  ],
  risk: [
    { label: "Operations", view: "admin_operations", icon: LayoutDashboard },
    { label: "Disputes", view: "admin_disputes", icon: Scale },
    { label: "Trust & Safety", view: "admin_trust", icon: ShieldAlert },
    { label: "Audit log", view: "admin_audit", icon: ScrollText },
    { label: "Admin notes", view: "admin_notes", icon: ClipboardList },
  ],
  ops_manager: [
    { label: "Operations", view: "admin_operations", icon: LayoutDashboard },
    { label: "KYC queue", view: "admin_kyc", icon: ClipboardCheck },
    { label: "Payments", view: "admin_payments", icon: Banknote },
    { label: "Payouts", view: "admin_payouts", icon: Wallet },
    { label: "Refunds", view: "admin_refunds", icon: RefreshCcw },
    { label: "Disputes", view: "admin_disputes", icon: Scale },
    { label: "Trust & Safety", view: "admin_trust", icon: ShieldAlert },
    { label: "Gig moderation", view: "admin_gig_moderation", icon: Sparkles },
    { label: "Audit log", view: "admin_audit", icon: ScrollText },
    { label: "Media & lifecycle", view: "media_lifecycle_demo", icon: Clapperboard },
    { label: "Admin notes", view: "admin_notes", icon: ClipboardList },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  visitor: "Visitor",
  buyer: "Buyer",
  pro: "Pro",
  admin_support: "Support · T1",
  finance: "Finance · T2",
  risk: "Risk · T3",
  ops_manager: "Ops Manager",
};

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src={assetPath("/quickquid-logo.svg")} alt="QuickQuid" className="h-8 w-auto" />
      <div className="leading-tight">
        <div className="font-semibold text-sm">QuickQuid</div>
        <div className="text-[10px] text-muted-foreground">the execution marketplace</div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { currentRole, view, navigate, switchRole, setMobileSidebar } = useQQ();
  const items = NAV[currentRole];
  return (
    <aside className="qq-sidebar hidden md:flex w-[240px] shrink-0 flex-col border-r border-border bg-card h-screen sticky top-0">
      <div className="flex h-16 items-center px-4 border-b border-border">
        <button onClick={() => navigate(currentRole === "visitor" ? "role_selection" : currentRole === "buyer" ? "buyer_dashboard" : currentRole === "pro" ? "pro_dashboard" : "admin_operations")}>
          <Logo />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto scroll-area-thin p-3 space-y-0.5">
        <div className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Menu</div>
        {items.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/25"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          );
        })}
        <SidebarTrustPanel role={currentRole} />
      </nav>
      <RoleSwitcher />
    </aside>
  );
}

function SidebarTrustPanel({ role }: { role: Role }) {
  const facts = role === "pro"
    ? { title: "0% commission", body: "Keep 100% of your agreed fee." }
    : role === "buyer"
    ? { title: "QuickQuid fee ₹0", body: "No platform fee during founding beta." }
    : { title: "Maker-checker", body: "All money actions are audited." };
  return (
    <div className="qq-sidebar-trust mt-4 mx-1 rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <ShieldCheck className="size-3.5 text-emerald-600" /> {facts.title}
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{facts.body}</p>
    </div>
  );
}

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebar, currentRole, view, navigate } = useQQ();
  if (!mobileSidebarOpen) return null;
  const items = NAV[currentRole];
  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebar(false)} />
      <aside className="qq-sidebar relative flex w-[280px] max-w-[80%] flex-col bg-card h-full">
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setMobileSidebar(false)}><X className="size-5" /></Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const active = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => { navigate(item.view); setMobileSidebar(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm",
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <RoleSwitcher />
      </aside>
    </div>
  );
}

function RoleSwitcher() {
  const { switchRole, currentRole, users, signInAs, currentUserId } = useQQ();
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const demoUsers = [
    { role: "buyer" as Role, userId: "BUY-1042" },
    { role: "buyer" as Role, userId: "BUY-1050" },
    { role: "pro" as Role, userId: "PRO-2088" },
    { role: "pro" as Role, userId: "PRO-2099" },
    { role: "pro" as Role, userId: "PRO-2101" },
    { role: "pro" as Role, userId: "PRO-2102" },
    { role: "admin_support" as Role, userId: "ADM-S01" },
    { role: "finance" as Role, userId: "FIN-F01" },
    { role: "risk" as Role, userId: "RSK-R01" },
    { role: "ops_manager" as Role, userId: "OPS-O01" },
  ];
  const activeUser = users.find((user) => user.id === currentUserId);
  return (
    <div className="border-t border-border p-3">
      <div className="rounded-md border border-border bg-muted/30 p-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Demo role switcher</div>
          <Badge variant="outline" className="text-[10px]">prototype</Badge>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-1.5 flex w-full items-center justify-between rounded px-1.5 py-1.5 text-left hover:bg-background"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-6 rounded"><AvatarFallback className="rounded bg-primary/10 text-primary text-[10px]">{currentUserId?.slice(0, 2).toUpperCase() ?? "V"}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1"><span className="text-xs font-medium truncate">{activeUser?.name ?? "Visitor"}</span>{activeUser?.verificationStatus === "approved" && (activeUser.role === "buyer" || activeUser.role === "pro") && <QuickQuidVerifiedBadge compact />}</div>
              <div className="text-[10px] text-muted-foreground">{ROLE_LABELS[currentRole]}</div>
            </div>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        {open && (
          <div className="mt-1 space-y-0.5">
            {demoUsers.map((u) => {
              const user = users.find((x) => x.id === u.userId);
              if (!user) return null;
              return (
                <button
                  key={u.userId}
                  onClick={() => { signInAs(u.userId); setOpen(false); toast({ title: `Signed in as ${user.name}`, description: ROLE_LABELS[u.role] }); }}
                  className="flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left text-xs hover:bg-background"
                >
                  <Avatar className="size-5 rounded"><AvatarFallback className="rounded bg-muted text-[9px]">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <span className="truncate">{user.name}</span>
                  {user.verificationStatus === "approved" && (user.role === "buyer" || user.role === "pro") && <QuickQuidVerifiedBadge compact />}
                  <span className="ml-auto text-[10px] text-muted-foreground">{ROLE_LABELS[u.role]}</span>
                </button>
              );
            })}
            <button onClick={() => { switchRole("visitor"); setOpen(false); }} className="flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left text-xs hover:bg-background">
              <Home className="size-4 text-muted-foreground" /> Back to role selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const { setNotificationDrawer, notifications, currentUserId, currentRole, view, navigate, setMobileSidebar, setSupportWidget, toggleTheme, theme, setCommandOpen } = useQQ();
  const unread = notifications.filter((n) => !n.read && n.userId === currentUserId).length;
  const showSearch = currentRole !== "visitor";
  const roleHome = currentRole === "buyer" ? "buyer_dashboard" : currentRole === "pro" ? "pro_dashboard" : "admin_operations";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
      <Button variant="ghost" size="icon" aria-label="Open navigation" className="md:hidden" onClick={() => setMobileSidebar(true)}><Menu className="size-5" /></Button>
      {view !== roleHome && <BackButton label="Back" className="shrink-0" />}
      {showSearch && (
        <button
          onClick={() => setCommandOpen(true)}
          className="relative hidden sm:flex flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:border-primary/30 transition-colors"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
        </button>
      )}
      <div className="flex-1 sm:hidden" />
      <div className="flex items-center gap-1">
        {showSearch && (
          <Button variant="ghost" size="icon" aria-label="Search" className="sm:hidden" onClick={() => setCommandOpen(true)}><Search className="size-5" /></Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme} title="Toggle dark mode">
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Help" onClick={() => setSupportWidget(true)}><HelpCircle className="size-5" /></Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" onClick={() => setNotificationDrawer(true)}>
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute right-1 top-1 inline-flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">{unread}</span>}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Home" onClick={() => navigate(currentRole === "visitor" ? "role_selection" : currentRole === "buyer" ? "buyer_dashboard" : currentRole === "pro" ? "pro_dashboard" : "admin_operations")}>
          <Home className="size-5" />
        </Button>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const { currentRole, view, navigate } = useQQ();
  if (currentRole === "visitor") return null;
  const items = NAV[currentRole].slice(0, 5);
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-14 items-stretch border-t border-border bg-background">
      {items.map((item) => {
        const active = view === item.view;
        return (
          <button key={item.view} onClick={() => navigate(item.view)} className={cn("flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
            <item.icon className="size-4" />
            <span className="leading-none">{item.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
