/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px -20px rgba(15, 23, 42, 0.35)',
      },
      fontFamily: {
        sans: ['"Trebuchet MS"', '"Segoe UI Variable"', '"Segoe UI"', 'sans-serif'],
        display: ['Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}
