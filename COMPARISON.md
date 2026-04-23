# Workflow Platform Comparison

Cumulative scoring across workflows and runs. Each bench run **adds** to this document — nothing is removed. The top table is a synthesized best-guess summary of everything we have learnt about each platform across every workflow tested.

Scores 1–5 (higher = better). Timing in minutes. Mode: **I** = Installation included · **F** = Flow only. Full rubrics in `services/{platform}/scoring.md` (gitignored — run the bench locally to generate them).

---

## Synthesized scores

**Best-guess aggregate judgment across all runs to date.** Update whenever new evidence shifts the picture. See the `Run log` below for the evidence.

| | Vercel Workflow | Inngest | Restate | Windmill | Hatchet | Mastra | XState | Trigger.dev |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Runs informing score** | 1 | 2 | 1 | 1 | 1 | 1 | 1 | 1 (boot failed) |
| **Workflows covered** | lead-lifecycle | reddit-ai-norwegian, lead-lifecycle | hn-digest | hn-digest | reddit-ai-norwegian | hn-digest | arxiv-ai-to-slack | hn-digest |
| **Typical build time (min)** | ~4 (incl. install) | ~4–11 | ~3.5 | ~40 | ~4 | ~15 | ~1.4 | ~5 (no boot) |
| **Typical execution time (sec)** | ~26 w/durable waits | ~9 simple · ~36 w/durable waits | ~60+ (rate-limit) | ~70 | ~6 | ~60 | ~0.8 | — |
| **Developer experience** | 5 | 4 | 4 | 2 | 3 | 3 | 2 | 3 |
| **Reliability** | 4 | 4 | 5 | 5 | 3 | 2 | 2 | ? |
| **Built for this** | 5 | 5 | 4 | 5 | 4 | 2 | 1 | 3 |
| **Visibility** | 4 | 4 | 5 | 5 | 4 | 3 | 1 | ? |
| **Operational overhead** | 5 | 5 | 3 | 2 | 3 | 5 | 5 | 5 |
| **Multi-tenant flexibility** | 3 | 3 | 3 | 4 | 3 | 2 | 2 | 2 |
| **Licensing & lock-in** | 3 | 4 | 2 | 3 | 5 | 4 | 5 | 2 |
| **Synthesized total** | **29/35** | **29/35** | **26/35** | **26/35** | **25/35** | **21/35** | **18/35** | **~17/35** |
| **Weighted (40/30/20/10)** | **89/100** | **~82/100** | **~74/100** | **~74/100** | **~72/100** | **~60/100** | **54/100** | — |

**Score notes:**
- **Inngest DX (4)** — started at 5 after the straightforward Reddit digest (2026-04-22); dropped to 4 after lead-lifecycle (2026-04-23) surfaced no-hot-reload + silent `waitForEvent` match-failure footguns.
- **Inngest Built-for-this (5)** — upgraded from 4 after lead-lifecycle exercised durable sleep + event waits + timeouts + fan-out + idempotency end-to-end cleanly.
- **Restate Reliability (5)** — native idempotency via workflow ID is unique on this roster; Restate Server rejects duplicate keys with HTTP 409 immediately, no app-level code needed. Retry machinery + sys_journal/sys_invocation SQL tables give best-in-class step observability.
- **Restate Licensing (2)** — BSL 1.1 (converts to Apache after 4 years). This is the most restrictive license on the roster and the biggest hesitation factor for a 40+ dev team.
- **Windmill DX (2)** — weakest authoring experience despite strongest runtime. OpenFlow JSON DSL, no local edit-run-test loop, CE's git sync is limited. Excellent observability lifts it from 1.
- **Windmill Built-for-this (5)** — ForloopFlow parallel, native cron, first-class secrets, built-in idempotency pattern. Structural fit is the best on the roster if you can stomach the authoring friction.
- **Mastra Built-for-this (2)** — Mastra is an **AI-agent** framework; using it for pure data-pipeline workflows leaves its differentiators (agents, memory, tool registry, RAG) untouched and forces you to bolt on node-cron and a durability adapter. Right platform, wrong job.
- **Trigger.dev Reliability / Visibility (?)** — worker never connected in the only attempt (missing `TRIGGER_SECRET_KEY` — cloud credential required even for the "dev" path). All runtime dimensions are unverified.
- **Trigger.dev Licensing (2)** — code is Apache 2.0, but default path requires cloud account and the task config in the built code points at `proj_hndigest` on cloud.trigger.dev. Self-host Docker Compose exists but was not exercised.
- **XState Built-for-this (1) / Reliability (2) / Visibility (1)** — xstate is a state-machine *library*, not a durable-execution engine. No journal, no crash replay, no dashboard, no scheduling, no event waiting. Everything the other platforms give you for free (retries, idempotency, observability) is hand-rolled here. Happy-path runs are fine and cheap; any crash mid-flight is data loss.
- **XState Operational (5) / Licensing (5)** — smallest footprint on the roster (one Node process, no Docker, no DB), MIT licensed, zero vendor dependency. Genuine strengths, just for the wrong job.
- **Vercel Workflow DX (5) / Built-for-this (5)** — two directives (`"use workflow"`, `"use step"`), no DSL, no worker class; durable async/await identical in shape to plain Node. Bundled docs in `node_modules/workflow/docs/` can never drift from the installed version.
- **Vercel Workflow Licensing (3)** — runtime is Apache-2.0 and runs on any Node host, but production polish (dashboard, retry visibility) is best-supported on Vercel Fluid Compute. Self-hosting at scale is a documented "not the happy path."
- **Vercel Workflow vs Inngest (tie at 29/35, but 89 vs 82 weighted)** — Vercel Workflow wins on the weighted DX/Ops axes by deleting the `inngest-cli dev` process entirely (state lives in `.next/workflow-data/`). Inngest wins on cross-host portability and not coupling you to Next.js.

