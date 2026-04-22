import { cn } from "@/lib/utils"
import { platformColor } from "@/lib/platform-colors"
import type { ScoredPlatform } from "@/lib/types"

function YesNo({ value }: { value: string }) {
  const lower = value.toLowerCase()
  const isYes = lower.startsWith("y")
  const isNo = lower.startsWith("n")
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-sm font-medium",
      isYes && "text-success",
      isNo && "text-danger",
      !isYes && !isNo && "text-white/70",
    )}>
      <span className={cn(
        "inline-block w-2 h-2 rounded-full",
        isYes && "bg-success shadow-[0_0_6px_oklch(0.72_0.15_150/0.6)]",
        isNo && "bg-danger shadow-[0_0_6px_oklch(0.65_0.18_25/0.6)]",
        !isYes && !isNo && "bg-white/30",
      )} />
      {value}
    </span>
  )
}

function ScoreBar({ value }: { value: string }) {
  const n = parseInt(value)
  if (isNaN(n)) return <span className="text-white/60 text-sm">{value}</span>
  const pct = Math.max(0, Math.min(5, n)) / 5 * 100
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-2 w-20 rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="score-gradient absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-white/75 tabular-nums font-medium">{n}/5</span>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs text-white/65 shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{children}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1.5 mt-5 first:mt-0">
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

  return Math.round(((boolPoints / 6) * 0.5 + (numericTotal / 20) * 0.5) * 100)
}

function ArcGauge({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value))
  const gradId = `arc-grad-${color.replace("#", "")}`
  return (
    <div className="relative w-full flex justify-center">
      <svg viewBox="0 0 120 72" className="w-52 h-[120px]">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.18 25)" />
            <stop offset="50%" stopColor="oklch(0.78 0.15 75)" />
            <stop offset="100%" stopColor="oklch(0.72 0.15 150)" />
          </linearGradient>
        </defs>
        <path
          d="M 10 62 A 50 50 0 0 1 110 62"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 10 62 A 50 50 0 0 1 110 62"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="8"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          style={{ transition: "stroke-dasharray 700ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
        <div className="text-4xl font-bold tabular-nums leading-none text-white">
          {Math.round(pct)}
        </div>
        <div className="text-[10px] text-white/55 mt-1 uppercase tracking-widest font-semibold">
          / 100
        </div>
      </div>
    </div>
  )
}

export function ScoreCard({ score }: { score: ScoredPlatform }) {
  const overall = computeScore(score)
  const color = platformColor(score.platform)

  return (
    <div
      className="relative rounded-xl border border-white/12 bg-[oklch(0.13_0.007_264)] p-6"
      style={{
        borderTopWidth: "3px",
        borderTopColor: color,
        boxShadow: `0 0 40px -20px ${color}`,
      }}
    >
      {/* Platform header + arc gauge */}
      <div className="mb-4">
        <h3
          className="font-bold text-xl capitalize tracking-tight text-center mb-1"
          style={{ color }}
        >
          {score.platform}
        </h3>
      </div>

      <ArcGauge value={overall} color={color} />

      <div className="mt-6 mb-1 h-px bg-white/10" />

      <SectionLabel>Runtime</SectionLabel>
      <div className="divide-y divide-white/[0.06]">
        <Row label="Booted first try"><YesNo value={score.bootedFirstTry} /></Row>
        <Row label="Trigger fired"><YesNo value={score.triggerFired} /></Row>
        <Row label="Success criteria"><YesNo value={score.successCriteriaMet} /></Row>
        <Row label="Failure test"><YesNo value={score.failureTestPassed} /></Row>
        <Row label="Idempotent"><YesNo value={score.idempotent} /></Row>
        <Row label="Dashboard"><ScoreBar value={score.dashboardQuality} /></Row>
      </div>

      <SectionLabel>Code quality</SectionLabel>
      <div className="divide-y divide-white/[0.06]">
        <Row label="Parallel primitive"><ScoreBar value={score.parallelPrimitive} /></Row>
        <Row label="Idempotency"><ScoreBar value={score.codeIdempotency} /></Row>
        <Row label="Cleanliness"><ScoreBar value={score.codeCleanness} /></Row>
      </div>

      <SectionLabel>Infrastructure</SectionLabel>
      <div className="divide-y divide-white/[0.06]">
        <Row label="Services"><span className="text-white/80">{score.infraServices}</span></Row>
        <Row label="Deps"><span className="text-white/80">{score.externalDeps}</span></Row>
        <Row label="RAM"><span className="text-white/80">{score.ram}</span></Row>
        <Row label="Self-hostable"><YesNo value={score.selfHostable} /></Row>
        <Row label="License"><span className="text-white/80">{score.license}</span></Row>
      </div>

      {score.notes.length > 0 && (
        <>
          <SectionLabel>Notes</SectionLabel>
          <ul className="space-y-2">
            {score.notes.map((n, i) => (
              <li key={i} className="text-sm text-white/70 leading-relaxed flex gap-2">
                <span className="text-white/35 shrink-0 mt-0.5">·</span>
                {n}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
