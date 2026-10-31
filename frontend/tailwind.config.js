/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        km: {
          bg: '#F7F8F0',
          primary: '#245C3A',
          'primary-dark': '#1B452B',
          'primary-light': '#2D7248',
          secondary: '#DCE9D5',
          'secondary-dark': '#C5D8BC',
          'secondary-light': '#EDF4EA',
          accent: '#D5A94F',
          'accent-light': '#E2BE71',
          'accent-dark': '#B88E3B',
          text: '#303B32',
          'text-muted': '#68756A',
          'text-light': '#8F9C91',
          card: '#FFFFFF',
        },
        forest: {
          DEFAULT: '#245C3A',
          deep: '#1B452B',
          light: '#2D7248',
        },
        leaf: {
          DEFAULT: '#245C3A',
          soft: '#DCE9D5',
          light: '#EDF4EA',
          dark: '#1B452B',
        },
        ivory: {
          warm: '#F7F8F0',
          paper: '#FFFFFF',
        },
        harvest: {
          amber: '#D5A94F',
          light: '#E2BE71',
          dark: '#B88E3B',
        },
        terracotta: {
          DEFAULT: '#B85C43',
          light: '#D47A62',
          dark: '#93402A',
        },
        ink: {
          DEFAULT: '#303B32',
          muted: '#68756A',
          light: '#8F9C91',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'Manrope', 'sans-serif'],
        display: ['"Fraunces"', 'Manrope', 'serif'],
      },
      boxShadow: {
        'field': '0 4px 20px -2px rgba(36, 92, 58, 0.06), 0 2px 6px -1px rgba(36, 92, 58, 0.04)',
        'field-lg': '0 12px 36px -4px rgba(36, 92, 58, 0.10), 0 4px 12px -2px rgba(36, 92, 58, 0.05)',
        'gold': '0 4px 20px -2px rgba(213, 169, 79, 0.25)',
      }
    },
  },
  plugins: [],
}
