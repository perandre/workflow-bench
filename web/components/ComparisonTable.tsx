import { Fragment } from "react"
import type { ScoredPlatform } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  return "text-white/50"
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

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th className="text-left pb-3 pr-6 text-[10px] font-semibold text-white/25 uppercase tracking-widest w-44">
            Criterion
          </th>
          {scores.map(s => (
            <th key={s.platform} className="text-left pb-3 px-3 font-semibold text-white capitalize text-sm">
              {s.platform}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map(({ label, key, section }) => {
          const showSection = section && section !== lastSection
          if (showSection) lastSection = section ?? ""

          return (
            <Fragment key={key}>
              {showSection && (
                <tr>
                  <td colSpan={scores.length + 1} className="pt-5 pb-1.5">
                    <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">
                      {section}
                    </span>
                  </td>
                </tr>
              )}
              <tr className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-2 pr-6 text-xs text-white/35">{label}</td>
                {scores.map(s => (
                  <td key={s.platform} className={cn("py-2 px-3 text-xs font-medium", cellColor(String(s[key])))}>
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
