import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import os from "os"

const BENCH_ROOT = path.join(os.homedir(), "Sites/workflow-bench")

export async function GET() {
  let platforms: string[] = []
  let workflow = ""
  try { platforms = JSON.parse(fs.readFileSync(path.join(BENCH_ROOT, "platforms.json"), "utf-8")) } catch {}
  try { workflow = fs.readFileSync(path.join(BENCH_ROOT, "workflow.md"), "utf-8") } catch {}
  return NextResponse.json({ platforms, workflow })
}
