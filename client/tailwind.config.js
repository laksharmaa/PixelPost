/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media' or 'class'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        md: '12px',
      },
      colors: {
        lightBg: '#ffffff', // Light mode background
        darkBg: '#111827', // Dark mode background
        lightText: '#000000', // Light mode text
        darkText: '#ffffff', // Dark mode text
        lightInput: '#f3f4f6', // Light mode input
        darkInput: '#1f2937', // Dark mode input
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
    },

  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}