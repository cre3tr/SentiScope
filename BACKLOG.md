# Backlog

> Last verified 2026-11-04 against `5276584`. **This file is an index.** Each
> item is one line pointing to where its detail lives. Items found after this
> file was created are written in full and marked "(new 2026-11-04)". Close an
> item by striking it through and dating the strike, and never delete it.
>
> History stays where it is: [DEPENDENCIES.md](DEPENDENCIES.md) (DEP-1, DEP-2).

## Blocked on Ian

- [ ] **What is SentiScope for?** [VISION.md](VISION.md) "Questions for Ian" #1.

## Dependencies

- [ ] Open Dependabot alerts: 2, both in development-scope packages. Check:
  `gh api repos/cre3tr/SentiScope/dependabot/alerts --jq '[.[]|select(.state=="open")]|length'`.
  Triage notes are kept privately by the owner.
- [ ] No open PRs (`gh pr list -R cre3tr/SentiScope --state open` → no rows).
- [ ] **ESLint stays on 9** until `eslint-config-next`'s nested
  `eslint-plugin-react` supports 10. Recheck trigger and procedure:
  DEPENDENCIES.md DEP-2.
- [ ] **`@types/node` stays on 24** until the Vercel project's Node moves past
  24. DEPENDENCIES.md DEP-1.

## Bugs and defects

- [ ] **A comment containing the word "constructor" corrupts the keyword
  counts** (new 2026-11-04). `src/lib/analyzer.ts` counts words in a plain
  object (`keywordCounts[word] = (keywordCounts[word] || 0) + 1`). The regex
  `\b[a-z]{4,}\b` lets `constructor` through, which resolves to
  `Object.prototype.constructor`. Replicating that line in node gave
  `[["constructor","function Object() { [native code] }1"],["battery",2]]`
  (control: `battery`, seen twice, counted 2). The chart then receives a string
  as a count. Not run through the app. Fix: use a `Map` or
  `Object.create(null)`.
- [ ] `analyzer.py` cannot run as shipped: `textblob`, `nltk` and `streamlit`
  are undeclared (no `requirements.txt`), and `feedback.csv` has no header row
  (CLAUDE.md "Running, building, testing").
- [ ] No test suite, and `analyzeFeedback()` is untested (CLAUDE.md).
- [ ] Unknown paths return 404 on the live site (`/zzz-nonexistent` → 404 on
  2026-11-04). Correct for a single-route Next.js app, noted so it is not
  mistaken for a rewrite defect (new 2026-11-04).
- [ ] The build depends on `fonts.googleapis.com` at build time (CLAUDE.md
  Gotcha 1). The offline fix is `next/font/local`.

## Docs drift (new 2026-11-04)

Existing docs were not edited. These are the stale lines found.

- [ ] **`../haven-ea/context/repo-map.md` row `SentiScope` says React
  "19.2.3, verified against `package.json` 2026-08-14".** `package.json` now has
  `"react": "19.3.1"`.
- [ ] **CLAUDE.md Gotchas 8 and 9 name `next@16.2.12`.** `package.json` has
  `next 16.4.3`. They read as dated history of why the overrides exist; the
  overrides themselves are still in `package.json`. Re-confirm the version
  numbers if the overrides are ever questioned.
- [ ] **DEPENDENCIES.md DEP-2 says "Lint is unchanged on eslint 9 (3
  pre-existing problems)".** CLAUDE.md says lint has exited 0 with 0 problems
  since 2026-10-29. Not a contradiction in time, but DEP-2 alone reads as if
  lint is red.
- [ ] CLAUDE.md "Before You Start" item 1 points at `BUILD.md` / `SPEC.md`,
  which do not exist. Item 0 added in this pass points at README.md.
- [ ] `package.json` is named `"web"`; CLAUDE.md already records it as a
  scaffolding leftover.

## Ideas (unprioritised, not commitments)

- A unit test file for `analyzeFeedback()`, with the "constructor" case as a
  planted-bug control.
- Move the Python prototype to `prototype/` with a `requirements.txt`, or
  delete it ([VISION.md](VISION.md)).
- Show a short "how this works and what it cannot judge" note on the page.
- Self-host the font so the build works offline.
