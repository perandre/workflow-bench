# Runbook

## Pre-flight (once)

1. Fill `shared-secrets.env` — copy the `.template`, put real keys in.
2. Verify both Slack webhooks post (`curl -X POST -H 'Content-Type: application/json' -d '{"text":"ping"}' "$SLACK_PREVIEW_WEBHOOK_URL"`).
3. Verify Anthropic key (`curl https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" | head`).

## Per platform (in order: inngest → trigger-dev → hatchet → restate)

### 1. Isolate + timer

```
cd ~/Sites/workflow-bench/results/<platform>/
cp ../../shared-secrets.env .env
date +%s > .bench-start-ts    # wall-clock start
claude                        # fresh Claude Code session — DO NOT reuse
```

### 2. Build pass

Paste the contents of `~/Sites/workflow-bench/BUILD_PROMPT.md` into the session, replacing `[TOOL]` with the platform name.

Observe, don't help. If Claude Code goes in circles for 3 turns, intervene once and log it in `.interventions.log`. If it fails again, write "required human rescue" in that file and move on.

When Claude Code reports "done" and `BENCH_LOG.json` exists:

```
date +%s > .bench-end-ts
exit
```

### 3. Score pass

```
claude   # fresh session — context from build must not leak into scoring
```

Paste the contents of `~/Sites/workflow-bench/SCORE_PROMPT.md`, replacing `[TOOL]` with the platform name.

When the scoring session completes and `scoring.md` exists, exit.

### 4. Tear down + confirm clean

```
docker ps    # should be empty or only unrelated containers
lsof -i :3000 -i :7070 -i :8080 -i :8288    # no bench processes left
```

## After all four

```
cd ~/Sites/workflow-bench/
claude
```

Paste `COMPARE_PROMPT.md`. Result lands in `comparison.md`.

## Variance check (optional, recommended)

Pick one platform (Hatchet suggested — newest agent tooling). Repeat steps 1-3 in a new session. Save scoring to `results/<platform>/scoring-run2.md`. Compare.
