# Sample Design System

A design system built on [Base UI](https://base-ui.com) primitives, documented in [Storybook](https://storybook.js.org), with a token layer designed to sync to Figma variables.

42 components, 4 foundations pages, 4 full-screen patterns.

**Live Storybook:** [christinevall.github.io/sample-design-system](https://christinevall.github.io/sample-design-system/) — no install needed. It updates on every merge to `main`.

## Stack

- **Vite 8 + React 19 + TypeScript** for the build
- **`@base-ui/react` 1.8.0** for unstyled, accessible primitives
- **CSS Modules + custom properties** for styling, so tokens stay inspectable in the browser and portable to Figma
- **Storybook 10** for documentation, with the docs, a11y and MCP addons

## Getting started

**If you have never run code before, you need exactly two things:**

1. **[Claude Code](https://claude.com/claude-code)** — the desktop app.
2. **[Node.js](https://nodejs.org)** — download the LTS build and run the
   installer. Node 22 or newer (this repo is developed on Node 24). To check
   whether you already have it, open Terminal and type `node -v`.

Then download this repository (green **Code** button → **Download ZIP**),
unzip it, open the folder in Claude Code, and say:

> Show me Storybook

Claude installs the dependencies and starts it for you. To run the health
check on this system, say:

> Run the design system inspection

The inspection skill already ships inside this repo — nothing to install.

### Or, from the terminal

```bash
npm install
npm run storybook   # http://localhost:6001  <- the real workspace
npm run dev         # http://localhost:5173  <- scratch playground
npm run build       # tokens + typecheck + production build
npm run build:tokens # regenerate the CSS token layer from tokens/
npm run build-storybook
npm run check:contrast # colour contrast of every token pair
```

Open **Getting started** in the Storybook sidebar first.

## How it is organised

```
tokens/                SOURCE OF TRUTH for design decisions (DTCG JSON)
  tier-1-definitions/  raw ramps and scales, themeless
  tier-2-usage/        roles, themed light/dark, plus composite text styles
scripts/
  build-tokens.mjs     Style Dictionary build: tokens/ -> src/tokens/
src/
  tokens/              GENERATED — do not edit
    primitives.css     from tier-1-definitions/
    semantic.css       from tier-2-usage/, light and dark blocks
    breakpoints.ts     breakpoints as values, for media queries and viewports
    base.css           imports the generated CSS, plus a minimal reset
  components/          42 components, one folder each
  foundations/         Colour, Typography, Space and shape, Motion
  patterns/            Settings page, Sign-up form, Data table, App shell
  index.ts             the public surface of the library
CLAUDE.md              the rails: ground before writing, then the rules
docs/
  architecture.md      why the repo is shaped this way
  conventions.md       how to add a component
  branching.md         the Gitflow variant, including the design branch
```

### The two token tiers

**Edit `tokens/**/*.json`, then run `npm run build:tokens`.** The CSS is output.

Tier 1 is the raw material: `--sds-color-brand-600`, `--sds-space-4`. Nothing in a component may reference a tier-1 colour.

Tier 2 is the contract, organised into three categories — `--sds-color-background-*`, `--sds-color-content-*`, `--sds-color-border-*` — plus `--sds-typography-heading-lg-font-size` and friends. Components use only these. Theming means redefining tier 2, never touching tier 1 or components.

That separation is also what makes the Figma sync work. Tier-2 names map one-to-one to Figma variables, the light and dark files map to Figma variable modes, and the `var()` references map to Figma variable aliases.

Flip the theme in the Storybook toolbar to see it.

**Breakpoints are emitted twice**, to CSS and to TypeScript, because `@media (min-width: var(--x))` is not valid CSS. Storybook viewports are generated from the TypeScript so they cannot drift from the tokens.

## Adding a component

See [docs/conventions.md](docs/conventions.md). The short version:

1. If Base UI has a primitive, wrap it. Never rebuild focus management or ARIA.
2. Read the primitive's types and Base UI's own reference demo before writing. Not from memory.
3. Semantic tokens only. No raw hex, no primitive colours.
4. Style from Base UI's `data-` state attributes, not from React state.
5. A story per meaningful state, disabled included, and a clean a11y panel in both themes.

## Roadmap

- [x] Base UI + Storybook, token layer, 42 components, foundations and patterns
- [x] On GitHub with the branch model documented
- [ ] Semantic scale tokens for space, radius and type, so density theming is possible without editing primitives
- [x] Move tokens to a DTCG source of truth (`tokens/**/*.json`) with a generator emitting the CSS
- [x] Sync tokens to Figma variables (mirrored 2026-09-10 through the Figma Console bridge)
- [ ] Code Connect mappings so Figma components point at these files
- [x] Publish Storybook from `main` (GitHub Pages)
- [ ] Publish Storybook per branch, including `design`

## Branching

See [docs/branching.md](docs/branching.md). `main` is the design system; changes land on it through `feature/*` pull requests. `design` exists as a long-lived branch for designers to prototype in real code, and accepted prototypes come back through a normal feature branch rather than merging `design` directly.

## Credits

The design system health check in `.claude/skills/ds-inspection/` is the
`ds-inspection` skill by **[Brad Frost](https://bradfrost.com)**, from
<https://github.com/bradfrost/skills>, bundled here under the MIT licence so
that it runs with no setup. See
[`.claude/skills/ds-inspection/ATTRIBUTION.md`](.claude/skills/ds-inspection/ATTRIBUTION.md).
