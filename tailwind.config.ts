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
    },
  },
  plugins: [],
};

export default config;
