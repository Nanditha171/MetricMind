/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        sidebar: {
          bg: '#0B0F19',
          card: '#111827',
          hover: '#1F2937',
          active: '#1E293B',
          border: '#1E293B',
          text: '#94A3B8',
          textBright: '#F8FAFC'
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          cardMuted: '#F1F5F9',
          border: '#E2E8F0',
          borderHover: '#CBD5E1',
          textMain: '#0F172A',
          textMuted: '#64748B',
          textSubtle: '#94A3B8'
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'card': '0.875rem',
      }
    },
  },
  plugins: [],
}
