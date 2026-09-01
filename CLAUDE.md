# SentiScope

## What this is

SentiScope is a client-side feedback-analysis dashboard: drop a `.txt` or
`.csv` file of customer comments into the browser and it produces a
sentiment breakdown (Positive/Neutral/Negative) plus top-keyword themes,
rendered as cards and charts. It is a single-page Next.js app — there is no
backend, no database, and no auth. All parsing and scoring happens in the
browser via client components. It reads as a portfolio/demo piece (product
name "SentiScope", polished UI, no persistence layer) rather than a
production SaaS tool.

**The root-level Python files are NOT wired into the Next.js app.** They are
a separate, earlier CLI/Streamlit prototype of the same idea:

- `analyzer.py` — a standalone CLI tool (`argparse`) that reads a `.txt` or
  `.csv` file, scores sentiment with `textblob`, extracts top keywords by
  filtering NLTK English stopwords, and writes a `results.txt` report.
- `analyzer(demo w streamlit).py` — a Streamlit UI (`st.file_uploader`) that
  imports `process_feedback` from `analyzer.py` and renders the same
  breakdown in a browser tab, driven by `streamlit run`.
- `feedback.csv` / `feedback.txt` — sample input data for the Python
  scripts, 20 lines of canned customer comments each.

The actual product (`src/lib/analyzer.ts`) is a from-scratch TypeScript
reimplementation of the same logic (sentiment scoring + stopword-filtered
keyword extraction) using the npm `sentiment` package instead of `textblob`,
so the two implementations exist in parallel with no shared code and no
import relationship. Treat the Python files as a design reference /
prototype artifact, not as source you need to keep in sync with the app.

## Stack (exact versions from package.json)

- Next.js **16.2.12** (App Router, Turbopack build)
- React **19.2.8** / React DOM 19.2.8
- TypeScript **^6.0.3** (`strict: true`)
- Tailwind CSS **^4** via `@tailwindcss/postcss`
- shadcn/ui (`components.json`, style `base-nova`, baseColor `neutral`) on
  top of `@base-ui/react` **^1.6.0** primitives, `class-variance-authority`,
  `tailwind-merge`, `clsx`
- `sentiment` ^5.0.2 — sentiment scoring engine used by `src/lib/analyzer.ts`
- `papaparse` ^5.5.4 — CSV parsing in the browser
- `recharts` ^3.10.1 — Pie/Bar charts
- `next-themes` ^0.4.6 — light/dark mode
- `lucide-react` ^1.11.0 — icons
- ESLint **^9.7.0** with `eslint-config-next` 16.2.12 (flat config,
  `eslint.config.mjs`). **Pinned below 10 deliberately** — see the gotcha
  below.

package name in `package.json` is `"web"` — this is a monorepo-style leftover
from scaffolding, not a second package; there is only one app here.

## Running, building, testing

- `npm run dev` — UNVERIFIED. Not started (task instructions require not
  leaving a dev server running; starting/stopping it just to confirm boot
  was judged lower value than the build/lint runs below, which already
  surfaced the real issues). If you need to verify it boots, expect the same
  Google Fonts network dependency noted below to potentially cause slow or
  failed font loading in a sandboxed/offline environment — the rest of the
  page should still render.
