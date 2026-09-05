import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111827",
        accent: "#2563eb",
      },
    },
  },
  plugins: [],
};

export default config;
