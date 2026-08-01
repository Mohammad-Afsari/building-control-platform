---
title: <Short imperative title>
status: proposed
capability: <existing folder in specs/capabilities/, or a new one>
design: <path under design/, or: none>
---

## Why

One or two sentences. What is broken, missing, or needed — and who it
affects. Not how to fix it.

## Scope

### In scope

- <the smallest set of changes that delivers the value>

### Out of scope

- <things a reasonable reader might assume are included, but are not>

Being explicit here is what keeps an implementation from sprawling.

## Acceptance criteria

One line per behaviour, in EARS notation. Every line must be checkable
by a test — if you cannot imagine the assertion, the line is too vague.

Always `SHALL`. Never should, must, may, or will.

- WHEN <trigger>, THE SYSTEM SHALL <observable response>.
- WHILE <state holds>, THE SYSTEM SHALL <observable response>.
- WHERE <feature is present>, THE SYSTEM SHALL <observable response>.

## Tests required

- `<path to test file>` — <what it proves>

Name the file and the behaviour. A change that fixes a bug needs a test
that fails without the fix.

## Open questions

Anything ambiguous, marked so it gets answered rather than guessed:

- [NEEDS CLARIFICATION: <the specific question>]

Delete this section only when there is genuinely nothing unresolved.
