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
          bg: "#0d1117",
          panel: "#161b22",
          subpanel: "#090d13",
          header: "#21262d",
          border: "#30363d",
          borderMuted: "#21262d",
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
