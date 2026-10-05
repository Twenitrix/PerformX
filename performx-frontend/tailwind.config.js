/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        ink: { DEFAULT: '#0F172A', soft: '#334155', muted: '#64748B' },
        brand: { 50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 500: '#4F46E5', 600: '#4338CA', 700: '#3730A3' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        pop: '0 10px 30px -10px rgba(15,23,42,0.25)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        slideIn: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
      },
      animation: {
        fadeUp: 'fadeUp .35s cubic-bezier(0.25,0.46,0.45,0.94) both',
        fadeIn: 'fadeIn .2s ease-out both',
        scaleIn: 'scaleIn .2s cubic-bezier(0.25,0.46,0.45,0.94) both',
        slideIn: 'slideIn .25s cubic-bezier(0.25,0.46,0.45,0.94) both',
      },
    },
  },
  plugins: [],
}
