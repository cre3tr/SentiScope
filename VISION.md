# Vision: what SentiScope could become

> Last verified 2026-11-04 against `5276584`. **Everything in "Proposed
> directions" is a suggestion by an agent, not a decision.** Ian decides. When
> he answers the questions below, record each answer and its date under
> "Decided", and leave the proposals as history.

## Decided

Nothing about direction is on record. Checked: `CLAUDE.md`,
`DEPENDENCIES.md`, `../haven-ea/decisions/log.md`. The decisions that do exist
are dependency ones: ESLint stays on 9, and `@types/node` tracks the Vercel
runtime (`DEPENDENCIES.md` DEP-1, DEP-2).

## Proposed directions (suggestions, not decisions)

1. **Treat it as a finished demo and keep it cheap (suggestion, recommended).**
   It works as described, has no backend, and costs a few dependency bumps a
   month. Add a short "what this is" line to the page if it is shown to anyone.
2. **Use it as a Cartman prospecting aid (alternative).** A business with a
   pile of customer comments is a possible conversation opener, the way a
   WebPulse finding is. This would make it a small piece of the pipeline and is
   a strategy call, not an engineering one.
3. **Remove the Python prototype (alternative).** `analyzer.py` and the
   Streamlit file do not run as shipped and are not used by the app. Deleting
   them, or moving them to a `prototype/` folder with a `requirements.txt`,
   would end a recurring trap.
4. **Retire it (alternative).** Archive the repo and take the site down, as
   done for other demos, if no one needs it.

## Questions for Ian

1. **What is SentiScope for?** A portfolio piece, a prospecting aid, or just a
   finished experiment? Everything else follows.
2. Is it fine for this repo to stay public? It carries two tracked sample
   files and prototype code; nothing sensitive was found in the files read.
3. Should the Python prototype stay?

## Critique (agent's view, offered as pushback)

- **The sentiment engine is a word list.** `src/lib/analyzer.ts` scores each
  comment with the `sentiment` npm package (a lexicon, `[MEDIUM]`: not read in
  this pass) and classes it by a `comparative` threshold of plus or minus 0.05. That is a fast, transparent method, and it will misread
  sarcasm, negation and any language other than English. The page does not say
  so. A business acting on the percentages would be trusting a crude score.
- **"Top themes" are the five most frequent non-stopwords.** They are word
  counts, not themes, and there is a bug in the counting (BACKLOG.md).
- **No test covers the one function that is the product.** `analyzeFeedback()`
  has no test and the repo has no test runner (`CLAUDE.md`).
- **Two implementations of the same logic** (Python and TypeScript) with no
  shared code is already one more than a demo needs.
