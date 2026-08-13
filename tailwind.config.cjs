/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2D6A4F',      // ForestGreen
          secondary: '#95D5B2',    // SageGreen
          mint: '#F1FAEE',         // MintCream
          gold: '#B8860B',         // DarkGold
          bg: '#0F1F17',           // DeepForest
          surface: '#1A2B22',      // DarkSurface
          white: '#E6F4EA',        // MintWhite
          sage: '#274C3A',         // DeepSage
          accent: '#B8860B'
        }
      },
      textColor: {
        main: 'var(--text-main)',
        sub: 'var(--text-sub)',
      },
      backgroundColor: {
        'surface-glass': 'var(--surface-glass)',
      }
    },
  },
  plugins: [],
}
