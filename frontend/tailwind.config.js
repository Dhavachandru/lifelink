/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Calm Charcoal / Obsidian surface tokens
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e2630',
          850: '#161d26',
          900: '#0f141c',
          950: '#090d13',
          border: '#263140',
          'border-subtle': '#1a222d',
          card: '#131922',
          elevated: '#1a222e',
        },
        // Deep Forest / Ink Accents (calm, prepared, trustworthy)
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Urgent tokens - used only with meaningful purpose
        urgency: {
          critical: '#ef4444',
          high: '#f59e0b',
          medium: '#eab308',
          low: '#38bdf8',
        },
        slate: {
          750: '#263346',
          850: '#141d2b',
          900: '#0f172a',
          925: '#0b1120',
          950: '#070b12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'glow-emerald': '0 0 16px -2px rgba(16, 185, 129, 0.2)',
        'glow-red': '0 0 16px -2px rgba(239, 68, 68, 0.25)',
      }
    },
  },
  plugins: [],
}
