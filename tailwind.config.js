/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f1fbf5",
          100: "#dcf6e6",
          200: "#b9eccc",
          300: "#86dea8",
          400: "#46c77b",
          500: "#1aa85a",
          600: "#11884a",
          700: "#0f6c3d",
          800: "#0f5632",
          900: "#0c472a",
          950: "#062a19",
        },
        slateInk: {
          50: "#f6f7fb",
          100: "#eef0f8",
          200: "#d7dcec",
          300: "#b3bddb",
          400: "#8494c2",
          500: "#6072aa",
          600: "#4c5a8b",
          700: "#3f4a71",
          800: "#353e5c",
          900: "#2f364d",
          950: "#1b1f2e",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        glass: "0 12px 40px rgba(2, 6, 23, 0.35)",
      },
    },
  },
  plugins: [],
};

