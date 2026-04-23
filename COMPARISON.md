# Workflow Platform Comparison

Cumulative scoring across workflows and runs. The top table tracks only **active contenders** — platforms still in the running for a 40+ dev team. Platforms we've ruled out are summarised in the short `Dropped from roster` section at the bottom and stop consuming space in the comparison.

Scores 1–5 (higher = better). Timing in minutes. Mode: **I** = Installation included · **F** = Flow only. Full rubrics in `services/{platform}/scoring.md` (gitignored — run the bench locally to generate them).

**Weighted scoring rubric (revised 2026-04-23):** DX 30% · Reliability 25% · Operational Load 15% · Hosting/Portability 15% · Ecosystem Maturity 10% · Cost/Licensing 5%. The earlier 40/30/20/10 rubric flattered vendor-coupled platforms by not scoring framework lock-in or adoption maturity as first-class dimensions. Multi-language support is explicitly not scored — this team is TypeScript-only.

---

## Executive summary

**Rewritten every run.** Opinionated take on where the roster stands after the most recent bench — a human-readable companion to the scoring table below. Earlier verdicts are not preserved; the `Run log` section is the archive.

### Latest verdict (2026-04-23, Dify × lead-lifecycle — category mismatch confirmed)

**Dify scored ~47/100 and goes straight to `Dropped from roster`** — not because Dify is bad, but because it is not in the category. Dify is an open-source LLM-app builder (chat / agents / RAG / visual DAG) with no durable sleep (`SANDBOX_WORKER_TIMEOUT=15s` kills any longer computation including `time.sleep`), no `waitForEvent` or HITL correlation on standalone workflows, no workflow-ID-as-idempotency-key, and no arbitrary back-edges for loop-back. Retries on HTTP and code nodes do work, parallel fan-out via multi-edge does work, and self-host is a first-class docker-compose happy path — but the authoring format for a code-first team is a JSON draft DAG posted to an undocumented console API with no TypeScript SDK. The 11-container footprint (Postgres + Redis + Weaviate + Squid + sandbox + plugin-daemon in addition to api/web/worker/beat/nginx) is the heaviest in the roster, and the "Dify Open Source License" is source-available (not OSI) with reseller restrictions. Right tool, wrong job — same verdict as n8n.

### Previous verdict (2026-04-23, Temporal + n8n × lead-lifecycle)

**New top of the roster: Temporal at ~87/100, edging DBOS (82) and Inngest (~82, verified).** Temporal is the reliability + ecosystem reference implementation on this roster — `workflowId` as idempotency key, declarative per-activity retry policy, event-sourced history replay, and the best observability UI any platform ships. `proxyActivities<typeof activities>()` gives type-safe RPCs across the workflow/activity boundary with no codegen — cleanest expression of that pattern we've seen. The honest catch is operational: dev is a single binary, but 40+ dev production with Temporal means running (or buying) a multi-service cluster + Postgres/Cassandra + usually Elasticsearch. You adopt Temporal when reliability + ecosystem maturity outweigh ops weight — which is most of the time for a team that actually cares about durable workflows.

**n8n enters the roster well below the active-contender line at ~44/100 and will be moved to `Dropped from roster` below.** The bench exposed n8n as a visual-first automation tool, not a code-first durable workflow platform: the source of truth is a 682-line JSON DAG, `$env` access is gated by an undocumented `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` flag, expressions throw "invalid syntax" on escaped double-quotes inside strings, the Wait-for-webhook resume URL is undocumented-by-example and returned `SQLITE_ERROR: no such column: NaN` for every URL shape we tried, and stale workflow versions were cached after `PUT+activate` until we deactivate→activate again. There is no trigger-level idempotency key — every webhook call creates an execution, and the intra-workflow dedupe we wrote (`$getWorkflowStaticData`) is in-memory-per-worker and unsafe in queue mode. The executions UI *is* genuinely excellent, and the install story is unbeaten (one container, sqlite embedded), but for a 40+ TS dev team that wants PR review, diffs, types, and tests, n8n is the wrong layer.

