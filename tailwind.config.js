/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './constants/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#00A86B',
        'brand-pink': '#FF6F91',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        base: ['Inter', 'System', 'sans-serif'],
        'base-semibold': ['Inter', 'System', 'sans-serif'],
        'base-bold': ['Inter', 'System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
