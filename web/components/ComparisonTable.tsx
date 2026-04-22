import { Fragment } from "react"
import type { ScoredPlatform } from "@/lib/types"
import { cn } from "@/lib/utils"
import { platformColor } from "@/lib/platform-colors"

function cellColor(val: string): string {
  const n = parseInt(val)
  if (!isNaN(n)) {
    if (n >= 4) return "text-success"
    if (n === 3) return "text-warning"
    return "text-danger"
  }
  const lower = val.toLowerCase()
  if (lower.startsWith("y")) return "text-success"
  if (lower.startsWith("n")) return "text-danger"
  return "text-white/75"
}

const ROWS: { label: string; key: keyof ScoredPlatform; section?: string }[] = [
  { label: "Booted first try", key: "bootedFirstTry", section: "Runtime" },
  { label: "Trigger fired", key: "triggerFired" },
  { label: "Success criteria", key: "successCriteriaMet" },
  { label: "Failure test", key: "failureTestPassed" },
  { label: "Idempotent", key: "idempotent" },
  { label: "Dashboard (0–5)", key: "dashboardQuality" },
  { label: "Parallel primitive (0–5)", key: "parallelPrimitive", section: "Code" },
  { label: "Code idempotency (0–5)", key: "codeIdempotency" },
  { label: "Code cleanliness (0–5)", key: "codeCleanness" },
  { label: "Services", key: "infraServices", section: "Infra" },
  { label: "External deps", key: "externalDeps" },
  { label: "RAM at idle", key: "ram" },
  { label: "License", key: "license" },
  { label: "Self-hostable", key: "selfHostable" },
  { label: "Telemetry", key: "telemetry" },
]

export function ComparisonTable({ scores }: { scores: ScoredPlatform[] }) {
  let lastSection = ""
  let rowIndex = 0

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th className="text-left pb-4 pr-6 text-[11px] font-semibold text-white/60 uppercase tracking-widest w-44">
            Criterion
          </th>
          {scores.map(s => {
            const color = platformColor(s.platform)
            return (
              <th
                key={s.platform}
                className="text-left pb-4 px-3 font-bold capitalize text-base"
                style={{
                  borderTop: `3px solid ${color}`,
                  color,
                }}
              >
                <span className="inline-block pt-2">{s.platform}</span>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {ROWS.map(({ label, key, section }) => {
          const showSection = section && section !== lastSection
          if (showSection) {
            lastSection = section ?? ""
            rowIndex = 0
          }
          const zebra = rowIndex % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
          rowIndex++

          return (
            <Fragment key={key}>
              {showSection && (
                <tr>
                  <td
                    colSpan={scores.length + 1}
                    className="pt-4"
                  >
                    <div className="rounded-md bg-white/[0.05] border border-white/10 px-3 py-2 mb-1">
                      <span className="text-[11px] font-semibold text-white/75 uppercase tracking-widest">
                        {section}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              <tr className={cn("border-t border-white/[0.06] hover:bg-white/[0.04] transition-colors", zebra)}>
                <td className="py-2.5 pr-6 text-sm text-white/65">{label}</td>
                {scores.map(s => (
                  <td key={s.platform} className={cn("py-2.5 px-3 text-sm font-medium", cellColor(String(s[key])))}>
                    {String(s[key])}
                  </td>
                ))}
              </tr>
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
