import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3c8dbc",
        "primary-foreground": "#ffffff",
        foreground: "#2b2f33",
        background: "#f4f6f9",
        muted: "#eef1f5",
        "muted-foreground": "#6b7280",
        border: "#d9dee3",
        card: "#ffffff",
        input: "#d9dee3",
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
        soft: "0 1px 3px rgba(0, 0, 0, 0.08)",
        glass: "0 10px 30px rgba(17, 24, 39, 0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
