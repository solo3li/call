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
          bg: '#161616', // Gray 100
          layer: '#262626', // Gray 90
          layerHover: '#393939', // Gray 80
          border: '#393939', // Gray 80
          darkBg: '#f4f4f4', // Gray 10
          darkLayer: '#ffffff', // White
          darkHover: '#e5e5e5', // Gray 20
          darkBorder: '#e0e0e0', // Gray 20
          blue: '#0f62fe', // Blue 60
          blueHover: '#0353e9', // Blue 70
          text: '#f4f4f4', // Gray 10
          textSecondary: '#a8a8a8', // Gray 40
          darkText: '#161616', // Gray 100
          darkTextSecondary: '#525252', // Gray 60
          success: '#24a148',
          error: '#da1e28',
          warning: '#f1c21b',
          purple: '#8a3ffc',
        }
      },
      fontFamily: {
        plex: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
