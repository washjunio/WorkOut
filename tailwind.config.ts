import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0a1624',
        surface: '#12253a',
        accent: '#2cd0c7',
        'accent-strong': '#1ba39b',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
