"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { StatusBadge, statusMeta } from "./StatusBadge";

export interface QueueColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
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
    return <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">{emptyMessage}</div>;
  }
  return (
    <>
      {/* Desktop table */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((c) => <th key={c.key} className={cn("px-3 py-2.5 text-left font-medium whitespace-nowrap", c.className)}>{c.header}</th>)}
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/30 cursor-pointer min-h-[64px]" onClick={() => onRowClick?.(row)}>
                  {columns.map((c) => <td key={c.key} className={cn("px-3 py-3 align-top", c.className)}>{c.render(row)}</td>)}
                  <td className="px-3 py-3 text-right"><ChevronRight className="size-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <Card key={row.id} className="p-3" onClick={() => onRowClick?.(row)}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-medium text-sm">{columns[0]?.render(row)}</span>
              {slaKey && <StatusBadge tone={slaKey(row).tone} icon={false}>{slaKey(row).label}</StatusBadge>}
            </div>
            <dl className="space-y-1">
              {columns.slice(1).filter((c) => !c.hideOnMobile).map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-2 text-xs">
                  <dt className="text-muted-foreground">{c.mobileLabel ?? c.header}</dt>
                  <dd className="text-right">{c.render(row)}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    </>
  );
}
