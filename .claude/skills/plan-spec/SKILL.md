---
name: plan-spec
description: Plan an agreed proposal — writes design.md and tasks.md for a change in specs/changes/ and opens a PR. Use after a proposal is merged and before implementation.
---

# Plan a change

Second gate. Takes a merged proposal and decides **how** it gets built,
so the approach is agreed before there is a large diff to argue with.

Output is `design.md` and `tasks.md` — still no source code.

## Steps

### 1. Read the proposal

`specs/changes/<name>/proposal.md`. If the user did not name a change,
list those with `status: proposed` and ask which.

**If any `[NEEDS CLARIFICATION]` markers remain, resolve them with the
user before planning anything.** That is what this gate is for.
Planning around an unanswered question just moves the guess later,
where it is more expensive.

Once the user answers, **write the decision into the proposal** —
replace the marker with the verdict and its reasoning under a
`## Decisions` heading, and commit that as its own change:

```markdown
## Decisions

- **Home link only.** "Go to dashboard" would bounce a signed-out
  visitor to login — a worse dead end than the 404 — and there is no
  support route yet. Revisit when both exist.
```

Do not leave the answer in the conversation or a PR comment. Whoever
implements this later reads the change folder, not the thread. Record
why, not just what, or the question gets reopened.

Amending a proposal this way is allowed — the immutability check only
rejects it when the same pull request also touches source.

**A change cannot move to `planned` while a marker is unresolved.**

### 2. Understand the ground

Before choosing an approach, look at what exists:

- The relevant code — how do neighbouring features do this?
- `.claude/COMPONENT_PATTERNS.md` and `.claude/STYLE_GUIDE.md`
- The mockup named in `design:`, if any
- Existing tests covering the area
- `supabase/migrations/` if data is involved

Reusing an established pattern is almost always better than introducing
a new one.

### 3. Write `design.md`

From `specs/templates/design.md`. The sections that earn their place:

- **Approach** — how it gets built.
- **Alternatives rejected** — and why. This is the highest-value part.
  Without it the next reader reopens a settled decision, or an
  implementing agent quietly picks the thing you already ruled out.
- **Components** — new and modified files.
- **Patterns to follow** — point at existing code.
- **Visual reference** — what to take from the mockup, plus the
  reminder that it is a visual spec and its CSS must not be
  transplanted.
- **Data and schema** — migrations and RLS, or "none".
- **Test strategy** — unit by default; end-to-end when the risk is in a
  seam (redirects, sessions, email, network boundaries).

Be concrete. "Use a modal" is not a design; "reuse `Dialog` from
`src/components/ui/`, triggered from the row action, closing on
success" is.

### 4. Write `tasks.md`

From `specs/templates/tasks.md`. Ordered, each item small enough to
review on its own. Every acceptance criterion in the proposal needs a
corresponding test task.

### 5. Update status

Set `status: planned` in the proposal's frontmatter.

**Change nothing else in that file.** The criteria are the contract, and
CI rejects a PR that edits them alongside other work. If planning
revealed that the proposal itself is wrong, stop and say so — that
needs its own amendment PR, not a quiet edit.

### 6. Open the pull request

```bash
git checkout main && git pull
git checkout -b plan-<name>
git add specs/changes/<name>
git commit -m "spec: plan <name>"
git push -u origin plan-<name>
```

`gh pr create --base main`, titled `spec: plan <name>`. In the body:
the approach in a sentence or two, and any alternative worth the
reviewer knowing you rejected.

### 7. Report back

PR link, the approach in plain language, and anything you were unsure
about. Note explicitly that merging this makes the change eligible for
implementation — that is the point where a machine starts writing code,
and the user should know they are crossing it.
