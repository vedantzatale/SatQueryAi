import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Strict monochrome geospatial palette (Zero blue, purple, gold, cyan)
        geo: {
          950: "#080808",
          900: "#0f0f0f",
          850: "#141414",
          800: "#1a1a1a",
          750: "#222222",
          700: "#2a2a2a",
          600: "#3d3d3d",
          500: "#525252",
          400: "#737373",
          300: "#a3a3a3",
          200: "#d4d4d4",
          100: "#e5e5e5",
          50: "#f5f5f4",
          surface: "#fafaf9",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          medium: "rgba(255, 255, 255, 0.15)",
          light: "rgba(0, 0, 0, 0.08)",
          lightMedium: "rgba(0, 0, 0, 0.15)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
