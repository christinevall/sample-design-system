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
| **Figma name = token path**, `.` → `/` | One rule, no exceptions: `color.background.accent` is `color/background/accent`. It is what the round-trip name check will test |
| **WEB code syntax on every variable** | Dev Mode shows `var(--sds-…)`, not hex, so a Figma selection points straight back at code |
| **Inter + Roboto Mono in Figma** | Code names no font — a system stack. CLAUDE.md forbids new dependencies, so code keeps the stack and Figma uses stand-ins, documented on each variable |
| **Composite type as resolved-px variables** | `typography/<style>/line-height` holds pixels (24 × 1.2 = 28.8) with code syntax pointing at the real CSS variable, so all five properties of every text style are bound. Renders identically; does not follow a font-size change on its own |
| **Figma properties use the code's names** | `variant=primary`, `size=md`, `disabled=false`, text property `children` — not Figma's usual `Size=Medium`. A frame coming back resolves to the component that already exists |
| **Code parts become boolean properties named after them** | `Card.Header`, `Card.Description`, `Card.Footer`, so a Figma instance says which parts to render |
| **Components are built from the stylesheet** | A parser maps each declaration in `*.module.css` through the naming contract to a variable, or flags it as raw. Nothing is transcribed by hand |
| **Prototype docs are generated from their own source** | A real `Card` and a hand-rolled `<div>` render identically, so a designer cannot audit composition in the browser. Each prototype story reads its own file (`?raw`) and derives "Show code" and a *Components used* table from it (`src/patterns/prototypeDocs.ts`) |
| **Components take type from text styles** (2026-09-10) | 55 of 102 component text rules matched no text style. Added five roles that already existed in practice — `caption`, `label-lg`, `label-xl`, `title-sm`, `title-md` (8 → 13 styles) — and snapped 24 near-misses to existing styles (form labels to `label-md`, dialog titles to `heading-xl`, small badge/avatar and group labels to `label-sm`). `validate` rule `raw-type-in-component` now flags a hand-set size, line height or letter spacing. This is what lets Figma bind text styles instead of loose variables |
| **Text-style structure follows Eddie; names and sizes stay ours** (2026-09-10) | Compared against Brad's `eddie-design-tokens`. Adopted: a style carries six properties including `text-transform` (maps to Case in Figma), so the uppercase group labels became a style (`overline`) instead of a one-off rule; a style is applied whole (`validate` rule `text-style-split`, the no-SCSS equivalent of his mixin); every style has a when-to-use `$description`; breakpoints are named and described by width, not device. Kept ours: t-shirt scale names, ratio line heights, breakpoints as tokens, two tiers |
| **One name per concept, before Figma** (2026-09-10) | Names cross into Figma as property names, so they are fixed while nothing consumes them. Meter's `tone` became `variant`, like every other colour choice. Kept apart on purpose: Alert's `info` is a *status*, Badge's `accent` is *emphasis* — merging them loses the meaning. Toggle's `iconOnly` and `IconButton` stay separate components, because a Toggle holds a pressed state |
| **Two long-lived branches, not three** (2026-09-10) | `main` is the system, `design` the playground, `feature/*` in between. `develop` was a team-sized layer that a solo maintainer and a class of students do not need. The repo becomes a GitHub template so each student gets both branches. `design` stays one-way — that rule is the lesson |
| **Page CSS lays out; it does not draw** | `validate` rule `surface-in-page`: a background, border, shadow or radius in pattern CSS is usually a component rebuilt from divs. Known gaps opt out in place with `/* validate-allow: surface — reason */`, so every exception carries its reason |

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

**9. Figma reads a bound line-height variable as pixels.**
Tested rather than assumed: a line-height variable of `150` bound to a 20px
text layer turned its line height into 150px and grew the layer from 24px to
150px tall. Letter-spacing `2` became 2px. Code expresses both relatively (`1.2`, `-0.01em`), so
they cannot be Figma variables without silently changing meaning. They are the
one part of the type system that can be mirrored by value but not by binding.

**10. A font stack cannot be mirrored.**
The code names no font — `ui-sans-serif, system-ui, …` — which is a deliberate
"whatever the OS has". Figma needs one family. Any choice is a stand-in, and on
a Mac Storybook renders SF Pro while Figma shows Inter, so text widths differ
slightly across the round trip. Naming a real font in code would close this,
at the cost of a font dependency.