---

## Run log

Chronological log of every bench run. Append new entries; never remove old ones.

### Vercel Workflow × lead-lifecycle (2026-04-23, mode I)

B2B lead-lifecycle simulation (ack → 10s sleep → nudge → hook decision w/30s timeout → conditional fan-out + loop-back → signature hook w/20s timeout → parallel fan-out w/injected 30% failure → 15s delayed follow-up). All Slack output to `#workflow-bench`.

- `workflow@4.2.4` + `@workflow/next@4.0.5` on Next.js 16.2.4. One Next dev process on :4300, no Docker, no DB — state lives in `.next/workflow-data/`.
- Install + build + verified run: ~4 min total. End-to-end execution: 25.8s (of which ~10s is durable sleep + two hook round-trips).
- Two directives (`"use workflow"` / `"use step"`) are the entire programming model; async/await code shape is identical to a plain Node script. `Promise.race([hook, sleep("30s")])` for timeouts, `Promise.all([...])` for fan-out, plain `while` loop for max-iterations loop-back — all stdlib JS idioms.
- Retries native per step; `FatalError` opts out, `RetryableError({retryAfter})` schedules. The injected 30% flake in the invoice step recovered without any config.
- Idempotency: `stepId` keys are native for external-API dedupe; 24h business-key dedupe (same `leadId`) was hand-rolled via tmpdir JSON file — no generic helper shipped.
- Observability: `npx workflow web` dashboard + `npx workflow inspect run <id> --json` CLI ship in-box. Structured JSON means scriptable.
- Gotchas: `package.json "type": "commonjs"` breaks Next.js route handlers (must be `module` or absent). `createHook` tokens must be deterministic across replays — derive from workflow inputs, never `Date.now()` or random. "Uncommitted operation: sleep" warning on abandoned race branches is benign but noisy.
- Weighted total: **4.47/5 → 89.4/100**. Ties Inngest on the 7-dim synthesized table (29/35) but wins the weighted 40/30/20/10 comparison by deleting the separate dev-CLI process.

### XState × arxiv-ai-to-slack (2026-04-23, mode I)

Single-step pipeline: fetch latest arXiv cs.AI paper → post to Slack `#workflow-bench`. Idempotent on UTC date via local JSON file.

- Install + build + verified run: 1.43 min total. End-to-end execution: ~0.8s. Smallest infra of the entire roster — one Node process on :4300, no Docker, no DB.
- `xstate@5.19.0` with `setup()` + `fromPromise` actors, one state per step (`checkIdempotency` → `fetching` → `posting` → `committing` → `done|skipped|failed`).
- Idempotency: pure application-level (`.idempotency.json`). Second trigger same UTC date returned `{"status":"skipped",...}` with the original Slack ts. No atomic guard — TOCTOU window between check and commit.
- Retries: expressed as an `onError` self-transition with a counter smuggled through context (needed `as any` to typecheck in v5). Works but inelegant vs `retries: 3` on a step.
- No durability: if the process crashes between `fetching` and `committing`, the paper is fetched, possibly posted, and the idempotency key is unwritten — next trigger re-runs. This is the defining limitation; no journal, no replay.
- No local dashboard (Stately Studio is cloud-only). Observability = whatever you `console.log`.
- Total 54/100 on the new 40%/30%/20%/10% DX/Reliability/Ops/Cost weighting. Verdict: right tool for in-process UI state machines, wrong tool as a top-level durable workflow runtime for a 40-dev team.

