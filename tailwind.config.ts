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
        // Backgrounds
        background: "var(--background)",
        card: {
          DEFAULT: "var(--card-background)",
          foreground: "var(--foreground)",
        },
        sidebar: "var(--sidebar-background)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        
        // Text colors
        foreground: {
          DEFAULT: "var(--foreground)",
          light: "var(--foreground-light)",
        },
        
        // Borders
        border: {
          DEFAULT: "var(--border)",
          card: "var(--card-border)",
          input: "var(--input-border)",
        },
        
        // Primary/Accent
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          focus: "var(--primary-focus)",
          foreground: "var(--accent-foreground)",
        },
        
        // State colors
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        
        // Input fields
        input: {
          DEFAULT: "var(--input-background)",
          border: "var(--input-border)",
          focus: "var(--input-focus-border)",
        },
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      backgroundColor: {
        DEFAULT: "var(--background)",
      },
      textColor: {
        DEFAULT: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
