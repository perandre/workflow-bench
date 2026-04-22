import { getRun } from "@/lib/runs"
import { subscribe } from "@/lib/runner"
import type { BenchEvent } from "@/lib/types"

export async function GET(_req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params
  const run = getRun(runId)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      function send(event: BenchEvent) {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      // Replay past events
      for (const event of run?.events ?? []) send(event)

      // Subscribe to new events
      const unsub = subscribe(runId, send)

      // Keepalive
      const ping = setInterval(() => send({ kind: "ping" }), 15_000)

      // Cleanup on disconnect
      const cleanup = () => { unsub(); clearInterval(ping) }
      ;(controller as { close?: () => void }).close = cleanup
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
