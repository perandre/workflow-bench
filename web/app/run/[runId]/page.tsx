"use client"
import { useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBenchStore } from "@/lib/store"
import { PlatformCard } from "@/components/PlatformCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { BenchEvent, StepName } from "@/lib/types"

const STEP_KEYS: StepName[] = ["install", "docker_up", "triggered", "verified", "scored"]

export default function RunPage() {
  const { runId } = useParams<{ runId: string }>()
  const { platforms, platformStates, runStatus, applyEvent, initRun } = useBenchStore()
  const router = useRouter()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(`/api/bench/stream/${runId}`)
    esRef.current = es

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data) as BenchEvent
      if (event.kind === "run_started") {
        initRun(runId, event.platforms)
      }
      applyEvent(event)
    }

    return () => { es.close() }
  }, [runId, applyEvent, initRun])

  useEffect(() => {
    if (runStatus === "complete" || runStatus === "error") {
      esRef.current?.close()
    }
  }, [runStatus])

  const platformList = platforms.length ? platforms : Object.keys(platformStates)

  const { done, total, percent } = useMemo(() => {
    const total = platformList.length * STEP_KEYS.length
    let done = 0
    for (const p of platformList) {
      const s = platformStates[p]
      if (!s) continue
      for (const k of STEP_KEYS) {
        if (s.steps[k] === "done") done++
      }
    }
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
  }, [platformList, platformStates])

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-4 transition-colors">
              ← Workflow Bench
            </Link>
            <h1 className="hero-gradient text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              {runStatus === "running" ? "Benchmark running" : runStatus === "complete" ? "Benchmark complete" : "Run"}
            </h1>
            <p className="text-sm text-white/50 mt-2 font-mono">{runId}</p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {runStatus === "complete" && (
              <Button onClick={() => router.push(`/results/${runId}`)}>
                View results
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {runStatus === "error" && (
              <span className="text-danger text-sm bg-danger/10 border border-danger/25 rounded-lg px-3.5 py-2">
                Run failed
              </span>
            )}
            {runStatus === "running" && (
              <div className="flex items-center gap-2 text-sm text-white/65">
                <div className="w-2 h-2 rounded-full bg-running animate-pulse" />
                Running…
              </div>
            )}
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mb-10">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              Overall progress
            </span>
            <span className="text-sm text-white/80 tabular-nums font-mono">
              {done} / {total} <span className="text-white/40">· {percent}%</span>
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/[0.06] overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full cta-gradient transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {platformList.map(p => (
            <PlatformCard
              key={p}
              name={p}
              state={platformStates[p] ?? {
                status: "pending",
                logs: [],
                steps: { install: "pending", docker_up: "pending", triggered: "pending", verified: "pending", scored: "pending" },
                score: null,
                scoreRaw: null,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