- `npm run build` (`next build`, Turbopack) — **FAILED, exit code 1.**
  Ran and captured full output. Root cause: `src/app/layout.tsx` uses
  `next/font/google` for two fonts (`Plus_Jakarta_Sans`, `JetBrains_Mono`),
  and Turbopack's build step tries to fetch both from
  `fonts.googleapis.com` at build time. In this sandboxed environment that
  request fails outright ("Failed to fetch `JetBrains Mono` from Google
  Fonts" / same for Plus Jakarta Sans), which Turbopack treats as a hard
  build error, not a warning. This is a **network-dependent build**, not a
  code bug — on a machine with normal internet access to Google Fonts it
  should build cleanly. Do not "fix" this by ripping out next/font; if you
  need to build in an offline/sandboxed environment, the real fix is to
  self-host the font files (e.g. via `next/font/local`) instead of fetching
  from Google at build time. `.next/` after this failed run contains a
  partial `server/`, `static/`, `build/`, `cache/`, `types/` tree from an
  earlier (Mar 16) successful build plus new `diagnostics/`/`trace` files
  from this failed attempt — do not treat the presence of `.next/` as proof
  the current source builds.
- `npm run lint` (`eslint`, flat config) — **VERIFIED, ran, exit code 1**
  (re-confirmed 2026-08-19 after the Next.js 16.2.12 / React 19.2.8
  safe-updates bump — see the gotcha below on why ESLint stayed pinned to
  9.x through that bump). 2 errors + 1 warning, all in
  `src/components/dashboard/Dashboard.tsx`:
  - line 7: `'CheckCircle'` imported from `lucide-react` but never used
    (`@typescript-eslint/no-unused-vars`)
  - line 65: `Unexpected any` — `const data = results.data as any[];` inside
    the PapaParse `complete` callback (`@typescript-eslint/no-explicit-any`)
  - line 353: `Unexpected any` — the Recharts `<Tooltip formatter={(value:
    any) => ...}>` on the sentiment pie chart (`@typescript-eslint/no-explicit-any`)
  These are pre-existing; do not fix them as a side effect of unrelated
  work — fix them deliberately if asked, since they touch active
  components.
- **No test suite.** `package.json` has no `test` script and there is no
  test runner (Jest/Vitest/Playwright/etc.) in `devDependencies`. There are
  no `*.test.ts(x)` or `*.spec.ts(x)` files anywhere in `src/`. Testing is
  currently manual only.
- Python side: **UNVERIFIED as runnable.** No `requirements.txt` (or
  `pyproject.toml`/`Pipfile`) exists anywhere in the repo. Running
  `python analyzer.py feedback.txt` in this environment fails immediately
  with `ModuleNotFoundError: No module named 'textblob'` — only `pandas` is
  present in the ambient Python env, not `textblob`, `nltk`, or `streamlit`
  (all three are imported by the two Python files but declared nowhere).
  Separately, `feedback.csv` has **no header row** — its first line is a
  real comment (`"The product is great but shipping took forever."`), so
  even with dependencies installed, `analyzer.py feedback.csv` would treat
  that comment as the column name and immediately raise `ValueError: CSV
  file must have a 'comments' column.` `analyzer.py feedback.txt` is the
  only invocation that stands a chance of working once `textblob`+`nltk`
  are installed (`.txt` path doesn't need a header).

## Directory layout (App Router)

```
src/
  app/
    layout.tsx       Root layout: loads Google fonts, wraps children in ThemeProvider, sets metadata
    page.tsx          The single route ("/"). Renders header + <Dashboard/>
    globals.css        Tailwind v4 + shadcn CSS variables/theme tokens
  components/
    dashboard/
      Dashboard.tsx    All app logic and UI: upload, parse, analyze, chart (see map below)
    theme-provider.tsx Thin wrapper around next-themes' ThemeProvider
    theme-toggle.tsx   Sun/moon icon button, toggles light/dark via next-themes
    ui/                shadcn/ui primitives: button.tsx, card.tsx, progress.tsx
  lib/
    analyzer.ts        Core sentiment/keyword logic (analyzeFeedback()) — the actual "product"
    utils.ts            cn() helper (clsx + tailwind-merge)
  css.d.ts              Ambient module declaration for *.css imports
```

There is no `src/pages/`, no `src/app/api/`, and no server actions — this is
a pure client-side App Router app with a single route. Everything after
"upload a file" happens in `Dashboard.tsx`'s browser-side state; nothing is
sent to a server.

`components.json` confirms shadcn/ui is in active use: style `base-nova`,
Tailwind CSS lives at `src/app/globals.css`, aliases map `@/components`,
`@/lib`, `@/components/ui`, `@/hooks` under `src/`. Only `button`, `card`,
and `progress` have been generated into `src/components/ui/` so far.

## Line-number map: `src/components/dashboard/Dashboard.tsx` (420 lines, the only file over ~300 lines)

- 1–40: imports — React `useState`, lucide icons, PapaParse, `analyzeFeedback`/`SentimentAnalysisResult` from `@/lib/analyzer`, shadcn `Card`/`Button`/`Progress`, Recharts primitives (`PieChart`, `BarChart`, etc.), and the `COLORS` map (Positive/Neutral/Negative → hex).
- 42–48: `Dashboard()` component state — `isDragging`, `file`, `error`, `isAnalyzing`, `results`.
- 49–57: `handleDragOver` / `handleDragLeave` — drag-and-drop visual state.
- 59–101: `processFileText(text, filename)` — branches on `.csv` (PapaParse with header row, case-insensitive lookup for a column containing "comment" or "feedback", line 65 is the `any[]` cast flagged by lint) vs `.txt` (split on newlines, trim, filter blanks). Both paths call `analyzeFeedback()` and set `results`.
- 103–115: `handleDrop` / `handleFileInput` — wire native drag/drop and `<input type="file">` events into `handleFiles`.
- 116–143: `handleFiles(files)` — validates extension is `.txt`/`.csv`, sets `file`/`isAnalyzing`, reads the file via `FileReader.readAsText`, then calls `processFileText` in `onload`.
- 145–149: `reset()` — clears file/results/error to return to the upload screen.
- 151–165: derives `pieData` (sentiment counts, zero-filtered) and `barData` (top keywords) from `results` for Recharts.
- 167–420: JSX render, three states gated on `!results && !isAnalyzing` / `isAnalyzing` / `results`:
  - 170–218: upload dropzone card (drag handlers, hidden file input, error banner).
  - 221–235: loading spinner state.
  - 238–417: results dashboard — 240–262 header (filename + comment count + "Analyze Another" button), 264–324 sentiment breakdown card with three `<Progress>` bars, 326–363 pie chart card (line 353 is the `Tooltip formatter={(value: any) => ...}` flagged by lint), 365–414 top-themes bar chart card.

No other file in `src/` exceeds ~130 lines (`globals.css` is 128 lines of
Tailwind/shadcn tokens; every `.tsx`/`.ts` file besides `Dashboard.tsx` is
under 105 lines).

## Gotchas hit while verifying

1. `npm run build` fails in this sandboxed environment purely because
   `next/font/google` needs outbound access to `fonts.googleapis.com` at
   build time — see the build section above. Don't assume the app is broken
   from this alone; re-test with real internet access before concluding
   anything about the actual source.
2. `next.config.ts` sets `experimental.forceSwcTransforms: true` with a
   comment explaining it's a Windows-specific workaround for SWC binding
   crashes — but Turbopack (which `next build`/`next dev` use by default in
   Next 16) silently ignores this option and prints a warning. If SWC
   crashes resurface on Windows, this existing mitigation is not actually
   taking effect under Turbopack; a Turbopack-specific workaround would be
   needed instead.
3. `feedback.csv` has no header row, which breaks `analyzer.py`'s explicit
   `'comments' column` requirement — see the Python section above.
4. There is no `requirements.txt` for the Python side at all; `textblob`,
   `nltk`, and `streamlit` are used but never declared. If someone asks you
   to "run the Python analyzer," you cannot assume it works out of the box.
5. Two pre-existing lint errors (`no-explicit-any`) and one warning
   (unused `CheckCircle` import) live in `Dashboard.tsx` — `npm run lint`
   currently exits 1. Don't assume a red lint run means your own change
   broke something; check whether it's one of these three first.
6. **`eslint-plugin-react` does not support ESLint 10, at any version
   published as of 2026-08-19 (latest is 7.37.5, peer range caps at
   `^9.7`).** `eslint-config-next` bundles its own nested copy of
   `eslint-plugin-react`, so this holds regardless of which
   `eslint-config-next` version is installed — checked directly against
   `eslint-config-next@16.3.1` (latest stable) and it still bundles
   `eslint-plugin-react@^7.37.0`. Before 2026-08-19, `package.json` declared
   `"eslint": "^10.2.1"`, which floated to whatever ESLint 10.x was newest —
   this silently broke `npm run lint` (hard crash, `TypeError:
   contextOrFilename.getFilename is not a function`, before any file gets
   linted) sometime after this doc's original version-verification pass,
   with no source change and no dependency bump on this repo's side; ESLint
   10 itself simply shipped a later patch that removed the legacy
   `context.getFilename()` API `eslint-plugin-react`'s old version-detection
   code still calls. Fixed by pinning `"eslint": "^9.7.0"` — do not bump it
   back to `^10` on a future dependency PR without first checking whether
   `eslint-plugin-react` (or whatever `eslint-config-next` bundles by then)
   has shipped ESLint 10 support.
   **Re-confirmed 2026-09-01: still broken.** Dependabot PR #3
   (`eslint` `^9.7.0` → `^10.9.1`) reproduced this exact crash — same
   `TypeError: contextOrFilename.getFilename is not a function`, same
   `react/display-name` rule, same call chain through
   `eslint-config-next/node_modules/eslint-plugin-react/lib/util/version.js`
   — even with `eslint-config-next` at 16.3.3 (current at that date) still
   bundling `eslint-plugin-react@7.37.5`, whose own declared peer range is
   `"^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9" ` /
   `"...|| ^9.7"` — `npm ls eslint` flags the whole tree `invalid` against
   `eslint@10.9.1`. **Do not merge that PR** (or any future eslint-10 bump)
   until re-checking whether a newer `eslint-plugin-react` has shipped.
7. **`shadcn` lives in `devDependencies`, not `dependencies` — keep it
   there.** It's the shadcn/ui CLI (`npx shadcn add button`), never imported
   anywhere in `src/` (confirmed by grep — zero hits for `from "shadcn"` or
   anything under it). But `shadcn`'s own dependency,
   `@modelcontextprotocol/sdk`, bundles a full **Hono + Express server**
   (`hono`, `@hono/node-server`, `express`, `body-parser`, `qs`,
   `ip-address`, `path-to-regexp`). While `shadcn` sat in `dependencies`,
   GitHub's dependency graph scanned that entire bundled server as
   production-runtime code and reported it in Dependabot alerts — it
   accounted for roughly two-thirds of a 64-row alert list surfaced
   2026-08-19, none of it real: nothing in that subtree ever runs in the
   deployed app. Moving `shadcn` to `devDependencies` doesn't remove any of
   it (Vercel has no `vercel.json` here, so it builds with default
   zero-config `npm install`, which always installs devDependencies) — it
   only fixes the scope GitHub reports. If a future dependency bump moves
   `shadcn` back to `dependencies` (e.g. an auto-generated Dependabot PR that
   doesn't know the history), move it back.
8. **`sharp` is pinned via a top-level `"overrides"` entry
   (`>=0.35.0`), not because the app uses it.** It arrives as a genuine
   `dependencies`-scope transitive of `next` itself (Next.js's optional
   image-optimization backend), and the version `next@16.2.12` resolves on
   its own (`0.34.5`) is vulnerable (`CVE-2026-33327` and siblings, inherited
   from `libvips`). But this app never calls `next/image` anywhere (`grep
   -rn "next/image" src/ next.config.ts` → zero hits), so the vulnerable code
   path is currently dead. The override exists as insurance against a future
   `next/image` addition landing on a still-vulnerable resolved version — if
   `npm ls sharp` ever shows `<0.35.0` again, check whether the override got
   dropped during a dependency bump rather than assuming Next fixed it
   upstream.
9. **`nanoid` and `postcss` are also pinned via `"overrides"` — both are
   genuine `dependencies`-scope transitives of `next` itself, not of the
   already-handled `shadcn`/dev tree.** `next@16.2.12` bundles its own
   `postcss@8.4.31`, which pulls `nanoid@3.3.17` — both vulnerable
   (`CVE-2026-67213` for nanoid, several CVEs up to `CVE-2026-69153` for
   postcss). GitHub's nanoid advisory is easy to misread: it lists two
   separate `vulnerable_version_range` entries (`>=4.0.0,<5.1.6` and
   `<3.3.18`), and reading only the first one makes an installed `3.3.17`
   look out-of-range and safe when it is actually caught by the second.
   Fixed via `"overrides": { "nanoid": ">=3.3.18", "postcss": ">=8.5.23" }`
   — confirmed with `npm ls nanoid postcss` (resolves to `6.0.1`/`8.5.26`)
   and `npm audit --omit=dev` (0 vulnerabilities). If either regresses below
   its threshold on a future bump, check the overrides block first.

## Before You Start

Read, in this order, before changing anything:

1. `BUILD.md` / `SPEC.md` in this repo — how the project works and what was
   decided. If both exist, they should not disagree; if they do, that is a
   finding.
2. `../haven-ea/references/ledger/projects/SentiScope.md` — rules this repo has
   already taught, earned from real failures.
3. `../haven-ea/references/ledger/portfolio.md` — cross-repo rules.

Ledger entries are dated. If one names a file, flag, or command, verify it
still exists before acting on it.

When this session learns something that cost real time or shipped a defect,
append it to the ledger via the `lessons` skill. Do not leave it in a session
summary — nothing loads those.
