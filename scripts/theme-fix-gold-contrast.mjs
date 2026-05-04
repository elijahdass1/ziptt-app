// Corrective pass on the bulk theme migration. The naive
// search-and-replace turned every `text-[#0A0A0A]` into
// `text-[var(--bg-primary)]` so it could flip with the theme — but
// that broke contrast on gold pills (gold bg stays gold in BOTH modes,
// so the text-on-gold needs to stay black, not flip to white).
//
// Heuristic: any element whose className includes `bg-[#C9A84C]` or
// `bg-[#F0C040]` (the gold tones) and `text-[var(--bg-primary)]`
// gets the latter rewritten to `text-black`.
//
// Same goes for `text-[#0A0A0A]` if anything was missed by the
// previous pass.

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

// Match a JSX className value. We only care about classNames whose
// literal string contains BOTH a gold bg AND text-[var(--bg-primary)].
// On a hit, swap the text token for `text-black` so the contrast
// stays correct in both modes.
const GOLD_BG = /(bg-\[#C9A84C\]|bg-\[#F0C040\])/
const PILL_TEXT_VAR = /text-\[var\(--bg-primary\)\]/g

const roots = ['app', 'components']
const files = roots.flatMap((r) => walk(r))

let touched = 0

for (const f of files) {
  const before = await readFile(f, 'utf8')
  // We rewrite line-by-line so a single broken pill doesn't pull a
  // whole file's worth of unrelated `text-[var(--bg-primary)]` with it.
  const out = before.split('\n').map((line) => {
    if (GOLD_BG.test(line) && PILL_TEXT_VAR.test(line)) {
      return line.replace(PILL_TEXT_VAR, 'text-black')
    }
    return line
  }).join('\n')
  if (out !== before) {
    touched++
    await writeFile(f, out)
  }
}

console.log(`Gold-contrast fix: ${touched} files rewritten.`)
