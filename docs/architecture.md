# Architecture

Why this repo is shaped the way it is. Start here before adding anything.

## Stack

- **Vite 8 + React 19 + TypeScript** for the build
- **Base UI `1.0.0-rc.0`** (`@base-ui/react`) for unstyled, accessible primitives
- **Storybook `10.6.0`** with `@storybook/react-vite`, `addon-docs`, `addon-a11y`, `addon-mcp`
- **CSS Modules + CSS custom properties** for styling. No CSS-in-JS, no Tailwind. Tokens stay inspectable in devtools and portable to Figma.

## Token architecture

Two layers, deliberately separated so the semantic layer can map one-to-one to Figma variables.

`src/tokens/primitives.css` holds raw ramps and scales: `--sds-brand-600`, `--sds-space-4`. Referenced only by `semantic.css`, never by a component.

`src/tokens/semantic.css` holds the contract components use: `--sds-color-accent`, `--sds-color-text-muted`. The light block sits on `:root` and `[data-theme="light"]`, the dark block on `[data-theme="dark"]`. Those two blocks become Figma variable modes.

`src/tokens/base.css` imports both plus a minimal reset.

The rule that makes the whole thing work: components reference semantic tokens only. Never a primitive, never a raw hex value. Theming then means redefining one file, and the Figma sync becomes a name-for-name translation rather than a negotiation.

## Components

42 components across Actions, Forms, Navigation, Overlays, Content, Layout, Display and Feedback. Most wrap a Base UI primitive; Card, Badge, Alert, Table, Spinner and Breadcrumb have no primitive to wrap because they carry no interaction logic.

Each lives in its own folder with `Component.tsx`, `Component.module.css`, `Component.stories.tsx` and `index.ts`. The public surface of the library is `src/index.ts`.

`src/foundations/Tokens.stories.tsx` renders the semantic layer as swatches, so the tokens have a page rather than only a file.

## Gotchas

**The package moved orgs.** `@base-ui-components/react` was abandoned at `1.0.0-rc.0`; the maintained package is `@base-ui/react`, now at 1.8.0. The old name still resolves on npm and looks current, which is a trap. Check the org before trusting a version number.

**Base UI's `ButtonProps` is a union type** (`nativeButton` true and false branches), so `interface X extends React.ComponentPropsWithoutRef<typeof BaseButton>` fails with TS2312. Type the wrapper as `React.ComponentProps<'button'> & { ... }` and pull `render` off the Base UI type separately.

**Install dependencies on the machine you run them on.** npm skips extracting optional platform packages that do not match the current OS, leaving empty directories. A `node_modules` installed on Linux will crash on macOS inside `oxc-resolver`, which Vite 8 uses for module resolution. Fix is `rm -rf node_modules && npm install` on the target machine.

**Keep `node_modules` out of Dropbox sync.** `xattr -w com.dropbox.ignored 1 node_modules`.

## Roadmap

1. Protect `main` and `develop` on GitHub.
2. Move tokens to a DTCG `tokens.json` source of truth with a generator emitting `primitives.css` and `semantic.css`.
3. Sync tokens to Figma variables over the Figma MCP.
4. Code Connect mappings so Figma components point at these files.
5. Per-branch Storybook deploys, including `design`.
