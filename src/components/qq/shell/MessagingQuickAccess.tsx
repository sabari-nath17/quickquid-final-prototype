"use client";

import * as React from "react";
import { useQQ } from "@/lib/qq/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Search, X, ChevronRight } from "lucide-react";
import { timeAgo } from "@/lib/qq/format";

export function MessagingQuickAccess() {
  const { currentRole, contracts, messages, navigate, currentUserId } = useQQ();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  if (currentRole === "visitor" || currentRole === "admin_support" || currentRole === "finance" || currentRole === "risk" || currentRole === "ops_manager") {
    return null;
  }

  // Get contracts with messages for this user
  const myContracts = contracts.filter((c) =>
    currentRole === "buyer" ? c.buyerId === currentUserId : c.proId === currentUserId
  );

  const contractsWithMessages = myContracts
    .map((c) => {
      const msgs = messages.filter((m) => m.contractId === c.id);
      const lastMsg = msgs[msgs.length - 1];
      return { contract: c, lastMessage: lastMsg, messageCount: msgs.length };
    })
    .filter((item) => item.messageCount > 0)
    .sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0;
      return new Date(b.lastMessage.at).getTime() - new Date(a.lastMessage.at).getTime();
    });

  const filtered = query.trim()
    ? contractsWithMessages.filter((item) =>
        item.contract.briefTitle.toLowerCase().includes(query.toLowerCase()) ||
        (currentRole === "buyer" ? item.contract.proName : item.contract.buyerName).toLowerCase().includes(query.toLowerCase())
      )
    : contractsWithMessages;

  function openConversation(contractId: string) {
    setOpen(false);
    navigate(currentRole === "buyer" ? "buyer_messages" : "pro_contract", { contractId });
  }

  return (
    <>
      {/* Floating compose button — bottom-left, above Help FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 md:bottom-20 md:left-20 z-20 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground shadow-lg px-3.5 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
        aria-label="Quick messages"
      >
        <MessageSquare className="size-3.5" /> Messages
        {contractsWithMessages.length > 0 && (
          <span className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full bg-background text-primary text-[10px] font-bold">
            {contractsWithMessages.length}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between space-y-0">
            <SheetTitle className="flex items-center gap-2"><MessageSquare className="size-4" /> Quick messages</SheetTitle>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setOpen(false)}><X className="size-4" /></Button>
          </SheetHeader>

          {/* Search */}
          <div className="px-4 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-md border border-border bg-muted/30 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto scroll-area-thin">
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                {contractsWithMessages.length === 0
                  ? "No conversations yet. Start messaging from a contract workroom."
                  : `No results for "${query}"`}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => {
                  const counterparty = currentRole === "buyer" ? item.contract.proName : item.contract.buyerName;
                  const counterpartyColor = currentRole === "buyer" ? "#7C3AED" : "#0F766E";
                  return (
                    <li key={item.contract.id}>
                      <button
                        onClick={() => openConversation(item.contract.id)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                      >
                        <Avatar className="size-10 rounded-md shrink-0" style={{ backgroundColor: counterpartyColor }}>
                          <AvatarFallback className="rounded-md text-white text-xs font-medium">
                            {counterparty.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm truncate">{counterparty}</span>
                            {item.lastMessage && (
                              <time className="text-[10px] text-muted-foreground shrink-0">{timeAgo(item.lastMessage.at)}</time>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{item.contract.briefTitle}</div>
                          {item.lastMessage && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              <span className="font-medium">{item.lastMessage.from === "system" ? "" : item.lastMessage.fromName + ": "}</span>
                              {item.lastMessage.text}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 text-center text-[10px] text-muted-foreground">
            {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
