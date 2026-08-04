---
name: implement-spec
description: Implement and test a planned change from specs/changes/. Use only after proposal and planning approval; follow tasks.md, verify all criteria, and open an implementation PR without merging it.
---

# Implement a change

Turn an agreed plan into tested code, one task and commit at a time.

## Workflow

1. Read `AGENTS.md`, `CLAUDE.md`, `specs/README.md`, and
   `specs/IMPLEMENTATION_RULES.md` completely before editing anything.
2. If the user did not name a change, list those with `status: planned` and ask
   which one to implement. Do not implement any other status.
3. Read the complete `proposal.md`, `design.md`, and `tasks.md`. Stop on any
   unresolved `[NEEDS CLARIFICATION]`; it requires a separate proposal-only
   amendment PR.
4. Branch from current `main` using the exact change-folder name. Set only the
   proposal status to `in-progress`.
5. For each unchecked task in order:
   - implement only that task;
   - tick it in `tasks.md`;
   - run proportionate checks;
   - commit it before moving on.
6. Follow `design.md`. If it is wrong or cannot satisfy the proposal, stop and
   explain rather than silently deviating.
7. Cover every acceptance criterion. For regression work, prove the test fails
   without the fix and passes with it.
8. Run every applicable verification command listed in the task file and
   implementation rules. Do not push until they pass, unless opening a clearly
   explained draft PR because work is blocked.
9. Set only the proposal status to `done`, commit it, push, and open a pull
   request using the repository format. Link the change folder and map criteria
   to tests. Never merge it.
10. Report completed and incomplete tasks, verification results, and any
    deviation or hesitation. Stop here; archiving is a separate gate.
