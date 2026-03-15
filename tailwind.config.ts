import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#111214",
        surface: "#181a1d",
        "surface-2": "#1d2024",
        "surface-3": "#252930",
        line: "rgba(255, 255, 255, 0.08)",
        accent: "#ccb089",
        "accent-2": "#a68a65",
        success: "#8aa486",
        warning: "#b79162",
        text: "#f3efe7",
        muted: "#a7a094"
      },
      fontFamily: {
        sans: [
          "\"Avenir Next\"",
          "\"Segoe UI\"",
          "\"Helvetica Neue\"",
          "sans-serif"
        ],
        display: [
          "\"Avenir Next\"",
          "\"Segoe UI\"",
          "\"Helvetica Neue\"",
          "sans-serif"
        ]
      },
      boxShadow: {
        soft: "0 28px 80px rgba(0, 0, 0, 0.34)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.04)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(204, 176, 137, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(204, 176, 137, 0.045) 1px, transparent 1px)"
      },
      animation: {
        "pulse-soft": "pulse-soft 2.6s ease-in-out infinite",
        float: "float 10s ease-in-out infinite"
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.95" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
