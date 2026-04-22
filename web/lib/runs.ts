import path from "path"
import fs from "fs"
import type { RunState, BenchEvent, RunMeta } from "./types"

const runsFile = path.join(process.cwd(), "runs.json")

const runs = new Map<string, RunState>()

// Load persisted run metadata on startup (not full events)
function loadPersisted(): void {
  try {
    const data = JSON.parse(fs.readFileSync(runsFile, "utf-8")) as RunMeta[]
    for (const meta of data) {
      runs.set(meta.id, { ...meta, events: [] })
    }
  } catch {}
}
loadPersisted()

export function createRun(id: string, platforms: string[], workflowName: string): RunState {
  const run: RunState = { id, timestamp: Date.now(), platforms, workflowName, status: "running", events: [] }
  runs.set(id, run)
  persistMeta()
  return run
}

export function getRun(id: string): RunState | undefined {
  return runs.get(id)
}

export function listRuns(): RunMeta[] {
  return [...runs.values()].map(({ events: _e, ...meta }) => meta).sort((a, b) => b.timestamp - a.timestamp)
}

export function appendEvent(id: string, event: BenchEvent): void {
  const run = runs.get(id)
  if (!run) return
  run.events.push(event)
  if (event.kind === "run_complete") { run.status = "complete"; persistMeta() }
  if (event.kind === "run_error") { run.status = "error"; persistMeta() }
}

function persistMeta(): void {
  const metas: RunMeta[] = listRuns()
  fs.writeFileSync(runsFile, JSON.stringify(metas, null, 2))
}

// Evict runs older than 48h
export function evictOldRuns(): void {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000
  for (const [id, run] of runs) {
    if (run.timestamp < cutoff) runs.delete(id)
  }
  persistMeta()
}
