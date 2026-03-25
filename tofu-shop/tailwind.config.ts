import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { serif: ['"Noto Serif TC"', 'Georgia', 'serif'] },
      colors: {
        ink:   '#2c1f0e',
        cream: '#f7f2e8',
        sand:  '#e8dcc8',
        gold:  '#c8973a',
        'gold-lt': '#f0c060',
        brown: '#6b4c1e',
        'brown-lt': '#a07840',
      },
    },
  },
  plugins: [],
}
export default config
