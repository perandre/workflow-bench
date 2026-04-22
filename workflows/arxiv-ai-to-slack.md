# Workflow: ArXiv Applied AI to Slack

## Overview
Fetch the latest article on applied AI from arXiv and post its title and link to a Slack channel.

## Steps

1. **Fetch from arXiv**
   - Query arXiv API for papers with category "cs.AI" (Artificial Intelligence)
   - Sort by submission date (newest first)
   - Return: title, authors, arxiv link, abstract (first 100 words)

2. **Post to Slack**
   - Format message with title as heading
   - Include arxiv link
   - Include first 100 words of abstract
   - Post to configured Slack channel

## Configuration

- **arXiv API**: Open, no authentication required. Base URL: `https://arxiv.org/api/query`
- **Slack**: Requires webhook URL or bot token (stored in env as `SLACK_WEBHOOK_URL` or `SLACK_BOT_TOKEN`)
- **Slack Channel**: Configurable, e.g., `#ai-updates`

## Success Criteria

- ✅ Latest AI paper successfully retrieved from arXiv
- ✅ Message posted to Slack with title and link
- ✅ No errors in API calls
- ✅ Execution completes within 10 seconds

## Error Handling

- arXiv API timeout → retry up to 2 times
- Slack posting failure → log error, do not retry
