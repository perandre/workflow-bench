# Workflow Bench

Compare durable workflow platforms (Inngest, Mastra, Hatchet, Restate) on a real workflow — your own use case or the built-in demo.

## Quickstart

```bash
cd web
npm install     # first time only
npm run dev
```

Open **http://localhost:3000** in your browser.

That's it. No terminal interview, no config files to edit.

---

## How it works

1. **Pick platforms** — check which ones you want to benchmark (all four, or a subset)
2. **Pick a workflow** — use the built-in Daily HN AI Digest, or describe your own use case
3. **Click Run** — the site writes the config and kicks off Claude Code in the background
4. **Watch live** — each platform shows a step checklist and live log stream as it builds and tests
5. **See results** — score cards and a side-by-side comparison table when everything finishes

---

## What gets tested

Each platform is scored on:

- **Build** — did it scaffold and run without errors?
- **Runtime** — did the workflow trigger, execute all steps, and succeed end-to-end?
- **Failure handling** — does it retry and resume correctly after a failure?
- **Idempotency** — does running it twice produce duplicate side effects?
- **Dashboard** — how useful is the local dev UI for debugging?
- **Infra footprint** — how many services? How much RAM?

Results land in `services/<platform>/scoring.md`. The comparison goes to `summary.md`.

---

## Custom workflows

When you pick "Custom workflow", describe what you want to solve — a customer scenario, an integration flow, whatever. A few hints:

- **Slack integration is available** — there's already a bot token configured. Ask Per André if you need to use a different channel.
- Mention what APIs the workflow calls (HTTP endpoints, databases, etc.)
- Describe what a successful run looks like so the scoring agent knows what to verify

---

## Platforms run sequentially

Each platform builds, runs, and tears down before the next one starts. This avoids port conflicts and gives accurate wall-clock timing. Expect 30–60 minutes per platform.

Between platforms the scoring agent will do `/clear` to reset context — this is normal and expected.

---

## File layout

```
workflow-bench/
  web/                   ← the Next.js web app (start here)
  services/<platform>/    ← build output + scores per platform
  workflow.md            ← the workflow spec for the current run
  platforms.json         ← which platforms to benchmark
  workflow-default.md    ← the built-in HN digest spec
  ORCHESTRATE.md         ← instructions Claude Code follows
  BUILD_PROMPT.md        ← build instructions per platform
  SCORE_PROMPT.md        ← scoring instructions per platform
  COMPARE_PROMPT.md      ← final comparison aggregation
  shared-secrets.env     ← API keys (not committed)
```

---

## Requirements

- Node 18+ and npm
- Docker (for Hatchet and Restate)
- `claude` CLI installed and authenticated (`claude --version` should work)
- API keys in `shared-secrets.env` (copy from the team vault)