**Trade-offs for runners-up:**
- **DBOS (82)** — trade Temporal's world-class UI + ecosystem for a pure library + Postgres-you-already-run; MIT license + no cluster to operate makes this the best value pick when you can live without the Temporal dashboard.
- **Inngest (~82, verified)** — trade DBOS's SQL journal for the cleanest TS authoring experience; verified reliability under local-only constraint dropped to 3 because `dev --persist` loses in-flight timers on restart without external Redis.
- **Vercel Workflow (80)** — trade portability and ecosystem maturity for the most elegant authoring experience; only compelling if you're a Next.js-on-Vercel shop.
- **Restate (~77)** — trade DBOS's MIT license for a bundled dashboard and richer built-in step observability; BSL 1.1 is a real hesitation factor.
- **Hatchet (~70)** — trade DX polish for the most transparent open-source engine; fewer high-level primitives (no native idempotency, token rotation friction).
- **Windmill (~68)** — trade code-first authoring for best-in-class observability + structural fit; OpenFlow JSON DSL and no local edit-run loop are real drags for TypeScript developers.
- **Kestra (~65)** — same family as Windmill (YAML DSL + strong UI) but with broader plugin ecosystem; HTTP-2xx-is-SUCCESS makes it risky for API-driven flows without defensive parsing on every call.

**Surprises:** (1) n8n's `/api/v1/executions` default filter hides `status=running` and `status=waiting` — easy to misread "my workflow never triggered" when it did. (2) n8n's wait-for-webhook resume URL format is not documented anywhere we found and failed with an internal SQL error for every shape we tried; we downgraded the HITL step to `timeInterval` to finish the bench. (3) Temporal's dev-server UI is on a **different port** from the gRPC endpoint (`--ui-port` defaults to :4281) — first-time users sometimes miss it.

**Agent-tooling signal:** neither Temporal nor n8n had a Claude skill or MCP; both were driven from prior SDK knowledge + live REST API + docker logs. Temporal's build was ~3.5 min with zero iteration; n8n's was ~15 min dominated by debugging platform behaviour (env-access gate, expression escaping, RespondToWebhook semantics, resume-URL format, version caching). The signal is not about skills — it's that Temporal's errors are specific and point at the fix, while n8n's surface as generic SQL exceptions and require log archaeology. **Error message quality is a first-class DX axis and it's the biggest delta between these two.**

---

## Synthesized scores

**Best-guess aggregate judgment across all runs to date.** Update whenever new evidence shifts the picture. See the `Run log` below for the evidence.

| | Temporal | DBOS | Inngest | Vercel Workflow | Restate | Hatchet | Windmill | Kestra | Trigger.dev |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Runs informing score** | 1 | 1 | 2 + crash-test | 1 | 1 | 1 | 1 | 1 | 1 (boot failed) |
| **Workflows covered** | lead-lifecycle | lead-lifecycle | reddit-ai-norwegian, lead-lifecycle | lead-lifecycle | hn-digest | reddit-ai-norwegian | hn-digest | lead-lifecycle | hn-digest |
| **Typical build time (min)** | ~3.5 | ~4 (incl. install) | ~4–11 | ~4 (incl. install) | ~3.5 | ~4 | ~40 | ~18 (incl. install) | ~5 (no boot) |
| **Typical execution time (sec)** | ~30 w/durable waits | ~31 w/durable waits | ~9 simple · ~36 w/durable waits | ~26 w/durable waits | ~60+ (rate-limit) | ~6 | ~70 | ~40 w/durable waits | — |
| **Developer experience** | 4 | 4 | 4 | 5 | 4 | 3 | 2 | 2 | 3 |
| **Reliability** | 5 | 5 | 3 (verified) | 4 | 5 | 3 | 5 | 3 | ? |
| **Built for this** | 5 | 4 | 5 | 5 | 4 | 4 | 5 | 4 | 3 |
| **Visibility** | 5 | 3 | 4 | 4 | 5 | 4 | 5 | 5 | ? |
| **Operational overhead** | 3 | 4 | 5 | 5 | 3 | 3 | 2 | 3 | 5 |
| **Hosting / portability** | 5 | 5 | 4 | 2 | 4 | 4 | 4 | 5 | 2 |
| **Ecosystem maturity** | 5 | 3 | 4 | 2 | 3 | 3 | 4 | 4 | 4 |
| **Multi-tenant flexibility** | 4 | 3 | 3 | 3 | 3 | 3 | 4 | 3 | 2 |
| **Licensing & lock-in** | 5 | 5 | 4 | 3 | 2 | 5 | 3 | 4 | 2 |
| **Weighted (30/25/15/15/10/5)** | **~87/100** | **~82/100** | **~82/100** | **80/100** | **~77/100** | **~70/100** | **~68/100** | **~65/100** | — |

