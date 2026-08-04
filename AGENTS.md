# Repository instructions

These instructions apply to every Codex task in this repository.

## Start here

- Read `CLAUDE.md` before changing code. Despite its filename, it is the
  shared repository guide: architecture, commands, testing, design system,
  style, and non-obvious conventions apply to every coding agent.
- Read the closest existing code and tests before choosing an approach.
- Preserve unrelated user changes. In particular, `.claude/launch.json` is a
  local untracked file and must not be committed unless the user asks.

## Pull requests

- Never commit directly to `main`; use a feature branch and a pull request.
- Never merge your own pull request.
- Before pushing implementation work, run the checks required by the spec and
  `CLAUDE.md`.
- Pull request bodies use `## Summary`, `## How to test`, and `## Other notes`.
- Do not add AI-attribution footers to commits or pull requests.

## Spec-driven development

Product changes follow the four manually invoked gates in `specs/README.md`:

1. `$new-spec` proposes the change.
2. `$plan-spec` adds the agreed design and task list.
3. `$implement-spec` writes and verifies the code.
4. `$archive-spec` promotes the merged behaviour into the capability specs.

Each gate opens a separate pull request and stops. Never advance to the next
gate merely because the previous pull request merged. Acceptance criteria are
immutable during implementation, and unresolved `[NEEDS CLARIFICATION]`
markers block planning or implementation.

The repository-scoped Codex skills live in `.agents/skills/`. Claude has
equivalent skills in `.claude/skills/`; both implement the same contract in
`specs/`.

## Implementation boundaries

- Read `specs/IMPLEMENTATION_RULES.md` before implementing a planned change.
- Treat `design/` as a visual reference, not source code. Recreate it using
  repository components and tokens; never copy its prototype CSS or classes.
- Do not edit `.github/workflows/`, `.env*`, credentials, acceptance criteria,
  or unrelated files while implementing a spec.
- Do not weaken or delete a test to make a check pass.

## Supabase

- `supabase/migrations/` is the repository source of truth for intended
  database structure; read `supabase/README.md` before comparing it with the
  hosted project.
- Use the Supabase connector for read-only inspection when available.
- Never apply a migration or mutate the hosted project unless the user
  explicitly asks for that database change.
