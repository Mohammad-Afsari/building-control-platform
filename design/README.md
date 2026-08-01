# Design mirror

A snapshot of the **Building Control** project in Claude Design. It
lives here so that anything implementing a change — including an agent
with no access to that account — can see what a page is supposed to
look like.

**Exported 1 August 2026.**

## Read this before using it

**These files are a visual specification, not an implementation.** They
use their own class names (`bc-btn`, `bc-input`, `bc-field`) and their
own stylesheet, and their scripts fake behaviour with `setTimeout`.

Recreate the *rendered output* using this repo's own components from
`src/components/ui/` and its design tokens. Never transplant a class
name, a rule from `styles.css`, or any of the prototype JavaScript.
`.claude/COMPONENT_PATTERNS.md` covers how to port a prototype
properly.

**`tokens/` is reference only.** `src/styles/*.css` is the source of
truth for what actually compiles. The two are near-identical by design,
with three deliberate differences:

- `--text-body` is renamed `--text-default` in the app, because
  `--text-body` is already the 15px size token in `typography.css` and
  the later import would shadow it
- the app drops the Google Fonts `@import`
- whitespace alignment in `spacing.css`

If you find a difference beyond those, treat it as drift worth
investigating rather than something to copy across.

## What is here

```
*.html          one file per page
cards/          per-component reference sheets (buttons, forms, pills, …)
tokens/         colour, spacing and typography custom properties
styles.css      the prototype's shared stylesheet
components.css  the prototype's component styles
assets/logo/    brand mark, SVG and PNG
```

`All Applications.html` is a stub that redirects to
`Applicant Dashboard.html` — the two were merged in the design.

Screenshots and Claude Design's internal files (`_ds_manifest.json`,
`_ds_bundle.js`, `.thumbnail`, `uploads/`) are deliberately excluded.
The screenshots are PNGs nothing here can read as text, and they roughly
tripled the size of the export.

## Refreshing it

The mirror is a snapshot, so it goes stale silently. Two bundles in
`~/Downloads` were six weeks out of date before anyone noticed.

To update: Claude Design → Export HTML → **Project archive** (not
Standalone HTML, which inlines everything per page), then replace the
contents of this folder and update the date above. Do it in its own
pull request so the visual diff is reviewable on its own.

A proposal referencing a page that is not in here should be treated as
a blocker, not worked around — the implementation would otherwise be
guesswork.
