/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ou-crimson': '#841617',
        'ou-crimson-dark': '#6a1214',
        'ou-crimson-light': '#9e2b2c',
      },
    },
  },
  plugins: [],
};
