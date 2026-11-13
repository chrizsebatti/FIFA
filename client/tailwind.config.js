/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#800020',
          light: '#9A2742',
          dark: '#5C0018',
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          dark: '#F5F5F5',
          muted: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
};
