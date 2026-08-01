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

Three gates. You review at each, and each is a separate pull request.

**1. Propose** — `/new-spec <description>`

Writes `specs/changes/<name>/proposal.md` with status `proposed` and
opens a PR. One markdown file, reviewable on a phone. This is the
cheapest possible place to catch "that is not what I meant".

**2. Plan** — `/plan <change-name>`

Adds `design.md` and `tasks.md`, moves status to `planned`. This is
where the approach gets agreed — before there is a large diff to argue
with.

**3. Implement** — automatic on merge

Merging a `planned` change triggers the implementation workflow. It
branches, writes the code and the tests named in the proposal, runs the
gates, and opens a PR for review. It never merges its own work.

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

## Status

`proposed` → `planned` → `in-progress` → `done`

Only `planned` changes are picked up for implementation, so merging a
proposal you have not planned yet will not surprise you with a PR.

## Rules for implementers

In [`.claude/SPEC_WORKFLOW.md`](../.claude/SPEC_WORKFLOW.md). The one
worth knowing here: **acceptance criteria are immutable during
implementation.** An agent that can edit the target can always hit it.
CI enforces this.
