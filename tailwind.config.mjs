/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Chrono India palette
        'bg-deep':    '#1A1410',
        'surface':    '#2A221A',
        'surface-2':  '#352B20',
        'accent':     '#C1894E',
        'accent-light': '#D4A96A',
        'text-primary': '#E8DDD0',
        'text-muted':  '#8A7A6A',
        'tileable':   '#3D5A3E',
        'tileable-light': '#4A6B45',
        'danger':     '#8B2020',
        'indigo':     '#3B1A6B',
        'sky':        '#2A6FBB',
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        cinzel:  ['Cinzel', 'serif'],
        body:    ['system-ui', 'sans-serif'],
      },
      gridTemplateColumns: {
        'gallery-sm': 'repeat(2, minmax(140px, 1fr))',
        'gallery-md': 'repeat(3, minmax(140px, 1fr))',
        'gallery-lg': 'repeat(4, minmax(150px, 1fr))',
        'gallery-xl': 'repeat(5, minmax(160px, 1fr))',
        'gallery-2xl': 'repeat(7, minmax(170px, 1fr))',
      },
    },
  },
  plugins: [],
};
