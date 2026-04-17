# PinBall Initial Slack Bot Design

## Goal
Build the first runnable Slack bot for reaction-based participant picking, covering a daily dinner-decider flow, an ad-hoc `/pinball n` flow, and repository conventions that make future issue and PR history readable.

## Approach
Use a small TypeScript Slack Bolt application with three boundaries:

1. `domain`: pure participant extraction and deterministic picking logic
2. `slack`: Slack API adapters, command handlers, and scheduler wiring
3. `docs/templates`: repository conventions, setup docs, and GitHub templates

The pure picking logic stays independent from Slack so it can be tested with Vitest. Slack-specific code will coordinate posting messages, reading reactions, and announcing results.

## Main Flows
### Daily dinner decider
- At 5:00 PM KST, post a daily `오점뭐?` message into a configured channel.
- At 5:30 PM KST, read all reactions on that message.
- Flatten all reacting users, remove duplicates, remove bots, and pick one winner.
- Post the result back into the same channel.

### Slash command
- `/pinball n` posts a recruitment message immediately.
- After 3 minutes, the app reads reactions on that message.
- It selects `n` unique users with the same deduplication and bot-exclusion rules.
- It posts the winners into the same channel.

## Architecture
### Runtime
- Node.js with TypeScript
- Slack Bolt for Slack app plumbing
- A lightweight cron scheduler for local/runtime scheduling

### Modules
- `src/domain/picker.ts`: candidate normalization, validation, deduplication, and drawing
- `src/slack/config.ts`: environment parsing and validation
- `src/slack/messages.ts`: message builders
- `src/slack/reactions.ts`: Slack reaction fetch and participant extraction
- `src/slack/workflows.ts`: daily and slash-command workflows
- `src/app.ts`: app bootstrap and scheduler registration

### Persistence
- No database in v1
- Daily workflow stores the posted message timestamp in memory for the current process lifetime
- Slash command delayed draw uses an in-process timer

This is intentionally minimal for the first version. If the process restarts, pending in-memory draws are lost. That is acceptable for the initial issue because the issue asks for a runnable scaffold and documented behavior, not durability.

## Error Handling
- Invalid `/pinball` input returns an ephemeral usage message.
- Empty candidate pools produce a friendly "no eligible participants" announcement instead of throwing.
- Scheduler and Slack API failures are logged with enough context to debug channel, timestamp, and command arguments.

## Testing Strategy
- Unit-test the picker domain thoroughly:
  - duplicate users across multiple emoji reactions collapse to one candidate
  - bot users are excluded
  - requested winner count is validated and capped by available candidates
  - deterministic selection is possible by injecting a random source
- Keep Slack integration lightly tested through function-level unit tests around parsing and workflow decisions.

## Repository Conventions
- Branch naming: `feat/<issueNumber>`
- Add issue and PR templates that force summary, scope, and validation notes
- Add README and environment example with setup, scopes, scheduling behavior, and command usage
