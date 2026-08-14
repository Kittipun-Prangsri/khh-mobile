/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal / Clinical healing accent
          600: '#0d9488',
          700: '#0f766e',
          850: '#115e59',
          900: '#134e4a',
        },
        navy: {
          50: '#f4f6fa',
          100: '#e8ecf5',
          200: '#c5d0e6',
          300: '#95abd1',
          400: '#5d80b8',
          500: '#3b5c92',
          600: '#2e4976',
          700: '#263b62',
          800: '#1b2a47',
          900: '#0f172a',
          950: '#080d1a',
        }
      },
      fontFamily: {
        sans: ['var(--font-prompt)', 'Prompt', 'var(--font-sarabun)', 'Sarabun', 'var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        prompt: ['var(--font-prompt)', 'Prompt', 'sans-serif'],
        sarabun: ['var(--font-sarabun)', 'Sarabun', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
        'clinical-gradient': 'linear-gradient(135deg, #1b2a47 0%, #0d9488 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px 2px rgba(20, 184, 166, 0.3)',
      }
    },
  },
  plugins: [],
}
