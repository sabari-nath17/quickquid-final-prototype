"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import type { ViewName, Role } from "@/lib/qq/types";

interface CmdItem {
  id: string;
  label: string;
  group: string;
  keywords?: string;
  view?: ViewName;
  params?: Record<string, string>;
  action?: () => void;
}

const NAV_BY_ROLE: { role: Role; items: { label: string; view: ViewName }[] }[] = [
  { role: "buyer", items: [
    { label: "Buyer dashboard", view: "buyer_dashboard" },
    { label: "Talent discovery", view: "buyer_talent" },
    { label: "Create a brief", view: "buyer_brief_new" },
    { label: "Messages", view: "buyer_messages" },
    { label: "Buyer profile", view: "buyer_profile" },
  ]},
  { role: "pro", items: [
    { label: "Pro dashboard", view: "pro_dashboard" },
    { label: "Browse briefs", view: "pro_briefs" },
    { label: "My proposals", view: "pro_proposals" },
    { label: "Gigs", view: "pro_gigs" },
    { label: "Payouts", view: "pro_payouts" },
    { label: "Pro profile", view: "pro_profile" },
  ]},
  { role: "finance", items: [
    { label: "Payment verification", view: "admin_payments" },
    { label: "Payout batches", view: "admin_payouts" },
    { label: "Refund queue", view: "admin_refunds" },
    { label: "Audit log", view: "admin_audit" },
  ]},
  { role: "risk", items: [
    { label: "Dispute queue", view: "admin_disputes" },
    { label: "Trust & Safety", view: "admin_trust" },
    { label: "Audit log", view: "admin_audit" },
  ]},
  { role: "admin_support", items: [
    { label: "KYC queue", view: "admin_kyc" },
    { label: "Support tickets", view: "support" },
    { label: "Audit log", view: "admin_audit" },
  ]},
  { role: "ops_manager", items: [
    { label: "Operations dashboard", view: "admin_operations" },
    { label: "Payment verification", view: "admin_payments" },
    { label: "Payout batches", view: "admin_payouts" },
    { label: "Dispute queue", view: "admin_disputes" },
  ]},
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen, navigate, currentRole, users, signInAs, switchRole, briefs, contracts, proProfiles, toggleTheme, normalizeSlaTimestamps, resetData } = useQQ();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Global keyboard shortcut Cmd/Ctrl+K
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") setCommandOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  React.useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  const items: CmdItem[] = React.useMemo(() => {
    const list: CmdItem[] = [];
    // Navigation for current role
    const nav = NAV_BY_ROLE.find((n) => n.role === currentRole);
    if (nav) {
      nav.items.forEach((it) => list.push({ id: `nav-${it.view}`, label: it.label, group: "Navigate", keywords: it.label.toLowerCase(), view: it.view }));
    }
    // Jump to specific briefs
    briefs.slice(0, 8).forEach((b) => list.push({ id: `brief-${b.id}`, label: `${b.title} (${b.id})`, group: "Briefs", keywords: `brief ${b.id} ${b.title}`.toLowerCase(), view: currentRole === "pro" ? "pro_briefs" : "buyer_brief_detail", params: { briefId: b.id } }));
    // Jump to contracts
    contracts.slice(0, 8).forEach((c) => list.push({ id: `contract-${c.id}`, label: `${c.briefTitle} — ${c.id}`, group: "Contracts", keywords: `contract ${c.id} ${c.briefTitle}`.toLowerCase(), view: currentRole === "pro" ? "pro_contract" : "buyer_contract", params: { contractId: c.id } }));
    // Switch role (demo)
    users.filter((u) => u.role !== "visitor").forEach((u) => list.push({ id: `role-${u.id}`, label: `Sign in as ${u.name}`, group: "Switch role (demo)", keywords: `switch ${u.name} ${u.role}`.toLowerCase(), action: () => signInAs(u.id) }));
    // Quick actions
    list.push({ id: "qa-theme", label: "Toggle dark / light theme", group: "Actions", keywords: "dark light theme mode", action: () => toggleTheme() });
    list.push({ id: "qa-sla", label: "Normalize SLA timestamps (demo)", group: "Actions", keywords: "sla timestamps reset normalize", action: () => normalizeSlaTimestamps() });
    list.push({ id: "qa-reset", label: "Reset all demo data", group: "Actions", keywords: "reset clear demo data", action: () => { if (confirm("Reset all demo data to defaults? This clears your session changes.")) resetData(); } });
    list.push({ id: "qa-support", label: "Open support", group: "Actions", keywords: "help support ticket", view: "support" });
    list.push({ id: "qa-back", label: "Back to role selection", group: "Actions", keywords: "logout sign out role selection", action: () => switchRole("visitor") });
    return list;
  }, [currentRole, briefs, contracts, users, signInAs, toggleTheme, normalizeSlaTimestamps, resetData, switchRole]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => (it.keywords ?? it.label.toLowerCase()).includes(q));
  }, [items, query]);

  React.useEffect(() => { setActive(0); }, [query]);

  function exec(item: CmdItem) {
    setCommandOpen(false);
    if (item.action) item.action();
    else if (item.view) navigate(item.view, item.params);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) exec(filtered[active]); }
  }

  // Group filtered items
  const groups = React.useMemo(() => {
    const m = new Map<string, CmdItem[]>();
    filtered.forEach((it) => { if (!m.has(it.group)) m.set(it.group, []); m.get(it.group)!.push(it); });
    return Array.from(m.entries());
  }, [filtered]);

  let flatIdx = -1;

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="max-w-[560px] p-0 gap-0 overflow-hidden top-[20%] translate-y-0" showCloseButton={false} aria-describedby={undefined}>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search screens, briefs, contracts, actions… (Esc to close)"
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto scroll-area-thin p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">No results for "{query}"</div>
          ) : (
            groups.map(([group, gItems]) => (
              <div key={group} className="mb-1">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group}</div>
                {gItems.map((it) => {
                  flatIdx++;
                  const idx = flatIdx;
                  return (
                    <button
                      key={it.id}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => exec(it)}
                      className={cn("flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors", active === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}
                    >
                      <span className="truncate">{it.label}</span>
                      {active === idx && <CornerDownLeft className="size-3.5 shrink-0 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5"><kbd className="rounded border border-border bg-background px-1">↑</kbd><kbd className="rounded border border-border bg-background px-1">↓</kbd> navigate</span>
            <span className="inline-flex items-center gap-0.5"><kbd className="rounded border border-border bg-background px-1">↵</kbd> select</span>
          </span>
          <span>{filtered.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useQQ();
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);
  return <>{children}</>;
}
