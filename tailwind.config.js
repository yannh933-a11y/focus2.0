/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 16px 40px rgba(0,0,0,.18)',
        lift: '0 8px 24px rgba(0,0,0,.16)'
      }
    }
  },
  plugins: []
}
