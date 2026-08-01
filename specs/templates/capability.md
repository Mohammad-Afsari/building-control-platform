---
capability: <kebab-case-name>
updated_by: <most recent change that amended this>
---

# <Capability name>

What this part of the system does **today** — present tense, current
truth. Not a history of how it got here.

Changes amend this file when they merge; the change itself is then
archived. Read together, `specs/capabilities/` describes the whole
product as it currently stands.

## Behaviour

- WHEN <trigger>, THE SYSTEM SHALL <observable response>.
- WHILE <state holds>, THE SYSTEM SHALL <observable response>.

Same EARS notation as a proposal's acceptance criteria — these lines
started life there and were promoted on merge.

## Covered by

- `<path to test file>` — <what it proves>

If a behaviour above has no test here, that is a gap worth closing.

## Notes

Constraints, deliberate limitations, or context that explains something
surprising. Keep it short; the behaviour list is the important part.