### Inngest × lead-lifecycle (2026-04-23, mode F)

B2B lead-lifecycle simulation (ack → 10s sleep → nudge → HITL decision w/30s timeout → conditional fan-out → signature wait w/20s timeout → parallel fan-out w/injected 30% failure → 15s delayed follow-up). All Slack output to `#workflow-bench`.

- Build: 10.6 min. Execution: 36s end-to-end (of which ~25s is intentional durable sleep).
- Hit every stress feature: daily-bucket idempotency via CEL (2 triggers → 1 run), durable `step.sleep`, `step.waitForEvent` with `match: "data.leadId"` and explicit timeouts, `Promise.all(step.run...)` parallel fan-out, `retries: 3`.
- DX friction: `tsx` has no `--watch`, and after a flow edit the Inngest dev CLI stops re-discovering (`"apps synced, disabling auto-discovery"`). `waitForEvent` with string-interpolated `if:` compiled and silently timed out; `match: "data.<field>"` fixed it.
- Total score: 29/35.

### Inngest × reddit-ai-norwegian (2026-04-22, mode F)

Cron-triggered pipeline: fetch top Reddit AI story, get top comment, translate to Norwegian via Gemini, post to Slack.

- Lightest infra of any platform: two processes, no Docker, no database (~159 MB total).
- Step API clean and idiomatic TypeScript. CEL idempotency deduped correctly (2 triggers → 1 run).
- Dev server crashed on worker reconnect in dev mode — minor but real rough edge. Port conflict on 3000/3001 required adapting to 3003.
- DX near-perfect at the time: instant edit→run cycle, secrets via `process.env`, full IDE support.

### Hatchet × reddit-ai-norwegian (2026-04-22, mode F)

- `durableTask` is the right primitive for sequential durable pipelines. Clean TypeScript authoring, good dashboard at :8888.
- Two non-obvious env vars required (`HATCHET_CLIENT_HOST_PORT=127.0.0.1:7077`, `HATCHET_CLIENT_TLS_STRATEGY=none`) — not in getting-started docs; required SDK source grep.
- Token rotation on every `hatchet server start` is a dev-loop friction point.
- No built-in idempotency primitive; would need manual implementation for dedup.
- ~6s execution once connected.

### Restate × hn-digest (mode F)

Daily HN AI digest: fetch top 30 stories → 30-way parallel metadata fetch → filter → parallel Gemini summarization → rank → Slack top 5. Idempotent on UTC date.

- Booted first try, build 3m35s. `restate.workflow()` keyed by UTC date is **native idempotency**; second `curl` returns HTTP 409 immediately.
- `Promise.all(topIds.map(id => ctx.run(...)))` is idiomatic fan-out; each step individually journaled.
- Rich observability: built-in React UI at :9070 plus SQL `sys_journal` / `sys_invocation` tables queryable at `/query`.
- Gotchas: `docker run --rm` means ephemeral journal (volume mount required for real durability). No native cron — node-cron sidecar. BSL 1.1 license.
- Run hit Gemini daily-quota exhaustion mid-flight; retry backoff machinery worked correctly.

### Windmill × hn-digest (mode F)

- Structural fit is excellent: ForloopFlow with `parallel: true` + parallelism limit, native 6-field cron, first-class encrypted variables, idempotency via a Windmill variable.
- Developer experience is the weakest of the roster: OpenFlow JSON DSL authored in a browser Studio (or hand-written 135-line JSON), no local file-watch dev loop, git sync is EE-only.
- First run failed on env-var sandboxing — secrets must use `wmill.getVariable()`, not `process.env`. Not obvious from docs.
- Dashboard is best-in-class: per-iteration jobs, click-to-replay, step-level input/output/logs.
- ~1.1 GB RAM across 5 containers (db, server, 2× worker, native worker, caddy). 30s warm boot, ~65s full restart cycle.

### Mastra × hn-digest (mode F)

- **Wrong tool for the job** verdict from the scoring file. Mastra is an AI-agent framework; using it for pure data pipelines leaves agents/memory/RAG untouched and forces bolted-on node-cron + a durability storage adapter.
- Parallel via `.foreach(step, { concurrency })` is clean; idempotency via local JSON file works.
- Bundler moves code to `.mastra/output/` so `process.cwd()` is unreliable → required `MASTRA_PROJECT_ROOT` env var.
- Zero Docker, zero DB, ~5s boot. PostHog telemetry default-on (`TELEMETRY_DISABLED=true` to disable).
- Studio UI at :4111 is functional but sparse — no step timings, no retry visibility.

### Trigger.dev × hn-digest (mode F, boot failed)

