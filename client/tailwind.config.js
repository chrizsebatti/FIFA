/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fifa: {
          green: '#00a651',
          dark: '#ffffff',
          gold: '#FF6D00',
          goldLight: '#FF8A33',
          yellow: '#FF6D00',
          primary: '#FF6D00',
        },
      },
    },
  },
  plugins: [],
};
