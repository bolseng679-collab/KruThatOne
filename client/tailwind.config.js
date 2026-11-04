/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
        },
        khmer: {
          teal: '#0f766e',
          dark: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Kantumruy Pro', 'Noto Sans Khmer', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

