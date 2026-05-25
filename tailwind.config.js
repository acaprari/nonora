/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5a85be', // Lighter, desaturated blue (was #0d47a1)
        'cell-filled': '#4CAF50',
        'cell-border': '#e0e0e0',
        error: '#f44336',
        success: '#4CAF50',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'ai-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' }
        }
      },
      animation: {
        'ai-pulse': 'ai-pulse 1.5s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}

