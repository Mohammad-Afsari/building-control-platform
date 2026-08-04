---
name: archive-spec
description: Archive a completed spec change after its implementation PR is merged. Promote current behaviour and tests into specs/capabilities/, move the change to the dated archive, and open a docs-only PR.
---

# Archive a completed change

Keep the capability specs current after implementation merges. This final gate
promotes present behaviour and preserves the change's design history.

## Workflow

1. Read `AGENTS.md`, `CLAUDE.md`, `specs/README.md`, the complete change
   folder, and `specs/templates/capability.md`.
2. Confirm the implementation PR is merged or the specified behaviour exists
   on `main`. Do not archive unmerged work.
3. Note any unchecked tasks and tell the user; do not silently erase them.
4. Open the capability named by the proposal:
   - update it if present, replacing obsolete or contradictory behaviour;
   - otherwise create it from the template.
5. Promote the acceptance criteria into present-tense Behaviour, add the tests
   under Covered by, update `updated_by`, and retain only durable constraints or
   decisions from the design.
6. Move the entire change folder to
   `specs/changes/archive/YYYY-MM-DD-<name>/`.
7. Create branch `archive-<name>`, commit only spec documentation, push, and
   open a pull request titled `spec: archive <name>` using the repository PR
   format.
8. Report the PR, updated capability, promoted behaviour, and any unchecked or
   deliberately dropped work. Stop here and never merge the PR yourself.
