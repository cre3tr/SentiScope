# Mission: why SentiScope exists

> Last verified 2026-11-04 against `5276584`. Each claim names its source. A
> claim with no source is marked as inference.

## What it is for

SentiScope turns a file of raw customer comments (survey answers, reviews,
support tickets) into a sentiment breakdown and a short list of recurring
themes, so a business owner can see at a glance what customers are saying
[HIGH]. Sources: the GitHub repository description, `CLAUDE.md` "What this is".

## Why it exists, as far as the record says

**Not on record** [UNKNOWN]. Checked: `CLAUDE.md`, `DEPENDENCIES.md`,
`../haven-ea/context/repo-map.md` (row `SentiScope`),
`../haven-ea/context/goals.md`, `../haven-ea/decisions/log.md` and
`../haven-ea/context/MEMORY-EXPORT.md`. The repo-map row describes the product
and repeats `CLAUDE.md`; none of these files names a venture, a buyer, a user
or a reason. There is no `projects/` entry and no ledger file for it.

What the record does say:

- `CLAUDE.md` reads it as "a portfolio/demo piece ... rather than a production
  SaaS tool", on the evidence of polished UI and no persistence layer. That is
  an agent's reading of the code, not a statement from Ian [MEDIUM].
- The Python files show it began as a CLI and Streamlit prototype and was
  reimplemented in TypeScript for the browser (`CLAUDE.md`).

## Where it sits in the portfolio

Outside the 2026-07-28 triage that named two repos as sale candidates
(`../haven-ea/decisions/log.md`). It is not listed under a venture in
`repo-map.md`. Nothing ties it to Cartman Systems' pipeline.

## Who it serves

Anyone with a text or CSV export of comments. Whether anyone other than its
author has used it is `[UNKNOWN]`: the app has no analytics and no backend, so
it records no use.
