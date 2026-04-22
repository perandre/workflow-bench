import fs from "fs"
import path from "path"
import type { BenchEvent, ScoredPlatform } from "./types"

const BENCH_ROOT = path.join(process.env.HOME ?? "~", "Sites/workflow-bench")

type EventCallback = (event: BenchEvent) => void
const listeners = new Set<EventCallback>()

export function onWatchEvent(cb: EventCallback): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function emit(event: BenchEvent): void {
  for (const cb of listeners) cb(event)
}

function parseScoring(raw: string, platform: string): ScoredPlatform {
  const get = (label: string) => {
    const m = raw.match(new RegExp(`-\\s*${label}[^:]*:\\s*(.+)`, "i"))
    return m?.[1]?.trim() ?? "?"
  }
  return {
    platform,
    bootedFirstTry: get("Booted first try"),
    triggerFired: get("Trigger fired"),
    successCriteriaMet: get("Success criteria"),
    failureTestPassed: get("Failure test passed"),
    idempotent: get("Idempotent"),
    dashboardQuality: get("Dashboard quality"),
    parallelPrimitive: get("Parallel primitive"),
    codeIdempotency: get("Idempotency correct"),
    codeCleanness: get("Overall code cleanliness"),
    infraServices: get("Number of services"),
    externalDeps: get("External deps:"),
    ram: get("External deps RAM"),
    teardownTime: get("Time to tear down"),
    license: get("License:"),
    selfHostable: get("Self-host possible"),
    telemetry: get("Default-on telemetry"),
    notes: raw.match(/^-\s+.+/gm)?.slice(-5).map(l => l.replace(/^-\s+/, "")) ?? [],
  }
}

export function startWatcher(): void {
  const resultsDir = path.join(BENCH_ROOT, "results")
  try {
    fs.watch(resultsDir, { recursive: true }, (_event, filename) => {
      if (!filename) return
      const full = path.join(resultsDir, filename)
      if (filename.endsWith("scoring.md")) {
        try {
          const raw = fs.readFileSync(full, "utf-8")
          const platform = filename.split(path.sep)[0]
          emit({ kind: "score_ready", platform, raw, parsed: parseScoring(raw, platform) })
        } catch {}
      }
    })
    fs.watch(BENCH_ROOT, (_event, filename) => {
      if (filename === "comparison.md") {
        try {
          const raw = fs.readFileSync(path.join(BENCH_ROOT, "comparison.md"), "utf-8")
          emit({ kind: "comparison_ready", raw })
        } catch {}
      }
    })
  } catch {}
}
