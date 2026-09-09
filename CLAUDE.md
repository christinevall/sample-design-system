# Working in this repo

## STOP — ground yourself first

**Before writing or changing any UI in this repo, check what actually exists. This session. Not from memory, not from an earlier session.**

Three sources of truth, in this order:

| Question | Where the answer is |
| --- | --- |
| What components exist, with what props, defaults and stories? | `storybook-static/manifests/components.json` — run `npm run build-storybook` if absent |
| What tokens exist? | `tokens/tier-1-definitions/` and `tokens/tier-2-usage/` |
| How is a component actually used? | its `*.stories.tsx`, and `src/patterns/` for full screens |

The manifest is generated from source, so it cannot be out of date. It is the answer to "does this component have a `variant` prop" — never guess, and never infer a prop from another component that looks similar.

If you cannot read those files, say so and stop. Do not fall back to writing from memory. A wrong answer that looks confident is the failure mode this file exists to prevent.

**One caveat the manifest will not tell you.** It documents *our* additions. Most components are thin wrappers around Base UI, and Base UI's own props come from `node_modules/@base-ui/react/<part>/index.d.ts`. If a component's manifest entry lists few or no props, that is not a component without an API — read the Base UI types too.

## The rules

1. **Semantic tokens only.** Components may use `--sds-color-*`, `--sds-space-*`, `--sds-radius-*`, `--sds-font-*`, `--sds-text-*`, `--sds-shadow-*`, `--sds-elevation-*`, `--sds-duration-*`, `--sds-easing-*`. Never a primitive (`--sds-brand-600`), never a raw hex, never a magic pixel where a token exists.
2. **Wrap, do not rebuild.** If Base UI ships a primitive, wrap it. Never reimplement focus management, keyboard handling or ARIA.
3. **Compose downward.** Reach for a pattern in `src/patterns/` first, then a component, then a primitive. Building a card out of divs when `Card` exists is the most common failure here.
4. **Never edit generated files.** `src/tokens/primitives.css`, `src/tokens/semantic.css` and `src/tokens/breakpoints.ts` are build output. Edit `tokens/**/*.json` and run `npm run build:tokens`. Each generated file says so in its header.
5. **Do not add dependencies.** No component library, no icon package, no CSS framework. Icons are inline SVG.

## Two tiers of component

The distinction matters when deciding what to change:

- **Base UI wrappers** — most of the 42. Behaviour belongs to Base UI; we own styling and the token contract.
- **Composed** — `Card`, `Table`, `Badge`, `Alert`, `Spinner`, `Breadcrumb`, `IconButton`. No Base UI primitive to wrap because they carry no interaction logic. We own these outright.

## After you change UI

Check the rendered result, not just the code:

```bash
npm run build:tokens     # if you touched tokens/
npx tsc -b --noEmit      # must be zero errors
npm run lint
npm run build-storybook  # also regenerates the manifest
```

Then look at the story in a browser. Markup that compiles and renders nothing still counts as broken.

## Branching

`docs/branching.md` is authoritative. Short version: `feature/*` off `develop`, merges back to `develop`. `design` is the designer playground and is a source of decisions, not a source of merges — accepted prototypes get rebuilt on a `feature/*` branch.

## Further reading

- `docs/architecture.md` — why the repo is shaped this way
- `docs/conventions.md` — how to add a component
- `docs/branching.md` — the branch model
