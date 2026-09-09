# Contributing

Read [docs/branching.md](docs/branching.md) first. It explains `main`, `develop` and the `design` branch.

## For engineers

Branch from `develop` as `feature/*` or `fix/*`. Every component change needs a story per meaningful state and a clean a11y panel in both themes. Use Conventional Commits. Open a PR into `develop`.

## For designers

`design` is yours. Branch from it, or commit to it directly if that is easier.

```bash
git checkout design
git pull
npm install
npm run storybook
```

Try things. Change token values in `src/tokens/semantic.css` and watch every component move. Sketch a new component in `src/components/`. Nothing here has to be finished or correct.

When something is worth keeping, say so in the PR or in the issue. An engineer will bring it across to `develop` on a feature branch with the stories, docs and accessibility work attached. Do not merge `design` into `develop` yourself.

## Rules of thumb

- Components use semantic tokens only, never primitives, never raw hex values.
- If Base UI has a primitive, wrap it rather than rebuilding the behaviour.
- New semantic token means adding it to both the light and dark blocks.
