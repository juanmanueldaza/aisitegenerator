/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom fonts for sci-fi aesthetic
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Custom animations for sci-fi effects
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        holographic: 'holographic 3s ease-in-out infinite',
        'grid-move': 'grid-move 20s linear infinite',
        shine: 'shine 0.5s ease-out',
        typing: 'typing 3s steps(40, end), blink-caret 0.75s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px hsl(var(--p)), 0 0 10px hsl(var(--p)), 0 0 15px hsl(var(--p))',
          },
          '50%': {
            boxShadow: '0 0 10px hsl(var(--p)), 0 0 20px hsl(var(--p)), 0 0 30px hsl(var(--p))',
          },
        },
        holographic: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '20px 20px' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: 'hsl(var(--p))' },
        },
      },
      // Custom backdrop blur utilities
      backdropBlur: {
        xs: '2px',
      },
      // Custom box shadow for sci-fi effects
      boxShadow: {
        'glow-primary': '0 0 20px hsl(var(--p) / 0.3)',
        'glow-secondary': '0 0 20px hsl(var(--s) / 0.3)',
        'glow-accent': '0 0 20px hsl(var(--a) / 0.3)',
        neon: '0 0 5px hsl(var(--p)), 0 0 10px hsl(var(--p)), 0 0 15px hsl(var(--p))',
      },
      // Custom background images for sci-fi patterns
      backgroundImage: {
        'cyber-grid':
          'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)',
        holographic: 'linear-gradient(45deg, hsl(var(--p)), hsl(var(--a)), hsl(var(--s)))',
      },
      backgroundSize: {
        'cyber-grid': '20px 20px',
        holographic: '200% 200%',
      },
      // Custom ring colors for focus states
      ringColor: {
        'sci-fi': 'rgba(0, 212, 255, 0.5)',
      },
      // Custom border radius for sci-fi elements
      borderRadius: {
        'sci-fi': '0.75rem',
      },
    },
  },
  // Safelist to ensure certain utilities are always included
  safelist: [
    'w-px',
    'h-px',
    'w-1.5',
    'h-1.5',
    'bg-gray-100',
    'bg-gray-100/50',
    'bg-gray-200',
    'border-gray-300',
    {
      pattern:
        /^(w-|h-)(0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/,
    },
  ],
  plugins: [
    require('daisyui'),
    // Custom plugin for sci-fi utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.glass-card': {
          backdropFilter: 'blur(16px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.glass-card-sci-fi': {
          backdropFilter: 'blur(16px) saturate(180%)',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.neon-glow': {
          position: 'relative',
        },
        '.neon-glow::before': {
          content: '""',
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          background: 'linear-gradient(45deg, hsl(var(--p)), hsl(var(--a)), hsl(var(--s)))',
          borderRadius: 'inherit',
          zIndex: '-1',
          opacity: '0',
          transition: 'opacity 0.3s ease',
        },
        '.neon-glow:hover::before': {
          opacity: '0.3',
        },
        '.holographic-text': {
          background: 'linear-gradient(45deg, hsl(var(--p)), hsl(var(--a)), hsl(var(--s)))',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'holographic 3s ease-in-out infinite',
        },
        '.btn-sci-fi': {
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.btn-sci-fi::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s',
        },
        '.btn-sci-fi:hover::before': {
          left: '100%',
        },
        '.typing-animation': {
          overflow: 'hidden',
          borderRight: '2px solid hsl(var(--p))',
          whiteSpace: 'nowrap',
          animation: 'typing 3s steps(40, end), blink-caret 0.75s step-end infinite',
        },
        '.focus-ring-sci-fi': {
          outline: '2px solid hsl(var(--p))',
          outlineOffset: '2px',
          boxShadow: '0 0 0 4px rgba(0, 212, 255, 0.2)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
  // DaisyUI configuration
  daisyui: {
    themes: ['light', 'dark'],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
};
