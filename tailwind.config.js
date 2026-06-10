/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D9E75',
          50:  '#E8F7F2',
          100: '#C4EBD9',
          200: '#9DDEBF',
          300: '#6CCDA0',
          400: '#3DBF84',
          500: '#1D9E75',
          600: '#15795A',
          700: '#0E5540',
          800: '#073127',
          900: '#030F0C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
