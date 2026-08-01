# Tasks — <change name>

Ordered checklist derived from the design. Each task should be small
enough to review on its own, and phrased as an action.

Tick items off as they land. This file is the one part of a change an
implementing agent is expected to edit.

## Implementation

- [ ] <task>
- [ ] <task>

## Tests

- [ ] <test file> — <behaviour it proves>

Every acceptance criterion in the proposal needs a test here. If one
cannot be tested, that is a sign the criterion is too vague — fix the
proposal rather than skipping the test.

## Verification

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test:run`
- [ ] `npm run test:e2e` — only if the change touches a seam covered end to end

All four gates also run in CI, but running them locally first is faster
than waiting for a red check.
