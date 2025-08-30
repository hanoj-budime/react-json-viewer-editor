// tailwind.config.cjs
// module.exports = {
//   darkMode: 'class',
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // enable dark mode using .dark class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // adjust to your project src path
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#ffffff",
          dark: "#1e1e1e",
        },
        text: {
          light: "#1a1a1a",
          dark: "#f5f5f5",
        },
        accent: {
          light: "#2563eb", // blue-600
          dark: "#3b82f6",  // lighter for dark mode
        },
        border: {
          light: "#e5e7eb", // gray-200
          dark: "#374151",  // gray-700
        },
      },
    },
  },
  plugins: [],
};
