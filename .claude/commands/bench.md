---
description: Start a workflow bench run (preflight + setup + execute)
---

You are starting a Workflow Bench run. Follow this order strictly.

## 1. Preflight — fail fast with one clear message

Run these checks in parallel. If any fail, print a single block listing every failure and stop. Do not proceed.

```bash
# Secrets file exists and all keys have values
test -f shared-secrets.env && grep -E '^(GOOGLE_API_KEY|SLACK_BOT_TOKEN|SLACK_DIGEST_CHANNEL|SLACK_PREVIEW_CHANNEL)=' shared-secrets.env | awk -F= '$2==""{print "MISSING VALUE: "$1}'

# Docker daemon reachable (only required if user picks hatchet/restate/windmill later — warn, don't block)
docker info >/dev/null 2>&1 && echo "docker: ok" || echo "docker: not running (needed for hatchet/restate/windmill)"

# Node version ≥18
node -v
```

If `shared-secrets.env` is missing, tell the user to run `cp shared-secrets.env.template shared-secrets.env` and fill it in. Do not try to create it for them.

## 2. Workflow

Check `workflow.md`. If it exists and looks intact, show the user its first ~10 lines and use `AskUserQuestion` to ask whether to use it or pick/describe a new one. If new, use `AskUserQuestion` to offer the `workflows/` library as options plus "describe a new one".

All user prompts in this flow MUST use the `AskUserQuestion` tool — never plain-text questions.

When the user describes a new workflow, follow the **Workflow enhancement protocol** in `CLAUDE.md` — suggest 1–3 enhancements that expose platform differences, agree on what "good results" looks like, then save to `workflow.md` and also copy to `workflows/<slug>.md`.

## 3. Hand off to ORCHESTRATE.md

Read `ORCHESTRATE.md` and execute its Setup phase (platforms + mode via `AskUserQuestion`), then start the first platform.

Do not dump the full plan to chat. One line: "Ready. Benchmarking: [list]. Workflow: [name]. Starting [first platform] now."
