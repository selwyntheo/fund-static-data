/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        confidence: {
          high: '#22c55e',    // Green (90-100%)
          medium: '#eab308',  // Yellow (70-89%)
          low: '#f97316',     // Orange (50-69%)
          verylow: '#ef4444', // Red (<50%)
        }
      }
    },
  },
  plugins: [],
}