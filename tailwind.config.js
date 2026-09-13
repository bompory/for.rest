/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FDF8F0',
        sage: { DEFAULT: '#A8C9A1', light: '#D7E8D3', dark: '#7FA377' },
        peach: { DEFAULT: '#F7C7A3', light: '#FBE3CE', dark: '#EFA871' },
        sky: { DEFAULT: '#AFD8E8', light: '#DCEFF6', dark: '#7CBBD4' },
        warmOrange: { DEFAULT: '#F2994A', light: '#FBE0C6' },
        ink: '#5B4A3F',
      },
      fontFamily: {
        round: ['"Baloo 2"', '"Gowun Dodum"', 'sans-serif'],
        body: ['"Gowun Dodum"', '"Baloo 2"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '20px',
        xl3: '28px',
      },
      boxShadow: {
        soft: '0 4px 14px rgba(91, 74, 63, 0.10)',
        softer: '0 2px 8px rgba(91, 74, 63, 0.08)',
      },
    },
  },
  plugins: [],
}
