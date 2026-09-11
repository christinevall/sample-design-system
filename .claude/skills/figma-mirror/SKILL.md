---
name: figma-mirror
description: Build or update the Figma library so it mirrors the code — a component with its variants and properties, or the tokens behind variables and text styles. Use when asked to add, build, sync, update, mirror or "push" something to Figma, or after tokens or a component's CSS changed. Code is the source; Figma follows it.
---

# Figma mirror — code → Figma

The Figma library (file `PvLNUW3xI3A9kTumVi7O3d`, "sample-design-system") mirrors
this repo. It is never the source. Every name, property and value in it comes
from `tokens/*.json`, a component's `.tsx` and its `.module.css`, through the
scripts in `scripts/figma/`, and `npm run validate` checks the result against
the code through `figma/manifest.json`.

That manifest is also what the return trip will use: a Figma frame names
`Button · variant=primary, size=md`, and the manifest is how that resolves to
`<Button variant="primary" size="md">` in a story. So the rules below are not
style preferences. Break one and a frame coming back from Figma stops resolving.

## Before you start

1. Load `figma:figma-use` and `figma:figma-generate-library` — mandatory before
   any `use_figma` call. They cover the Plugin API and the generic build phases;
   this skill adds the contract on top.
2. Ground yourself, as `CLAUDE.md` requires: the component's manifest entry,
   its `.tsx`, `.module.css` and `.stories.tsx`. For Base UI wrappers, also the
   Base UI types in `node_modules/@base-ui/react/<part>/`.
3. Read `figma/manifest.json`. If the component is already there, you are
   updating it, not building it — change what differs, keep node IDs.
4. Figma writes are strictly sequential. Reads can run in parallel.

## The contract

