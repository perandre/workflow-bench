"use client"
import { create } from "zustand"
import type { BenchEvent, Platform, StepName, StepStatus, ScoredPlatform, RunMeta } from "./types"

export interface PlatformState {
  status: "pending" | "running" | "complete" | "error"
  logs: string[]
  steps: Record<StepName, StepStatus>
  score: ScoredPlatform | null
  scoreRaw: string | null
}

function defaultSteps(): Record<StepName, StepStatus> {
  return { install: "pending", docker_up: "pending", triggered: "pending", verified: "pending", scored: "pending" }
}

interface BenchStore {
  runId: string | null
  platforms: Platform[]
  platformStates: Record<Platform, PlatformState>
  comparisonRaw: string | null
  runStatus: "idle" | "running" | "complete" | "error"
  runHistory: RunMeta[]

  initRun(runId: string, platforms: Platform[]): void
  applyEvent(event: BenchEvent): void
  setHistory(runs: RunMeta[]): void
  reset(): void
}

export const useBenchStore = create<BenchStore>((set) => ({
  runId: null,
  platforms: [],
  platformStates: {},
  comparisonRaw: null,
  runStatus: "idle",
  runHistory: [],

  initRun(runId, platforms) {
    const states: Record<Platform, PlatformState> = {}
    for (const p of platforms) {
      states[p] = { status: "pending", logs: [], steps: defaultSteps(), score: null, scoreRaw: null }
    }
    set({ runId, platforms, platformStates: states, comparisonRaw: null, runStatus: "running" })
  },

  applyEvent(event) {
    set(state => {
      const ps = { ...state.platformStates }

      const ensurePlatform = (p: string) => {
        if (p && !ps[p]) ps[p] = { status: "pending", logs: [], steps: defaultSteps(), score: null, scoreRaw: null }
      }

      switch (event.kind) {
        case "platform_started": {
          ensurePlatform(event.platform)
          ps[event.platform] = { ...ps[event.platform], status: "running" }
          break
        }
        case "log": {
          if (!event.platform) break
          ensurePlatform(event.platform)
          const logs = [...ps[event.platform].logs, event.text]
          ps[event.platform] = { ...ps[event.platform], logs: logs.slice(-500) }
          break
        }
        case "step_update": {
          ensurePlatform(event.platform)
          ps[event.platform] = {
            ...ps[event.platform],
            steps: { ...ps[event.platform].steps, [event.step]: event.status },
          }
          break
        }
        case "score_ready": {
          ensurePlatform(event.platform)
          ps[event.platform] = {
            ...ps[event.platform],
            status: "complete",
            score: event.parsed,
            scoreRaw: event.raw,
          }
          break
        }
        case "run_complete":
          return { ...state, platformStates: ps, runStatus: "complete" }
        case "run_error":
          return { ...state, platformStates: ps, runStatus: "error" }
        case "comparison_ready":
          return { ...state, platformStates: ps, comparisonRaw: event.raw }
      }
      return { ...state, platformStates: ps }
    })
  },

  setHistory(runs) { set({ runHistory: runs }) },
  reset() { set({ runId: null, platforms: [], platformStates: {}, comparisonRaw: null, runStatus: "idle" }) },
}))
