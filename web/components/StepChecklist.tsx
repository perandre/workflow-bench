import { cn } from "@/lib/utils"
import type { StepName, StepStatus } from "@/lib/types"

const STEPS: { key: StepName; label: string }[] = [
  { key: "install", label: "Install deps" },
  { key: "docker_up", label: "Infrastructure up" },
  { key: "triggered", label: "Workflow triggered" },
  { key: "verified", label: "End-to-end verified" },
  { key: "scored", label: "Scored" },
]

export function StepChecklist({ steps }: { steps: Record<StepName, StepStatus> }) {
  return (
    <div className="space-y-2">
      {STEPS.map(({ key, label }) => {
        const status = steps[key]
        return (
          <div key={key} className="flex items-center gap-2.5">
            <StepIcon status={status} />
            <span className={cn(
              "text-xs transition-colors",
              status === "done" && "text-white/60",
              status === "running" && "text-white font-medium",
              status === "error" && "text-danger",
              status === "pending" && "text-white/20",
            )}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="w-4 h-4 rounded-full bg-success/20 border border-success/40 flex items-center justify-center shrink-0">
        <svg className="w-2.5 h-2.5 text-success" fill="none" viewBox="0 0 10 10">
          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  if (status === "running") {
    return (
      <div className="w-4 h-4 rounded-full border-2 border-running/60 border-t-transparent animate-spin shrink-0" />
    )
  }
  if (status === "error") {
    return (
      <div className="w-4 h-4 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center shrink-0">
        <svg className="w-2.5 h-2.5 text-danger" fill="none" viewBox="0 0 10 10">
          <path d="M3 3l4 4M7 3l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-4 h-4 rounded-full border border-white/12 shrink-0" />
  )
}
