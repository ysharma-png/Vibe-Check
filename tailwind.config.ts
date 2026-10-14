import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090B",
        surface: {
          DEFAULT: "rgba(18, 22, 26, 0.70)",
          subtle: "rgba(22, 27, 32, 0.60)",
          muted: "rgba(28, 34, 40, 0.70)",
          border: "rgba(255, 255, 255, 0.08)",
          "border-hover": "rgba(255, 255, 255, 0.18)",
        },
        content: {
          primary: "#F4F6F8",
          muted: "#96A0AB",
          faint: "#545E6A",
        },
        accent: {
          DEFAULT: "#D8FD38", // Electric Acid Lime
          subtle: "rgba(216, 253, 56, 0.14)",
          hover: "#E5FF66",
          darkText: "#08090B",
        },
        coral: {
          DEFAULT: "#FF6842", // Molten Solar Coral
          subtle: "rgba(255, 104, 66, 0.14)",
          hover: "#FF8261",
        },
        ice: {
          DEFAULT: "#38F2C7", // Ice Cyan Trust
          subtle: "rgba(56, 242, 199, 0.14)",
          hover: "#5BFFD7",
        },
        verified: {
          DEFAULT: "#38F2C7",
          subtle: "rgba(56, 242, 199, 0.14)",
        },
        caution: {
          DEFAULT: "#FFB020",
          subtle: "rgba(255, 176, 32, 0.14)",
        },
        flagged: {
          DEFAULT: "#FF4D4D",
          subtle: "rgba(255, 77, 77, 0.14)",
        },
      },
      borderRadius: {
        "10": "10px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 8px 32px -4px rgba(0, 0, 0, 0.45)",
        card: "0 16px 40px -10px rgba(0, 0, 0, 0.55)",
        lift: "0 24px 60px -12px rgba(0, 0, 0, 0.65)",
        "accent-glow": "0 0 25px -4px rgba(216, 253, 56, 0.35)",
        "coral-glow": "0 0 25px -4px rgba(255, 104, 66, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
