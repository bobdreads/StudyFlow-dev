/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Adicione esta seção
      keyframes: {
        'pulse-bg': {
          '0%, 100%': { backgroundColor: 'rgb(17 24 39)' }, // bg-gray-900
          '50%': { backgroundColor: 'rgb(31 41 55)' }, // bg-gray-800
        }
      },
      animation: {
        'pulse-bg': 'pulse-bg 6s ease-in-out infinite',
      }
      // Fim da seção
    },
  },
  plugins: [],
}

