import { spawn } from "child_process"
import path from "path"
import os from "os"
import { parseLine, resetParser } from "./parser"
import { appendEvent } from "./runs"
import { onWatchEvent } from "./watcher"
import type { BenchEvent } from "./types"

const BENCH_ROOT = path.join(os.homedir(), "Sites/workflow-bench")

// SSE subscriber registry: runId → Set of push functions
const subscribers = new Map<string, Set<(e: BenchEvent) => void>>()

export function subscribe(runId: string, push: (e: BenchEvent) => void): () => void {
  if (!subscribers.has(runId)) subscribers.set(runId, new Set())
  subscribers.get(runId)!.add(push)
  return () => subscribers.get(runId)?.delete(push)
}

function broadcast(runId: string, event: BenchEvent): void {
  appendEvent(runId, event)
  for (const push of subscribers.get(runId) ?? []) push(event)
}

export async function startRun(runId: string): Promise<void> {
  resetParser()

  // Forward file-watcher events to this run
  const unwatch = onWatchEvent(event => broadcast(runId, event))

  const claude = spawn("claude", [
    "--print",
    "--output-format", "stream-json",
    "--dangerously-skip-permissions",
    "-p",
    "workflow.md and platforms.json are already written. Skip the interview and begin immediately with the first platform listed in platforms.json.",
  ], {
    cwd: BENCH_ROOT,
    env: { ...process.env },
  })

  claude.stdout.setEncoding("utf-8")
  let buffer = ""

  claude.stdout.on("data", (chunk: string) => {
    buffer += chunk
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      for (const event of parseLine(line)) {
        broadcast(runId, event)
      }
    }
  })

  claude.stderr.setEncoding("utf-8")
  claude.stderr.on("data", (line: string) => {
    broadcast(runId, { kind: "log", platform: "", text: `[stderr] ${line}` })
  })

  claude.on("close", code => {
    unwatch()
    if (code !== 0) {
      broadcast(runId, { kind: "run_error", message: `Process exited with code ${code}` })
    } else {
      broadcast(runId, { kind: "run_complete" })
    }
  })

  claude.on("error", err => {
    unwatch()
    broadcast(runId, { kind: "run_error", message: err.message })
  })
}
