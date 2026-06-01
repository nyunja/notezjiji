/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        indigo: {
          50: '#faf4f0',
          100: '#f4e5db',
          200: '#e5c6b2',
          300: '#d29e7f',
          400: '#bf7e58',
          500: '#aa5b2e',
          600: '#904820',
          700: '#773919',
          800: '#5f2e14',
          900: '#4b2410',
          950: '#2e1306',
        },
        violet: {
          50: '#fbf8f3',
          100: '#f6ebd9',
          200: '#edd4b3',
          300: '#e1b782',
          400: '#d39955',
          500: '#c57e33',
          600: '#b26927',
          700: '#94521e',
          800: '#77411a',
          900: '#603316',
          950: '#341909',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

