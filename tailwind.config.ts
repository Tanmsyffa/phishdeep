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
          bg: '#F2F2F7',         // iOS Light Background — systemGroupedBackground
          bgDark: '#000000',     // iOS Dark Background — systemBackground
          card: '#FFFFFF',       // iOS Light Card — secondarySystemGroupedBackground
          cardDark: '#1C1C1E',   // iOS Dark Card — secondarySystemBackground
          card2Dark: '#2C2C2E',  // iOS Dark Card Level 2 — tertiarySystemBackground
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
