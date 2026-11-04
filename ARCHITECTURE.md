# Architecture

> Last verified 2026-11-04 against `5276584`. Versions are deliberately left
> out. Read them from `package-lock.json`. Line-number map of
> `Dashboard.tsx` and gotchas: [CLAUDE.md](CLAUDE.md).

## Shape

One static-feeling Next.js App Router app with a single route (`/`) and no
server code: no `src/pages/`, no `src/app/api/`, no server actions
(CLAUDE.md "Directory layout"). A file the user picks never leaves the browser.

```
Browser ──► Vercel (default Next.js hosting, no vercel.json)
              └─► / (src/app/page.tsx)  ──► <Dashboard/> (client component)
                      file input / drag-drop
                         └─► FileReader.readAsText ──► .csv: PapaParse | .txt: split lines
                                └─► analyzeFeedback(comments)  (src/lib/analyzer.ts)
                                       └─► state ──► Recharts pie + bar, Progress bars
```

## Components

| Part | Where | Role |
|---|---|---|
| Root layout | `src/app/layout.tsx` | font, theme provider, metadata |
| Page | `src/app/page.tsx` | header plus `<Dashboard/>` |
| Dashboard | `src/components/dashboard/Dashboard.tsx` | upload, parse, analyze, chart; the only large file |
| Analyzer | `src/lib/analyzer.ts` | the product: sentiment scoring and keyword counts |
| UI primitives | `src/components/ui/` | shadcn `button`, `card`, `progress` |
| Theme | `src/components/theme-provider.tsx`, `theme-toggle.tsx` | light/dark via next-themes |
| Prototype (not wired in) | `analyzer.py`, `analyzer(demo w streamlit).py`, `feedback.*` | earlier Python version of the same idea |

## Data flow

1. The user drops or selects a `.txt` or `.csv` file; only those extensions are
   accepted.
2. For `.csv`, PapaParse reads a header row and picks the first column whose name
   contains "comment" or "feedback", case-insensitive. For `.txt`, each non-blank
   line is a comment.
3. `analyzeFeedback()` scores each comment with the `sentiment` package, classes
   it Positive, Neutral or Negative on a comparative-score threshold, counts
   lowercase words of four or more letters that are not stop words, and returns
   percentages plus the top five words.
4. `Dashboard` holds the result in React state and renders it. Nothing is stored
   or sent anywhere.

## Runtime external dependencies

| Dependency | Used for | If it goes away |
|---|---|---|
| Vercel | hosting | site down |
| `fonts.googleapis.com` | Plus Jakarta Sans, fetched at **build** time by `next/font/google` | build fails; the running site is unaffected |

There are no runtime API calls from the app. No PAL is needed.

## Decisions

No ADRs. Dependency decisions: [DEPENDENCIES.md](DEPENDENCIES.md) (DEP-1:
`@types/node` tracks the runtime; DEP-2: ESLint stays on 9). The override pins
for `sharp`, `nanoid` and `postcss` and the `shadcn` placement are explained in
CLAUDE.md Gotchas 7 to 9.
