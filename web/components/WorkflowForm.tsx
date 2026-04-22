"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useBenchStore } from "@/lib/store"
import { platformColor } from "@/lib/platform-colors"
import { Play, X } from "lucide-react"

const DEFAULT_PLATFORMS = ["inngest", "mastra", "hatchet", "restate"]

const DEFAULT_WORKFLOW = {
  name: "Daily HN AI Digest",
  description: "Fetch top 30 HackerNews stories, summarise each with Google Gemini AI, rank by score + AI/dev-tools tags, post top 5 to Slack. Tests parallel durable steps, LLM integration, and idempotency.",
  successCriteria: "All 30 HN fetch steps visible as individual steps in dashboard. Top 5 digest message appeared in Slack. No duplicate post on second trigger same day.",
}

export function WorkflowForm() {
  const router = useRouter()
  const { initRun } = useBenchStore()
  const [useDefault, setUseDefault] = useState<boolean | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(DEFAULT_PLATFORMS)
  const [customPlatform, setCustomPlatform] = useState("")
  const [workflowName, setWorkflowName] = useState("")
  const [workflow, setWorkflow] = useState("")
  const [successCriteria, setSuccessCriteria] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  function addCustomPlatform() {
    const p = customPlatform.trim().toLowerCase()
    if (p && !selectedPlatforms.includes(p)) {
      setSelectedPlatforms(prev => [...prev, p])
      setCustomPlatform("")
    }
  }

  async function handleSubmit() {
    if (!selectedPlatforms.length) return setError("Select at least one platform.")
    const wf = useDefault ? DEFAULT_WORKFLOW : { name: workflowName, description: workflow, successCriteria }
    if (!useDefault && !wf.description.trim()) return setError("Describe the workflow.")

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/bench/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: useDefault ? DEFAULT_WORKFLOW.description : workflow,
          workflowName: useDefault ? DEFAULT_WORKFLOW.name : workflowName || "Custom Workflow",
          platforms: selectedPlatforms,
          successCriteria: useDefault ? DEFAULT_WORKFLOW.successCriteria : successCriteria,
        }),
      })
      const { runId } = await res.json() as { runId: string }
      initRun(runId, selectedPlatforms)
      router.push(`/run/${runId}`)
    } catch (e) {
      setError(String(e))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Platform selection */}
      <section>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">
          Platforms
        </label>
        <div className="flex flex-wrap gap-2.5 mb-4">
          {DEFAULT_PLATFORMS.map(p => (
            <PlatformPill
              key={p}
              name={p}
              selected={selectedPlatforms.includes(p)}
              onToggle={() => togglePlatform(p)}
            />
          ))}
          {selectedPlatforms.filter(p => !DEFAULT_PLATFORMS.includes(p)).map(p => (
            <PlatformPill
              key={p}
              name={p}
              selected
              removable
              onToggle={() => togglePlatform(p)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add platform…"
            value={customPlatform}
            onChange={e => setCustomPlatform(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustomPlatform()}
            className="max-w-56"
          />
          <Button variant="outline" size="sm" onClick={addCustomPlatform}>Add</Button>
        </div>
      </section>

      {/* Workflow selection */}
      <section>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-4">
          Workflow
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {[
            {
              id: true,
              title: "Default workflow",
              desc: "Daily HN AI digest — Gemini summaries + Slack post. Tests parallel steps, LLM integration, and idempotency.",
            },
            {
              id: false,
              title: "Custom workflow",
              desc: "Describe your own scenario — an integration flow, customer process, or any multi-step job.",
            },
          ].map(({ id, title, desc }) => {
            const active = useDefault === id
            return (
              <button
                key={String(id)}
                onClick={() => setUseDefault(id)}
                className={[
                  "relative p-5 pl-6 min-h-[120px] rounded-xl border text-left transition-all duration-200",
                  active
                    ? "border-l-4 border-l-indigo-400 border-white/15 bg-white/[0.04] shadow-[0_0_24px_-4px_oklch(0.62_0.22_267/0.45)]"
                    : "border-white/10 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <div className="mb-2">
                  <span className={[
                    "text-base font-semibold tracking-tight",
                    active ? "text-white" : "text-white/85",
                  ].join(" ")}>
                    {title}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
              </button>
            )
          })}
        </div>

        {useDefault === false && (
          <div className="space-y-4 mt-5">
            <div>
              <label className="block text-xs text-white/65 mb-2 font-semibold uppercase tracking-wider">Workflow name</label>
              <Input
                placeholder="e.g. Order processing pipeline"
                value={workflowName}
                onChange={e => setWorkflowName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-white/65 mb-2 font-semibold uppercase tracking-wider">What should the workflow do?</label>
              <Textarea
                placeholder="Describe the trigger, steps, and what APIs it calls. Slack integration is available."
                value={workflow}
                onChange={e => setWorkflow(e.target.value)}
                className="min-h-[130px]"
              />
            </div>
            <div>
              <label className="block text-xs text-white/65 mb-2 font-semibold uppercase tracking-wider">Success criteria</label>
              <Textarea
                placeholder="e.g. Message posted to Slack, no duplicate on second run, all steps visible in dashboard"
                value={successCriteria}
                onChange={e => setSuccessCriteria(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        )}
      </section>

      {error && (
        <p className="text-danger text-sm bg-danger/10 border border-danger/25 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedPlatforms.length || useDefault === null}
        className="cta-gradient w-full inline-flex items-center justify-center gap-2.5 h-12 rounded-xl text-base font-semibold text-white tracking-tight shadow-[0_0_28px_-4px_oklch(0.6_0.22_280/0.6)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Play className="w-4.5 h-4.5" strokeWidth={2.5} />
        {loading
          ? "Starting…"
          : `Run benchmark${selectedPlatforms.length ? ` · ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? "s" : ""}` : ""}`
        }
      </button>
    </div>
  )
}

function PlatformPill({
  name, selected, removable, onToggle,
}: {
  name: string; selected: boolean; removable?: boolean; onToggle: () => void
}) {
  const color = platformColor(name)
  const style: React.CSSProperties = selected
    ? {
        backgroundColor: `${color}33`,
        borderColor: color,
        boxShadow: `0 0 18px -2px ${color}66`,
      }
    : {
        borderLeft: `3px solid ${color}`,
        borderTopColor: "rgba(255,255,255,0.1)",
        borderRightColor: "rgba(255,255,255,0.1)",
        borderBottomColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(255,255,255,0.015)",
      }

  return (
    <button
      onClick={onToggle}
      style={style}
      className={[
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border tracking-tight transition-all duration-200 capitalize",
        selected ? "text-white" : "text-white/70 hover:text-white",
      ].join(" ")}
    >
      {name}
      {removable && <X className="w-3.5 h-3.5 opacity-70" />}
    </button>
  )
}
