/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#F6F8FB',
        surface: '#FFFFFF',
        'surface-hover': '#EEF3FA',
        border: '#DCE3ED',
        'border-strong': '#C2CCDA',
        ink: '#0F1720',
        muted: '#5B6472',
        faint: '#8B93A1',
        accent: '#148CF0',
        'accent-deep': '#0D6FC4',
        accepted: '#16A34A',
        review: '#D97706',
        draft: '#94A3B8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'lia-pulse': { '0%, 100%': { opacity: 0.55 }, '50%': { opacity: 0.15 } },
        'lia-fade': { from: { opacity: 0, transform: 'translateY(3px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'lia-ping': { '0%': { transform: 'scale(1)', opacity: 0.6 }, '100%': { transform: 'scale(2.2)', opacity: 0 } },
      },
      animation: {
        'lia-pulse': 'lia-pulse 1.6s ease-in-out infinite',
        'lia-fade': 'lia-fade .3s ease both',
        'lia-ping': 'lia-ping 1.8s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
};
