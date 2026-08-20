/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'asinp-laranja': '#ff7b00ff',
        'asinp-verde': '#278f37ff',
        'asinp-amarelo': '#fca533ff',
        'asinp-azul': '#3575cc',
      }
    }
  },
  plugins: [],
}