## The workflow: "Reddit AI Story Norwegian Digest"

Fetch the top Reddit story about AI from today (e.g. from r/artificial or r/MachineLearning), find the top comment on that story, translate the top comment to Norwegian (using Gemini AI), and post it to the Slack channel #workflow-bench with a link to the top story.

Steps:
1. Fetch the top story about AI from Reddit today (use the Reddit JSON feed — no auth required for public data)
2. Fetch the top comment on that story
3. Translate the top comment text to Norwegian using Gemini AI (GOOGLE_API_KEY)
4. Post to Slack #workflow-bench: the Norwegian translation of the top comment, plus a link to the Reddit story

Available env vars: GOOGLE_API_KEY, SLACK_BOT_TOKEN, SLACK_PREVIEW_CHANNEL, SLACK_DIGEST_CHANNEL

No mocks, no stubs — real APIs only.

## Success criteria

- A message appears in #workflow-bench in Slack
- The message contains a link to the top Reddit AI story
- The message contains the top comment translated to Norwegian (visually plausible Norwegian text)
- The link resolves to a valid Reddit post
