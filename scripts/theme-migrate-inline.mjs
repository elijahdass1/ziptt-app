// Second-pass theme migration: swap hardcoded hex values inside
// inline `style={{}}` props (and other JS-string contexts) to CSS
// variable references. The first pass only touched Tailwind
// arbitrary-value classes (`bg-[#…]`, `text-[#…]`).
//
// Skipped: anything inside SVG `fill="#…"` / `stroke="#…"` attribute
// values (those are visual brand glyphs that shouldn't flip with
// theme — e.g. the Google "G" colors on the login button).

import { readFile, writeFile } from 'node:fs/promises'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (full.endsWith('.tsx')) out.push(full)
  }
  return out
}

// We rewrite `'#XXXXXX'` (single-quoted JS string) and `"#XXXXXX"`
// (double-quoted JS string) — but NOT bare `#XXXXXX` (which would
// hit JSX attributes like `fill="#4285F4"` that shouldn't change).
//
// To be extra safe: we only touch the five tokens we know are theme
// colors. Gold (#C9A84C, #F0C040, #8B6914) and brand red (#D62828)
// are intentionally never rewritten because they're the same in
// both modes.
const REPLACEMENTS = [
  ["'#0A0A0A'", "'var(--bg-primary)'"],
  ["'#111111'", "'var(--bg-secondary)'"],
  ["'#1A1A1A'", "'var(--bg-card)'"],
  ["'#F5F0E8'", "'var(--text-primary)'"],
  ["'#9A8F7A'", "'var(--text-secondary)'"],
  ["'#0a0a0a'", "'var(--bg-primary)'"],
  ["'#1a1a1a'", "'var(--bg-card)'"],
  ["'#f5f0e8'", "'var(--text-primary)'"],
  ["'#9a8f7a'", "'var(--text-secondary)'"],
  ['"#0A0A0A"', '"var(--bg-primary)"'],
  ['"#111111"', '"var(--bg-secondary)"'],
  ['"#1A1A1A"', '"var(--bg-card)"'],
  ['"#F5F0E8"', '"var(--text-primary)"'],
  ['"#9A8F7A"', '"var(--text-secondary)"'],
]

const roots = ['app', 'components']
const files = roots.flatMap((r) => walk(r))

let touched = 0

for (const f of files) {
  const before = await readFile(f, 'utf8')
  let after = before
  for (const [from, to] of REPLACEMENTS) {
    after = after.split(from).join(to)
  }
  if (after !== before) {
    touched++
    await writeFile(f, after)
  }
}

console.log(`Inline-style theme migration: ${touched} files rewritten.`)
