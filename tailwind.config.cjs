/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lumixPurple: "#7d2bc0", // 💜 color representativo
      },
    },
  },
  plugins: [],
};
