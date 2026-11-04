# SentiScope

A client-side feedback-analysis dashboard. Drop a `.txt` or `.csv` file of
customer comments into the browser and get a sentiment breakdown
(Positive / Neutral / Negative) plus the top keyword themes, shown as cards and
charts. It is a single-page Next.js app with no backend, database or auth: all
parsing and scoring happens in the browser (`CLAUDE.md` "What this is"). The
GitHub description reads: "A tool that takes raw customer feedback ... and turns
it into something useful for a business."

> Last verified 2026-11-04 against `5276584`, clean tree on `main`.

## Status

**Live; maintenance only; reads as a portfolio or demo piece.** Deployed at
<https://sentiscop3.vercel.app> (HTTP 200 on `/`, 404 on `/zzz-nonexistent`,
checked 2026-11-04). The last commits are dependency bumps and a lint fix
(`git log`: `5276584`, `e83099c`, `9cf8eb9`, 2026-11-02). The "portfolio piece"
reading comes from `CLAUDE.md`; no document records an intended audience
([MISSION.md](MISSION.md)).

## Quick start

```bash
npm install
npm run dev     # next dev
npm run build   # next build (Turbopack); needs internet for the Google font
npm run start   # serve the build
npm run lint    # eslint, flat config
```

All four scripts are from `package.json`. There is no test script and no test
suite.

## Where everything lives

| Question | File |
|---|---|
| Why does this exist? | [MISSION.md](MISSION.md) |
| What could it become? Open questions for Ian | [VISION.md](VISION.md) |
| What is open: bugs, deps, docs drift | [BACKLOG.md](BACKLOG.md) |
| How to report an issue | [SECURITY.md](SECURITY.md) |
| How it is built | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Agent rules, line-number map of `Dashboard.tsx`, gotchas | [CLAUDE.md](CLAUDE.md) |
| Dependency decisions (DEP-1, DEP-2) | [DEPENDENCIES.md](DEPENDENCIES.md) |

## Traps for a cold start

1. **The root-level Python files are not part of the app.** `analyzer.py` and
   `analyzer(demo w streamlit).py` are an earlier prototype of the same idea,
   with no declared dependencies and a header-less `feedback.csv` that breaks
   them (CLAUDE.md "Running, building, testing").
2. **Do not bump ESLint to 10.** `eslint-config-next` bundles an
   `eslint-plugin-react` that crashes under it; Dependabot is told to ignore it
   (DEPENDENCIES.md DEP-2).
3. **The build needs network access** for `next/font/google`. An offline build
   failure is the environment, not the code.
4. **Keep `shadcn` in `devDependencies`** and leave the `overrides` block alone
   (CLAUDE.md Gotchas 7 to 9).
