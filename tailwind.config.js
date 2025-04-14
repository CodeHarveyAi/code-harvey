/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // includes all JS/TS/React files inside `app` folder
    './pages/**/*.{js,ts,jsx,tsx}', // if you have a pages folder
    './components/**/*.{js,ts,jsx,tsx}', // if you have components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
