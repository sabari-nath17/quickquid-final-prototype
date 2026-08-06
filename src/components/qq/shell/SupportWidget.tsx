"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQQ } from "@/lib/qq/store";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, X } from "lucide-react";
import { genId } from "@/lib/qq/format";

export function SupportWidget() {
  const { supportWidgetOpen, setSupportWidget, currentUserId, users, contracts, payments, createTicket, navigate } = useQQ();
  const { toast } = useToast();
  const [category, setCategory] = React.useState("payment");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const user = users.find((u) => u.id === currentUserId);

  const myContracts = contracts.filter((c) => c.buyerId === currentUserId || c.proId === currentUserId);
  const myPayments = payments.filter((p) => myContracts.some((c) => c.id === p.contractId));

  function submit() {
    if (!user) { toast({ title: "Sign in to submit a ticket", variant: "destructive" }); return; }
    if (!subject.trim() || !description.trim()) { toast({ title: "Subject and description required", variant: "destructive" }); return; }
    const ticket = {
      id: genId("TKT"),
      userId: user.id,
      userName: user.name,
      category: category as any,
      subject: subject.trim(),
      description: description.trim(),
      attachedContext: {
        contractId: myContracts[0]?.id,
        paymentReference: myPayments[0]?.id,
        status: myPayments[0]?.status.replace(/_/g, " "),
        latestEvent: myPayments[0]?.submittedAt,
      },
      status: "submitted" as const,
      createdAt: new Date().toISOString(),
      messages: [{ from: "user" as const, text: description.trim(), at: new Date().toISOString() }],
    };
    createTicket(ticket);
    toast({ title: "Ticket submitted", description: `${ticket.id} created. We will respond shortly.` });
    setSubject(""); setDescription(""); setCategory("payment");
    setSupportWidget(false);
    navigate("support");
  }

  return (
    <>
      <button
        onClick={() => setSupportWidget(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background shadow-lg px-3.5 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
        aria-label="Help"
      >
        <HelpCircle className="size-3.5" /> Help
      </button>
      <Sheet open={supportWidgetOpen} onOpenChange={setSupportWidget}>
        <SheetContent className="w-full sm:max-w-[420px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><HelpCircle className="size-4" /> Get help</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment issue</SelectItem>
                  <SelectItem value="contract">Contract issue</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subj">Subject</Label>
              <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Describe the issue</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="What happened? What do you need?" />
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              We will automatically attach your contract ID, payment reference, current status, and latest event so Support can help faster.
              {myContracts[0] && <div className="mt-1 font-mono">Context: {myContracts[0].id}{myPayments[0] ? ` · ${myPayments[0].id}` : ""}</div>}
            </div>
          </div>
          <SheetFooter>
            <Button onClick={submit} className="w-full">Submit ticket</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
