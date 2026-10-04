/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        teal500: "rgb(var(--teal-500-rgb) / <alpha-value>)",
        clay600: "rgb(var(--clay-600-rgb) / <alpha-value>)",
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        primaryHover: "var(--primary-hover)",
        primarySoft: "var(--primary-soft)",
        primarySoftFg: "var(--primary-soft-fg)",
        ink2: "var(--text-2)",
        muted: "var(--text-muted)",
      },
    },
  },
  plugins: [],
};
