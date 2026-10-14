export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      colors: {
        navy: {
          50: '#eef4fb',
          100: '#d7e5f5',
          200: '#adc9e9',
          600: '#16467f',
          700: '#103764',
          800: '#0c2c51',
          900: '#08203c',
        },
        brand: {
          50: '#eaf3ff',
          100: '#d4e6ff',
          200: '#a9ccff',
          400: '#5b9bf5',
          500: '#2f7fee',
          600: '#1668e3',
          700: '#0f53b8',
        },
        gold: {
          400: '#f7ce4b',
          500: '#eeb821',
        },
        leaf: {
          50: '#e9f7ef',
          200: '#b6e2c8',
          500: '#1f9d55',
          600: '#178047',
        },
        ink: {
          200: '#ccd2dc',
          300: '#a7afbe',
          400: '#8a94a6',
          500: '#5d6879',
          700: '#2f3948',
          900: '#141b26',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f4f7fb',
          border: '#e3e9f2',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 55, 100, 0.06), 0 8px 24px -16px rgba(16, 55, 100, 0.25)',
        pop: '0 12px 40px -12px rgba(8, 32, 60, 0.35)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 220ms cubic-bezier(0.23, 1, 0.32, 1) both',
      },
    },
  },
}
