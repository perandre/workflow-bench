"use client"
import { useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBenchStore } from "@/lib/store"
import { PlatformCard } from "@/components/PlatformCard"
import { Button } from "@/components/ui/button"
import { Gauge, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { BenchEvent } from "@/lib/types"

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

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs mb-3 transition-colors">
              <Gauge className="w-3.5 h-3.5" />
              Workflow Bench
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {runStatus === "running" ? "Benchmark running" : runStatus === "complete" ? "Benchmark complete" : "Run"}
            </h1>
            <p className="text-xs text-white/25 mt-1 font-mono">{runId}</p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            {runStatus === "complete" && (
              <Button onClick={() => router.push(`/results/${runId}`)}>
                View results
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {runStatus === "error" && (
              <span className="text-danger text-sm bg-danger/8 border border-danger/20 rounded-lg px-3 py-1.5">
                Run failed
              </span>
            )}
            {runStatus === "running" && (
              <div className="flex items-center gap-2 text-sm text-white/40">
                <div className="w-1.5 h-1.5 rounded-full bg-running animate-pulse" />
                Running…
              </div>
            )}
          </div>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
