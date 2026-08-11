"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatINR, buyerTotal } from "@/lib/qq/format";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FeeBreakdown({
  proFee,
  showTax = true,
  compact = false,
  className,
}: {
  proFee: number;
  showTax?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const total = buyerTotal(proFee);
  return (
    <Card className={compact ? "p-3" : "p-4"}>
      <div className="space-y-2 text-sm">
        <Row label="Professional fee" value={formatINR(proFee)} />
        <Row
          label={
            <span className="inline-flex items-center gap-1">
              QuickQuid commission (deducted from Pro)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="size-3 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>QuickQuid deducts 0% from the Pro's professional fee.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          }
          value={formatINR(0)}
          muted
        />
        <Row label="QuickQuid Buyer fee (0%)" value={formatINR(0)} muted />
        {showTax && (
          <Row
            label={
              <span className="inline-flex items-center gap-1">
                Applicable taxes
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Info className="size-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>Calculated by Finance if applicable. Tax configuration pending approval.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            }
            value="Calculated by Finance if applicable"
            muted
          />
        )}
        <Separator className="my-1" />
        <Row label={<span className="font-semibold">Buyer total before applicable tax</span>} value={<span className="font-semibold">{formatINR(total)}</span>} />
      </div>
    </Card>
  );
}

function Row({ label, value, muted }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span className={muted ? "text-muted-foreground text-right" : "text-foreground text-right tabular-nums"}>{value}</span>
    </div>
  );
}
