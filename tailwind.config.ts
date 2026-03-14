import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "kva-navy": "#0a1628",
        "kva-blue": "#1a3a6b",
        "kva-red": "#c8102e",
        "kva-red-dark": "#a00d24",
      },
      backgroundImage: {
        "gradient-kva":
          "linear-gradient(135deg, #0a1628 0%, #1a3a6b 50%, #0d2a5c 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
