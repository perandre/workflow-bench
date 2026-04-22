import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import os from "os"
import type { ScoredPlatform, BenchLog } from "@/lib/types"

const BENCH_ROOT = path.join(os.homedir(), "Sites/workflow-bench")

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

export async function GET() {
  const platformsFile = path.join(BENCH_ROOT, "platforms.json")
  let platforms: string[] = []
  try { platforms = JSON.parse(fs.readFileSync(platformsFile, "utf-8")) } catch {}

  const result: Record<string, { benchLog: BenchLog | null; scoreRaw: string | null; scoreParsed: ScoredPlatform | null }> = {}
  for (const p of platforms) {
    const dir = path.join(BENCH_ROOT, "results", p)
    let benchLog: BenchLog | null = null
    let scoreRaw: string | null = null
    let scoreParsed: ScoredPlatform | null = null
    try { benchLog = JSON.parse(fs.readFileSync(path.join(dir, "BENCH_LOG.json"), "utf-8")) } catch {}
    try { scoreRaw = fs.readFileSync(path.join(dir, "scoring.md"), "utf-8"); scoreParsed = parseScoring(scoreRaw, p) } catch {}
    result[p] = { benchLog, scoreRaw, scoreParsed }
  }

  let comparisonRaw: string | null = null
  try { comparisonRaw = fs.readFileSync(path.join(BENCH_ROOT, "comparison.md"), "utf-8") } catch {}

  return NextResponse.json({ platforms: result, comparisonRaw, platformsList: platforms })
}
