import { NextResponse } from "next/server"
import { listRuns } from "@/lib/runs"

export async function GET() {
  return NextResponse.json(listRuns())
}
