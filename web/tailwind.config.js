/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF9401',
          highlight: '#FBC67E',
          accent: '#DF5F28',
          brown: '#572D24',
          coffee: '#210B05',
          ink: '#2B2322',
          deep: '#160401',
          gray: '#D9D9D9',
        },
      },
      fontFamily: {
        sans: [
          'Satoshi',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Satoshi',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}