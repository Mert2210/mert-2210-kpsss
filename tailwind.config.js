/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn95: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInFromRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInFromTop2: {
          '0%':   { opacity: '0', transform: 'translateY(-0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromTop4: {
          '0%':   { opacity: '0', transform: 'translateY(-1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromBottom6: {
          '0%':   { opacity: '0', transform: 'translateY(1.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromRight6: {
          '0%':   { opacity: '0', transform: 'translateX(1.5rem)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in':              'fadeIn 0.2s ease-out',
        'zoom-in-95':           'zoomIn95 0.2s ease-out',
        'slide-in-from-right':  'slideInFromRight 0.3s ease-out',
        'slide-in-from-top-2':  'slideInFromTop2 0.2s ease-out',
        'slide-in-from-top-4':  'slideInFromTop4 0.2s ease-out',
        'slide-in-from-bottom-6': 'slideInFromBottom6 0.3s ease-out',
        'slide-in-from-right-6':  'slideInFromRight6 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
