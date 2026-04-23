# Workflow Platform Comparison

Cumulative scoring across workflows and runs. The top table tracks only **active contenders** — platforms still in the running for a 40+ dev team. Platforms we've ruled out are summarised in the short `Dropped from roster` section at the bottom and stop consuming space in the comparison.

Scores 1–5 (higher = better). Timing in minutes. Mode: **I** = Installation included · **F** = Flow only. Full rubrics in `services/{platform}/scoring.md` (gitignored — run the bench locally to generate them).

**Weighted scoring rubric (revised 2026-04-23):** DX 30% · Reliability 25% · Operational Load 15% · Hosting/Portability 15% · Ecosystem Maturity 10% · Cost/Licensing 5%. The earlier 40/30/20/10 rubric flattered vendor-coupled platforms by not scoring framework lock-in or adoption maturity as first-class dimensions. Multi-language support is explicitly not scored — this team is TypeScript-only.

---

## Executive summary

**Rewritten every run.** Opinionated take on where the roster stands after the most recent bench — a human-readable companion to the scoring table below. Earlier verdicts are not preserved; the `Run log` section is the archive.

### Latest verdict (2026-04-23, DBOS × lead-lifecycle)

**DBOS ties Inngest for the top spot.** If the team already runs Postgres — which most 40+ dev teams do — DBOS delivers Restate-grade durability semantics (workflow-ID idempotency, per-step retry config, crash replay) as a library rather than a separate engine process. Code reads like plain TypeScript; no DSL, no worker class, no vendor cloud, MIT license. The two real downsides are ecosystem depth (early-adopter risk in 2026) and observability (no bundled local dashboard — either pay for Conductor, build an internal status page, or live with SQL against `dbos_system.*`). For a team that values runtime correctness over dashboard polish and is allergic to vendor cloud, DBOS is the pick. For "just works with the richest ecosystem," Inngest remains tied and slightly safer.

**Trade-offs for runners-up:**
- **Inngest** — trade DBOS's native workflow-ID idempotency for a larger ecosystem and a richer local dev UI; CEL idempotency and `waitForEvent({if:})` have subtle footguns DBOS sidesteps.
- **Vercel Workflow** — trade portability and ecosystem maturity for the most elegant authoring experience; only compelling if you're a Next.js-on-Vercel shop.
- **Restate** — trade DBOS's MIT license for a bundled dashboard and richer built-in step observability; BSL 1.1 is a real hesitation factor.
- **Hatchet** — trade DX polish for the most transparent open-source engine; fewer high-level primitives (no native idempotency, token rotation friction).
- **Windmill** — trade code-first authoring for best-in-class observability + structural fit; OpenFlow JSON DSL and no local edit-run loop are real drags for TypeScript developers.

**Surprises:** DBOS's TSv3 function-based API is more ergonomic than the decorator version pre-2025 tutorials show. `npx dbos postgres start` is the smoothest local-Postgres-in-Docker experience on the roster. No surprises on reliability — durability behaved as advertised.

**Agent-tooling signal:** DBOS has no Claude skill in this harness; the build was driven by four `WebFetch` calls against `docs.dbos.dev`, and build time (~4 min) was competitive with skill-backed platforms. When docs are accurate and map 1:1 to the installed SDK version, skills are nice-to-have, not load-bearing. Inngest's skill earned its keep mainly because it covered API-version drift — a different problem.

---

## Synthesized scores

**Best-guess aggregate judgment across all runs to date.** Update whenever new evidence shifts the picture. See the `Run log` below for the evidence.

| | Vercel Workflow | Inngest | Restate | Windmill | Hatchet | Trigger.dev | DBOS |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Runs informing score** | 1 | 2 | 1 | 1 | 1 | 1 (boot failed) | 1 |
| **Workflows covered** | lead-lifecycle | reddit-ai-norwegian, lead-lifecycle | hn-digest | hn-digest | reddit-ai-norwegian | hn-digest | lead-lifecycle |
| **Typical build time (min)** | ~4 (incl. install) | ~4–11 | ~3.5 | ~40 | ~4 | ~5 (no boot) | ~4 (incl. install) |
| **Typical execution time (sec)** | ~26 w/durable waits | ~9 simple · ~36 w/durable waits | ~60+ (rate-limit) | ~70 | ~6 | — | ~31 w/durable waits |
| **Developer experience** | 5 | 4 | 4 | 2 | 3 | 3 | 4 |
| **Reliability** | 4 | 4 | 5 | 5 | 3 | ? | 5 |
| **Built for this** | 5 | 5 | 4 | 5 | 4 | 3 | 4 |
| **Visibility** | 4 | 4 | 5 | 5 | 4 | ? | 3 |
| **Operational overhead** | 5 | 5 | 3 | 2 | 3 | 5 | 4 |
| **Hosting / portability** | 2 | 4 | 4 | 4 | 4 | 2 | 5 |
| **Ecosystem maturity** | 2 | 4 | 3 | 4 | 3 | 4 | 3 |
| **Multi-tenant flexibility** | 3 | 3 | 3 | 4 | 3 | 2 | 3 |
| **Licensing & lock-in** | 3 | 4 | 2 | 3 | 5 | 2 | 5 |
| **Synthesized total** | **33/45** | **37/45** | **33/45** | **34/45** | **32/45** | **~23/45** | **36/45** |
| **Weighted (30/25/15/15/10/5)** | **80/100** | **~82/100** | **~77/100** | **~68/100** | **~70/100** | — | **~82/100** |

