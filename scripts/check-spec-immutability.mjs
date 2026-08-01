#!/usr/bin/env node
/**
 * A change's proposal is a contract. An implementer that can edit the
 * acceptance criteria can always meet them, which would make the whole
 * pipeline self-certifying.
 *
 * So: on a pull request, any proposal.md that exists on both the base
 * branch and the head may differ only in its `status` frontmatter
 * field. Everything else — why, scope, criteria, tests required — is
 * frozen.
 *
 * Adding a brand new proposal is fine; that is how changes get
 * proposed in the first place. Deliberately amending an existing one
 * is also fine, but it has to be its own pull request that touches no
 * source files, so the change of target is visible rather than buried
 * in an implementation diff.
 *
 * Usage: node scripts/check-spec-immutability.mjs <base-ref>
 */
import { execFileSync } from 'node:child_process'

const baseRef = process.argv[2] ?? 'origin/main'

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

const changedFiles = git('diff', '--name-only', `${baseRef}...HEAD`)
  .split('\n')
  .filter(Boolean)

const proposals = changedFiles.filter(
  (file) => file.startsWith('specs/changes/') && file.endsWith('/proposal.md'),
)

if (proposals.length === 0) {
  console.log('No proposals touched — nothing to check.')
  process.exit(0)
}

const touchesSource = changedFiles.some(
  (file) => file.startsWith('src/') || file.startsWith('e2e/'),
)

/** Split frontmatter from body, and pull out the status line. */
const parse = (text) => {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { frontmatter: '', body: text }
  return { frontmatter: match[1], body: match[2] }
}

const withoutStatus = (frontmatter) =>
  frontmatter
    .split('\n')
    .filter((line) => !/^status\s*:/.test(line))
    .join('\n')

const violations = []

for (const path of proposals) {
  let before
  try {
    before = git('show', `${baseRef}:${path}`)
  } catch {
    // Not on the base branch — a newly proposed change.
    console.log(`✓ ${path} (new proposal)`)
    continue
  }

  const after = git('show', `HEAD:${path}`)

  const a = parse(before)
  const b = parse(after)

  const bodyChanged = a.body.trim() !== b.body.trim()
  const metaChanged = withoutStatus(a.frontmatter) !== withoutStatus(b.frontmatter)

  if (!bodyChanged && !metaChanged) {
    console.log(`✓ ${path} (status only)`)
    continue
  }

  if (!touchesSource) {
    // A deliberate amendment, made in isolation. Visible on its own.
    console.log(`✓ ${path} (amended, no source changes in this PR)`)
    continue
  }

  violations.push(path)
}

if (violations.length > 0) {
  console.error('\nA proposal was rewritten in a PR that also changes source:\n')
  for (const path of violations) console.error(`  ✗ ${path}`)
  console.error(
    '\nAcceptance criteria are the target — editing them while implementing' +
      '\nmakes them meaningless. Only `status` may change here.' +
      '\n\nIf the proposal is genuinely wrong, amend it in a separate PR that' +
      '\ntouches no source files, then rebase this one on top.\n',
  )
  process.exit(1)
}

console.log('\nAll touched proposals are intact.')
