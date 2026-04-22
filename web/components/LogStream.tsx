"use client"
import { useEffect, useRef } from "react"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"

export function LogStream({ logs }: { logs: string[] }) {
  const ref = useRef<VirtuosoHandle>(null)

  useEffect(() => {
    ref.current?.scrollToIndex({ index: logs.length - 1, behavior: "smooth" })
  }, [logs.length])

  if (!logs.length) {
    return (
      <div className="text-white/20 text-xs font-mono px-4 py-4">
        Waiting for output…
      </div>
    )
  }

  return (
    <Virtuoso
      ref={ref}
      style={{ height: "220px" }}
      totalCount={logs.length}
      data={logs}
      itemContent={(_, line) => (
        <div className="px-4 py-0.5 text-xs font-mono text-white/50 leading-relaxed whitespace-pre-wrap break-all hover:text-white/70 transition-colors">
          <span className="text-white/15 select-none mr-2">›</span>
          {line}
        </div>
      )}
      followOutput="smooth"
    />
  )
}