**Score notes:**
- **Inngest DX (4)** — started at 5 after the straightforward Reddit digest (2026-04-22); dropped to 4 after lead-lifecycle (2026-04-23) surfaced no-hot-reload + silent `waitForEvent` match-failure footguns.
- **Inngest Built-for-this (5)** — upgraded from 4 after lead-lifecycle exercised durable sleep + event waits + timeouts + fan-out + idempotency end-to-end cleanly.
- **Restate Reliability (5)** — native idempotency via workflow ID is unique on this roster; Restate Server rejects duplicate keys with HTTP 409 immediately, no app-level code needed. Retry machinery + sys_journal/sys_invocation SQL tables give best-in-class step observability.
- **Restate Licensing (2)** — BSL 1.1 (converts to Apache after 4 years). This is the most restrictive license on the roster and the biggest hesitation factor for a 40+ dev team.
- **Windmill DX (2)** — weakest authoring experience despite strongest runtime. OpenFlow JSON DSL, no local edit-run-test loop, CE's git sync is limited. Excellent observability lifts it from 1.
- **Windmill Built-for-this (5)** — ForloopFlow parallel, native cron, first-class secrets, built-in idempotency pattern. Structural fit is the best on the roster if you can stomach the authoring friction.
- **Trigger.dev Reliability / Visibility (?)** — worker never connected in the only attempt (missing `TRIGGER_SECRET_KEY` — cloud credential required even for the "dev" path). All runtime dimensions are unverified.
- **Trigger.dev Licensing (2)** — code is Apache 2.0, but default path requires cloud account and the task config in the built code points at `proj_hndigest` on cloud.trigger.dev. Self-host Docker Compose exists but was not exercised.
- **Vercel Workflow DX (5) / Built-for-this (5)** — two directives (`"use workflow"`, `"use step"`), no DSL, no worker class; durable async/await identical in shape to plain Node. Bundled docs in `node_modules/workflow/docs/` can never drift from the installed version.
- **Vercel Workflow Hosting (2)** — Next.js-coupled (`@workflow/next`, `withWorkflow()`, `.next/workflow-data/`). A non-Next.js team cannot adopt this; a Next.js team off Vercel gets a degraded production experience (dashboard/retry UI are best on Vercel Fluid Compute).
- **Vercel Workflow Ecosystem (2)** — released 2025, few independent production references, minimal third-party content, no public postmortems or scale stories. A 40+ dev team adopting WDK is an early adopter.
- **Vercel Workflow Licensing (3)** — runtime is Apache-2.0 and runs on any Node host, but production polish is best-supported on Vercel Fluid Compute. Self-hosting at scale is a documented "not the happy path."
- **Vercel Workflow rescore (89 → 80)** — under the revised rubric (30/25/15/15/10/5) WDK drops from first place to roughly tied with Inngest. Runtime qualities are unchanged; the new Hosting (2) and Ecosystem (2) dimensions surface what the old rubric hid — WDK is a Next.js durability primitive, not a standalone workflow platform. Still the top pick for a Next.js-on-Vercel shop; no longer an automatic top pick for a platform-agnostic team.
- **DBOS Reliability (5)** — native workflow-ID idempotency + per-step retry config (`retriesAllowed`, `maxAttempts`, `intervalSeconds`, `backoffRate`) + Postgres-journaled crash replay. Only other platform with workflow-ID-as-idempotency-key is Restate.
- **DBOS Hosting (5)** — library only (no engine process, no vendor cloud required). Any Node host + any Postgres (RDS, Supabase, Neon, on-prem) is a production deployment; no framework lock-in.
- **DBOS Visibility (3)** — no bundled local dashboard (Restate and Windmill both ship one). `DBOS.retrieveWorkflow(id).getStatus()` + SQL queries against `dbos_system.workflow_status` / `operation_outputs` / `notifications` are the observability surface. Paid Conductor SaaS provides a hosted UI; self-hosted teams roll their own or query SQL.
- **DBOS Licensing (5)** — MIT runtime, free self-host forever, no SaaS requirement. Matches Hatchet as cleanest license + lock-in combo on the roster.
- **DBOS Ecosystem (3)** — credible (Stonebraker/Madden lineage, Series A 2024), but a 40+ dev team adopting DBOS in 2026 is an early adopter. Hiring for "DBOS experience" is a 2027+ bet; TSv3 API (function-based, no decorators) only landed in 2025, so older tutorials actively mislead.

---

## Run log

Chronological log of every bench run. Append new entries; never remove old ones.

### DBOS × lead-lifecycle (2026-04-23, mode I)

