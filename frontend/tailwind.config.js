/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F4C81',
        accent: '#00C896',
        warning: '#F59E0B',
        background: '#F8FAFC',
        card: '#FFFFFF',
        textPrimary: '#1E293B',
        textSecondary: '#64748B',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
