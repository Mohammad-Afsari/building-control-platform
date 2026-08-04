---
name: new-spec
description: Propose a new repository change from a feature, page, or bug-fix idea. Create only the change proposal and a review pull request; do not plan or implement it.
---

# Propose a change

Turn a short request such as "spec an about page" into the first review gate.
The output is one proposal file and one pull request, with no source code.

## Workflow

1. Read `AGENTS.md`, `CLAUDE.md`, `specs/README.md`, and
   `specs/templates/proposal.md` completely.
2. Define the smallest useful PR-sized change. Suggest splitting work that is
   too large to review in one sitting.
3. Choose a unique verb-led kebab-case name such as `add-about-page` or
   `fix-404-route`. Check active and archived changes; do not use numbers.
4. For visual work, search `design/` for a real matching file. Reference it if
   found. If it should exist but does not, use `design: none` and add a
   `[NEEDS CLARIFICATION]` marker. Never invent a path.
5. Reuse a capability from `specs/capabilities/` where it fits; otherwise name
   the capability that this change will create.
6. Create `specs/changes/<name>/proposal.md` from the template:
   - keep `status: proposed`;
   - write testable EARS criteria using `SHALL`;
   - state in-scope and likely out-of-scope assumptions;
   - name the required test files and behaviours;
   - mark unknowns rather than guessing.
7. Create a branch named `<name>`, commit only the proposal, push it, and open a
   pull request titled `spec: <name>` using the repository PR format.
8. Report the PR, one-line scope, and every clarification marker. Stop here.

Ask the user directly only when an answer changes the entire shape of the
proposal. Otherwise expose the gap for review through a clarification marker.
