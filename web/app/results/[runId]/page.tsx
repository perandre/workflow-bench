"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useBenchStore } from "@/lib/store"
import { ScoreCard } from "@/components/ScoreCard"
import { ComparisonTable } from "@/components/ComparisonTable"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Gauge, Plus, LayoutGrid, Table2, GitCompare } from "lucide-react"
import type { ScoredPlatform } from "@/lib/types"

type Tab = "cards" | "table" | "comparison"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "cards", label: "Cards", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { id: "table", label: "Table", icon: <Table2 className="w-3.5 h-3.5" /> },
  { id: "comparison", label: "Comparison", icon: <GitCompare className="w-3.5 h-3.5" /> },
]

export default function ResultsPage() {
  const { runId } = useParams<{ runId: string }>()
  const { platformStates, comparisonRaw } = useBenchStore()
  const [tab, setTab] = useState<Tab>("cards")
  const [, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/results").then(r => r.json()).then((data: {
      platforms: Record<string, { scoreParsed: ScoredPlatform | null; scoreRaw: string | null }>
      comparisonRaw: string | null
    }) => {
      void data
      setLoaded(true)
    })
  }, [runId])

  const scores = Object.entries(platformStates)
    .filter(([, s]) => s.score !== null)
    .map(([, s]) => s.score!)

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
            <h1 className="text-xl font-bold tracking-tight text-white">Results</h1>
            <p className="text-white/30 text-sm mt-1">
              {scores.length} platform{scores.length !== 1 ? "s" : ""} scored
            </p>
          </div>
          <Link href="/" className="mt-1">
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5" />
              New benchmark
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-8 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                tab === id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/35 hover:text-white/60",
              ].join(" ")}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {tab === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.length === 0 && (
              <p className="text-white/25 text-sm col-span-2">No scores yet — run the benchmark first.</p>
            )}
            {scores.map(s => <ScoreCard key={s.platform} score={s} />)}
          </div>
        )}

        {tab === "table" && (
          <div className="rounded-xl border border-white/8 bg-[oklch(0.12_0.007_264)] p-6 overflow-x-auto">
            {scores.length === 0
              ? <p className="text-white/25 text-sm">No scores yet.</p>
              : <ComparisonTable scores={scores} />
            }
          </div>
        )}

        {tab === "comparison" && (
          <div className="rounded-xl border border-white/8 bg-[oklch(0.12_0.007_264)] p-6">
            {comparisonRaw ? (
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-p:text-white/60 prose-p:leading-relaxed
                prose-li:text-white/60
                prose-strong:text-white
                prose-code:text-accent prose-code:bg-accent/10 prose-code:rounded prose-code:px-1">
                <ReactMarkdown>{comparisonRaw}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-white/25 text-sm">
                Comparison not generated yet — it appears after all platforms finish.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
