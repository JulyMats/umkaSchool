/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        primary: {
          light: "#fbcfe8", // light pink for background
          DEFAULT: "#f472b6", // pink accent
          dark: "#ec4899", // strong pink for text 
        },
        secondary: {
          light: "#bfdbfe", // light blue for background
          DEFAULT: "#60a5fa", //  blue accent
          dark: "#2563eb", // strong blue for text 
        },
        grayLight: "#f9fafb", // for cards and layout background
        grayText: "#6b7280", // neutral gray for text
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
}
