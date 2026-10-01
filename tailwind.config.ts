import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jadoo: {
          navy: "#181E4B",
          slate: "#5E6282",
          coral: "#DF6951",
          tangerine: "#FA7436",
          amber: "#F1A501",
          gold: "#FFB606",
          lagoon: "#14B8A6",
          ocean: "#0D9488",
          sand: "#FFFDF9",
          cream: "#FAF6ED",
          lime: "#C8E972",
        },
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        coral: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        sage: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          500: "#10b981",
          600: "#059669",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        display: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(24, 30, 75, 0.05), 0 2px 6px -1px rgba(24, 30, 75, 0.02)",
        "card-hover": "0 20px 40px -8px rgba(223, 105, 81, 0.15), 0 6px 16px -2px rgba(24, 30, 75, 0.06)",
        float: "0 24px 48px -12px rgba(24, 30, 75, 0.12)",
        amber: "0 12px 28px -6px rgba(241, 165, 1, 0.4)",
        coral: "0 12px 28px -6px rgba(223, 105, 81, 0.35)",
        lagoon: "0 12px 28px -6px rgba(20, 184, 166, 0.3)",
      }
    },
  },
  plugins: [],
};
export default config;
