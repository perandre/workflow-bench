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
    <div className="space-y-2.5">
      {STEPS.map(({ key, label }) => {
        const status = steps[key]
        return (
          <div key={key} className="flex items-center gap-3">
            <StepIcon status={status} />
            <span className={cn(
              "text-sm transition-colors leading-none",
              status === "done" && "text-white/80",
              status === "running" && "text-white font-medium",
              status === "error" && "text-danger font-medium",
              status === "pending" && "text-white/35",
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
      <div className="w-5 h-5 rounded-full bg-success/25 border border-success/55 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 10 10">
          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }
  if (status === "running") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-running/70 border-t-transparent animate-spin shrink-0" />
    )
  }
  if (status === "error") {
    return (
      <div className="w-5 h-5 rounded-full bg-danger/25 border border-danger/55 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-danger" fill="none" viewBox="0 0 10 10">
          <path d="M3 3l4 4M7 3l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-5 h-5 rounded-full border border-white/18 shrink-0" />
  )
}