B2B lead-lifecycle simulation (ack → 10s sleep → nudge → HITL decision w/30s timeout → conditional fan-out + loop-back w/max iterations → signature wait w/20s timeout → parallel fan-out w/injected 30% failure → 15s delayed follow-up). All Slack output to `#workflow-bench`.

- `@dbos-inc/dbos-sdk@4.15.5`. Two processes: Node/Express app on :4500 + Postgres Docker container via `npx dbos postgres start`. Install + build + verified happy-path run: ~4 min total. End-to-end execution: 30.6s (10s nudge sleep + 15s follow-up sleep + Slack I/O + two external signal round-trips).
- TSv3 API is **function-first, no decorators**: plain async function + `DBOS.runStep(fn, {name, retriesAllowed, maxAttempts, intervalSeconds, backoffRate})` + `DBOS.registerWorkflow(fn)`. Reads like normal TypeScript; no DSL, no worker class.
- External signals: `DBOS.recv<T>(topic, timeoutSeconds)` returns `null` on timeout (cleaner than thrown error); `DBOS.send(workflowID, value, topic)` from outside delivers durably via Postgres. No event-correlation footgun (contrast Inngest's `waitForEvent({if})` silently timing out).
- Idempotency: workflow ID is the native idempotency key. Setting `workflowID: "lead-<id>-<YYYYMMDD>"` on `DBOS.startWorkflow` makes second submission return existing handle with zero duplicate side effects. Verified — no duplicate Slack posts on re-submit.
- Retries: per-step config matches industry best-practice (`maxAttempts: 5, intervalSeconds: 1, backoffRate: 2`). Injected 30% invoice flake recovered without any user-visible noise.
- Observability: no bundled local dashboard. Status via `DBOS.retrieveWorkflow(id).getStatus()` returns structured JSON (status/input/output/recoveryAttempts/timestamps). Raw SQL against `dbos_system.*` tables is the advanced path. Paid Conductor SaaS for UI.
- Gotchas: `tsx` default has no `--watch` (same as Inngest). TSv3 (2025) dropped class decorators — any pre-2025 tutorial is misleading. `DBOS.setConfig()` must precede `DBOS.launch()`.
- Weighted total: **~82/100** — ties Inngest; slightly edges Vercel Workflow (80) on the revised rubric. Hosting (5) and Licensing (5) are the standouts.

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
| **Trigger.dev** | Default `npm run dev` requires a cloud credential (`TRIGGER_SECRET_KEY`) even for the self-hosted path — must explicitly configure local server URL before anything runs. Imports must come from `@trigger.dev/sdk/v3`, not `@trigger.dev/sdk` (CJS exports v2). TriggerConfig requires `maxDuration` to be set. |
| **Vercel Workflow** | `package.json` `"type": "commonjs"` (npm-init default) breaks Next.js route handlers using `import/export` — must be `"type": "module"` or absent. `createHook({ token })` tokens must be deterministic across replays — derive from workflow inputs (`lead-decision-${leadId}-${iteration}`), never from `Date.now()`/random. `Promise.race([hook, sleep])` leaves an "uncommitted operation: sleep" warning on the abandoned branch — benign but noisy. No generic business-key idempotency helper — only `stepId` (external-API) is native; logical dedupe is hand-rolled. |
| **DBOS** | TSv3 (2025) dropped class decorators in favor of function-based registration — any pre-2025 tutorial showing `@DBOS.workflow()` is misleading for new projects. `DBOS.setConfig()` must be called **before** `DBOS.launch()`. `DBOS.recv<T>(topic, timeoutSeconds)` returns `null` on timeout, not a thrown error — branch on `null` for the timeout handler. No bundled local observability dashboard; use `DBOS.retrieveWorkflow().getStatus()` or SQL against `dbos_system.workflow_status` / `operation_outputs` / `notifications`. `npx dbos postgres start` is the smoothest local-Postgres experience on the roster — one command, no compose file. |

---

## Dropped from roster

Platforms we benched but ruled out as top-level durable-workflow runtimes for a 40+ dev team. One-line rationale kept so we don't re-litigate.

- **XState** (benched 2026-04-23, arxiv-ai-to-slack, 54/100) — state-machine *library*, not a workflow engine. No journal, no crash replay, no dashboard, no durable sleep, no `waitForEvent`, no cron, no idempotency. Zero-infra win is real but for the wrong job. Fine *inside* a durable step, never as the top layer.
- **Mastra** (benched 2026-04-22, hn-digest, ~60/100) — AI-agent framework, not a durable-workflow runtime. Using it for pipelines leaves agents/memory/RAG unused and forces bolted-on node-cron + a storage adapter for durability. Right tool, wrong job.

---

## Incomplete runs (do not include in scores)

Platforms with a `services/<P>/mode.txt` but no `scoring.md`. Aborted builds, not evidence.

- **pgflow** (`services/pgflow/`) — bench started (mode: installation), no build or scoring completed.

---

*Latest update: 2026-04-23 (added **DBOS** to active roster after lead-lifecycle run — weighted 82/100, ties Inngest; standout dimensions are Hosting (5) and Licensing (5)).*
