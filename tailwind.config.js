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
        primary: {
          DEFAULT: '#2D3AFE',
          dark: '#1E2AEF',
          light: '#4F5BFF'
        },
        secondary: {
          DEFAULT: '#00F7FF',
          dark: '#00D1D9',
          light: '#7FFFFF'
        },
        accent: {
          DEFAULT: '#FF2E63',
          dark: '#E31C4F',
          light: '#FF6B8E'
        },
        background: {
          DEFAULT: '#0A1128',
          dark: '#050914',
          light: '#1A2542'
        },
        surface: {
          DEFAULT: '#1C2541',
          dark: '#131A2E',
          light: '#2C3B5F'
        }
      },
    },
  },
  plugins: [],
}
