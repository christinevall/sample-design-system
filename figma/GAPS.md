# Where Figma cannot mirror the code exactly

Every entry here is a decision, not an oversight: what the code does, what
Figma does instead, and why. Add an entry whenever the `figma-mirror` skill
meets something it cannot express. Anything not listed is expected to match.

## Tokens

| Code | Figma | Why |
| --- | --- | --- |
| Font family is a system stack (`ui-sans-serif, system-ui, …`) | `Inter` and `Roboto Mono` stand in | Figma needs one real family. On macOS Storybook renders SF Pro, so text widths differ slightly. Naming a real font in code would close this, at the cost of a font dependency |
| Line height is unitless (`1.2`), letter spacing is `em` | Resolved pixels (24 × 1.2 = 28.8px) in `typography/<style>/line-height` and `letter-spacing` | Figma reads a bound line-height or letter-spacing variable as pixels (tested). Renders the same, but does not follow a font-size change on its own |
| `text-transform` is part of a text style | Case on the Figma text style | Figma has no case variable |
| A shadow is one token, `--sds-elevation-*`, different in Light and Dark | An effect style whose colour is bound to `elevation/<level>/color` (Light/Dark) | Effect styles have no modes. The geometry is the same in both themes in code; only the alpha changes. The colour variables are Figma-only and carry no code syntax |
| Tier-1 `shadow.*`, `line.height.*`, `letter.spacing.*`, `text.transform.*` | Not mirrored as variables | Internal to the text and effect styles above |
| `TIMING` and `EASING` variables | `ALL_SCOPES` | Figma has no motion scopes; these types can only fill a timing or easing field anyway |

## Components

| Component | Code | Figma | Why |
| --- | --- | --- | --- |
| Card | `.header + .body` gives the body 8px top padding only when a header comes first | The body always has 8px | Figma has no sibling selectors. The default composition is exact; with `Card.Header` hidden the body sits 4px tighter than in code |
| All | `:hover`, `:active`, `:focus-visible` styles | Not mirrored | They are CSS states, not props, so they are not in the contract. Candidate for prototype interactions later |
| All | Values Base UI computes in the browser (`--anchor-width`, `--popup-height`, `--active-tab-left`, …) | A representative fixed value, stated in the page documentation | They only exist at runtime |
| Icons | Every component draws its own inline SVG, so the same shape has drifted: **chevron-down** is `M4 6l4 4 4-4` in Accordion and `m4 6.5 4 4 4-4` in Select, Combobox, Autocomplete and NavigationMenu; **chevron-right** is `M6 3.5 10.5 8 6 12.5` in Breadcrumb and Menu and `M6 4l4 4-4 4` in Collapsible; **check** is the same geometry at stroke 1.75 in Select and Combobox and stroke 2 in Checkbox (so it is two icons); **close** is one shape written in absolute and relative notation (so it is one icon) | Every distinct drawing is its own icon, so each component keeps exactly what it renders | Figma follows the code, including its drift. Merging them into one shared icon module is a code decision — CLAUDE.md allows inline SVG, and consolidating changes components |
| Story icons | Toolbar's stories draw bold, italic and underline differently from Toggle's and ToggleGroup's | One drawing each, from Toggle and ToggleGroup; `scripts/figma/icons.mjs --summary` lists the skipped ones | They are example content, not system decisions — but the same drift, one layer out |
| Avatar | With no `fallback`, it draws the person glyph (`GlyphFallback` story) | Not mirrored as a state: the Figma set has `fallback` as text and `size` | The glyph state is "no fallback given", not a prop value a designer picks. `icon/person` exists on the Icons page for when it is modelled |
