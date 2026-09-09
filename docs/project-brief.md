# Project brief — AI + design system workflows

Carry-over context for any session working in this repo, and the raw material
for writing about it. Started 2026-09-09.

## What this project is

A deliberately small, deliberately real design system used to test **how
designers and AI can work together on a real codebase without drift**, and to
teach that workflow. It is not a product. Every decision optimises for
*legible and demonstrable*, not for scale.

Christine Vallaure — founder of moonlearning.io, trains designers in
design-to-code, Figma and AI workflows. The audience for this repo is
designers learning to prototype against real components.

## The thesis being tested

Prototyping with only a codebase and an LLM is a **drift guarantee**. With the
right guardrails, you can mix code and Figma creatively:

```
research (Miro) → prototype in code on `design` → push to Figma
  → design freely there → push back as a prototype made of components
  that already exist → hand off → production code on a feature branch
```

Figma is **not** the source of truth. Code is. Figma is an exploration surface
fed by code — a sketchpad that speaks the system's vocabulary.

## Decisions made, and why

| Decision | Reason |
| --- | --- |
| **JSON is the token source of truth**, CSS is generated | One file per design decision, and the same file maps to Figma variables |
| **DTCG format** (`$value`/`$type`) | The actual W3C standard; Brad's Eddie uses the older `value`/`type` form |
| **Two tiers, not three** | Eddie has a component tier; 42 components need none yet. Documented as the extension point |
| **Brad's `background`/`content`/`border`** colour categories | The role colours are genuinely multi-role — `accent` was used 17× as content, 15× as background, 9× as a border under one name that carried no intent |
| **No Code Connect** | A per-component binding file, maintained by hand, Figma-proprietary, rots when either side changes. A second sync surface |
| **Component contracts instead** | The manifest already publishes the contract. Generate the Figma library from it and names match *by construction* — nothing to bind |
| **Validate is warn-only** | It must never block a designer mid-prototype. `--strict` exists for CI |
| **No Steel Curtain** (Brad's station 8) | Explicitly out of scope. This is a teaching instrument, not a team shipping to production |
| **Chromatic for publishing** | Per-branch deploys, which is what `docs/branching.md` already promises for `design` |
| **`design` is one-way** | A source of decisions, not a source of merges. Accepted prototypes get rebuilt on `feature/*` |

## Findings worth writing about

Ordered roughly by how much they'd surprise a reader.

**1. A design system is only as groundable as its metadata.**
`storybook-static/manifests/components.json` is what an agent should read
instead of guessing. Ours was **42% usable** — 29 of 50 entries errored. Every
compound component was `export const X = { Root, ... }`, a plain object
Storybook cannot resolve through. So an agent grounding against a carefully
built system got real data for `Button` and an error for `Card`, then guessed.
Fix was `Object.assign(Root, { Root, ... })`. Errors went 29 → 8, and the 8 are
Foundations and Patterns pages, which document no single component.

**2. Stale docs are drift with a signature on it.**
`conventions.md` instructed authors to export compound components as a plain
object literal — precisely what dropped them from the manifest. The rules file
was actively teaching the failure. `architecture.md` claimed Base UI
`1.0.0-rc.0` while its own gotchas section said `1.8.0`.

**3. Verification catches what looks fine.**
Style Dictionary's default `css` transform group silently broke three things:
re-quoted font stacks (`"SF Mono"` → `'"SF Mono"'`), collapsed
`rgb(0 0 0 / 0.4)` to `#000000` — dropping every overlay's alpha — and
flattened semantic tokens to literal hex, destroying the tier-1→tier-2
indirection that a Figma variable *alias* maps onto. All three were invisible
until the generated CSS was diffed against the originals.

**4. A checker that cries wolf gets switched off.**
First validate run: 259 findings, **257 of them noise**. It flagged the raw
type scale that the rules explicitly permit, and read `'Build #482'` and
`href="#ada"` as hex colours. Tuning it down to the 2 real findings was more
work than writing it.

**5. An AI-written helper that looked correct hung the browser.**
`useResolved` in `foundations/tokenTable.tsx` had a `useEffect` with no
dependency array storing a fresh object each render — an infinite loop that
flooded 18,000 console errors and froze the tab. It read as perfectly
reasonable code. Every Foundations page was affected: the exact pages
designers open first.

**6. The property does not decide the category.**
When splitting colours into background/content/border, the obvious rule — use
the CSS property — is wrong. A popover arrow is `fill: background-surface`
because it paints the popup's *surface*. A switch thumb is
`background-on-accent` because it's a surface sitting *on* an accent fill.
18 usages crossed categories. Tokens with an intrinsic category keep it; only
the role colours take one from the property.

**7. The discipline was already good, which is the point.**
42 components, **zero raw hex**, and only 2 tier-1 violations in the whole
library. Guardrails here catch a slow leak, not a flood. That's the argument
for warn-only.

**8. Storybook MCP is not what it sounds like.**
`@storybook/addon-mcp` ships exactly one tool, `preview-stories`, and describes
itself as helping agents *write and test stories*. It is not a queryable
catalog and it is not an `eddie-brain` equivalent. It also serves from the dev
server, so a published static build does not provide it. The catalog value is
in `manifests/components.json`, which a static build *does* contain.

## Brad Frost's model, and what we took

Source: "Keep AI on the Rails of Your Design System", part of
[aianddesign.systems](https://aianddesign.systems). Nine stations, each forcing
a check against live machine-readable truth. His footnote is the whole idea:
*not one station trusts the model to remember the design system.*

Taken: stations 1–7 (ground, rules, consult, compose, validate, render, human).
Skipped: 8 (the Steel Curtain — CI gauntlet + two-axis eval), 9 (merge gate),
the telemetry loop, the bfw-process phases, the ten-package monorepo.

Where we differ: Brad had to **build** `eddie-brain` from scratch because Eddie
is custom web components with no introspectable catalog. Storybook generates
ours. And Brad's loop is code→code; ours is code↔Figma, which adds a drift
surface he does not have — **name divergence across the boundary**. Nothing in
his nine stations would catch a variant renamed in Figma.

Brad keeps breakpoints **out** of the token JSON, with a code comment giving the
reason: a CSS custom property cannot be used in a media query, so he uses SCSS
variables. We have no SCSS, so ours emit to TypeScript as well as CSS.

## The LinkedIn debate (2026-09)

Thread under one of Christine's posts, with Liam Cresswell (Product Design
Engineer) and Danilo Cruz.

**Liam's position:** code is already the source of truth, so you can't impose a
new one. Pointing an agent at Figma means re-deriving components from raw
tokens every time — he measured ~20 token decisions for one button versus one
pre-built `button-group.tsx`. Spent ~£1,000 testing it. Also: where does
generated code live, and what stops a second button appearing tomorrow?

**Where he is right:** all of that, for the workflow he is describing.
Assembling UI from raw tokens is expensive and error-prone.

**Where the disagreement dissolves:** he is attacking *Figma as source of
truth*. The proposal is *Figma as an exploration surface generated from code*.
The agent never assembles from tokens — it composes pre-built components, and
the manifest is how it knows which exist and what they accept. The Figma
library is generated from that same manifest, so names match by construction.

**Weakest argument to avoid:** "lots of teams already work in Figma." True, but
it is an adoption argument, not a technical one, and reads as inertia.

## Where we are

Branch `feature/ai-foundation`, off `develop`, pushed. Not yet merged.

Done: render-loop fix, manifest fix (29→8 errors), DTCG token pipeline, text
styles, breakpoints, Brad-standard colour naming, `CLAUDE.md` grounding rules,
`validate.mjs` (reports clean), docs corrected.

Next: publish to Chromatic → Foundations page for text styles and breakpoints →
tokens to Figma variables → Figma library from the manifest → name check in
`validate.mjs` → first round-trip test.

**Blocked:** the Figma MCP server is not authenticated. Nothing in the Figma
half can run until it is connected in claude.ai connector settings.

**Still missing from Base UI 1.8.0:** Drawer and OTP Field.

## Writing this up

Angles that have actually earned their keep, in order of strength:

1. *The guardrails are the work.* Not the prompting, not the model.
2. *Your design system is only as groundable as its metadata* — 42% finding.
3. *Verification catches what review does not* — the three silent Style
   Dictionary breakages, none visible by reading the diff.
4. *Figma is a sketchpad, not a source of truth* — the resolution to the
   LinkedIn argument.
5. *Iterating purely in code converges on generic.* You refine what is on
   screen instead of asking what else it could be. This is the honest case for
   keeping a canvas in the loop, and it is not a technical argument.

Tone note: the interesting material is the failures and the tuning, not the
demo working. Everything in "Findings" above is a thing that looked fine and
was not.
