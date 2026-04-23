# Build Prompt

Build a durable, production-quality workflow using **[TOOL]** in TypeScript.

## The workflow

Read `~/Sites/workflow-bench/workflow.md` for the full spec — what it does, what APIs it calls, what env vars it uses, what success looks like.

The Slack message header must include the platform name: e.g. `*Daily HN AI Digest — 2026-04-22* [Inngest]`.

## Adding flows, not replacing them

A platform's `services/<P>/` directory accumulates flows over time — one file per workflow, all registered with the worker. **Never overwrite an existing flow file.** Instead:

1. Check what flow files already exist in `src/` (or equivalent).
2. Create a new file named after the workflow (e.g. `src/hn-digest.ts`, `src/reddit-norwegian.ts`).
3. Register the new flow alongside existing ones in the worker entry point.

This means a worker may run multiple flows simultaneously — that's intentional.

## Ports

Pick a port ≥ 4000 for any worker/app process. Don't probe common ports — just pick a high one (e.g. 4100, 4200) and use it. Document it in `BENCH_LOG.json`.

## LOCAL-ONLY constraint

Run entirely locally. Do not connect to the vendor's cloud.

- **Inngest**: use `npx inngest-cli@latest dev`. No cloud event key.
- **Hatchet**: `hatchet server start` (Docker-based local engine). No Hatchet Cloud.
- **Restate**: `docker run restatedev/restate`. No Restate Cloud.
- **Vercel Workflow**: local `next dev`; no Vercel account required for build/bench.
- **Windmill**: local Docker Compose; no Windmill Cloud.
- **Trigger.dev**: local Docker Compose self-host; no Trigger Cloud (default `npm run dev` still requires `TRIGGER_SECRET_KEY` — see gotchas).

## Requirements

- Every external call is a named, durable step with auto-retry.
- Use the platform's idiomatic parallel primitive for concurrent steps.
- Idempotent: same trigger twice on the same UTC date must not duplicate side effects.
- No mocks — real APIs only.
- README must include exact commands to boot and trigger manually.

## Verification — mandatory before writing BENCH_LOG.json

1. Boot all infra.
2. Trigger immediately (don't wait for cron).
3. Watch logs/dashboard until terminal state.
4. **If it fails: debug and fix. Repeat until one successful end-to-end run.**
5. Verify success criteria from `workflow.md`. Check run status with the minimal API call needed — don't pull full step traces unless debugging a failure.

Only write `BENCH_LOG.json` after a successful run. On genuine blocker: write it with `"buildStatus": "failed"` and a specific `"failureReason"`.

## BENCH_LOG.json — mandatory

```json
{
  "tool": "[TOOL]",
  "sdkVersion": "exact version from package.json",
  "agentTooling": {
    "usedMCP": true|false,
    "usedSkills": ["skill-name"],
    "fetchedDocs": true|false,
    "notes": "what you consulted"
  },
  "files": ["src/workflow.ts", "..."],
  "totalLoc": 123,
  "bootCommand": "npm run dev",
  "manualTriggerCommand": "exact curl or CLI command to fire the workflow",
  "mode": "flow-only | installation-included",
  "timing": {
    "installMinutes": null,
    "buildMinutes": 4,
    "executionMinutes": 1
  },
  "infra": {
    "services": ["process 1 (port N)", "process 2"],
    "externalDeps": ["Postgres", "none", "..."]
  },
  "notes": "anything surprising"
}
```

## Output files

- `src/<workflow>.ts` — the workflow
- `package.json`
- `README.md` — 10 lines max: install, boot, trigger manually
- `BENCH_LOG.json`
- `GUIDE.md` — ELI5: one paragraph on what the platform is, one paragraph per local service, a table of local URLs with what you can do at each