**11. Effect styles have no modes, but their colours can.**
Shadows are composite, so they cannot be variables, and effect styles cannot
switch between Light and Dark. The geometry of each shadow is identical in both
themes in code; only the alpha changes. So each effect style's colour is bound
to a Light/Dark colour variable, and the shadow follows the theme. Those three
colour variables are Figma-only, and deliberately carry no code syntax, since
there is no CSS variable for a shadow's colour alone.

**12. Figma's default variant is the top-left one, not the first layer.**
Moving the intended default to the first or last layer changed nothing. Figma
takes the variant at the top-left of the grid. So the grid itself has to start
at the code's defaults — Button's rows begin at `md`, not `sm` — which reads
oddly until you know why.

**13. CSS `border-box` and Figma strokes disagree by 2px.**
In CSS a 1px border counts toward the element's size; a Figma stroke drawn
inside does not, by default. Every bordered component came out 2px narrower
than in Storybook. "Include stroke in layout" (`strokesIncludedInLayout`)
makes them match — including Button's `1px solid transparent` border, which
has to exist in Figma as an invisible stroke to keep the widths honest.

**14. CSS sibling selectors have no Figma equivalent.**
`.header + .body` gives the card body 8px of top padding only when a header
precedes it. Figma cannot express "depends on the previous sibling", so the
default composition is exact and the header-hidden case is 4px tighter than
code. Documented on the component rather than hidden.

**15. Built from the stylesheet, the audit came back clean.**
Badge, Button and Card were built by parsing their CSS modules through the
naming contract, not by reading them and retyping. An audit of the live file
found zero unbound fills, strokes, paddings, radii or type properties across
Badge (21 layers) and Button (49 layers). The only raw values are the ones the
CSS itself has raw: min-heights, the 1px border, disabled opacity.

**16. A designer cannot see component usage in the browser.**
Reviewing the first code prototype, the designer concluded it "used tokens,
not components" and had reinvented the Card. It had not — the card carried
Card's own classes — but nothing in Storybook could show that: "Show code"
printed `<BlogIndex />`. The complaint was right about the tooling even where
it was wrong about the code. Fixed by generating the composition from source.

**17. The checker never looked where the drift was.**
`validate` scanned `src/` only. The Storybook preview wrapper still referenced
`--sds-color-bg` and `--sds-color-text`, deleted in the colour rename, so every
story rendered un-themed. Widening the scan to `.storybook/` caught both on its
first run. A guardrail is only as good as its file list.

**18. Figma was faithful to a gap in code.**
The designer asked why library components use type *variables* rather than
text styles. Because the code does: 0 of 43 component stylesheets use
`--sds-typography-*`; all set size, weight and line height separately. The text
styles were defined and never adopted. Mirroring was correct; the fix is in code.

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

Branch `feature/ai-foundation`, off `main` (identical to the retired `develop`),
pushed. Merging into `main` by pull request.

Done: render-loop fix, manifest fix (29→8 errors), DTCG token pipeline, text
styles, breakpoints, Brad-standard colour naming, `CLAUDE.md` grounding rules,
`validate.mjs` (reports clean), docs corrected.

Figma foundations mirrored (2026-09-10), file
[sample-design-system](https://www.figma.com/design/PvLNUW3xI3A9kTumVi7O3d/sample-design-system):
5 collections — Color Primitives, Color (Light/Dark), Size, Typography, Motion —
plus 8 text styles and 3 effect styles. Built from `tokens/*.json` by a
generator, not retyped by hand. Pages: Cover, Foundations (every swatch, bar
and specimen bound), then Badge (10 variants), Button (24) and Card (2, with
real Button instances in its footer).

Next: publish to Chromatic → Foundations page for text styles and breakpoints →
Figma library from the manifest → name check in
`validate.mjs` → first round-trip test.

**Figma (2026-09-10):** connected through the Figma Console bridge. The library
now has 8 components — Alert, Avatar, Badge, Breadcrumb, Button, Card,
NavigationMenu, Separator — each built from its stylesheet, with property
names taken from the code. Publishing the library is manual: the plugin API
cannot publish.

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
