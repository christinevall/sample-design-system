# Sample Design System

A small, deliberately readable design system built on [Base UI](https://base-ui.com) primitives, documented in [Storybook](https://storybook.js.org), with a token layer designed to sync to Figma variables later.

## Stack

- **Vite + React 19 + TypeScript** for the build
- **Base UI 1.0** for unstyled, accessible primitives
- **CSS Modules + custom properties** for styling, so tokens stay inspectable in the browser and portable to Figma
- **Storybook 10** for documentation, with the a11y and docs addons

## Getting started

```bash
npm install
npm run storybook   # http://localhost:6006  <- the real workspace
npm run dev         # http://localhost:5173  <- scratch playground
npm run build       # typecheck + production build
npm run build-storybook
```

## How it is organised

```
src/
  tokens/
    primitives.css   raw palette and scales, referenced by nothing but semantic.css
    semantic.css     the layer components use, redefined per theme
    base.css         imports both, plus a minimal reset
  components/
    Button/          Component.tsx, Component.module.css, Component.stories.tsx, index.ts
    TextField/
    Switch/
    Dialog/
  foundations/
    Tokens.stories.tsx   renders the semantic layer as swatches
  index.ts           the public surface of the library
docs/
  branching.md       the Gitflow variant, including the design branch
```

### The two token layers

Primitives are the raw material: `--sds-brand-600`, `--sds-space-4`. Nothing in a component may reference them.

Semantic tokens are the contract: `--sds-color-accent`, `--sds-color-text-muted`. Components use only these. Theming means redefining semantic tokens, never touching primitives or components.

That separation is also what makes the Figma sync work. Semantic token names map one-to-one to Figma variables, and the light/dark blocks map to Figma variable modes.

Switch theme in the Storybook toolbar to see it.

## Adding a component

1. Check Base UI has a primitive for it. If it does, wrap it rather than rebuilding the behaviour.
2. `src/components/Thing/Thing.tsx` plus `Thing.module.css` using only semantic tokens.
3. `Thing.stories.tsx` with `tags: ['autodocs']` and a story per meaningful state.
4. Export from `src/index.ts`.
5. Check the a11y panel is clean in both themes.

## Roadmap

- [x] Base UI + Storybook, token layer, first four components
- [ ] Push to GitHub, protect `main` and `develop`, create the `design` branch
- [ ] Move tokens to a DTCG `tokens.json` source of truth with a generator that emits `primitives.css` and `semantic.css`
- [ ] Sync tokens to Figma variables over the Figma MCP
- [ ] Code Connect mappings so Figma components point at these files
- [ ] Publish Storybook per branch, including `design`

## Branching

See [docs/branching.md](docs/branching.md). Short version: `main` is released, `develop` is integration, `design` is a designer playground whose accepted ideas come back through a normal feature branch rather than a merge.
