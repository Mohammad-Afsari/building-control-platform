# Specs

How work gets described, agreed and built in this repo.

The short version: a **change** is one PR-sized piece of work, proposed
and reviewed as markdown before any code exists. Once merged it amends a
**capability** — the description of what the system does — and is
archived.

## Layout

```
specs/
  capabilities/          what the system does today
    auth-signup/spec.md
  changes/               work in flight, one folder per change
    add-about-page/
      proposal.md        what and why
      design.md          how, and why that way
      tasks.md           ordered checklist
    archive/             merged changes, kept for history
      2026-07-28-add-about-page/
  templates/             copy these when starting something new
```

## Naming

Verb-led kebab-case, matching the branch: `add-about-page`,
`fix-404-route`, `update-payment-flow`, `remove-legacy-export`.

No numeric prefixes. Two changes proposed in parallel would race for the
same number, and a folder name collision is not something git flags.
Ordering lives in the archive timestamp, where it is actually true.

## The flow

Four steps, each a separate pull request you review.

**1. Propose** — `/new-spec <description>`

Writes `specs/changes/<name>/proposal.md` with status `proposed` and
opens a PR. One markdown file, reviewable on a phone. The cheapest
possible place to catch "that is not what I meant".

**2. Plan** — `/plan <change-name>`

Adds `design.md` and `tasks.md`, moves status to `planned`. Where the
approach gets agreed — before there is a large diff to argue with.

**3. Implement** — `/implement-spec <change-name>`

Works through `tasks.md` **one task at a time**, committing after each,
writing the tests named in the proposal, then opens a PR. Never merges
its own work.

One task at a time is deliberate. It is what both
[OpenSpec](https://github.com/Fission-AI/OpenSpec) and
[Kiro](https://kiro.dev/docs/specs/) settled on, for the same reason:
when something goes wrong at task four of seven, you get three sound
commits and an obvious stopping point instead of one tangled diff.

**4. Archive** — `/archive-spec <change-name>`

Once the implementation is merged, folds the criteria into
`specs/capabilities/` and moves the change to
`specs/changes/archive/YYYY-MM-DD-<name>/`.

Skipping this is how a capability folder goes stale. Without it you
accumulate historical diffs and nothing describing what the system
currently does.

## Why this is invoked rather than automated

Every step is run by a person. There is no workflow that picks up a
merged spec and starts building.

That is on purpose, and it matches how the tools this borrows from
actually work — both are editor-invoked with someone watching. Kiro
[held back unattended execution for a long time](https://kiro.dev/blog/run-all-tasks/)
because their testing found the agent sometimes did well alone and
sometimes produced failures that cost more to unpick than to have done
by hand.

Automating the trigger is a small change once the loop is proven. Doing
it before then just means discovering a weak prompt through a series of
pull requests nobody was watching.

## Writing acceptance criteria

EARS notation — one line per behaviour, always `SHALL`:

```
WHEN a visitor opens an unmatched URL, THE SYSTEM SHALL render the 404 page.
WHILE a signup request is in flight, THE SYSTEM SHALL disable the submit button.
WHERE the applicant has no applications, THE SYSTEM SHALL show the empty state.
```

The constraint is the point. Each line maps to one test, and it is hard
to write a vague one. If you cannot picture the assertion, the criterion
needs sharpening.

## Marking what you do not know

A spec dictated in thirty seconds will have gaps. Say so rather than
guessing:

```
- [NEEDS CLARIFICATION: does the About page list the team, or just the company?]
```

An unresolved marker blocks planning. That is deliberate — a guess made
here becomes a wrong assumption baked into code later.

### Answering one

**Resolve it by editing the proposal, not by replying in a PR comment.**

Replace the marker with the decision and the reason, under a
`## Decisions` heading:

```markdown
## Decisions

- **Home link only.** "Go to dashboard" would bounce a signed-out
  visitor to login — a worse dead end than the 404 — and there is no
  support route yet. Revisit when both exist.
```

A comment thread is invisible to whoever implements the change three
weeks later; the proposal is not. Recording the reasoning, not just the
verdict, is what stops the same question being reopened.

The immutability check permits this: amending a proposal is fine in a
pull request that touches no source files. Answering during
implementation is not.

**A change cannot move to `planned` while an unresolved marker
remains.**

## Status

`proposed` → `planned` → `in-progress` → `done`

Only `planned` changes are picked up for implementation, so merging a
proposal you have not planned yet will not surprise you with a PR.

## Rules for implementers

In [`specs/IMPLEMENTATION_RULES.md`](./IMPLEMENTATION_RULES.md). The one
worth knowing here: **acceptance criteria are immutable during
implementation.** An agent that can edit the target can always hit it.
CI enforces this.

## Agent support

The workflow is tool-neutral. Claude exposes the four stages through
`.claude/skills/`; Codex exposes the same stages through `.agents/skills/` and
loads repository-wide guidance from `AGENTS.md`. Both tools read the files in
this directory as the contract, so switching agents does not change the
acceptance criteria, design, tasks, or archive format.
