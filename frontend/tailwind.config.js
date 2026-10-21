/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/admin/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          2: '#F7FBF8',
        },
        sidebar: '#FFFFFF',
        card: '#FFFFFF',
        elevated: '#F3F8F4',
        line: '#D7E8DC',
        brand: {
          DEFAULT: '#22C55E',
          2: '#16A34A',
          mint: '#BBF7D0',
        },
        ink: {
          DEFAULT: '#0B1F12',
          2: '#4B6354',
          3: '#7A8F82',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 10px 30px rgba(11, 31, 18, 0.08)',
        lift: '0 8px 20px rgba(34, 197, 94, 0.12)',
      },
      borderRadius: {
        panel: '1rem',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
}
