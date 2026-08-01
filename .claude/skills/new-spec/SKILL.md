---
name: new-spec
description: Propose a new change — writes specs/changes/<name>/proposal.md from a short description and opens a PR for review. Use when the user wants to spec, propose, or plan a new feature, page, or fix.
---

# Propose a change

Turns a sentence like "spec an about page" into a reviewable proposal.
Output is **one markdown file and a pull request** — no source code.

Read [`specs/README.md`](../../../specs/README.md) first if you have not
already; it defines the pipeline this feeds.

## Steps

### 1. Understand what is being asked

Work out the smallest useful change. If the request is large enough to
need several pull requests, say so and propose splitting it — a change
should be reviewable in one sitting.

Do not interrogate the user over every detail. Gaps become
`[NEEDS CLARIFICATION]` markers, which is the cheaper way to resolve
them. Ask directly only when the whole shape of the change depends on
the answer.

### 2. Pick a name

Verb-led kebab-case, matching what the branch will be:
`add-about-page`, `fix-404-route`, `update-payment-flow`,
`remove-legacy-export`.

No numeric prefix. Check `specs/changes/` and `specs/changes/archive/`
for an existing folder with that name.

### 3. Find the design, if there should be one

Search `design/` for a matching mockup — an About page would want
something like `design/About.html`.

- **Found:** reference it in the `design:` frontmatter field.
- **Not found, but the change is visual:** set `design: none` and add a
  `[NEEDS CLARIFICATION]` asking whether a mockup exists that has not
  been exported into `design/` yet. **Do not invent a path.** A proposal
  pointing at a file that is not there will send the implementer looking
  for something that does not exist.
- **Not visual at all** (a refactor, a workflow, a migration): set
  `design: none` and move on.

### 4. Choose the capability

Look at `specs/capabilities/` for the area this belongs to. Reuse an
existing one where it fits; name a new one otherwise.

### 5. Write the proposal

Copy `specs/templates/proposal.md` to
`specs/changes/<name>/proposal.md` and fill it in.

- **Acceptance criteria in EARS.** One line per behaviour, always
  `SHALL`. Each must be checkable by a test — if you cannot picture the
  assertion, sharpen the line.
- **Out of scope matters.** Name the things a reader might reasonably
  assume are included. This is what stops an implementation sprawling.
- **Tests required** — name the file and what it proves.
- **Mark what you do not know.** A short spoken description will have
  gaps; that is expected. Flag them rather than guessing.

Leave `status: proposed`.

### 6. Open the pull request

```bash
git checkout main && git pull
git checkout -b <name>
git add specs/changes/<name>
git commit -m "spec: propose <name>"
git push -u origin <name>
```

Then open the PR with `gh pr create --base main`, titled
`spec: <name>`. In the body: why this is being proposed, and any
`[NEEDS CLARIFICATION]` markers surfaced so they are visible without
opening the file.

**Only the proposal file.** No source changes, no `design.md`, no
`tasks.md` — those come from the planning step once the intent is
agreed.

### 7. Report back

Give the user the PR link, a one-line summary of the change, and an
explicit list of anything you marked as needing clarification. If the
design lookup came up empty, say so plainly — that is the most likely
thing to derail the implementation later.
