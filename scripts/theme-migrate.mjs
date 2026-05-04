// One-shot migration of hardcoded zip.tt theme colors to CSS vars.
//
// Why: components were originally written with hex literals like
// `bg-[#0A0A0A]`. To make light/dark mode actually flip, every such
// usage needs to point at a CSS variable that re-resolves when the
// `dark` class is toggled on <html>.
//
// What it does: scans every .tsx under app/ and components/ and
// rewrites the specific Tailwind ARBITRARY-VALUE CLASS forms:
//
//   bg-[#0A0A0A]        → bg-[var(--bg-primary)]
//   text-[#F5F0E8]      → text-[var(--text-primary)]
//   ...etc.
//
// What it deliberately doesn't touch:
//   - inline `style={{ color: '#…' }}` props (need a separate pass)
//   - gold tokens (#C9A84C, #F0C040, #8B6914) — brand stays put
//   - red (#D62828) — accent stays put
//   - hex strings inside JS strings / SVG paths — never touched
//
// Run once after the CSS vars land in globals.css:
//   node scripts/theme-migrate.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'

// (path-pattern → replacement). Each entry is wrapped in `[…]` brackets
// in the source to ensure we only touch Tailwind arbitrary-value
// classes — not free hex strings elsewhere.
const REPLACEMENTS = [
  ['[#0A0A0A]', '[var(--bg-primary)]'],
  ['[#111111]', '[var(--bg-secondary)]'],
  ['[#1A1A1A]', '[var(--bg-card)]'],
  ['[#F5F0E8]', '[var(--text-primary)]'],
  ['[#9A8F7A]', '[var(--text-secondary)]'],
  // Lower-case variants (some files use lower-case hex)
  ['[#0a0a0a]', '[var(--bg-primary)]'],
  ['[#111111]', '[var(--bg-secondary)]'],
  ['[#1a1a1a]', '[var(--bg-card)]'],
  ['[#f5f0e8]', '[var(--text-primary)]'],
  ['[#9a8f7a]', '[var(--text-secondary)]'],
]

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

const roots = ['app', 'components']
const files = roots.flatMap((r) => walk(r))

let touchedFiles = 0
let touchedLines = 0

for (const f of files) {
  const before = await readFile(f, 'utf8')
  let after = before
  for (const [from, to] of REPLACEMENTS) {
    after = after.split(from).join(to)
  }
  if (after !== before) {
    const diff = after.split('\n').filter((l, i) => l !== before.split('\n')[i]).length
    touchedFiles++
    touchedLines += diff
    await writeFile(f, after)
  }
}

console.log(`Theme migration complete: ${touchedFiles} files, ~${touchedLines} lines touched.`)
