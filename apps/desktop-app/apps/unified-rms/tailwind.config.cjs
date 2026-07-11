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
          bg: '#f4f4f4', // Light background
          layer: '#ffffff', // Light layer
          layerHover: '#e5e5e5', // Light hover
          border: '#e0e0e0', // Light border
          darkBg: '#161616', // Dark background
          darkLayer: '#262626', // Dark layer
          darkHover: '#393939', // Dark hover
          darkBorder: '#393939', // Dark border
          blue: '#0f62fe', // Blue 60
          blueHover: '#0353e9', // Blue 70
          text: '#161616', // Dark text (for light background)
          textSecondary: '#525252', // Dark secondary text
          darkText: '#f4f4f4', // Light text (for dark background)
          darkTextSecondary: '#a8a8a8', // Light secondary text
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
