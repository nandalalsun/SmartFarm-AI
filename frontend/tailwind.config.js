/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#0B6623',
        'forest-green-light': '#2E8B57',
        'honey-gold': '#D4AF37',
        'honey-gold-light': '#FFD700',
        'off-white': '#FAF9F6',
      }
    },
  },
  plugins: [],
}
