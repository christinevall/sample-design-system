/**
 * Checks generated and hand-written UI against the rules in CLAUDE.md.
 *
 * Warn-only by default: it reports and exits 0, so it never blocks a designer
 * mid-prototype. Pass --strict to exit 1, which is what CI would use.
 *
 *   npm run validate
 *   npm run validate -- --strict
 *
 * The point is not to be clever. Every rule here is one an agent has already
 * been told in CLAUDE.md, restated somewhere that actually checks.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const STRICT = process.argv.includes('--strict');
const findings = [];
const report = (file, line, rule, message) => findings.push({ file, line, rule, message });

const files = execSync(
  "find src -type f \\( -name '*.module.css' -o -name '*.tsx' \\) -not -path '*/node_modules/*'",
  { encoding: 'utf8' },
).trim().split('\n').filter(Boolean);

// ---------------------------------------------------------------- token names
const TOKENS_CSS = ['src/tokens/primitives.css', 'src/tokens/semantic.css'];
const defined = new Set();
for (const f of TOKENS_CSS) {
  if (!existsSync(f)) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(/^\s*(--sds-[\w-]+)\s*:/gm)) defined.add(m[1]);
}

/**
 * Tier-1 tokens are plumbing for tier 2. A component using one has reached past
 * the semantic layer, which is what breaks theming.
 *
 * Deliberately narrow: only where a semantic replacement actually exists. The
 * raw type scale (--sds-font-size-*, --sds-line-height-*, --sds-font-weight-*)
 * is tier 1 too, and CLAUDE.md currently permits it, because the typography
 * composites that would replace it are new and nothing consumes them yet.
 * Flagging those 253 usages would drown the two real findings, and a checker
 * that cries wolf gets switched off. Migrating type to --sds-typography-* is a
 * separate decision; tighten this rule when that happens.
 */
const isPrimitive = (t) =>
  /^--sds-color-(neutral|brand|success|warning|danger)-\d+$/.test(t) ||
  /^--sds-shadow-/.test(t);

for (const file of files) {
  if (file.startsWith('src/tokens/')) continue;         // generated
  const isFoundation = file.startsWith('src/foundations/'); // documents primitives on purpose
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    const n = i + 1;

    // 1. every token referenced must exist
    for (const m of line.matchAll(/var\((--sds-[\w-]+)\)/g)) {
      if (!defined.has(m[1])) report(file, n, 'unknown-token', `${m[1]} is not defined in the token layer`);
    }

    // 2. components may not reach past the semantic layer
    if (!isFoundation) {
      for (const m of line.matchAll(/var\((--sds-[\w-]+)\)/g)) {
        if (isPrimitive(m[1])) {
          report(file, n, 'primitive-in-component',
            `${m[1]} is a tier-1 token; use a semantic one (e.g. --sds-elevation-* instead of --sds-shadow-*)`);
        }
      }
    }

    // 3. no raw colour where a token exists.
    //    Only in stylesheets, and only in the value half of a declaration —
    //    `'Build #482'` and `href="#ada"` are not colours, and matching them
    //    is how this rule loses its credibility.
    if (!isFoundation && file.endsWith('.module.css')) {
      const decl = line.replace(/\/\*.*?\*\//g, '').match(/^\s*[a-z-]+\s*:\s*(.+?);/);
      const value = decl?.[1];
      if (value && !/url\(|data:/.test(value)) {
        if (/#[0-9a-fA-F]{3,8}\b/.test(value)) {
          report(file, n, 'raw-colour', 'hard-coded hex — use a --sds-color-* token');
        }
        if (/\b(rgb|rgba|hsl|hsla)\(/.test(value) && !/var\(--sds-/.test(value)) {
          report(file, n, 'raw-colour', 'hard-coded colour function — use a --sds-color-* token');
        }
      }
    }
  });
}

// ------------------------------------------------- components exist as claimed
const MANIFEST = 'storybook-static/manifests/components.json';
if (existsSync(MANIFEST)) {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const broken = Object.values(manifest.components).filter(
    (c) => c.error && !c.id.startsWith('foundations-') && !c.id.startsWith('patterns-'),
  );
  for (const c of broken) {
    report(c.path ?? MANIFEST, 0, 'manifest-gap',
      `${c.id} has no resolvable component, so agents cannot ground against it`);
  }
} else {
  console.log(`note: ${MANIFEST} not found — run \`npm run build-storybook\` to check manifest coverage\n`);
}

// ------------------------------------------------------------------- report
const byRule = findings.reduce((a, f) => ((a[f.rule] ??= []).push(f), a), {});
if (!findings.length) {
  console.log('validate: no findings.');
  process.exit(0);
}
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`\n${rule}  (${list.length})`);
  for (const f of list.slice(0, 20)) console.log(`  ${f.file}:${f.line}  ${f.message}`);
  if (list.length > 20) console.log(`  ... and ${list.length - 20} more`);
}
console.log(`\n${findings.length} finding(s).`);
if (STRICT) {
  console.log('--strict: failing.');
  process.exit(1);
}
console.log('warn-only: not failing. Pass --strict to make these block.');
