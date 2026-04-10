/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        surface: {
          base: '#050505',
          raised: '#0a0a0a',
          overlay: '#0f0f0f',
          card: '#111111',
          'card-hover': '#161616',
          input: '#1a1a1a',
        },
        accent: {
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#7c3aed',
        },
      },
      boxShadow: {
        'card-hover': '0 8px 30px rgba(0,0,0,0.4), 0 0 20px rgba(168, 85, 247, 0.08)',
      },
    },
  },
  plugins: [],
}
