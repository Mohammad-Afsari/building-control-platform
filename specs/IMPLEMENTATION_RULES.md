# Implementing a change

Rules for whoever picks up a change in `specs/changes/` — usually an agent with
no memory of the conversation that produced it. Everything needed should be in
the change folder; if it is not, say so rather than inventing it.

Read `specs/README.md` for the pipeline, `CLAUDE.md` for the codebase, and
`.claude/STYLE_GUIDE.md` plus `.claude/COMPONENT_PATTERNS.md` for how code here
is written. Those style documents are shared repository guidance despite their
directory name.

## Before writing anything

1. Read `proposal.md` — what, why, and the acceptance criteria to satisfy.
2. Read `design.md` — the agreed approach and rejected alternatives. Follow it.
   If it looks wrong, stop and say so; do not quietly choose something else.
3. Read `tasks.md` — the ordered checklist.
4. Check for `[NEEDS CLARIFICATION]` markers. If any remain unresolved, stop
   and open a draft PR explaining what is blocked. Do not guess.

## Doing the work

- Branch from `main`, named after the change folder:
  `specs/changes/add-about-page/` becomes `add-about-page`.
- Work through `tasks.md` in order, ticking each item as it lands. That file is
  the one part of the change an implementer is expected to edit.
- Commit after each task so the history remains reviewable and resumable.
- Write the tests named in the proposal's **Tests required**. Every acceptance
  criterion needs one.
- A regression fix needs a test that fails without the fix. Verify that by
  temporarily reverting the fix and watching the test fail.
- Follow existing patterns, reuse `src/components/ui/`, and use design tokens.

## Before opening a pull request

All applicable checks must pass:

```bash
npm run lint
npm run build
npm run test:run
npm run test:e2e   # only when the change touches an end-to-end seam
```

Then set only `status: done` in the proposal frontmatter and open a pull
request against `main` referencing the change folder.

## If blocked

Open a draft pull request with completed work and explain the exact blocker: a
criterion conflicting with the design, an ambiguity, or a missing dependency.
A diagnosable stop is more useful than a confident guess.

## Hard limits

Never:

- Edit acceptance criteria, scope, or the why in `proposal.md` during
  implementation. Only its `status` field may change.
- Merge your own pull request or push to `main`.
- Modify `.github/workflows/` from an implementation task.
- Weaken, skip, or delete a test to make a build pass.
- Touch `.env*` or commit credentials.
- Widen scope. Mention adjacent work in the PR and leave it for another change.

## Notes that save time

- `@/` maps to the repository root, so imports use `@/src/lib/...`.
- Unit tests mock `@/src/lib/supabase/client`; live backend behaviour belongs
  in end-to-end tests.
- Use `renderWithProviders(ui, { strict: true })` when testing StrictMode.
- Anything under `design/` is visual reference only. Never copy its class names
  or CSS.
