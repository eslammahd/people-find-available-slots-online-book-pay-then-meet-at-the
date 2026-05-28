import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f0f7f4',
          100: '#d9ede6',
          200: '#b3dace',
          300: '#7ec0a8',
          400: '#4fa07f',
          500: '#2e8060',
          600: '#1f674c',
          700: '#1a533e',
          800: '#174233',
          900: '#14362a',
        },
        warm: {
          50: '#faf8f5',
          100: '#f3ede3',
          200: '#e7dac8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
