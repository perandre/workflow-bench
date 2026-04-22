"use client"
import { Badge } from "@/components/ui/badge"
import { StepChecklist } from "@/components/StepChecklist"
import { LogStream } from "@/components/LogStream"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { platformColor } from "@/lib/platform-colors"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { PlatformState } from "@/lib/store"
import type { StepName } from "@/lib/types"

const STATUS_CONFIG: Record<PlatformState["status"], {
  label: string
  variant: "pending" | "running" | "success" | "error"
}> = {
  pending: { label: "Waiting", variant: "pending" },
  running: { label: "Running", variant: "running" },
  complete: { label: "Done", variant: "success" },
  error: { label: "Error", variant: "error" },
}

const STATUS_DOT: Record<PlatformState["status"], string> = {
  pending: "bg-white/25",
  running: "bg-running animate-pulse shadow-[0_0_12px_2px_oklch(0.72_0.15_230/0.55)]",
  complete: "bg-success shadow-[0_0_10px_2px_oklch(0.72_0.15_150/0.5)]",
  error: "bg-danger shadow-[0_0_10px_2px_oklch(0.65_0.18_25/0.5)]",
}

export function PlatformCard({ name, state }: { name: string; state: PlatformState }) {
  const [showLogs, setShowLogs] = useState(false)
  const cfg = STATUS_CONFIG[state.status]
  const color = platformColor(name)

  return (
    <div
      className="relative rounded-xl border border-white/12 bg-[oklch(0.13_0.007_264)] p-6 transition-all duration-300"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: color,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full shrink-0", STATUS_DOT[state.status])} />
          <h3
            className="font-bold text-lg capitalize tracking-tight"
            style={{ color }}
          >
            {name}
          </h3>
        </div>
        <Badge variant={cfg.variant as "pending" | "running" | "error" | "default"}>{cfg.label}</Badge>
      </div>

      {/* Steps */}
      <StepChecklist steps={state.steps as Record<StepName, "pending" | "running" | "done" | "error">} />

      {/* Log toggle */}
      <button
        onClick={() => setShowLogs(v => !v)}
        className="mt-5 flex items-center gap-1.5 text-xs text-white/50 hover:text-white/85 transition-colors font-medium"
      >
        {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {showLogs ? "Hide" : "Show"} logs
        <span className="text-white/30">({state.logs.length})</span>
      </button>

      {showLogs && (
        <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black">
          <div
            className="h-[3px] w-full"
            style={{ backgroundColor: color }}
          />
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white/15" />
              <div className="w-2 h-2 rounded-full bg-white/15" />
              <div className="w-2 h-2 rounded-full bg-white/15" />
            </div>
            <span className="text-xs text-white/50 font-mono">{name}</span>
          </div>
          <LogStream logs={state.logs} />
        </div>
      )}
    </div>
  )
}
