import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import os from "os"
import { createRun } from "@/lib/runs"
import { startRun } from "@/lib/runner"

const BENCH_ROOT = path.join(os.homedir(), "Sites/workflow-bench")

export async function POST(req: Request) {
  const { workflow, workflowName, platforms, successCriteria } = await req.json() as {
    workflow: string
    workflowName: string
    platforms: string[]
    successCriteria?: string
  }

  // Write workflow.md
  const workflowMd = `## The workflow: "${workflowName}"\n\n${workflow}\n\n## Success criteria\n\n${successCriteria ?? "Run completed without errors."}\n`
  fs.writeFileSync(path.join(BENCH_ROOT, "workflow.md"), workflowMd)

  // Write platforms.json
  fs.writeFileSync(path.join(BENCH_ROOT, "platforms.json"), JSON.stringify(platforms, null, 2))

  const runId = Date.now().toString()
  createRun(runId, platforms, workflowName)

  // Fire and forget — don't await
  startRun(runId).catch(console.error)

  return NextResponse.json({ runId })
}
