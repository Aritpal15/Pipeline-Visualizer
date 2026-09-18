/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Courier New"',
          "monospace",
        ],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        tech: {
          green: "#10b981",
          blue: "#2563eb",
          amber: "#f59e0b",
          red: "#ef4444",
          pink: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
};
