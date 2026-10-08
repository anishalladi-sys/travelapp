---
description: Start or resume the TravelApp autonomous loop (reconcile → plan → build → verify → harden → review → document)
agent: travel-loop
---

Start or resume the TravelApp loop agent. It runs the full
RECONCILE → PLAN → BUILD → VERIFY → HARDEN → REVIEW → DOCUMENT →
RECORD cycle inline, in one session, no separate agents.

First read `tasks/README.md`, `prompts/_CONVENTIONS.md`, the latest
`docs/audits/` report, the `README.md` gaps section, the actual code
state, AND the founder state (`.fs/company-state.json`,
`recommended-next-step.md`, `truth-memo.md`). Reconcile all of them
before choosing work. If the next move is unclear, run `co-founder`.

Then loop without pausing for routine approval: reconcile the plan
against reality, select the highest-priority unverified slice, plan it,
branch, implement with regression tests, run all project gates
(`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, plus
e2e/RLS/R2/Sentry when relevant), harden, self-review, update canonical
docs, and record evidence. Continue until the agreed scope is complete
and all gates pass, or until a genuine external blocker.

$ARGUMENTS
