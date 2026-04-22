# Build Prompt — paste verbatim into a fresh Claude Code session

Build a durable, production-quality workflow using **[TOOL]** in TypeScript.
Output a runnable project in the current directory with a single workflow file + a minimal README.

## The workflow

**Read `~/Sites/workflow-bench/workflow.md` for the full workflow specification**, including what it does, what APIs it calls, what env vars it uses, and what a successful run looks like.

The message header in any outbound notification must include the platform name so it is identifiable — e.g. `*Daily HN AI Digest — 2026-04-22* [Inngest]`.

## PORT CONFLICT AWARENESS

Other platform builds may be running in parallel tabs on this machine. Before starting any service, check whether its default port is already in use (`lsof -i :<port>` or `nc -z localhost <port>`). If it is, configure this platform to use an alternative port — document the change in `README.md` and reflect it in `BENCH_LOG.json`. Do not fail; adapt.

## LOCAL-ONLY CONSTRAINT — READ FIRST

**Run the platform entirely locally. Do NOT connect to any cloud service offered by the platform vendor.**

- Trigger.dev: use `@trigger.dev/sdk` with a self-hosted server (`trigger-dev/trigger.dev` Docker image or `npx trigger.dev@latest start`). Do NOT sign up for or use cloud.trigger.dev. Do NOT set `TRIGGER_SECRET_KEY` to a cloud API key.
- Inngest: use the local Dev Server (`npx inngest-cli@latest dev` or the `inngest` npm package's dev mode). Do NOT use Inngest Cloud or set a cloud event key.
- Hatchet: spin up the Hatchet engine via Docker Compose locally. Do NOT use Hatchet Cloud.
- Restate: run `restateserver` locally (Docker image `restatedev/restate`). Do NOT use Restate Cloud.

If the SDK's default configuration points at a cloud endpoint, override it explicitly to `localhost`. The benchmark measures local open-source behaviour only.

## Requirements

- Every external call is a named, durable step (auto-retry on transient failure).
- Use the tool's idiomatic parallel primitive for any steps that can run concurrently.
- Idempotent: running the same trigger twice for the same logical unit (e.g. same UTC date) must not duplicate side effects. Use a dedupe key.
- No mocks, no stubs — use real APIs as described in `workflow.md`.
- Include the minimum infra commands to run this locally (dev server, worker process, whatever the tool needs). The README must tell me exactly how to invoke the workflow manually for testing.

## Mandatory end-to-end verification — do this BEFORE writing BENCH_LOG.json

After writing the code, you must boot the project and confirm the workflow actually executes. This is not optional. Do NOT wait for the cron schedule — trigger the workflow immediately.

1. Start all required local infrastructure (dev server, worker, Docker services).
2. **Trigger the workflow immediately** using the tool's idiomatic manual trigger method (HTTP endpoint, CLI command, dashboard button, etc.). Do not wait for the cron to fire on its own schedule.
3. Watch logs / dashboard until the run either completes successfully or hits a clear error.
4. **If it fails: debug and fix it. Repeat until the workflow completes end-to-end at least once.** There is no "it compiles, good enough" — the workflow must actually run.
5. Verify success per the "Success criteria" section in `workflow.md`. Confirm each criterion is met — don't assume.

Do not write `BENCH_LOG.json` until a successful run has completed. If you cannot get a working run after genuine debugging effort, write `BENCH_LOG.json` with `"buildStatus": "failed"` and a clear `"failureReason"` field explaining exactly what you tried and what is still broken.

## Writing the bench log — MANDATORY

After you finish, write `BENCH_LOG.json` in the project root with this exact shape:

```json
{
  "tool": "[TOOL]",
  "sdkVersion": "exact version string from package.json",
  "agentTooling": {
    "usedMCP": true|false,
    "usedSkills": ["skill-name", ...],
    "fetchedDocs": true|false,
    "notes": "what docs/skills you consulted"
  },
  "files": ["relative/path/file1.ts", "..."],
  "totalLoc": 123,
  "bootCommand": "npm run dev",
  "manualTriggerCommand": "the exact command or UI action to invoke the workflow now",
  "infra": {
    "services": ["list of local processes/containers"],
    "externalDeps": ["Postgres", "Redis", "none", ...]
  },
  "notes": "anything surprising"
}
```

Do not skip this file. The scoring pass depends on it.

## Output shape

- Workflow file (idiomatic name for the platform, e.g. `digest.ts`)
- `package.json`
- `README.md` — ~10 lines: install, run, trigger manually
- `BENCH_LOG.json` — described above
- `GUIDE.md` — described below

## GUIDE.md — ELI5 service guide (mandatory)

Write a `GUIDE.md` that explains this platform to someone who has never used it before. Use simple language (ELI5 level). Include:

1. **What is [TOOL]?** — one short paragraph describing what the platform does and why you'd use it.
2. **Services running locally** — one paragraph per service/process, explaining what it does in plain English (not just its name).
3. **Local URLs** — a table listing every URL that is running, what you will see when you open it, and what you can do there. Use the actual ports configured in this build (not defaults if you changed them).

Example table format:
```
| URL | What it is | What you can do |
|---|---|---|
| http://localhost:8288 | Inngest Dev Server dashboard | See all triggered workflows, inspect individual steps, view logs, replay failed runs |
```

Keep it short and practical — 1–2 paragraphs total + the URL table. The user will open this file in a browser/editor while the services are running.
