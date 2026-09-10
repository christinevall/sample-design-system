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
| Checkbox | `data-invalid` gives the box a danger border | No `invalid` variant | Checkbox has no `invalid` prop. The state comes from an enclosing `Field.Root` (its `invalid` prop, or validation), so a variant would name a prop that does not exist |
| Checkbox | A description renders without a label | `Field.Label` hides the whole text column, description included | In code the column exists when either is given; Figma binds a layer's visibility to one property. No story uses a description without a label |
| Checkbox | `indeterminate` wins over `checked`: the dash replaces the tick | Both are variants, so two pairs of variants look identical | Each pair is a real prop combination. Dropping one would make it unreachable from Figma |
| Tabs | `Tabs.Indicator` is a sibling of the tabs, sized and moved by Base UI (`--active-tab-width`, `--active-tab-left`, …) | Drawn inside the active `Tabs.Tab`, 2px along its bottom (right edge when vertical), behind a `Tabs.Indicator` boolean | That is where the runtime geometry puts it, and it follows the tab a designer marks `active`. Structurally it is one level off |
| Tabs | `Tabs.List`'s border is `box-shadow: inset 0 -1px 0 0` (`-1px 0` when vertical), painted beneath the tabs | A 1px rectangle as the list's bottom layer | A Figma inner shadow on a frame with no fill applies to the frame's children — it blurred the tab labels — and a stroke draws over them, covering the indicator |
| Select | While nothing is selected, `data-placeholder` is set and the value slot shows the `placeholder` prop | A variant `placeholder` (Base UI state) and a TEXT property `value` for the slot's text | The wrapper's `placeholder` is a string prop and Base UI's `placeholder` a boolean state; one Figma name cannot be both. `value` names the part it fills (`Select.Value`), as `panel` does `Tabs.Panel`. Coming back: `placeholder=true` with a value is the placeholder prop; `placeholder=false` is the `defaultValue` of the item with that label |
| Select | `.item[data-selected]` sets `font-weight: medium` on top of body-md | No text style: body-md's four fields and `font/weight/medium` bound one by one, marked `textStyle` for the audit | Figma cannot override one field of a text style. Setting the weight detaches the style, and a bound font-weight on a styled text is ignored (tested) |
| Select | `<Select.Separator />` in the Grouped story | Not mirrored | It has no class and no styles in `Select.module.css`, so it renders nothing visible. A code question: style it or drop it from the story |
| Select | Field.Error and the danger border (`data-invalid`) after failed validation | Not mirrored | Validation state, not a prop — as with Checkbox |
| Select | Scroll arrows | Not mirrored | Base UI mounts them only while the list overflows |
| Spinner | The indicator is a circle with `stroke-dasharray: 10 31`, spinning (900ms; slowed under reduced motion) | The arc that dash pattern produces, drawn as a path, at rest | Figma restarts a dash pattern at every segment of a path, and an imported circle is four segments: it drew four arcs. Motion is not in the contract |
| Spinner | Colour is `currentcolor`: inside a Button it takes the button's text colour (`InheritsColor` story) | `color/content/accent` on both strokes | Figma has no inherited colour. Override the strokes on the instance |
| IconButton | `label` is required and becomes `aria-label`; nothing visible renders it | A hidden text layer bound to a `label` text property | The frame has to carry the accessible name back; a hidden layer takes no space |
| IconButton | The icon (`children`) takes the button's text colour (`currentColor`) | Each variant overrides the icon's ink; the story icons edit, trash and more-vertical were flattened to one path each | Figma carries an override across an instance swap layer by layer, so a four-path icon swapped in kept the ink on two paths only. With one `Vector` per icon, the ink survives any swap |
| Progress, Meter | The indicator's width is `value` as a share of the track, written inline by Base UI | A rectangle at the stories' reading (40%, 42%), constrained to scale with the track | A runtime value. Resize it on an instance for another reading, and put the number in the `value` text |
| Progress, Meter | The header renders when there is a label or `showValue` | `Progress.Label` / `Meter.Label` hides the header; `showValue` hides the value | One layer takes one visibility property, so a value without a label cannot be drawn |
| Progress | `status=indeterminate` slides a 35% indicator across the track (1.4s) | Drawn at rest at the start of the track | Motion is not in the contract |
| Progress, Meter | `font-variant-numeric: tabular-nums` on the value | Not mirrored | It changes nothing in a still frame: tabular figures only stop digits shifting while the number changes |
| Meter | `.danger .value` is body-sm at medium weight | Fields bound one by one, marked `textStyle` | As `Select.Item`: Figma cannot override one field of a text style |
| Avatar | With no `fallback`, it draws the person glyph (`GlyphFallback` story) | Not mirrored as a state: the Figma set has `fallback` as text and `size` | The glyph state is "no fallback given", not a prop value a designer picks. `icon/person` exists on the Icons page for when it is modelled |
