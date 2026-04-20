# PinBall

PinBall is a Slack reaction-based picker bot. The first version supports a daily dinner decider flow and an ad-hoc `/pinball n` draw.

## Features
- Post a daily `오점뭐?` message at 5:00 PM KST
- Pick one dinner decider from unique non-bot reactors at 5:10 PM KST
- Handle `/pinball n` and pick `n` unique non-bot reactors after 1 minute
- Handle `/pinball-weighted n` and pick `n` unique non-bot reactors after 1 minute, with each emoji reaction counting as one ticket
- Explain usage with `/help`
- Deduplicate users who react with multiple emoji

## Repository Conventions
- Branch naming: `feat/<issueNumber>`
- Issues should fill in summary, scope, why, and acceptance criteria
- Pull requests should summarize changes and include validation results

## Setup
1. Copy `.env.example` to `.env`.
2. Create a Slack app with bot token, signing secret, and app-level token.
3. Install dependencies with `npm install`.
4. Start local development with `npm run dev`.

## Required Slack Capabilities
- Slash commands: `/pinball`, `/pinball-weighted`, `/help`
- Event subscriptions or Socket Mode support through Bolt
- Bot scopes sufficient to post messages and read reactions

Recommended bot scopes:
- `chat:write`
- `channels:history`
- `channels:read`
- `commands`
- `groups:history`
- `groups:read`
- `reactions:read`
- `users:read`

## Runtime Behavior
- The daily post and draw use the `SLACK_DEFAULT_CHANNEL_ID` channel.
- Slash-command initiated draws use a one-minute in-process timer.
- `/help` replies with an ephemeral usage guide.
- If fewer eligible users react than requested by `/pinball n`, the bot posts a failure message and does not draw.
- Pending timers and the latest daily message timestamp are stored in memory only for this initial version.

## EKS Deployment
The repository includes a minimal Kubernetes deployment under `k8s/`.

Create the runtime secret from local environment values:
```bash
kubectl create namespace pinball
kubectl create secret generic pinball-secrets \
  --namespace pinball \
  --from-env-file=.env
```

Apply the manifests and set the image built for your registry:
```bash
kubectl apply -f k8s/
kubectl set image deployment/pinball pinball=<registry>/pinball:<tag> -n pinball
```

## Commands
```bash
npm test
npm run build
npm run dev
```
