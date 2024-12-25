/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        'text-dark': 'var(--text-dark)',
      },
    },
  },
  plugins: [],
}