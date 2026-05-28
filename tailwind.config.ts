import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff', 100: '#e0effe', 200: '#bae0fd', 300: '#7dc8fb',
          400: '#38aaf5', 500: '#0e8de6', 600: '#036ec4', 700: '#04589f',
          800: '#084b83', 900: '#0c3f6d', 950: '#082848',
        },
      },
    },
  },
  plugins: [],
};
export default config;
