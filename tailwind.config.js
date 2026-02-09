/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Vibe Palette: Clean, Minimalist, High Contrast
                primary: '#111827', // Deep Black for text/buttons
                secondary: '#ffffff', // Pure White
                accent: '#FACC15', // Vibrant Yellow for pops of color
                'accent-hover': '#EAB308',

                // Neutral Grays for clean UI
                slate: {
                    50: '#f9fafb', // Main Background
                    100: '#f3f4f6', // Secondary Background
                    200: '#e5e7eb', // Borders
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280', // Secondary Text
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827', // Primary Text
                    950: '#030712',
                },

                // Keeping some indigo/purple just in case, but muting them
                indigo: {
                    50: '#eef2ff',
                    500: '#6366f1',
                    600: '#4f46e5',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'], // Keep Outfit for that modern feel
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'card': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
                'floating': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            }
        },
    },
    plugins: [],
}
