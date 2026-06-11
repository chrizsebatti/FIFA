/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fifa: {
          green: '#00a651',
          dark: '#1a1a2e',
          gold: '#f5c518',
        },
      },
    },
  },
  plugins: [],
};
