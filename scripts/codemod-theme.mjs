import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

// Ordered: most specific first.
const REPLACEMENTS = [
  ['bg-neutral-200/70', 'bg-line/60'],
  ['hover:bg-neutral-50', 'hover:bg-sunken'],
  ['hover:bg-neutral-100', 'hover:bg-sunken'],
  ['disabled:bg-neutral-50', 'disabled:bg-canvas'],
  ['bg-white/80', 'bg-panel/80'],
  ['bg-white', 'bg-surface'],
  ['bg-neutral-50', 'bg-canvas'],
  ['bg-neutral-100', 'bg-sunken'],
  ['bg-neutral-200', 'bg-sunken'],
  ['bg-neutral-900', 'bg-ink'],
  ['text-neutral-900', 'text-ink'],
  ['text-neutral-800', 'text-ink'],
  ['text-neutral-700', 'text-ink-2'],
  ['text-neutral-600', 'text-ink-2'],
  ['text-neutral-500', 'text-ink-3'],
  ['text-neutral-400', 'text-ink-4'],
  ['border-neutral-100', 'border-line'],
  ['border-neutral-200', 'border-line'],
  ['border-neutral-300', 'border-line-strong'],
  ['border-neutral-500', 'border-ink-3'],
  ['ring-neutral-100', 'ring-line'],
  ['ring-neutral-200', 'ring-line'],
  ['ring-neutral-300', 'ring-line-strong'],
  ['bg-neutral-400', 'bg-ink-4'],
  ['placeholder-neutral-400', 'placeholder-ink-4'],
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) yield p;
  }
}

let changed = 0;
for (const file of walk(SRC)) {
  let content = readFileSync(file, 'utf8');
  const before = content;
  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to);
  }
  if (content !== before) {
    writeFileSync(file, content);
    changed++;
    console.log('updated', file);
  }
}
console.log(`${changed} files updated`);
