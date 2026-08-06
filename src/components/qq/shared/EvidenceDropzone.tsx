"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadCloud, File as FileIcon, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function EvidenceDropzone({
  label = "Drop file or click to upload",
  accept = "JPG, PNG, PDF · max 10MB",
  multiple = false,
  onUploaded,
  simulated = true,
}: {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onUploaded?: (files: { name: string; size: number }) => void;
  simulated?: boolean;
}) {
  const [files, setFiles] = React.useState<{ name: string; size: number; status: "uploading" | "done" | "error"; reason?: string }[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list).slice(0, multiple ? undefined : 1);
    arr.forEach((f) => {
      const over = f.size > 10 * 1024 * 1024;
      const invalidType = !/\.(jpg|jpeg|png|pdf)$/i.test(f.name);
      const entry = { name: f.name, size: f.size, status: "uploading" as const, reason: over ? "File too large (max 10MB)" : invalidType ? "Invalid type (JPG/PNG/PDF only)" : undefined };
      setFiles((prev) => [...prev, entry]);
      if (over || invalidType) {
        setFiles((prev) => prev.map((x) => (x.name === f.name && x.status === "uploading" ? { ...x, status: "error" } : x)));
        return;
      }
      if (simulated) {
        setTimeout(() => {
          setFiles((prev) => prev.map((x) => (x.name === f.name && x.status === "uploading" ? { ...x, status: "done" } : x)));
          onUploaded?.({ name: f.name, size: f.size });
        }, 900);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors", dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30")}
      >
        <UploadCloud className="size-6 text-muted-foreground" />
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{accept}</div>
        <input ref={inputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => addFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f) => (
            <li key={f.name} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              {f.status === "uploading" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {f.status === "done" && <CheckCircle2 className="size-4 text-emerald-600" />}
              {f.status === "error" && <AlertCircle className="size-4 text-destructive" />}
              <FileIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{f.name}</span>
              {f.reason && <span className="text-xs text-destructive">{f.reason}</span>}
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setFiles((prev) => prev.filter((x) => x.name !== f.name))}><X className="size-3.5" /></Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PERMISSIONS = [
  { action: "View workrooms", support: true, finance: true, risk: true, ops: true },
  { action: "Communicate with users", support: true, finance: false, risk: true, ops: true },
  { action: "Process KYC intake", support: true, finance: false, risk: false, ops: true },
  { action: "Verify payments", support: false, finance: true, risk: false, ops: false },
  { action: "Trigger approved payouts", support: false, finance: true, risk: false, ops: false },
  { action: "Process refunds", support: false, finance: true, risk: false, ops: false },
  { action: "Export payout batches", support: false, finance: true, risk: false, ops: true },
  { action: "Suspend accounts", support: false, finance: false, risk: true, ops: false },
  { action: "Make risk decisions", support: false, finance: false, risk: true, ops: false },
  { action: "Mediate disputes", support: false, finance: false, risk: true, ops: true },
  { action: "View audit logs", support: false, finance: true, risk: true, ops: true },
  { action: "Reassign work / SLA", support: false, finance: false, risk: false, ops: true },
];

export function PermissionMatrix() {
  const cols = [
    { key: "support", label: "Support (T1)" },
    { key: "finance", label: "Finance (T2)" },
    { key: "risk", label: "Risk (T3)" },
    { key: "ops", label: "Ops Manager" },
  ] as const;
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Action</th>
              {cols.map((c) => <th key={c.key} className="px-3 py-2 text-center font-medium">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.action} className="border-t border-border">
                <td className="px-3 py-2">{p.action}</td>
                {cols.map((c) => (
                  <td key={c.key} className="px-3 py-2 text-center">
                    {p[c.key] ? <CheckCircle2 className="size-4 text-emerald-600 inline" /> : <X className="size-4 text-muted-foreground inline" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
