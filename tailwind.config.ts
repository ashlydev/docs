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
        background: "#06101d",
        surface: "#0c1627",
        "surface-2": "#101d32",
        "surface-3": "#152540",
        line: "rgba(148, 163, 184, 0.18)",
        accent: "#7dd3fc",
        "accent-2": "#38bdf8",
        success: "#34d399",
        warning: "#fbbf24",
        text: "#f7fbff",
        muted: "#9fb1c6"
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
        soft: "0 24px 80px rgba(2, 6, 23, 0.35)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.05)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px)"
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
