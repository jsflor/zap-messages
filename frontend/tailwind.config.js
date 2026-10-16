/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        imessage: {
          blue: {
            DEFAULT: '#007AFF',
            dark: '#0062E0',
            light: '#3395FF',
          },
          green: {
            DEFAULT: '#34C759',
            dark: '#248A3D',
          },
          bubble: {
            gray: {
              light: '#E9E9EB',
              dark: '#26252A',
            },
          },
          bg: {
            light: '#FFFFFF',
            dark: '#1E1E1E',
          },
          sidebar: {
            light: 'rgba(246, 246, 246, 0.85)',
            dark: 'rgba(30, 30, 30, 0.85)',
          },
          subtext: {
            light: '#8E8E93',
            dark: '#98989D',
          },
          divider: {
            light: '#E5E5EA',
            dark: '#38383A',
          },
          search: {
            light: '#E3E3E8',
            dark: '#2C2C2E',
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ],
      },
      borderRadius: {
        'bubble': '18px',
      },
      boxShadow: {
        'tapback': '0 2px 10px rgba(0, 0, 0, 0.18)',
        'composer': '0 1px 4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
};
