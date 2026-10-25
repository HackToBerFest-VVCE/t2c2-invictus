/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gh: {
          bg: "#0b0f17",
          panel: "#131823",
          subpanel: "#090d14",
          header: "#1c2333",
          border: "#263042",
          borderMuted: "#1e2638",
          text: "#c9d1d9",
          textMuted: "#8b949e",
          textWhite: "#f0f6fc",
          blue: "#58a6ff",
          blueHover: "#79b8ff",
          green: "#238636",
          greenHover: "#2ea043",
          greenText: "#3fb950",
          red: "#da3633",
          redHover: "#f85149",
          redText: "#f85149",
          purple: "#bc8cff",
          amber: "#d29922",
        },
        brand: {
          50: "#eef2ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
        "glass-hover": "0 14px 44px 0 rgba(0, 0, 0, 0.5), inset 0 1px 2px 0 rgba(255, 255, 255, 0.22)",
        "glow-indigo": "0 0 25px -4px rgba(99, 102, 241, 0.4)",
        "glow-emerald": "0 0 25px -4px rgba(52, 211, 153, 0.35)",
        "glow-rose": "0 0 25px -4px rgba(244, 63, 94, 0.35)",
      },
      animation: {
        "liquid-slow": "liquidFloat 18s ease-in-out infinite alternate",
        "liquid-fast": "liquidFloat 12s ease-in-out infinite alternate-reverse",
      },
      keyframes: {
        liquidFloat: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(30px, -20px) scale(1.08)" },
          "100%": { transform: "translate(-20px, 20px) scale(0.96)" },
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
