/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#f4f4f4', // Gray 10
          layer: '#ffffff', // White
          layerHover: '#e5e5e5', // Gray 20
          border: '#e0e0e0', // Gray 20
          darkBg: '#161616', // Gray 100
          darkLayer: '#262626', // Gray 90
          darkHover: '#393939', // Gray 80
          darkBorder: '#393939', // Border
          blue: '#0f62fe', // Blue 60
          blueHover: '#0353e9', // Blue 70
          text: '#161616', // Gray 100
          textSecondary: '#525252', // Gray 60
          darkText: '#f4f4f4', // Gray 10
          darkTextSecondary: '#c6c6c6', // Gray 30
          success: '#24a148',
          error: '#da1e28',
          warning: '#f1c21b',
        }
      },
      fontFamily: {
        plex: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
