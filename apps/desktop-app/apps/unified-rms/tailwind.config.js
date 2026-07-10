/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#161616', // Main background
          layer: '#262626', // Panel background
          layerHover: '#393939', // Panel hover
          border: '#393939', // Border
          blue: '#0f62fe', // Primary interaction
          blueHover: '#0353e9',
          text: '#f4f4f4', // Primary text
          textSecondary: '#c6c6c6', // Secondary text
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
