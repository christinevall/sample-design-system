// scripts/figma/audit.figma.js — plugin-side. Run through the Figma MCP after
// building or changing a component. Returns every visual value that is set by
// hand instead of coming from a variable or a style.
//
// An empty result is the bar. Values the CSS itself has raw — a min-height, a
// 1px border width, a disabled opacity, `transparent` — are not paints or
// bindings, so they never show up here. Text must use a text style, because in
// code a component's type comes from one (CLAUDE.md, rule 1).
//
// A raw value that does land in a checked field — Alert's `margin-top: 2px`,
// drawn as padding — is marked on its node, so the exception is named where it
// lives: node.setSharedPluginData('sds', 'raw', 'paddingTop'). Comma-separate
// several fields. Marked fields are skipped.
//
// Set ONLY to audit specific components, e.g. ['Checkbox', 'Tabs'].
const ONLY = null;

const out = {};
let checked = 0;
for (const page of figma.root.children) {
  await page.loadAsync();
  const roots = [
    ...page.findAllWithCriteria({ types: ['COMPONENT_SET'] }),
    ...page.findAllWithCriteria({ types: ['COMPONENT'] }).filter((c) => c.parent.type !== 'COMPONENT_SET'),
  ];
  for (const root of roots) {
    if (ONLY && !ONLY.includes(root.name.split('.')[0])) continue;
    const issues = new Set();
    const walk = (n, insideInstance) => {
      const skip = insideInstance || n.type === 'INSTANCE'; // an instance is audited through its own component
      if (!skip) {
        checked++;
        const raw = new Set(n.getSharedPluginData('sds', 'raw').split(',').map((s) => s.trim()).filter(Boolean));
        for (const key of ['fills', 'strokes']) {
          if (!(key in n) || n[key] === figma.mixed || raw.has(key)) continue;
          for (const p of n[key]) {
            if (p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0 && !p.boundVariables?.color) issues.add(`${n.name} › ${key}`);
          }
        }
        if ('layoutMode' in n && n.layoutMode !== 'NONE') {
          for (const f of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) {
            if (n[f] > 0 && !n.boundVariables?.[f] && !raw.has(f)) issues.add(`${n.name} › ${f}`);
          }
        }
        if (n.type !== 'COMPONENT_SET' && typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !n.boundVariables?.topLeftRadius && !raw.has('cornerRadius')) {
          issues.add(`${n.name} › cornerRadius`);
        }
        if (n.type === 'TEXT' && !(typeof n.textStyleId === 'string' && n.textStyleId)) issues.add(`${n.name} › text style`);
      }
      if ('children' in n) for (const c of n.children) walk(c, skip);
    };
    walk(root, false);
    if (issues.size) out[root.name] = [...issues];
  }
}
return { nodesChecked: checked, unbound: out };