- `npm run dev` requires `TRIGGER_SECRET_KEY` (cloud API key) even for the "dev" path; build did not include one → worker never connected → every runtime dimension unverifiable.
- Build itself was the fastest on the roster at ~5 minutes: no local infra, `batchTriggerAndWait` is the correct v3 primitive and was used correctly.
- Import trap: `@trigger.dev/sdk` CJS exports are v2 API; must explicitly import from `@trigger.dev/sdk/v3` for v3 tasks.
- Code-as-source-of-truth is clean; license is Apache 2.0. But the cloud-first default makes this effectively a SaaS unless you deploy the self-host Docker Compose stack.

---

## Known gotchas (cumulative)

Things not in the official docs that cost a failed run or forced a workaround. The agent reads this before building on a platform. **Append only.**

| Platform | Gotcha |
|---|---|
| **Inngest** | Skills may cover a newer API version than what npm serves — check the installed version before trusting skill examples. Dev server crashes if the worker process restarts while it's connected — restart both processes together. **(lead-lifecycle 2026-04-23)** Idempotency keys use **CEL, not JavaScript** — `event.ts.toString().slice(...)` fails at registration; use `string(int(event.ts / 86400000))` for a daily bucket. **`waitForEvent({ if: ... })` silently times out** if the expression doesn't match — use `match: "data.<field>"` for same-field correlation. **After editing a flow file**, the CLI logs `"apps synced, disabling auto-discovery"` and stops re-discovering; restart the **CLI itself**, not just the app server. `npm run dev` uses `tsx` without `--watch` — consider `tsx watch` for a team setup. |
| **Hatchet** | Token rotates on every server restart — re-read from `~/.hatchet/profiles.yaml` and update `.env`. No idempotency primitive built in; must implement manually. `localhost` resolves to IPv6 on macOS but Docker only binds gRPC to IPv4 — use `HATCHET_CLIENT_HOST_PORT=127.0.0.1:7077`. SDK defaults to TLS; set `HATCHET_CLIENT_TLS_STRATEGY=none` for local dev. |
| **Restate** | Ephemeral by default — `docker run --rm` without a volume mount loses all journal state on restart. Mount `/restate-data` for real durability. No native cron; needs a `node-cron` sidecar. BSL 1.1 license (converts to Apache after 4 years). SQL query API returns binary Arrow IPC by default — add `Accept: application/json` for plain JSON. |
| **Windmill** | Workers sandbox env vars — secrets must use `wmill.getVariable()`, not `process.env`. API endpoint paths differ from docs; fetch `/api/openapi.json` from the live instance to find correct routes. Cron uses 6-field syntax (seconds first): `0 0 8 * * *`. Git sync for flow-as-code is Enterprise only in full form. |
| **Mastra** | Bundler runs code from a temp `.mastra/output/` / `src/mastra/public/` dir — `process.cwd()` and `__dirname` are unreliable. Use a `MASTRA_PROJECT_ROOT` env var for any file paths. Step-level retry is `retries: N`, not `retryConfig`. No native cron — node-cron sidecar required. No durability by default — requires a storage adapter (LibSQL/Postgres). PostHog telemetry default-on. |
| **Trigger.dev** | Default `npm run dev` requires a cloud credential (`TRIGGER_SECRET_KEY`) even for the self-hosted path — must explicitly configure local server URL before anything runs. Imports must come from `@trigger.dev/sdk/v3`, not `@trigger.dev/sdk` (CJS exports v2). TriggerConfig requires `maxDuration` to be set. |
| **Vercel Workflow** | `package.json` `"type": "commonjs"` (npm-init default) breaks Next.js route handlers using `import/export` — must be `"type": "module"` or absent. `createHook({ token })` tokens must be deterministic across replays — derive from workflow inputs (`lead-decision-${leadId}-${iteration}`), never from `Date.now()`/random. `Promise.race([hook, sleep])` leaves an "uncommitted operation: sleep" warning on the abandoned branch — benign but noisy. No generic business-key idempotency helper — only `stepId` (external-API) is native; logical dedupe is hand-rolled. |

---

## Incomplete runs (do not include in scores)

Platforms with a `services/<P>/mode.txt` but no `scoring.md`. These are aborted builds, not evidence — the framework flags them so they aren't silently omitted.

- **DBOS** (`services/dbos/`) — bench started (mode: installation), no build or scoring completed. Not scored.
- **pgflow** (`services/pgflow/`) — bench started (mode: installation), no build or scoring completed. Not scored.

---

*Latest update: 2026-04-23 (backfilled Vercel Workflow × lead-lifecycle, flagged DBOS/pgflow as incomplete). This document accumulates across runs — prior data is never removed.*
