"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBenchStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import type { RunMeta } from "@/lib/types"

export function RunHistory() {
  const { runHistory, setHistory } = useBenchStore()
  const router = useRouter()

  useEffect(() => {
    fetch("/api/bench/runs").then(r => r.json()).then((runs: RunMeta[]) => setHistory(runs))
  }, [setHistory])

  if (!runHistory.length) return null

  return (
    <div className="mt-16">
      <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">Recent runs</p>
      <div className="space-y-2">
        {runHistory.slice(0, 5).map(run => (
          <button
            key={run.id}
            onClick={() => router.push(run.status === "running" ? `/run/${run.id}` : `/results/${run.id}`)}
            className="group w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-left transition-all duration-200"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                {run.workflowName}
              </p>
              <p className="text-xs text-white/45 mt-1 font-mono">
                {run.platforms.join(", ")} · {new Date(run.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 ml-3">
              <Badge
                variant={run.status === "complete" ? "success" : run.status === "error" ? "error" : "running"}
              >
                {run.status}
              </Badge>
              <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white/65 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
