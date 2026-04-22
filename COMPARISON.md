# Workflow Platform Comparison

**Workflow tested:** Reddit AI Story Norwegian Digest — cron-triggered pipeline, fetch top Reddit AI story, get top comment, translate to Norwegian via Gemini, post to Slack #workflow-bench. Full spec in `workflow.md`.

Scores 1–5 (higher = better). Timing in minutes. Mode: **I** = Installation included · **F** = Flow only. Full rubrics in `services/{platform}/scoring.md` (gitignored — run the bench locally to generate them).

---

| | Inngest | Hatchet | Windmill |
|---|:---:|:---:|:---:|
| **Mode** | F | F | — |
| **Install time (min)** | — | — | — |
| **Build time (min)** | ~4 | ~4 | — |
| **Execution time (sec)** | ~9 | ~6 | — |
| **Developer experience** | 5 | 3 | — |
| **Reliability** | 4 | 3 | — |
| **Built for this** | 4 | 4 | — |
| **Visibility** | 4 | 4 | — |
| **Operational overhead** | 5 | 3 | — |
| **Multi-tenant flexibility** | 3 | 3 | — |
| **Licensing & lock-in** | 4 | 5 | — |
| **Total** | **29/35** | **25/35** | —/35 |

---

## Quick notes per platform

**Inngest** — Lightest infra of any platform: two processes, no Docker, no database (~159 MB total). Step API is clean and idiomatic TypeScript. CEL-expression idempotency deduped correctly (2 triggers → 1 run). Dev server crashed on worker reconnect in dev mode — minor but real rough edge. Port conflict on 3000/3001 required adapting to 3003. DX scores near-perfect: instant edit→run cycle, secrets via `process.env`, full IDE support.

**Hatchet** — `durableTask` is the right primitive for a sequential durable pipeline. Clean TypeScript authoring, good dashboard. Two non-obvious env vars required (`HATCHET_CLIENT_HOST_PORT=127.0.0.1:7077` and `HATCHET_CLIENT_TLS_STRATEGY=none`) — not in getting-started docs, require SDK source grep to discover. Token rotation on every server restart is a genuine dev-loop friction point. No idempotency primitive; re-triggering would post a duplicate Slack message.

**Windmill** — Not completed this run (user redirected to Hatchet). Prior bench scores preserved in gotchas section for reference.

---

## Known gotchas

Things not in the official docs that cost a failed run or forced a workaround. The agent reads this before building on a platform.

| Platform | Gotcha |
|---|---|
| **Windmill** | Workers sandbox env vars — secrets must use `wmill.getVariable()`, not `process.env`. API endpoint paths differ from docs; fetch `/api/openapi.json` from the live instance to find correct routes. Cron uses 6-field syntax (seconds first): `0 0 8 * * *`. |
| **Mastra** | Bundler runs code from a temp `src/mastra/public/` dir — `process.cwd()` and `__dirname` are unreliable. Use a `MASTRA_PROJECT_ROOT` env var for any file paths. Step-level retry is `retries: N`, not `retryConfig`. |
| **Restate** | Ephemeral by default — run with a named volume or all journal state is lost on restart. No native cron; needs a `node-cron` sidecar. |
| **Hatchet** | Token rotates on every server restart — re-read from `~/.hatchet/profiles.yaml` and update `.env`. No idempotency primitive built in; must implement manually. Also: `localhost` resolves to IPv6 on macOS but Docker only binds gRPC to IPv4 — use `HATCHET_CLIENT_HOST_PORT=127.0.0.1:7077`. SDK defaults to TLS; set `HATCHET_CLIENT_TLS_STRATEGY=none` for local dev. |
| **Inngest** | Skills may cover a newer API version than what npm serves — check the installed version before trusting skill examples. Dev server crashes if the worker process restarts while it's connected — restart both processes together. |
| **Trigger.dev** | Default `npm run dev` requires a cloud credential even for the self-hosted path — must explicitly configure local server URL before anything runs. |

---

*Last updated: 2026-04-22. Workflow: Reddit AI Story Norwegian Digest. Timing figures are approximate from bench logs. — = not run this session.*
