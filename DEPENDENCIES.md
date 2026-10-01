# Dependency decisions

Decisions only: pins, overrides, deferrals, majors. Routine patch/minor bumps
are recorded by their commit messages.

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
