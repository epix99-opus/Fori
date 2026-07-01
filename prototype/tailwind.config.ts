import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          100: "#DBEAFE",
          300: "#93C5FD",
          500: "#2563EB",
          700: "#1A4B82",
          900: "#0D2B4E",
        },
        secondary: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
          200: "#FDE68A",
          500: "#D97706",
          600: "#B45309",
        },
        semantic: {
          success: "#16A34A",
          danger: "#DC2626",
          warning: "#D97706",
          info: "#0284C7",
        },
        neutral: {
          100: "#F3F4F6",
          200: "#E5E7EB",
          500: "#6B7280",
          700: "#374151",
          900: "#111827",
          white: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#DBEAFE",
          foreground: "#1A4B82",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        numeric: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        display: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        h3: ["17px", { lineHeight: "24px", fontWeight: "600" }],
        "body-l": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-m": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "body-s": ["13px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "price-l": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "price-m": ["20px", { lineHeight: "28px", fontWeight: "600" }],
      },
      fontWeight: {
        regular: "400",
        semibold: "600",
        bold: "700",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.08)",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
