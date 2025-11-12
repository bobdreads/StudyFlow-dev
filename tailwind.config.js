// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ATUALIZAÇÃO: Mudamos a animação para algo mais sutil
      keyframes: {
        'pulse-bg-simple': {
          '0%, 100%': { opacity: 0.4 }, // Mais sutil
          '50%': { opacity: 0.9 },
        }
      },
      animation: {
        // Renomeamos a animação para corresponder
        'pulse-bg-simple': 'pulse-bg-simple 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}