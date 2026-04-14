/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ig: {
          bg:            '#FAFAFA',
          card:          '#FFFFFF',
          border:        '#DBDBDB',
          text:          '#262626',
          secondary:     '#8e8e8e',
          purple:        '#ae7aff',
          'purple-dark': '#9452ff',
          'purple-light':'#f0e6ff',
          red:           '#ed4956',
        },
      },
      animation: {
        'heart-pop':  'heartPop 0.3s ease-in-out',
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        shimmer:      'shimmer 1.6s infinite linear',
      },
      keyframes: {
        heartPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition:  '1000px 0' },
        },
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
}
