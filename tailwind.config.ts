import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF6EC',
        'paper-deep': '#F3EADA',
        card: '#FFFDF8',
        ink: '#1A1714',
        'ink-soft': '#5B544B',
        rule: '#E4D9C6',
        tomato: '#FF5A36',
        butter: '#FFC93C',
        mint: '#34D399',
        sky: '#4D8DFF',
        grape: '#A77BFF',
        'tomato-tint': '#FFE1D8',
        'butter-tint': '#FFF1C7',
        'mint-tint': '#D5F6E9',
        'sky-tint': '#DCE8FF',
        'grape-tint': '#ECE3FF',
      },
      fontFamily: {
        display: ['Bricolage Grotesque Variable', 'system-ui', 'sans-serif'],
        sans: ['Figtree Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0 #1A1714',
        'hard-md': '6px 6px 0 #1A1714',
        'hard-lg': '8px 8px 0 #1A1714',
      },
      borderWidth: {
        3: '3px',
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
