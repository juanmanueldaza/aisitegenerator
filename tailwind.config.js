/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#f8fafc',
        'chat-user': '#3b82f6',
        'chat-ai': '#10b981',
        'chat-border': '#e2e8f0',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}