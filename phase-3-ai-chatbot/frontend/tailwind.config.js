/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Metallic Chic Theme - Light Blue Metallic
        metallic: {
          sky: {
            light: '#E8F4F8',    // Very Light Blue (almost white)
            DEFAULT: '#C1E1EC',  // Soft Sky Blue
            medium: '#A8D8EA',   // Light Metallic Blue
          },
          blue: {
            light: '#6BB6D6',    // Bright Cyan Blue
            DEFAULT: '#4A90A4',  // Medium Blue
            dark: '#2E5266',     // Navy Blue
          },
          navy: {
            light: '#1B3A52',    // Deep Blue
            DEFAULT: '#17324D',  // Very Dark Blue
            dark: '#0D1F2D',     // Almost Black Blue
          },
        },
        // Functional colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#6BB6D6',
      },
      backgroundImage: {
        'metallic-gradient': 'linear-gradient(135deg, #E8F4F8 0%, #C1E1EC 50%, #A8D8EA 100%)',
        'blue-gradient': 'linear-gradient(135deg, #6BB6D6 0%, #4A90A4 50%, #2E5266 100%)',
        'navy-gradient': 'linear-gradient(135deg, #2E5266 0%, #1B3A52 50%, #17324D 100%)',
      },
      boxShadow: {
        'metallic': '0 4px 6px -1px rgba(107, 182, 214, 0.3), 0 2px 4px -1px rgba(107, 182, 214, 0.2)',
        'blue': '0 4px 6px -1px rgba(74, 144, 164, 0.4), 0 2px 4px -1px rgba(74, 144, 164, 0.3)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.5s ease-in-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
