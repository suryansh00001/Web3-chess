/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-primary': '#312e2b',
        'chess-secondary': '#769656',
        'chess-accent': '#eeeed2',
      }
    },
  },
  plugins: [],
}
