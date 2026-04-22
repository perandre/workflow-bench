import type { BenchEvent, StepName } from "./types"

let currentPlatform = ""

function extractPlatform(pathStr: string): string {
  const m = pathStr.match(/results\/([^/]+)\//)
  return m?.[1] ?? ""
}

export function parseLine(line: string): BenchEvent[] {
  if (!line.trim()) return []
  let obj: Record<string, unknown>
  try { obj = JSON.parse(line) } catch { return [] }

  const events: BenchEvent[] = []
  const type = obj.type as string

  if (type === "assistant") {
    const msg = obj.message as { content?: Array<{ type: string; text?: string }> }
    for (const block of msg?.content ?? []) {
      if (block.type === "text" && block.text) {
        events.push({ kind: "log", platform: currentPlatform, text: block.text })
      }
    }
  }

  if (type === "tool_use") {
    const name = obj.name as string
    const input = (obj.input ?? {}) as Record<string, string>
    const filePath = input.file_path ?? input.path ?? ""
    const command = input.command ?? ""

    const p = extractPlatform(filePath) || extractPlatform(command)
    if (p && p !== currentPlatform) {
      currentPlatform = p
      events.push({ kind: "platform_started", platform: p })
    }

    // Step detection
    const step = detectStep(name, command, filePath)
    if (step) events.push({ kind: "step_update", platform: currentPlatform, step, status: "running" })

    if (filePath.includes("BENCH_LOG.json") && (name === "Write" || name === "Edit")) {
      events.push({ kind: "step_update", platform: currentPlatform, step: "triggered", status: "done" })
    }
    if (filePath.includes("scoring.md") && (name === "Write" || name === "Edit")) {
      events.push({ kind: "step_update", platform: currentPlatform, step: "scored", status: "done" })
    }
  }

  if (type === "result") {
    const sub = obj.subtype as string
    if (sub === "success") events.push({ kind: "run_complete" })
    if (sub === "error") events.push({ kind: "run_error", message: String(obj.error ?? "Unknown error") })
  }

  return events
}

function detectStep(toolName: string, command: string, _filePath: string): StepName | null {
  if (toolName === "Bash") {
    if (/npm install|bun install|pnpm install/.test(command)) return "install"
    if (/docker.compose.up|docker-compose up/.test(command)) return "docker_up"
  }
  return null
}

export function resetParser(): void {
  currentPlatform = ""
}
