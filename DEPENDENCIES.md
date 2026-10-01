# Dependency decisions

Decisions only: pins, overrides, deferrals, majors. Routine patch/minor bumps
are recorded by their commit messages.

## DEP-2: eslint stays on 9 — blocked by eslint-config-next's nested eslint-plugin-react — 2026-10-01

**Context:** Dependabot PR #6 (eslint 9.39.5 → 10.11.0) had a **green**
Vercel preview, but `next build` never runs lint. Run under 10.11.0,
`npx eslint .` crashes and exits 2:
`TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function`.
The crash comes from `eslint-config-next@16.3.6` → nested
`eslint-plugin-react@7.37.5`, the latest release. That plugin peers
`eslint ≤ ^9.7` and calls `context.getFilename()`, which eslint 10 removed.
It's the same blocker as Huduma-Q's DEP-4. There it surfaces as an
install-time ERESOLVE, because the plugin is a direct dependency. Here it
surfaces only when lint runs.
**Decision:** Stay on eslint 9.39.5 (install reverted). A scoped Dependabot
`ignore` holds eslint `>=10.0.0`. PR #6 is closed.
**Recheck trigger:** an `eslint-config-next` release whose nested
`eslint-plugin-react` supports eslint 10. Check it by running `npx eslint .`
under eslint 10. **A green preview is not the check.**
**Verified on:** main — see the commit adding this entry. Lint is unchanged on
eslint 9 (3 pre-existing problems).
**Confidence:** HIGH — the crash was reproduced, and the stack trace names the
nested plugin.

## DEP-1: @types/node — 2026-10-01

**Context:** The manifest declared `^25.6.0` (25.9.5 installed), and Dependabot
PR #7 proposed 26.6.3. The Vercel project `senti-scope` runs **Node 24.x**
(`nodeVersion`, read from the Vercel project API). So the types were already a
major ahead of the runtime, and they would type-check Node 25/26 APIs that
production does not have.
**Decision:** Pin `@types/node` to `^24.19.0`, matching the runtime major. A
scoped Dependabot `ignore` on `>=25.0.0` holds it. PR #7 is closed, not merged.
This follows WebPulse DEP-4.
**Consequences:** No source change was needed (build and type-check pass on the
24 types). **Removal trigger:** the Vercel project's Node version moves to
25+. Bump the pin and the ignore range together.
**Verified on:** main — see the commit that adds this entry; Vercel production
status read after push.
**Confidence:** HIGH — runtime version read from the platform, not inferred.
