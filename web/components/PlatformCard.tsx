"use client"
import { Badge } from "@/components/ui/badge"
import { StepChecklist } from "@/components/StepChecklist"
import { LogStream } from "@/components/LogStream"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { PlatformState } from "@/lib/store"
import type { StepName } from "@/lib/types"

const STATUS_CONFIG: Record<PlatformState["status"], {
  label: string
  variant: "pending" | "running" | "success" | "error"
  borderClass: string
  bgClass: string
}> = {
  pending: { label: "Waiting", variant: "pending", borderClass: "border-white/8", bgClass: "" },
  running: { label: "Running", variant: "running", borderClass: "border-running/25", bgClass: "bg-running/[0.03]" },
  complete: { label: "Done", variant: "success", borderClass: "border-success/20", bgClass: "bg-success/[0.02]" },
  error: { label: "Error", variant: "error", borderClass: "border-danger/20", bgClass: "bg-danger/[0.02]" },
}

const STATUS_DOT: Record<PlatformState["status"], string> = {
  pending: "bg-white/15",
  running: "bg-running animate-pulse",
  complete: "bg-success",
  error: "bg-danger",
}

export function PlatformCard({ name, state }: { name: string; state: PlatformState }) {
  const [showLogs, setShowLogs] = useState(false)
  const cfg = STATUS_CONFIG[state.status]

  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all duration-300",
      "bg-[oklch(0.12_0.007_264)]",
      cfg.borderClass,
      cfg.bgClass,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[state.status])} />
          <h3 className="font-semibold text-white capitalize tracking-tight">{name}</h3>
        </div>
        <Badge variant={cfg.variant as "pending" | "running" | "error" | "default"}>{cfg.label}</Badge>
      </div>

      {/* Steps */}
      <StepChecklist steps={state.steps as Record<StepName, "pending" | "running" | "done" | "error">} />

      {/* Log toggle */}
      <button
        onClick={() => setShowLogs(v => !v)}
        className="mt-4 flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors"
      >
        {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {showLogs ? "Hide" : "Show"} logs
        <span className="text-white/15">({state.logs.length})</span>
      </button>

      {showLogs && (
        <div className="mt-2.5 rounded-lg overflow-hidden border border-white/5 bg-black/40">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <span className="text-xs text-white/20 font-mono">{name}</span>
          </div>
          <LogStream logs={state.logs} />
        </div>
      )}
    </div>
  )
}
