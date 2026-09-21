import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ikigai: {
          primary: '#0B5566',
          secondary: '#08404F',
          accent: '#2B969E',
          light: '#E3F4F8',
          gold: '#D4A843',
          'gold-light': '#FBF3E0',
          teal: '#0D9488',
          'teal-light': '#CCFBF1',
        },
        // Sidebar gradient stops (see --sidebar-* in globals.css; darker in dark mode)
        sidebar: {
          from: 'var(--sidebar-from)',
          to: 'var(--sidebar-to)',
        },
        // Semantic deltas / status pills
        positive: { DEFAULT: '#0A7F55', soft: '#E3F8EF' },
        negative: { DEFAULT: '#C81E4B', soft: '#FDE6EC' },
        // Stat-card accents: DEFAULT = icon glyph, soft = icon circle, line = sparkline
        stat: {
          teal: { DEFAULT: '#0A778D', soft: '#D6F3F8', line: '#0899B5' },
          green: { DEFAULT: '#0E9F6E', soft: '#E4F8F0', line: '#10B981' },
          purple: { DEFAULT: '#5B3FE8', soft: '#ECE6FE', line: '#6D4DF2' },
          rose: { DEFAULT: '#E11D48', soft: '#FDE4EA', line: '#F43F5E' },
          amber: { DEFAULT: '#E08A00', soft: '#FEF3D8', line: '#F5A400' },
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
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
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(8, 64, 79, 0.04), 0 6px 20px rgba(8, 64, 79, 0.05)',
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