**Score notes:**
- **Temporal Reliability (5) / Ecosystem (5) / Licensing (5)** — the durability reference implementation on this roster: `workflowId`-as-idempotency-key, declarative per-activity retry policy, event-sourced history replay, and Apache 2.0 with no SaaS requirement. Temporal Cloud exists but is optional.
- **Temporal Visibility (5)** — dev-server UI is still the gold standard: full history event-by-event, stack traces of paused workflows, signal-from-UI, replay-from-any-point. Ties Restate/Kestra/Windmill for observability but beats them on depth of replay tooling.
- **Temporal Operational (3)** — dev is a single binary, prod is the heaviest infra on the roster (Temporal Server cluster + Postgres/Cassandra + typically Elasticsearch). The only platform where "buy Temporal Cloud" is a serious consideration for a 40+ dev team that doesn't want dedicated SRE.
- **Temporal DX (4)** — `proxyActivities<typeof activities>()` gives full type-safe RPCs across the workflow/activity boundary with no codegen; offset by the workflow sandbox (no `Date.now`, no `Math.random`, no `fetch`, all side effects through activities) which is a real learning curve.
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
- **Inngest Reliability (4 → 3, verified)** — manual kill-during-durable-sleep test on 2026-04-23 showed `inngest-cli dev --persist` (SQLite + embedded in-memory Redis) does NOT survive a process restart. SQLite retained run history, but the in-memory Redis lost scheduled wake-ups and `waitForEvent` subscriptions — the paused run stayed `Running` indefinitely and events sent after restart were orphaned. Fresh triggers also hung until the worker restarted too. Full crash-safe self-host requires `--redis-uri` pointing at a persistent Redis. Architecture-claimed reliability is higher; verified reliability under the LOCAL-ONLY bench constraint is 3.
- **Kestra DX (2)** — four mental models to learn: YAML structure, Pebble templates with non-recursive `vars` evaluation, onResume form-field conventions, and base64-encoded `SECRET_*` env vars (no API in OSS). Declarative fit is worse than Windmill for a TS team because the gotchas compound.
- **Kestra Reliability (3)** — per-task `retry:` is clean; idempotency is not native (no workflow-ID or business-key dedupe, only concurrency limits). HTTP Request task treats any 2xx response as SUCCESS — a Slack `{"ok":false,"error":"channel_not_found"}` in a 200 response silently passed undetected. Crash-replay architecture via SQL journal is sound but not verified.
- **Kestra Visibility (5)** — UI timeline, per-task input/output inspection, label-based execution search, logs tab. Ties Restate and Windmill for best-in-class observability on the roster.
- **Kestra Ecosystem (4)** — 18k+ GitHub stars, 1000+ plugins scanned at boot, ~4 years in production, named enterprise references. Strongest OSS ecosystem on this roster after Airflow.
- **Kestra Hosting (5)** — Apache 2.0 OSS, single-container for dev + Postgres Compose + Helm chart for k8s, no cloud dependency. Enterprise tier adds RBAC, SSO, git sync, secrets API — real upgrade pressure at 40+ devs but OSS runs production fine.

