/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media' or 'class'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBg: '#ffffff', // Light mode background
        darkBg: '#111827', // Dark mode background
        lightText: '#000000', // Light mode text
        darkText: '#ffffff', // Dark mode text
        lightInput: '#f3f4f6', // Light mode input
        darkInput: '#1f2937', // Dark mode input
      },
    },
  },
  plugins: [],
}