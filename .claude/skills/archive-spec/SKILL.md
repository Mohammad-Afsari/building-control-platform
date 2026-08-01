---
name: archive-spec
description: Archive a completed change — folds its acceptance criteria into the capability spec and moves the change to specs/changes/archive/. Use after an implementation PR has been merged.
---

# Archive a completed change

Last step. Without it `specs/capabilities/` goes stale immediately and
the split between "what the system is" and "what we're changing"
becomes decorative.

Two jobs: **promote** the change's criteria into the capability spec,
then **move** the change folder into the archive.

## Steps

### 1. Check it is actually done

The implementation PR must be **merged**. Confirm with `gh pr list
--state merged` or by checking the change's behaviour exists on `main`.

Read `tasks.md`. If items are still unchecked, say so and ask whether
to continue — sometimes work was descoped deliberately, sometimes it
was forgotten. Do not block on it, but do not stay silent either.

### 2. Promote the criteria

Open the capability named in the proposal's `capability:` field.

- **It exists:** merge the change's acceptance criteria into its
  Behaviour section. Criteria that *replace* existing behaviour should
  overwrite the old lines, not sit alongside them — a capability
  describes the present, and two contradictory lines make it useless.
- **It does not exist:** create it from
  `specs/templates/capability.md`.

Then:

- Add the change's tests to **Covered by**, with what each proves.
- Update `updated_by` in the frontmatter to name this change.
- Carry across anything from the design worth keeping — a constraint, a
  deliberate limitation, a decision that would otherwise get reopened.
  Not the whole design document; the parts that still explain the
  system.

Keep the tense present. `specs/capabilities/` describes what the system
does now, not how it got there. The history is in the archive.

### 3. Move the change

```bash
git mv specs/changes/<name> specs/changes/archive/$(date +%Y-%m-%d)-<name>
```

Date prefix, so the archive reads chronologically. This is also where
ordering actually lives — which is why change folders themselves carry
no numbers.

Everything goes: proposal, design, tasks. The reasoning behind past
work stays findable, which matters more than it sounds when someone
asks why something was built a particular way.

### 4. Open the pull request

```bash
git checkout main && git pull
git checkout -b archive-<name>
git add specs
git commit -m "spec: archive <name>"
git push -u origin archive-<name>
gh pr create --base main --title "spec: archive <name>"
```

In the body: which capability was updated and how it changed. This is a
docs-only PR — it touches nothing under `src/`, so the spec-integrity
check will pass even though a proposal moved.

### 5. Report back

The PR link, the capability that changed, and — if any tasks were left
unchecked — what was dropped. That last point is the one most likely to
matter later.
