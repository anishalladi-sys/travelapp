# Prompt Execution Rules

Read this file, `tasks/README.md`, the relevant phase README, `CLAUDE.md`, and any existing `LESSONS.md` before executing a numbered prompt. These shared rules are part of every prompt and resolve conflicting shorthand in phase descriptions.

## Selecting the next task

1. Read the tracker in numeric order; do not infer progress from file existence. All implementation segments start pending.
2. Resume the earliest in-progress segment. If the earliest unfinished segment is blocked, report its blocker and ask for what is needed; never skip it.
3. Otherwise select the first pending segment whose predecessors are verified. Read that numbered prompt and inspect its actual source/test paths before changing code.
4. Execute one segment per "go to prompts, next task" request. Mark it in_progress before implementation; stop after verification and reporting. Creating these planning files does not authorize executing 00.1 now.

## State and evidence

Use pending, in_progress, blocked, verified, and audit_complete in the tracker. Record branch/base, changed files, commands and results, browser/integration evidence, remaining defects, and resume instructions in its Notes column or the linked phase README. Never record credentials or private fixture data.

Verified requires acceptance criteria and all mandatory checks to pass. Missing credentials/browser tools, deferred RLS/storage checks, and tests never run are blockers, not passes. Phase QA must repair defects and retest before the next phase. Minor carryover needs explicit user approval.

Exception: 07.1 may be audit_complete with failing product checks when every planned audit check has run and the report fully records defects. Only 07.2 may follow that state; 07.2 must resolve findings and pass the release gates. Missing audit coverage still blocks 07.1.

## Branch and worktree safety

Inspect Git status and the current branch before changes. Create a new `feat/<segment-id>-<slug>` branch from the current approved working state containing ALL verified predecessors, not blindly from main. Preserve existing uncommitted and untracked user files. If prerequisites are only in uncommitted work, identify the files and ask for approval before carrying them across a new branch; never reset, stash, discard, or stage them automatically. Record the base revision and prerequisite worktree state.

Never commit, merge, push, create a PR, or deploy without an explicit user request. "Next task" is not Git publication approval. Do not test hooks by making a commit; invoke the hook or check command directly against an isolated fixture. Do not work on the production branch. Ask when the prerequisite-containing base cannot be established safely.

## Implementation and verification

Use applicable installed skills, inspect real versions and conventions, write focused regression tests before fixes, and use actual actions/data functions rather than recreating authorization in test-only arrays. Keep implementation incremental. Ask before material product decisions, new paid services, provider changes, or destructive operations. Do not add code comments or blanket suppressions merely to silence checks.

For every implementation segment run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`, plus its targeted tests and required browser/integration checks. Use synthetic local/test accounts and data. Confirm environment separation before starting builds or integration tests; do not silently target production. Do not run build and typecheck simultaneously if generated types are shared.

Bootstrap exception: 00.1 still runs and records all four commands, but may hand off the already-known lint-tooling failure (and build failure solely from that lint issue) to 00.2 if its auth tests/typecheck and required auth/RLS integration pass and no new failures exist. 00.2 must clear that tooling blocker; no later phase may inherit it. Record this narrow handoff explicitly, never describe it as all checks passing.

## Shared data and security contract

- Real auth/data mode is fail-closed: absent/invalid sessions or missing Supabase configuration must never select demo identity or demo data.
- Demo storage/identity requires explicit non-production opt-in. A server-side production check must reject demo mode even if its flag is set. Use only synthetic data in demo fixtures. Do not mix demo auth with a real Supabase database.
- Every child record must belong to an owned parent trip. If user_id is duplicated, enforce both child user and parent-trip ownership on SELECT/INSERT/UPDATE/DELETE and on trip_id reassignment in RLS and actions. A child user_id policy alone is insufficient.
- Author append-only SQL in canonical `docs/migrations/`; do not rewrite already-applied migrations. Inspect the existing Supabase tooling mirror in `supabase/migrations/`, establish deterministic byte-identical mirroring and a consistency check, and document that policy before adding copies. Do not independently author two versions. Run migrations only against an explicitly confirmed disposable local/test database; `db:push` alone does not establish a safe target.
- Money uses validated ISO currencies and exact decimal/minor-unit arithmetic. Group totals by currency; never sum unlike currencies or silently convert. Compare a budget cap only against matching currency. Do not automatically count stay/transport estimates again as expenses.
- Timed transport needs explicit departure/arrival timezones and UTC instant comparison; overnight legs across zones are valid. All-day itinerary dates and stay dates remain date-only values.
- R2 is the accepted file-storage provider. Consult current official Cloudflare documentation and relevant available skills before implementation; do not invent APIs or silently switch vendors. Credentials and signed URLs stay out of logs and client source. Missing required R2 test integration blocks verification.
- Documents initially store metadata only; no sensitive scans. Emergency numbers require an explicit country plus authoritative source and verification date. Unknown/ambiguous locations show an unavailable state, never a guessed emergency number.

## Scope reconciliation and stopping

Treat `tasks/README.md` and these numbered prompts as the approved execution order; older roadmaps provide context, not competing status. Reconcile affected canonical docs when implementation invalidates them, without rewriting historical audits. New source paths in prompts are proposals until checked against the repository. Do not create placeholder routes/features simply because a path was suggested.

On failure, reproduce, identify the responsible layer, add regression protection, fix, and re-run. After three unsuccessful reasonable fixes, stop and reassess with the user. On completion, update status with evidence and stop; do not proceed to the next prompt automatically.
