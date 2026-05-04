// Sun/moon button that flips the active theme. Stored in localStorage
// under `ziptt-theme` ('light' | 'dark') so the choice persists across
// reloads. The actual class application happens twice:
//
//   1. An inline <script> in app/layout.tsx runs BEFORE React hydrates
//      and sets `<html class="dark">` from localStorage to avoid a
//      flash of the wrong theme.
//   2. This component reads/sets the same value on click and updates
//      the `<html>` class live.
'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export type ZipTheme = 'light' | 'dark'
export const THEME_KEY = 'ziptt-theme'

function readTheme(): ZipTheme {
  if (typeof window === 'undefined') return 'light'
  const v = window.localStorage.getItem(THEME_KEY)
  if (v === 'light' || v === 'dark') return v
  return 'light' // explicit default — even on prefers-dark, new visitors get light
}

function applyTheme(t: ZipTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', t === 'dark')
  document.documentElement.dataset.theme = t
}

export function ThemeToggle() {
  // Mirror the persisted theme into React state so the icon updates
  // synchronously on click without waiting for a re-render from
  // localStorage.
  const [theme, setThemeState] = useState<ZipTheme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = readTheme()
    setThemeState(t)
    applyTheme(t)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next: ZipTheme = theme === 'dark' ? 'light' : 'dark'
    setThemeState(next)
    try { window.localStorage.setItem(THEME_KEY, next) } catch { /* private mode */ }
    applyTheme(next)
  }

  // Render a static placeholder until the effect has run so the
  // server-rendered HTML matches the client's initial paint (no
  // hydration mismatch warnings).
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors"
        suppressHydrationWarning
      >
        <Sun className="h-5 w-5 text-[var(--text-secondary)]" />
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-[var(--gold)]" />
      ) : (
        <Moon className="h-5 w-5 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors" />
      )}
    </button>
  )
}
