---
name: implement-spec
description: Implement a planned change — works through tasks.md one task at a time, writing code and tests, then opens a PR. Use after a change has been proposed and planned.
---

# Implement a change

Third gate. Turns an agreed plan into code.

Work **one task at a time**, committing after each. Both OpenSpec and
Kiro converged on this independently, for the same reason: when
something goes wrong at task four of seven, a reviewer gets three sound
commits and an obvious stopping point rather than one tangled diff.

Read [`.claude/SPEC_WORKFLOW.md`](../../SPEC_WORKFLOW.md) before
starting — it holds the rules and the hard limits. They are not
negotiable.

## Steps

### 1. Pick up the change

If the user did not name one, list changes with `status: planned` and
ask. Only `planned` changes are ready — a proposal that has not been
through `/plan` has no agreed approach to follow.

Read all three files: `proposal.md` for the target, `design.md` for the
approach and what was already rejected, `tasks.md` for the checklist.

**If any `[NEEDS CLARIFICATION]` marker is still unresolved, stop.**
Ask the user. Do not pick the likeliest reading — that is the failure
this whole pipeline exists to prevent.

### 2. Set up

```bash
git checkout main && git pull
git checkout -b <change-name>
```

Branch name matches the change folder exactly, so a PR is traceable to
its spec without opening anything.

Set `status: in-progress` in the proposal's frontmatter. **Change
nothing else in that file** — CI rejects a PR that edits criteria
alongside source.

### 3. Work through the tasks

For each unchecked item in `tasks.md`, in order:

1. Do the one task. Nothing beyond it.
2. Tick it: `- [ ]` → `- [x]`
3. Commit, message describing that task
4. Move to the next

Resist finishing several at once because they seem related. The
sequence is what makes a failure diagnosable, and `tasks.md` doubles as
a resume point if the work is interrupted.

While implementing:

- Follow `design.md`. If it turns out to be wrong, **stop and say so** —
  do not quietly substitute your own approach. Disagreeing is fine;
  silently deviating is not.
- Reuse what exists. Primitives from `src/components/ui/`, patterns
  from `.claude/COMPONENT_PATTERNS.md`, design tokens only.
- Anything under `design/` is a **visual** reference. Recreate the
  rendered output with this repo's components; never transplant its
  class names or CSS.

### 4. Write the tests

Every acceptance criterion needs one. They are in EARS form precisely
so each maps to a single assertion.

For a regression fix, the test must **fail without the fix**. Verify
that: revert the fix, watch it go red, restore it. A test that cannot
fail looks like coverage and provides none — that has already happened
in this repo once.

### 5. Verify

```bash
npm run lint
npm run build
npm run test:run
npm run test:e2e   # only if the change touches a seam covered end to end
```

All four also run in CI, but finding a failure here is faster than
waiting for a red check.

### 6. Open the pull request

Set `status: done` in the proposal frontmatter, commit, push, and:

```bash
gh pr create --base main
```

Follow the repo's PR template — Summary, How to test, Other notes. In
the body: link the change folder, list the acceptance criteria and how
each is covered, and name anything you were unsure about.

**Never merge it.** That is the user's call, always.

### 7. If you get stuck

Open a **draft** PR with what you have and explain plainly what blocked
you — a criterion that contradicts the design, an ambiguity nobody
resolved, a dependency that does not exist.

A clear stop is worth far more than a confident guess. The tasks you
completed still stand, and the user can unblock you and resume.

### 8. Report back

The PR link, which tasks landed, which did not, and anything that made
you hesitate. If you deviated from `design.md` at all, say so
explicitly and why — that is the single most important thing for the
reviewer to know.
