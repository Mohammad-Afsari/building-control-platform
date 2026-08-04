---
name: plan-spec
description: Plan a merged proposed change in specs/changes/ by adding design.md and tasks.md. Use after proposal approval and before implementation; create a planning PR only.
---

# Plan a change

Turn an approved proposal into an agreed technical design and ordered task
list. This is the second review gate; do not write source code.

## Workflow

1. Read `AGENTS.md`, `CLAUDE.md`, `specs/README.md`, the change's complete
   `proposal.md`, and both planning templates.
2. If the user did not name a change, list those with `status: proposed` and
   ask which one to plan.
3. Stop if any `[NEEDS CLARIFICATION]` marker remains. Resolve it with the user
   and record the verdict and reasoning under `## Decisions` in a proposal-only
   commit or PR. Never leave the answer only in chat or a PR comment.
4. Inspect neighbouring code and tests, `.claude/STYLE_GUIDE.md`,
   `.claude/COMPONENT_PATTERNS.md`, the named visual reference, and relevant
   migrations.
5. Create `design.md` from the template. Specify the approach, rejected
   alternatives, exact components, existing patterns, visual translation,
   data/RLS implications, and unit versus end-to-end strategy.
6. Create `tasks.md` from the template. Keep tasks ordered and independently
   reviewable; map every acceptance criterion to a test task.
7. Set only the proposal frontmatter status to `planned`. If planning reveals
   that the proposal contract is wrong, stop and propose a separate amendment.
8. Create branch `plan-<name>`, commit the change-folder files, push, and open a
   pull request titled `spec: plan <name>` using the repository PR format.
9. Report the PR, the approach, rejected alternatives, and uncertainties. Say
   explicitly that merging makes the change eligible for implementation, then
   stop.
