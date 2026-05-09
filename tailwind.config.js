/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f0eb',
          100: '#e8ddd2',
          200: '#d0bba5',
          300: '#b89878',
          400: '#a07855',
          500: '#8a6340',
          600: '#6f4f32',
          700: '#573d27',
          800: '#3d2b1b',
          900: '#241a10',
          950: '#130d07',
        },
        paper: {
          50: '#fefcf8',
          100: '#fdf8f0',
          200: '#f9f0e0',
          300: '#f3e5cc',
          400: '#ead4b0',
          500: '#dfc094',
        },
        sage: {
          400: '#87a878',
          500: '#6d9160',
          600: '#567348',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
