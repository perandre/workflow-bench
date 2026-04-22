# Workflow Platform Comparison

**Workflow tested:** Daily HN AI Digest — cron-triggered pipeline, 30 parallel HN fetches, Gemini summarisation, Slack post. Full spec in `workflow.md`.

Scores 1–5 (higher = better). Timing in minutes. Mode: **I** = Installation included · **F** = Flow only. Full rubrics in `services/{platform}/scoring.md` (gitignored — run the bench locally to generate them).

---

| | Inngest | Mastra | Windmill | Hatchet | Restate | Trigger.dev |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Mode** | I | I | I | I | I | I |
| **Install time (min)** | ~8 | ~5 | ~15 | ~10 | ~4 | — |
| **Build time (min)** | ~23 | ~10 | ~25 | ~12 | ~3 | ~5 |
| **Execution time (min)** | ~2 | ~2 | ~2 | — | ~1 | — |
| **Developer experience** | 4 | 3 | 2 | 3 | 4 | 2 |
| **Reliability** | 4 | 2 | 4 | 4 | 5 | — |
| **Built for this** | 4 | 2 | 4 | 3 | 3 | — |
| **Visibility** | 4 | 3 | 5 | 4 | 4 | — |
| **Operational overhead** | 5 | 5 | 2 | 2 | 3 | 3 |
| **Multi-tenant flexibility** | 3 | 2 | 4 | 3 | 2 | 3 |
| **Licensing & lock-in** | 4 | 4 | 3 | 5 | 3 | 3 |
| **Total** | **28/35** | **19/35** | **24/35** | **24/35** | **24/35** | —/35 |

---

## Quick notes per platform

**Inngest** — Lightest setup: two processes, no Docker, no database. Step API is clean and idiomatic. Best operational overhead. Idempotency correct via CEL expressions. Minor friction: skills covered v4 API while npm served v3, causing a one-line fix on first compile.

**Mastra** — Agent-first framework used as a pipeline runner. `.foreach()` parallel primitive works well. Zero infra overhead. Loses on reliability (no durability without a storage adapter) and structural fit (no native cron, file-based idempotency, bundler cwd quirks). Wrong tool for this job.

**Windmill** — Best visibility of any platform: per-iteration job tracking, click-to-replay, full job tree. Everything needed is built-in (cron, ForloopFlow, secrets). DX is the weak spot: Docker stack required, browser IDE is the primary authoring surface, flow definition is a JSON DSL. Built for operators more than developers.

**Hatchet** — Solid fan-out via `spawnChildren`, strong dashboard. Requires Postgres (~790 MB Docker). Critical gaps: no idempotency implemented, and token rotation on server restart is a dev-loop footgun. Good fit for teams already running Postgres.

**Restate** — Best-in-class reliability: journal-based durability with HTTP 409 idempotency enforced at the server level — zero application code needed. Fastest to first green run. Knocked by BSL 1.1 licence and no native cron. Ephemeral by default without a persistent volume.

**Trigger.dev** — Could not run locally: `npm run dev` required a cloud credential, blocking the LOCAL_ONLY constraint. Idiomatic `batchTriggerAndWait` parallel primitive. Runtime scores unavailable. Self-hosted path exists but was not the default.

---

*Last updated: 2026-04-22. Timing figures are approximate from bench logs. — = not measured / blocked.*
