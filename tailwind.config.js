/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F755D',
          dark: '#1F5C46',
          light: '#408B71',
        },
        secondary: {
          DEFAULT: '#94A3B8',
          dark: '#64748B',
          light: '#CBD5E1',
        },
        background: {
          DEFAULT: '#F0F9F6',
          dark: '#E0F2ED',
          light: '#FFFFFF',
        },
        text: {
          DEFAULT: '#0F172A',
          light: '#334155',
          lighter: '#64748B',
        },
        accent: {
          DEFAULT: '#2F755D',
          dark: '#1F5C46',
          light: '#408B71',
        }
      },
    },
  },
  plugins: [],
};
