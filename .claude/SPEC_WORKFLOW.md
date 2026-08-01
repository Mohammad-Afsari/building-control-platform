# Implementing a change

Rules for whoever picks up a change in `specs/changes/` — usually an
agent with no memory of the conversation that produced it. Everything
needed should be in the change folder; if it is not, say so rather than
inventing it.

Read [`specs/README.md`](../specs/README.md) for how the pipeline works,
`CLAUDE.md` for the codebase, and `.claude/STYLE_GUIDE.md` plus
`.claude/COMPONENT_PATTERNS.md` for how code here is written.

## Before writing anything

1. Read `proposal.md` — what and why, and the acceptance criteria you
   must satisfy.
2. Read `design.md` — the agreed approach, and what was rejected. Follow
   it. If it looks wrong, stop and say so; do not quietly pick something
   else.
3. Read `tasks.md` — the checklist.
4. **Check for `[NEEDS CLARIFICATION]` markers.** If any remain
   unresolved, stop and open a draft PR explaining what is blocked. Do
   not guess.

## Doing the work

- Branch from `main`, named after the change folder:
  `specs/changes/add-about-page/` → branch `add-about-page`.
- Work through `tasks.md`, ticking items as they land. That file is the
  one part of the change you are expected to edit.
- Write the tests named in the proposal's **Tests required**. Every
  acceptance criterion needs one.
- A regression fix needs a test that **fails without the fix**. Verify
  by reverting the fix and watching it go red — a test that cannot fail
  is worse than no test, because it looks like coverage.
- Follow existing patterns. Reuse primitives from `src/components/ui/`.
  Design tokens only.

## Before opening a PR

All of these must pass:

```bash
npm run lint
npm run build      # tsc -b, typechecks tests too
npm run test:run
npm run test:e2e   # only if the change touches a seam covered end to end
```

Then set `status: done` in the proposal's frontmatter and open a PR
against `main` referencing the change folder.

## If you get stuck

Open a **draft** PR with what you have, and say plainly what blocked
you — a criterion that conflicts with the design, an ambiguity, a
dependency that does not exist. A diagnosable stop is far more useful
than a confident guess or a silent failure.

## Hard limits

Never:

- **Edit acceptance criteria, scope, or the why in `proposal.md`.** Only
  the `status` field may change. An implementer who can edit the target
  can always hit it, and CI will reject the PR if the body differs from
  `main`.
- **Merge your own pull request**, or push to `main`.
- **Modify `.github/workflows/`.** Those files decide what is allowed to
  run; changing them from inside a run is privilege escalation.
- **Weaken, skip or delete a test to make a build pass.** If a test is
  genuinely wrong, say so in the PR and leave it failing.
- **Touch `.env*`**, or commit credentials of any kind.
- **Widen scope.** If something outside the change clearly needs fixing,
  mention it in the PR description and leave it alone.

## Notes that save time

- `@/` maps to the **repo root**, so imports look like `@/src/lib/...`.
- Unit tests always mock `@/src/lib/supabase/client`; nothing there
  talks to a real backend.
- `StrictMode` only double-invokes effects when it is the outermost
  element passed to `render` — use `renderWithProviders(ui, { strict:
  true })`, not a hand-rolled wrapper.
- Anything under `design/` is a **visual** spec. Recreate it with this
  repo's components; never copy its class names or CSS.
