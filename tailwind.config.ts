import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#007AFF', // iOS Blue
          900: '#0a192f',
        },
        ios: {
          bg: '#F2F2F7',         // iOS Light Background
          bgDark: '#000000',     // iOS Dark Background
          card: '#FFFFFF',       // iOS Light Card
          cardDark: '#1C1C1E',   // iOS Dark Card
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
