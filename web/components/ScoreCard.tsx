import { cn } from "@/lib/utils"
import type { ScoredPlatform } from "@/lib/types"

function YesNo({ value }: { value: string }) {
  const lower = value.toLowerCase()
  const isYes = lower.startsWith("y")
  const isNo = lower.startsWith("n")
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium",
      isYes && "text-success",
      isNo && "text-danger",
      !isYes && !isNo && "text-white/40",
    )}>
      <span className={cn(
        "inline-block w-1.5 h-1.5 rounded-full",
        isYes && "bg-success",
        isNo && "bg-danger",
        !isYes && !isNo && "bg-white/20",
      )} />
      {value}
    </span>
  )
}

function ScoreBar({ value }: { value: string }) {
  const n = parseInt(value)
  if (isNaN(n)) return <span className="text-white/40 text-xs">{value}</span>
  const color = n >= 4 ? "bg-success" : n >= 3 ? "bg-warning" : "bg-danger"
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={cn(
              "w-5 h-1 rounded-full transition-colors",
              i <= n ? color : "bg-white/8"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-white/35 tabular-nums">{n}/5</span>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-white/35 shrink-0">{label}</span>
      <span className="text-xs text-white text-right">{children}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-1 mt-4 first:mt-0">
      {children}
    </p>
  )
}

function computeScore(score: ScoredPlatform): number {
  const boolPoints = [
    score.bootedFirstTry, score.triggerFired, score.successCriteriaMet,
    score.failureTestPassed, score.idempotent, score.selfHostable,
  ].filter(v => v.toLowerCase().startsWith("y")).length

  const numericTotal = [
    score.dashboardQuality, score.parallelPrimitive, score.codeIdempotency, score.codeCleanness,
  ].reduce((sum, v) => sum + (parseInt(v) || 0), 0)

  // 6 bool points (max 6) + 20 numeric points (max 20) → normalize to 100
  return Math.round(((boolPoints / 6) * 0.5 + (numericTotal / 20) * 0.5) * 100)
}

export function ScoreCard({ score }: { score: ScoredPlatform }) {
  const overall = computeScore(score)
  const overallColor = overall >= 75 ? "text-success" : overall >= 50 ? "text-warning" : "text-danger"

  return (
    <div className="rounded-xl border border-white/8 bg-[oklch(0.12_0.007_264)] p-5">
      {/* Platform header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/6">
        <h3 className="font-semibold text-white capitalize tracking-tight text-base">{score.platform}</h3>
        <div className="text-right">
          <div className={cn("text-2xl font-bold tabular-nums leading-none", overallColor)}>
            {overall}
          </div>
          <div className="text-[10px] text-white/25 mt-0.5">/ 100</div>
        </div>
      </div>

      <SectionLabel>Runtime</SectionLabel>
      <div className="divide-y divide-white/4">
        <Row label="Booted first try"><YesNo value={score.bootedFirstTry} /></Row>
        <Row label="Trigger fired"><YesNo value={score.triggerFired} /></Row>
        <Row label="Success criteria"><YesNo value={score.successCriteriaMet} /></Row>
        <Row label="Failure test"><YesNo value={score.failureTestPassed} /></Row>
        <Row label="Idempotent"><YesNo value={score.idempotent} /></Row>
        <Row label="Dashboard"><ScoreBar value={score.dashboardQuality} /></Row>
      </div>

      <SectionLabel>Code quality</SectionLabel>
      <div className="divide-y divide-white/4">
        <Row label="Parallel primitive"><ScoreBar value={score.parallelPrimitive} /></Row>
        <Row label="Idempotency"><ScoreBar value={score.codeIdempotency} /></Row>
        <Row label="Cleanliness"><ScoreBar value={score.codeCleanness} /></Row>
      </div>

      <SectionLabel>Infrastructure</SectionLabel>
      <div className="divide-y divide-white/4">
        <Row label="Services"><span className="text-white/60">{score.infraServices}</span></Row>
        <Row label="Deps"><span className="text-white/60">{score.externalDeps}</span></Row>
        <Row label="RAM"><span className="text-white/60">{score.ram}</span></Row>
        <Row label="Self-hostable"><YesNo value={score.selfHostable} /></Row>
        <Row label="License"><span className="text-white/60">{score.license}</span></Row>
      </div>

      {score.notes.length > 0 && (
        <>
          <SectionLabel>Notes</SectionLabel>
          <ul className="space-y-1.5">
            {score.notes.map((n, i) => (
              <li key={i} className="text-xs text-white/40 leading-relaxed flex gap-2">
                <span className="text-white/20 shrink-0 mt-0.5">·</span>
                {n}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
