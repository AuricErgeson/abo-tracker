/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#FAFAF8',
          dark: '#141412',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1E1E1B',
        },
        line: {
          DEFAULT: '#E8E6E0',
          dark: '#2C2C28',
        },
        ink: {
          DEFAULT: '#1A1A18',
          dark: '#F0EDE6',
        },
        muted: {
          DEFAULT: '#888580',
          dark: '#6B6860',
        },
        accent: {
          DEFAULT: '#2D6A4F',
          hover: '#235C43',
        },
        danger: '#C0392B',
        warning: '#D97706',
        success: '#2D6A4F',
      },
      borderRadius: {
        card: '10px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};
