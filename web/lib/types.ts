export type Platform = string

export type StepName = "install" | "docker_up" | "triggered" | "verified" | "scored"
export type StepStatus = "pending" | "running" | "done" | "error"

export interface BenchLog {
  tool: string
  sdkVersion: string
  bootCommand: string
  manualTriggerCommand: string
  infra: { services: string[]; externalDeps: string[] }
  notes: string
  buildStatus?: "success" | "failed"
  failureReason?: string
}

export interface ScoredPlatform {
  platform: string
  // Runtime
  bootedFirstTry: string
  triggerFired: string
  successCriteriaMet: string
  failureTestPassed: string
  idempotent: string
  dashboardQuality: string
  // Code quality
  parallelPrimitive: string
  codeIdempotency: string
  codeCleanness: string
  // Infra
  infraServices: string
  externalDeps: string
  ram: string
  teardownTime: string
  // License
  license: string
  selfHostable: string
  telemetry: string
  // Notes
  notes: string[]
}

export type BenchEvent =
  | { kind: "run_started"; runId: string; platforms: Platform[] }
  | { kind: "platform_started"; platform: Platform }
  | { kind: "log"; platform: Platform; text: string }
  | { kind: "step_update"; platform: Platform; step: StepName; status: StepStatus }
  | { kind: "bench_log_ready"; platform: Platform; data: BenchLog }
  | { kind: "score_ready"; platform: Platform; raw: string; parsed: ScoredPlatform }
  | { kind: "comparison_ready"; raw: string }
  | { kind: "run_complete" }
  | { kind: "run_error"; message: string }
  | { kind: "ping" }

export interface RunMeta {
  id: string
  timestamp: number
  platforms: Platform[]
  workflowName: string
  status: "running" | "complete" | "error"
}

export interface RunState extends RunMeta {
  events: BenchEvent[]
}
