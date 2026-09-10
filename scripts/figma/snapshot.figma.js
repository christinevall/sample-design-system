// scripts/figma/snapshot.figma.js — plugin-side. Run through the Figma MCP
// (use_figma or figma_execute) and save the returned object, pretty-printed,
// as figma/manifest.json.
//
// Records what the Figma library contains, in the shape scripts/validate.mjs
// checks against the code. No timestamps and a stable order, so a diff of
// figma/manifest.json shows only real changes to the library.
const snap = { file: figma.root.name, components: [], variables: {}, codeSyntaxExceptions: {}, textStyles: [], effectStyles: [] };
for (const page of figma.root.children) {
  await page.loadAsync();
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const loose = page.findAllWithCriteria({ types: ['COMPONENT'] }).filter((c) => c.parent.type !== 'COMPONENT_SET');
  for (const n of [...sets, ...loose]) {
    const isSet = n.type === 'COMPONENT_SET';
    snap.components.push({
      name: n.name,
      page: page.name,
      kind: isSet ? 'set' : 'component',
      variants: isSet ? n.children.length : 1,
      defaultVariant: isSet ? (n.defaultVariant?.name ?? null) : null,
      source: (n.description.match(/src\/components\/[\w/]+?(?:\.stories)?\.tsx/) || [null])[0], // example icons cite their story
      props: Object.entries(n.componentPropertyDefinitions).map(([k, d]) => ({
        name: k.split('#')[0],
        type: d.type,
        ...(d.type === 'VARIANT' ? { values: d.variantOptions } : {}),
        default: d.defaultValue,
      })),
    });
  }
}
snap.components.sort((a, b) => a.name.localeCompare(b.name));
const byId = new Map((await figma.variables.getLocalVariablesAsync()).map((v) => [v.id, v]));
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const names = c.variableIds.map((id) => byId.get(id)).filter(Boolean).map((v) => {
    const web = v.codeSyntax?.WEB ?? null;
    if (web !== `var(--sds-${v.name.replace(/\//g, '-')})`) snap.codeSyntaxExceptions[v.name] = web;
    return v.name;
  });
  snap.variables[c.name] = { modes: c.modes.map((m) => m.name), names };
}
snap.textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({ name: s.name, textCase: s.textCase, bound: Object.keys(s.boundVariables ?? {}).sort() }));
snap.effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => s.name);
return snap;
