# Workflow Bench

Benchmark durable workflow platforms (Inngest, Hatchet, Restate, Mastra, Windmill) on a real workflow — side by side, self-hosted, open source only.

Runs entirely inside Claude Code. No web UI.

---

## Quickstart

```bash
cp shared-secrets.env.template shared-secrets.env   # fill in API keys
claude                                               # open Claude Code in this dir
```

Then at the Claude prompt, type:

```
start the bench
```

Claude will:
1. Suggest enhancements to your workflow (or use one from `workflows/`).
2. Ask which platforms to run and whether to include install time.
3. Build, run, score, and compare each platform sequentially.

When Claude says to `/clear` between platforms — do it. That's how fresh context is kept.

---

## Requirements

- macOS or Linux, Node 18+, npm
- Docker (for Hatchet, Restate, Windmill)
- [`claude`](https://docs.claude.com/claude-code) CLI installed and authenticated
- API keys filled into `shared-secrets.env` (see template)

---

## Pick a workflow

Either:
- Choose one from `workflows/` (arXiv → Slack, HN digest, lead lifecycle, reddit) — name it when asked, or
- Describe your own in plain English. Claude proposes enhancements before building.

Slack output goes to `#workflow-bench`. The bot token slot is in the secrets template.

---

## What you get out

- `services/<platform>/` — generated code, logs, and `scoring.md` per platform
- `COMPARISON.md` — cumulative scoreboard across every run (7 dimensions, DX included)
- `summary.md` — narrative synthesis of the latest run

---

## Key files

| File | Purpose |
|---|---|
| `ORCHESTRATE.md` | Master plan Claude follows each run |
| `BUILD_PROMPT.md` | Per-platform build instructions |
| `SCORE_PROMPT.md` | Per-platform scoring rubric |
| `COMPARE_PROMPT.md` | Final aggregation step |
| `COMPARISON.md` | Living scoreboard (cumulative) |
| `workflows/` | Reusable workflow specs |
| `workflow.md` | Active workflow for the current run |
| `platforms.json` | Platforms selected for the current run |

---

## Notes

- Platforms run sequentially to avoid port conflicts and give accurate wall-clock timing. Expect 30–60 min per platform.
- `COMPARISON.md` is append-only — new runs add to it, prior data is never wiped.
- Only self-hosted open-source versions are benchmarked. No vendor cloud.