| Rule | Why |
| --- | --- |
| Component and part names are the code's: `Card`, `Card.Header`, `NavigationMenu.Link` | The manifest resolves names, not intentions |
| Variant **properties and values are the code's props, verbatim**: `variant=primary`, `size=md`, `disabled=false` — never `Size=Medium` | A frame coming back must name a real prop and a real value |
| Text content is `children`, or the prop that carries it (`title`, `fallback`), or the part it fills (`title` → `Card.Title`, `value` → `Select.Value`). When a state and a prop share a name — Select's `placeholder` is both — the text is named after the part | Same reason |
| Optional code parts are BOOLEAN properties named after the part: `Card.Header`, `Card.Footer` — or, for an optional prop, after the Base UI part it renders: Checkbox's `description` renders `Field.Description` | The instance says which parts to render |
| The **top-left variant is the default**, and it must be the code's default. Order the grid from the defaults: Button's rows start at `md` | Figma ignores layer order when choosing the default |
| **Type is a text style, applied whole** — the one the CSS rule names in its six `--sds-typography-<style>-*` declarations. If a state rule overrides one field (Select's selected item: body-md at medium weight), bind every field to its variable instead and mark the node `textStyle` | In code, type comes from one text style (CLAUDE.md rule 1). Figma cannot override one field of a style: changing it detaches the style, and a bound weight on a styled text is ignored |
| Every fill, stroke, padding, gap, radius is **bound to a variable**; shadows are **effect styles** | `audit.figma.js` must return nothing |
| Values the CSS has raw stay raw in Figma — `min-height: 32px`, `opacity: 0.5`, `transparent` — never promoted to a token. When one lands in a field the audit checks (Alert's `margin-top: 2px` is drawn as padding), mark it: `node.setSharedPluginData('sds', 'raw', 'paddingTop')` | Inventing a token is drift in the other direction; the mark tells the audit it is deliberate |
| A CSS border counts toward size: `strokeAlign = 'INSIDE'` **and** `strokesIncludedInLayout = true`; `1px solid transparent` is an invisible stroke | Otherwise every bordered component is 2px narrow |
| Nested components are **instances** of the library's own components, exposed with `isExposedInstance = true` — Figma exposes only instances that have properties, so a `Menu.Separator` stays unexposed | Card's footer holds real Buttons, editable from the Card |
| The component set's description starts `Contract — src/components/<Name>/<Name>.tsx: …` and names every prop with its values and default | `snapshot.figma.js` reads the source path from it |

### Base UI state → variant properties

Base UI styles state through data attributes. `css-to-spec` classifies each one:

| Kind | Attributes | In Figma |
| --- | --- | --- |
| Chosen through a prop | `checked`, `indeterminate`, `disabled`, `invalid`, `pressed`, `selected`, `orientation`, `open`/`popup-open`, `active`, `type` | A variant property named after **the prop** (`checked=true`), values from the prop's type |
| Item state inside a list | `highlighted`, `selected` on a menu or listbox item | A variant on the item's own component (`Menu.Item`), not on the parent |
| Produced by the browser | `starting-style`, `ending-style`, `side`, `align`, `swiping`, `dragging`, `scrolling`, `instant`, `activation-direction` | Nothing. A designer cannot choose it |
| `:hover`, `:active`, `:focus-visible` | pseudo-classes | Not in the contract yet — they are not props. Log them in `figma/GAPS.md` |

State the Root decides for a part — `Tabs.Tab`'s `active`, `Select.Trigger`'s
`placeholder`, `Select.Item`'s `selected` and `highlighted` — is named as Base
UI's `*State` interface names it (validate reads those types). Say in the
description how it maps back: the active tab's `value` is the Root's
`defaultValue`.

Values Base UI computes at runtime are drawn **where they land**: Tabs'
indicator sits inside the active tab, so it follows whichever tab a designer
marks active.

If `css-to-spec` lists an **unclassified state**, decide which kind it is, add
it to `STATE_ATTRS` or `RUNTIME_ATTRS` in `scripts/figma/css-to-spec.mjs`, and
commit that with the component.

### Figma behaviours that bite

- An inner shadow on a frame **with no fill** is applied to its children (it
  blurred Tabs' labels), and a frame's stroke draws **over** its children. For
  a `box-shadow: inset` border, draw a 1px rectangle as the frame's first child.
- A dash pattern restarts at every segment of a path (an imported circle has
  four). Draw the arc a `stroke-dasharray` produces as a path instead.
- An instance swap carries overrides layer by layer. A swappable icon must be
  one `Vector`, or the ink survives on its first paths only.
- A prop that renders nothing visible but is required (IconButton's `label` →
  `aria-label`) goes on a hidden text layer with a TEXT property, so the frame
  carries it back.
- A TEXT property's default applies to every variant, so variant-specific
  sample text is lost. The labels beside the set carry it instead.
- A `use_figma` call that throws is **rolled back**: nothing it did persists.
  Fix the script and rerun it whole, and make lookups throw with the layer
  names they saw, so the next attempt is informed.
- `use_figma` runs with `figma.skipInvisibleInstanceChildren = true`: hidden
  layers inside an instance do not appear in `children` or `findOne`. Set it
  to `false` at the top of any script that shows or edits a hidden layer on
  an instance (Toolbar's text buttons).
- `resize()` pins an auto-layout frame's size. Set the sizing modes (`AUTO`
  to hug) **after** calling it, or the component keeps a fixed height and
  overflows once a description is switched on. The audit flags any component
  with a fixed height unless its node is marked `height` (a raw CSS size).
- Parent selectors (`.segmented > button`) have no Figma equivalent: the child
  instances carry the look as overrides, and Figma keeps overrides across a
  variant change. Log it; a code-side option is usually the real fix.
- Property names are unique across types: a second `children` is silently
  renamed `children2`. Where `children` is text in some variants and an icon in
  others (Toggle), the text keeps the property and the icon is swapped on its
  layer.
- An auto-layout frame whose children are all hidden keeps its last size; it
  does not collapse. To drop a label-and-description column, hide the column
  itself (bind it to `Field.Label`), not only its lines.
- Boolean and text defaults come from the **Default story's** args
  (`showValue` on for Progress), the same composition Storybook opens on.
- `search_design_system` answers one query per call; batching is clamped.
- A story can be broken. Standalone `Checkbox` crashes (`Field.Item` outside a
  `Field.Root`); compare against a story that renders and flag the crash.

Stay under ~30 variants per set. If the matrix is bigger, split a repeating
sub-element into its own component (`Select.Item`, `Tabs.Tab`) and compose it.

## Procedure — one component

1. `node scripts/figma/css-to-spec.mjs <Name>` — the bindings, the text style
   per rule, and the gaps to decide. Read the "decide on purpose" block first.
2. `search_design_system` for the name (required before creating). Other
   libraries will match loosely; reuse only a component whose properties are
   already this contract.
3. Page named after the component, documentation frame at (40, 40): title,
   the JSDoc description, the contract in `typography/code-sm`, and the gaps.
4. Build each variant from the spec (one `use_figma` call). Auto-layout, all
   bindings, text styles, raw values raw. Return every node ID.
5. `combineAsVariants` in a **separate** call. Lay the grid out from the
   defaults so the default sits top-left; add column/row labels outside the set.
6. Properties: TEXT, BOOLEAN for parts, `INSTANCE_SWAP` for icons (from the
   Icons page). Check `componentSet.defaultVariant` equals the code default.
7. Run `scripts/figma/audit.figma.js` with `ONLY = ['<Name>']`. It must return
   no unbound values. Fix, do not explain away.
8. Screenshot the component set (`node.screenshot()` inside the call, or the
   console's `figma_capture_screenshot`) and compare with the Storybook story.
9. Run `scripts/figma/snapshot.figma.js` and save the result, pretty-printed
   with two-space indentation, as `figma/manifest.json`.
10. `npm run validate` — the Figma checks must pass. Fix the library or the
    spec, never the check.
11. Commit the manifest, any `STATE_ATTRS` change and any `figma/GAPS.md` entry
    together with a message that names the component.

## Procedure — tokens changed

1. `node scripts/figma/tokens-to-figma.mjs --summary`, then the full payload.
2. In Figma, compare the payload with the live variables and styles and apply
   only the differences: create what is missing, update changed values, and
   list — do not delete — what the payload no longer contains. Deleting a
   variable unbinds it everywhere; that is a decision for a person.
3. Snapshot → `figma/manifest.json` → `npm run validate` → commit.

## When to stop

Stop and ask, rather than invent, when the code does not answer the question:
no text style fits, a state cannot be classified, a value is computed at
runtime with no representative default, or the CSS depends on something Figma
cannot express. Record the question in `figma/GAPS.md`, skip that part, and
carry on with the rest.

## Build order

Atoms before anything that contains them — a component can only hold an
instance of something that already exists.

1. **Icons** — on an `Icons` page, 16px, named by shape (`icon/chevron-down`,
   `icon/check`), stroke or fill bound to `color/content/*`. Two kinds, mirrored
   differently:
   - **Glyphs a component draws itself** (Checkbox's tick, Select's chevron): a
     nested instance inside that component, **not** exposed and not swappable.
     The code has no prop to change them, so a swap would promise a choice
     that does not exist.
   - **Icons a consumer passes in** (IconButton's and Toggle's `children`): an
     `INSTANCE_SWAP` property named `children`, defaulting to one of the
     example icons from the stories.

   Mirror every distinct drawing the code has, even near-duplicates — Figma
   follows the code, including its drift. Log duplicates in `figma/GAPS.md`;
   merging them is a code decision. Spinner's circles and the popup arrow are
   parts of their components, not icons.
2. **Controls** — Spinner, Progress, Meter, IconButton, Toggle, Switch, Checkbox,
   RadioGroup, Slider, TextField, Textarea, NumberField, CheckboxGroup,
   ToggleGroup, Fieldset, Table.
3. **Disclosure and navigation** — Collapsible, Accordion, Tabs, Toolbar, Menubar.
4. **Popups and overlays** — Tooltip, Popover, PreviewCard, Menu, Select,
   Combobox, Autocomplete, Dialog, AlertDialog, Toast. Show the open state:
   the popup as its own component, the trigger beside it.

Not mirrored, by decision: **Form** (no visuals), **ScrollArea** (behaviour,
not a thing you draw), **ContextMenu** (the same popup as `Menu`).

## Scripts

| Script | Runs | Does |
| --- | --- | --- |
| `scripts/figma/tokens-to-figma.mjs` | Node | tokens → Figma variables and styles; imported by `validate` |
| `scripts/figma/css-to-spec.mjs` | Node | a component's CSS → bindings, text styles, gaps |
| `scripts/figma/icons.mjs` | Node | every inline SVG in components and stories → the icon list; imported by `validate` |
| `scripts/figma/snapshot.figma.js` | Figma MCP | what the library contains → `figma/manifest.json` |
| `scripts/figma/audit.figma.js` | Figma MCP | every hand-set value in a component |

Known gaps and their reasons live in `figma/GAPS.md`. Findings worth writing
about go in `docs/project-brief.md`.
