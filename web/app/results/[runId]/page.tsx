"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useBenchStore } from "@/lib/store"
import { ScoreCard } from "@/components/ScoreCard"
import { ComparisonTable } from "@/components/ComparisonTable"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, LayoutGrid, Table2, GitCompare } from "lucide-react"
import type { ScoredPlatform } from "@/lib/types"

type Tab = "cards" | "table" | "comparison"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "cards", label: "Cards", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "table", label: "Table", icon: <Table2 className="w-4 h-4" /> },
  { id: "comparison", label: "Comparison", icon: <GitCompare className="w-4 h-4" /> },
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
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-4 transition-colors">
              ← Workflow Bench
            </Link>
            <h1 className="hero-gradient text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Results
            </h1>
            <p className="text-white/60 text-base mt-2">
              {scores.length} platform{scores.length !== 1 ? "s" : ""} scored
            </p>
          </div>
          <Link href="/" className="mt-2">
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5" />
              New benchmark
            </Button>
          </Link>
        </div>

        <div className="flex gap-1 mb-8 p-1 bg-white/[0.05] rounded-xl w-fit border border-white/10">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                tab === id
                  ? "bg-white/15 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset]"
                  : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {tab === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scores.length === 0 && (
              <p className="text-white/55 text-base col-span-2">No scores yet — run the benchmark first.</p>
            )}
            {scores.map(s => <ScoreCard key={s.platform} score={s} />)}
          </div>
        )}

        {tab === "table" && (
          <div className="rounded-xl border border-white/12 bg-[oklch(0.13_0.007_264)] p-6 overflow-x-auto">
            {scores.length === 0
              ? <p className="text-white/55 text-base">No scores yet.</p>
              : <ComparisonTable scores={scores} />
            }
          </div>
        )}

        {tab === "comparison" && (
          <div className="rounded-xl border border-white/12 bg-[oklch(0.13_0.007_264)] p-6">
            {comparisonRaw ? (
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white
                prose-p:text-white/75 prose-p:leading-relaxed
                prose-li:text-white/75
                prose-strong:text-white
                prose-code:text-accent prose-code:bg-accent/10 prose-code:rounded prose-code:px-1">
                <ReactMarkdown>{comparisonRaw}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-white/55 text-base">
                Comparison not generated yet — it appears after all platforms finish.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
