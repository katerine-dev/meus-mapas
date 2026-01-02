import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',

        // Borders
        border: 'var(--border)',
        'border-light': 'var(--border-light)',

        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-placeholder': 'var(--text-placeholder)',

        // Primary (roxo)
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-active': 'var(--primary-active)',
        'primary-light': 'var(--primary-light)',
        'primary-muted': 'var(--primary-muted)',

        // Focus
        'focus-ring': 'var(--focus-ring)',

        // Destructive
        destructive: 'var(--destructive)',
        'destructive-hover': 'var(--destructive-hover)',
        'destructive-light': 'var(--destructive-light)',
        'destructive-border': 'var(--destructive-border)',

        // Success/Warning
        success: 'var(--success)',
        'success-light': 'var(--success-light)',
        warning: 'var(--warning)',
        'warning-light': 'var(--warning-light)',

        // Selection
        'selection-bg': 'var(--selection-bg)',
        'selection-border': 'var(--selection-border)',

        // Legacy (compatibilidade)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        purple: {
          darkest: 'var(--purple-darkest)',
          dark: 'var(--purple-dark)',
          main: 'var(--purple-main)',
          light: 'var(--purple-light)',
          lightest: 'var(--purple-lightest)',
        },
      },
      boxShadow: {
        'focus-ring': '0 0 0 3px var(--focus-ring)',
      },
    },
  },
  plugins: [],
};

export default config;
