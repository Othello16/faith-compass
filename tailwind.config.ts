import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}','./src/components/**/*.{js,ts,jsx,tsx,mdx}','./src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'faith-blue': '#1E40AF',
        'faith-gold': '#D4AF37',
        'faith-dark': '#0F172A',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
      }
    },
  },
  plugins: [],
}
export default config
