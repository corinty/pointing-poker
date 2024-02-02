import type { Config } from 'tailwindcss'

export default {
  content: ["./app/routes/**/*.{tsx,js}", "./app/root.tsx"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
