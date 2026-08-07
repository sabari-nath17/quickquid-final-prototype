"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Inbox } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export interface QueueColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  align?: "left" | "right" | "center";
}

export function QueueTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  emptyMessage = "No items in this queue.",
  slaKey,
}: {
  columns: QueueColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  slaKey?: (row: T) => { tone: "success" | "pending" | "warning" | "critical"; label: string };
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
        <div className="rounded-full bg-background border border-border p-2.5 shadow-sm">
          <Inbox className="size-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  const alignClass = (a?: "left" | "right" | "center") => a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";
  return (
    <>
      {/* Desktop table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto scroll-area-thin">
          <table className="qq-table w-full text-sm">
            <thead className="bg-muted/60 border-b border-border">
              <tr>
                {columns.map((c) => <th key={c.key} className={cn("px-3 py-3 font-semibold text-foreground whitespace-nowrap text-xs uppercase tracking-wide", alignClass(c.align), c.className)}>{c.header}</th>)}
                <th className="px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => onRowClick?.(row)}>
                  {columns.map((c) => <td key={c.key} className={cn("px-3 py-3.5 align-middle", alignClass(c.align), c.className)}>{c.render(row)}</td>)}
                  <td className="px-3 py-3.5 text-right"><ChevronRight className="size-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <Card key={row.id} className="p-3.5 active:scale-[0.99] transition-transform" onClick={() => onRowClick?.(row)}>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="font-semibold text-sm">{columns[0]?.render(row)}</span>
              {slaKey && <StatusBadge tone={slaKey(row).tone} icon={false}>{slaKey(row).label}</StatusBadge>}
            </div>
            <dl className="space-y-1.5">
              {columns.slice(1).filter((c) => !c.hideOnMobile).map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-2 text-xs">
                  <dt className="text-muted-foreground">{c.mobileLabel ?? c.header}</dt>
                  <dd className="text-right font-medium text-foreground">{c.render(row)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    </>
  );
}
