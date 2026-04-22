import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        paper: "#fffaf2",
        coral: "#f97360",
        teal: "#0f766e",
        sand: "#f4e8d7",
      },
      boxShadow: {
        receipt: "0 24px 60px rgba(31, 41, 55, 0.12)",
      },
      fontFamily: {
        sans: ["\"Avenir Next\"", "Avenir", "\"Segoe UI\"", "sans-serif"],
        mono: ["\"SFMono-Regular\"", "\"SF Mono\"", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
