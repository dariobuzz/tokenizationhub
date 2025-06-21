import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#6b7280',
          700: '#374151',
          800: '#1f2937',
        },
        green: {
          100: '#dcfce7',
          600: '#16a34a',
          800: '#166534',
        },
        red: {
          600: '#dc2626',
        },
        purple: {
          100: '#f3e8ff',
          600: '#9333ea',
        },
      },
    },
  },
  plugins: [],
};

export default config;