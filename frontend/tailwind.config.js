/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        red: {
          "100": "#fee2e2",
          "800": "#991b1b",
        },
        yellow: {
          "100": "#fef3c7",
          "800": "#92400e",
        },
        green: {
          "100": "#dcfce7",
          "800": "#166534",
        },
        blue: {
          "100": "#dbeafe",
          "800": "#1e40af",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-in-top": {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "rotate-icon": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "ping-subtle": {
          "0%": { transform: "scale(1)", opacity: 1 },
          "75%, 100%": { transform: "scale(1.2)", opacity: 0 },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: 0.8 },
          "80%, 100%": { transform: "scale(1.5)", opacity: 0 },
        },
        "progress-bar": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "blink": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.5s ease-out",
        "slide-in-top": "slide-in-top 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "pop": "pop 0.3s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 1.5s infinite linear",
        "rotate-icon": "rotate-icon 0.5s ease-in-out",
        "rotate-continuous": "rotate-icon 2s linear infinite",
        "ping-subtle": "ping-subtle 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite",
        "progress": "progress-bar 2s ease-out forwards",
        "blink": "blink 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

