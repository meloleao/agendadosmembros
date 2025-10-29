/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./integrations/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tce-pi-green': '#006A4E',
        'tce-pi-green-dark': '#00523D',
        'tce-pi-blue': '#007bff',
        'tce-pi-blue-dark': '#0056b3',
      }
    },
  },
  plugins: [],
}