import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // zip.tt brand colors — inspired by T&T flag (red, black, white)
        brand: {
          red: '#D62828',
          black: '#1a1a1a',
          gold: '#F7B731',
          green: '#228B22',
        },
        // Named theme tokens — these resolve to CSS variables that flip
        // when the `dark` class is applied to <html>. Components written
        // with `bg-bg-primary`, `text-text-primary`, etc. respond to the
        // theme toggle automatically.
        'bg-primary':    'var(--bg-primary)',
        'bg-secondary':  'var(--bg-secondary)',
        'bg-card':       'var(--bg-card)',
        'bg-surface':    'var(--bg-surface)',
        'text-primary':  'var(--text-primary)',
        'text-secondary':'var(--text-secondary)',
        'border-color':  'var(--border-color)',
        gold: {
          DEFAULT: 'var(--gold)',
          hover:   'var(--gold-hover)',
          text:    'var(--gold-text)',
          light:   'var(--gold-light)',
          dark:    'var(--gold-dark)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
