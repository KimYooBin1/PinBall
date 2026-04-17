# PinBall Initial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable Slack reaction-based picker bot with daily scheduling, `/pinball n`, tested core drawing logic, and repository conventions.

**Architecture:** Keep drawing logic pure and fully unit-tested in a domain module, then build a thin Slack Bolt integration layer for posting messages, collecting reaction users, and announcing winners. Use in-memory scheduling and delayed timers for the initial version to satisfy the issue without adding storage.

**Tech Stack:** TypeScript, Node.js, Slack Bolt, node-cron, Vitest

---

### Task 1: Bootstrap project files

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] Step 1: Add project manifest and scripts
- [ ] Step 2: Add TypeScript compiler configuration
- [ ] Step 3: Add Vitest configuration
- [ ] Step 4: Add ignore rules and environment example

### Task 2: Build picker domain with TDD

**Files:**
- Create: `src/domain/picker.ts`
- Test: `src/domain/picker.test.ts`

- [ ] Step 1: Write failing tests for deduplication, bot exclusion, and count validation
- [ ] Step 2: Run tests to verify expected failures
- [ ] Step 3: Implement minimal picker domain
- [ ] Step 4: Re-run tests until green

### Task 3: Add Slack-facing adapters

**Files:**
- Create: `src/slack/config.ts`
- Create: `src/slack/messages.ts`
- Create: `src/slack/reactions.ts`
- Create: `src/slack/workflows.ts`

- [ ] Step 1: Add environment parsing and message builders
- [ ] Step 2: Add reaction-to-candidate extraction helpers
- [ ] Step 3: Add daily and slash-command workflow functions around the domain layer

### Task 4: Add app bootstrap and schedules

**Files:**
- Create: `src/app.ts`

- [ ] Step 1: Register Slack Bolt app and `/pinball` command
- [ ] Step 2: Schedule daily posting and daily draw
- [ ] Step 3: Add startup logging and error handling

### Task 5: Add repository conventions and docs

**Files:**
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/pull_request_template.md`
- Create: `README.md`

- [ ] Step 1: Add issue and PR templates for clear scope summaries
- [ ] Step 2: Document setup, Slack scopes, env vars, branch rule, and runtime behavior

### Task 6: Verify baseline quality

**Files:**
- Verify: project root

- [ ] Step 1: Install dependencies
- [ ] Step 2: Run `npm test`
- [ ] Step 3: Run `npm run build`
- [ ] Step 4: Summarize any remaining limitations
