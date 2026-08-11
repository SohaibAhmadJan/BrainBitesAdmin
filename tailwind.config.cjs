/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2D6A4F',      // ForestGreen
          secondary: '#95D5B2',    // SageGreen
          mint: '#F1FAEE',         // MintCream
          gold: '#E9C46A',         // SoftGold
          bg: '#0F1F17',           // DeepForest
          surface: '#1A2B22',      // DarkSurface
          white: '#E6F4EA',        // MintWhite
          sage: '#274C3A',         // DeepSage
          accent: '#E9C46A'
        }
      }
    },
  },
  plugins: [],
}