---

## Run log

Chronological log of every bench run. Append new entries; never remove old ones.

### Dify × lead-lifecycle (2026-04-23, mode I)

B2B lead-lifecycle simulation authored as a Dify workflow DAG via the console JSON API. All Slack output to `#workflow-bench`. Category-mismatch bench — Dify is an LLM-app builder (chat / agents / RAG + visual DAG workflows), not a code-first durable workflow platform. Run with eyes open; documented what does and doesn't translate.

- `langgenius/dify` main @ 2026-04 (docker images: `dify-api` Flask + `dify-web` Next.js + `dify-sandbox` Go + `dify-plugin-daemon` + `dify-worker` Celery + `worker_beat` + `nginx` + `ssrf_proxy` Squid + Postgres + Redis + Weaviate). **11 containers** from `repo/docker/docker-compose.yaml` — heaviest infra on the roster.
- Install + admin bootstrap + workflow author (via JSON draft API, not UI) + publish + first green run: ~13 min wall-clock. Happy-path execution ~20s end-to-end; ~75% success rate across four triggers (one run exhausted the intentional 30% failure's 5-retry budget).
- **No SDK, no TypeScript.** Authored workflow by posting a JSON graph to `POST /console/api/apps/<id>/workflows/draft`. Schema reverse-engineered from `repo/api/tests/fixtures/workflow/http_request_with_json_tool_workflow.yml` and the Flask controllers. `build-graph.py` is 165 lines of Python to produce the graph JSON — the workflow itself is not code, it's positional DAG JSON.
- **What works:** parallel fan-out (multiple edges from same node → Dify runs them concurrently and the downstream node waits for all), per-node `retry_config` with exponential backoff (observed 3-attempt recovery on the fail_inject code node), environment variables referenced as `{{#env.NAME#}}`, bearer-token auth in `http-request` nodes, console UI run history with per-node input/output inspection, public `/v1/workflows/run` trigger API.
- **What doesn't:** (1) **No durable sleep.** `SANDBOX_WORKER_TIMEOUT=15` in `docker/.env.example` is a hard ceiling on any code-node execution including `time.sleep`; the initial 15s sleep failed with `error: timeout / signal: killed` and was clamped to 8s to make the run pass. (2) **No waitForEvent / HITL for standalone workflows.** `human-input` node exists only in `advanced-chat` apps as a UI form; no external-event correlator for vanilla workflow mode. (3) **No workflow-ID-as-idempotency-key.** Re-triggering with the same `leadId` creates a fresh run — verified. (4) **No arbitrary back-edges.** `if-else` branches exist; Iteration/Loop nodes exist but are for iterating collections, not max-N loop-back.
- Gotchas discovered during authoring: console login body wants password **base64-encoded** (`FieldEncryption` is misnamed — it's base64, not RSA). Authenticated console calls require `X-CSRF-Token` header mirroring the `csrf_token` cookie. `POST /workflows/draft` requires the current `hash` field or returns 409 `draft_workflow_not_sync`. Environment vars must be declared at the workflow level in the `environment_variables` array of the sync payload.
- License: **Dify Open Source License** (source-available, AGPL-influenced, reseller / multi-tenant restrictions). Not OSI-approved. Legal review warranted before a 40+ dev team commits.
- Weighted total: **~47/100** — DX 2.2, Reliability 1.3, Operational 2.0, Hosting 4.0, Ecosystem 3.3, Cost 3.0. Well below the active-contender line. Moving to `Dropped from roster` for the same reason as n8n: right tool, wrong job.

### n8n × lead-lifecycle (2026-04-23, mode I)

B2B lead-lifecycle simulation authored as an n8n JSON DAG (webhook → Code dedupe → IF → HTTP Slack → Wait 10s → HTTP Slack nudge → Wait 3s [simplified] → Inject decision Code → Switch → parallel HTTP Slack → Merge → flaky Code (`retryOnFail`) → Wait 15s → HTTP Slack NPS). All Slack output to `#workflow-bench`.

- `n8nio/n8n:latest` v2.17.6 single-container, sqlite-embedded, 1 editor/webhook/worker process on :4678 + internal task broker on :5679. Install + owner setup + API key + workflow PUT + activate: ~2 min. Debugging + re-iterating: ~13 min. Happy-path exec 34.9s (status=success).
- 682-line workflow JSON (18 nodes, 13 connection entries). **Source of truth is a visual DAG, not code** — diffs are unreadable, no types, no tests.
- **HITL via wait-for-webhook could not be verified.** Resume URL `/webhook-waiting/<webhookId>/<suffix>` returned `SQLITE_ERROR: no such column: NaN` for every shape we tried (custom `webhookSuffix`, `$execution.resumeUrl`, by execution ID). Downgraded the step to a short `timeInterval` wait + injected `decision=Proposal` in a Code node so the rest of the DAG (parallel fan-out + `retryOnFail` + durable sleeps) could be exercised end-to-end.
- `N8N_BLOCK_ENV_ACCESS_IN_NODE` defaults to **true** — HTTP and Code nodes cannot read `$env` until the flag is flipped. Error message ("access to env vars denied") is clear only once you know the flag exists.
- Expression escaping footgun: `$node[\"Name\"]` inside a JSON template string throws "invalid syntax" because the parser sees literal backslash-quote. Use single quotes inside expressions (`$node['Name']`).
- No trigger-level idempotency key — both invocations of the same `leadId` created separate execution rows. Intra-workflow dedupe via `$getWorkflowStaticData('global')` is in-memory-per-worker and unsafe in queue mode.
- Public `/api/v1/executions` hides `status=running` and `status=waiting` by default; we had to fall back to `/rest/executions` with an explicit filter to see paused runs.
- After `PUT /api/v1/workflows/:id`, a stale version kept executing until we did `deactivate → activate` (not just `activate`). One execution ran against the old version.
- License is **Sustainable Use License (fair-code, not OSI)**. SSO, LDAP, audit logs, external-secret stores are Enterprise-only.
- Weighted total: **~44/100** — well below the active-contender line. Moving to `Dropped from roster`.

### Temporal × lead-lifecycle (2026-04-23, mode F)

B2B lead-lifecycle simulation (ack → 10s sleep → nudge → HITL decision w/30s timeout via signal → conditional fan-out → signature signal w/20s timeout → parallel fan-out w/injected 30% failure → 15s delayed follow-up). All Slack output to `#workflow-bench`.

- Temporal CLI 1.6.2 (Server 1.30.2) dev server on :4233 (gRPC) + UI on :4281. Node worker on :4500. Two processes, no Docker, no DB. `temporal server start-dev` is a single binary.
- 244 LoC TypeScript total across workflow + activities + worker + client. Happy-path exec **30.17s** (status=COMPLETED). `condition(predicate, timeoutSeconds)` idiomatically expresses "waitForEvent with timeout" and returns `true`/`false` for clean branching.
- Type safety across the workflow/activity boundary via `proxyActivities<typeof activities>()` — no codegen, no schema, full TS. Cleanest expression of this pattern on the roster.
- Idempotency: `workflowId` is the native idempotency key; `workflowIdReusePolicy: REJECT_DUPLICATE` is a one-line declarative flag. Matches DBOS/Restate on this axis.
- Retry policy per-activity is declarative: `{maximumAttempts, initialInterval, backoffCoefficient, maximumInterval, nonRetryableErrorTypes}`. Industry reference.
- Observability: event-sourced history + full replay + signal-from-UI + stack traces of paused workflows. Tied with Restate/Kestra/Windmill for best-in-class but with the deepest replay tooling.
- Gotchas: **workflow sandbox is strict** — no `fetch`, no `Date.now`, no `Math.random` in workflow code (all through activities). `workflowsPath` in dev must point at `.ts` (webpack bundles at runtime). Dev UI is on a **different port** from gRPC (`--ui-port` defaults to :4281) — first-time users miss it.
- Prod-weight: dev is free but production means a multi-service Temporal Server cluster + Postgres/Cassandra + typically Elasticsearch. Not DBOS's "just add Postgres." Temporal Cloud exists but is optional.
- Weighted total: **~87/100** — new top of the roster. Ahead of DBOS (82) and Inngest (82) on Reliability, Visibility, and Ecosystem; behind them on Operational Load only.

### Inngest durability crash-test (2026-04-23, ad-hoc)

Follow-up to the question: "if Inngest has no DB, where does the data go on a power outage?" Switched from `inngest-cli dev` (pure in-memory) to `inngest-cli dev --persist` (SQLite at `.inngest/main.db` + embedded in-memory Redis with periodic snapshot backups). Triggered lead-lifecycle happy path, `kill -9`'d the Inngest process at T+3s during `step.sleep("10s")`, outage ~14s, restarted with the same SQLite file.

- ✅ Ack step survived — SQLite retained the completed step output.
- ✅ Run metadata retained — same `run_id` reported after restart, status `Running`.
- ❌ Sleep timer lost — scheduled wake-up was in Redis, not in SQLite. Never fired.
- ❌ `waitForEvent` subscription lost — `lead/decision` and `lead/signed` events received after restart were never matched to the paused run. Run stayed `Running` indefinitely.
- ❌ Worker routing lost — fresh triggers sent after Inngest restart also hung until the worker process was also restarted. `Successfully registered / modified: false` was misleading; the routing state lived in Redis too.
- **Takeaway:** `--persist` is history-durability only. Full crash-safe self-host requires `--redis-uri` at a persistent Redis. Under the bench's LOCAL-ONLY constraint, Inngest Reliability drops from 4 (architecture-claimed) to 3 (verified).

### Kestra × lead-lifecycle (2026-04-23, mode I)

B2B lead-lifecycle simulation (ack → 10s Pause → nudge → Pause-w/onResume decision 30s → Switch → parallel fan-out → Pause-w/onResume signed 20s → parallel fan-out w/retry → 15s Pause → NPS). All Slack output to `#workflow-bench`.

- `kestra/kestra:latest` v1.3.14 single-container, H2 SQL journal, 1036 plugins scanned at boot. One Docker container on :4280. Install + flow authoring + two boots (secrets-env-var requirement forced a restart) + one iteration after Pebble gotcha: ~18 min total. End-to-end execution: ~40s (10s + 15s durable waits + two resume round-trips).
- 181 lines of YAML (flow only). No TypeScript. Authoring medium is YAML + Pebble expressions. Tasks exercised: `io.kestra.plugin.core.http.Request`, `.flow.Pause` (with and without `onResume`), `.flow.Switch`, `.flow.Parallel`, per-task `retry:` block.
- Happy path reached 12/13 tasks. The final `signedSwitch` evaluated its value correctly (took the "true" branch, all three implementation Slack posts succeeded), but the Switch task itself reported FAILED for an opaque reason, preventing the downstream `nps` task. Flow marked overall FAILED despite ~85% of business work completing.
- HTTP Request task treats any 2xx response as SUCCESS regardless of payload — Slack's `{"ok":false,"error":"channel_not_found"}` in a 200 passed undetected in the first run (root cause was an unrelated Pebble variable-nesting bug; the HTTP-2xx-is-SUCCESS behavior is the general footgun).
- Pebble `vars:` entries are not recursively evaluated. `vars.slackChannel: "{{ secret('X') }}"` referenced as `{{ vars.slackChannel }}` inserted the literal template string, not the decoded secret. Inline `secret()` at the use site.
- OSS secret management is env-var-only: `SECRET_<KEY>=<base64>` on the container. No API. New secret = container restart. Enterprise tier has a secrets API.
- Basic auth is mandatory since v0.24 with no disable flag. Set via `POST /api/v1/basicAuth` with password policy (8+ chars, upper, lower, number) before the first authenticated call.
- Weighted total: **~65/100**. Ties Windmill on the declarative-DSL tier. Ecosystem (4) and Visibility (5) are the standouts; DX (2) and lack of native idempotency (Reliability 3) are the drags.

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
| **Temporal** | `workflowsPath` in dev must point at `.ts` (webpack bundles at runtime), not at `.js` build output. **Workflow sandbox is strict** — `fetch`, `Date.now`, `Math.random` all throw inside a workflow; wrap every side effect in an activity. `workflowInfo().random()`-style helpers replace Node globals. Dev UI runs on **`--ui-port` (default :4281)**, not the gRPC port (:4233) — first-time users miss it. Workflow code is replayed on every worker restart to reconstruct in-memory state, so any non-determinism (new Date, random, env reads) anywhere in the workflow breaks replay. Activities are where non-determinism is allowed. |
| **Dify** | Category mismatch for a durable-workflow bench, but noted for future readers. Console login body expects password **base64-encoded** (`FieldEncryption` is misnamed — it's base64, not RSA). Authenticated console calls require `X-CSRF-Token` header mirroring the `csrf_token` cookie. `POST /console/api/apps/<id>/workflows/draft` requires the current `hash` field or returns 409 `draft_workflow_not_sync`. **`SANDBOX_WORKER_TIMEOUT=15`** (in `docker/.env.example`) is a hard ceiling on any code-node execution including `time.sleep`; durable waits past 15s are unimplementable inside Dify's model without reconfiguring the sandbox and restarting workers. No durable sleep / waitForEvent / workflow-ID-idempotency nodes exist for standalone workflow apps; `human-input` node is `advanced-chat`-only and is a UI form. Workflow graph schema is undocumented outside Flask source and `api/tests/fixtures/workflow/*.yml`. Environment vars referenced as `{{#env.NAME#}}`; bearer tokens go in `authorization.config.api_key`. License is Dify Open Source License (source-available, reseller-restricted) — legal review warranted. |
| **n8n** | `N8N_BLOCK_ENV_ACCESS_IN_NODE` defaults to **true** — HTTP and Code nodes cannot read `$env` until the flag is flipped; error message ("access to env vars denied") only makes sense once you know the flag exists. **Wait-for-webhook resume URL is undocumented-by-example**: POSTing to `/webhook-waiting/<webhookId>/<suffix>` with a custom `webhookSuffix` returns `SQLITE_ERROR: no such column: NaN`; POSTing to `/webhook-waiting/<executionId>` returns `Invalid token`. `$execution.resumeUrl` is the documented expression but the exact shape is obscure. Public `/api/v1/executions` hides `status=running` and `status=waiting` by default — filter explicitly or fall back to `/rest/executions`. After `PUT /api/v1/workflows/:id`, new version may not take effect until `deactivate → activate` (not just `activate`). Expression escaping: `$node[\"Name\"]` inside a JSON template string throws "invalid syntax" (parser sees literal backslash-quote) — use single quotes `$node['Name']`. `Unused Respond to Webhook node found in the workflow` fails the whole workflow if `responseMode: responseNode` is set and not every branch hits a RespondToWebhook node. No trigger-level idempotency key — intra-workflow `$getWorkflowStaticData` is in-memory-per-worker, unsafe in queue mode. License is **Sustainable Use** (fair-code, not OSI); SSO/audit/external secrets are Enterprise-only. |
| **Kestra** | Basic auth is **mandatory since v0.24** with no disable flag; set one-time via `POST /api/v1/basicAuth` with an 8+ char password containing upper+lower+number before any authenticated call. Secrets in OSS are env-var-only (`SECRET_<KEY>=<base64>`) — no API, every new secret needs a container restart. Pebble `vars:` entries are **not recursively evaluated** — stashing `{{ secret('X') }}` in a var and referencing `{{ vars.Y }}` in a body inserts the literal template string; inline `secret()` at the use site. HTTP Request task treats any **2xx response as SUCCESS regardless of payload** — Slack/Stripe-style APIs that return `{"ok":false}` in a 200 body pass undetected. BOOLEAN `onResume` inputs from multipart form fields need an explicit `| string` filter in Switch `value:` expressions to match case keys reliably. Single-container boot is slow (~30s first response) due to the 1036-plugin scan. |

---

## Dropped from roster

Platforms we benched but ruled out as top-level durable-workflow runtimes for a 40+ dev team. One-line rationale kept so we don't re-litigate.

- **XState** (benched 2026-04-23, arxiv-ai-to-slack, 54/100) — state-machine *library*, not a workflow engine. No journal, no crash replay, no dashboard, no durable sleep, no `waitForEvent`, no cron, no idempotency. Zero-infra win is real but for the wrong job. Fine *inside* a durable step, never as the top layer.
- **Mastra** (benched 2026-04-22, hn-digest, ~60/100) — AI-agent framework, not a durable-workflow runtime. Using it for pipelines leaves agents/memory/RAG unused and forces bolted-on node-cron + a storage adapter for durability. Right tool, wrong job.
- **pgflow** (dropped 2026-04-23, before build) — Postgres-native DAG executor. No durable sleep, no `waitForEvent`/signals, no conditional branching, no loops, no native idempotency keys on `start_flow`. Cannot model lead-lifecycle (or any HITL/event-driven workflow). Fits pure DAG pipelines only — same shape as a Postgres-backed Airflow-lite. Wrong tool for a general workflow runtime in a 40+ dev team.
- **Dify** (benched 2026-04-23, lead-lifecycle, ~47/100) — open-source LLM-app builder (chat / agents / RAG / visual DAG), not a code-first durable-workflow runtime. No durable sleep (sandbox worker timeout = 15s kills `time.sleep`), no `waitForEvent` or HITL on standalone workflows, no workflow-ID-as-idempotency-key, no arbitrary back-edges for loop-back. Retries + parallel fan-out do work. Authoring format for a code-first team is a JSON draft DAG posted to an undocumented console API with no TypeScript SDK. 11-container footprint (heaviest in the roster). Dify Open Source License (source-available, reseller-restricted, not OSI). Right tool, wrong job.
- **n8n** (benched 2026-04-23, lead-lifecycle, ~44/100) — visual-first automation tool, not a code-first durable workflow platform. 682-line JSON DAG as source-of-truth (unreviewable diffs, no types), wait-for-webhook resume URL undocumented-by-example and returned `SQLITE_ERROR: no such column: NaN` for every shape we tried, env-var access gated by undocumented `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`, no trigger-level idempotency, Sustainable Use License (not OSI). Executions UI is genuinely excellent and install is unbeaten — but wrong layer for a 40+ TS dev team that wants PR review, diffs, and types.

---

## Incomplete runs (do not include in scores)

Platforms with a `services/<P>/mode.txt` but no `scoring.md`. Aborted builds, not evidence.

- *(none)*

---

*Latest update: 2026-04-23 (benched **Dify** at ~47/100 and moved to `Dropped from roster` — visual LLM-app builder, not a code-first durable-workflow runtime; no durable sleep / waitForEvent / workflow-ID idempotency, 11-container footprint, source-available Dify Open Source License).*
