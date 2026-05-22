/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palet warna berdasarkan logo GardaWiraWiri
        garda: {
          50: "#E8F4FF",
          100: "#D0E9FF",
          200: "#A1D3FF",
          300: "#72BDFF",
          400: "#4BAEFF",
          500: "#1F9FFF", // Cyan bright
          600: "#1977D2", // Medium blue
          700: "#1560B0", // Dark blue
          800: "#0F4A8A", // Darker blue
          900: "#0A3166", // Navy
          950: "#051E3E", // Deep navy
        },
        // Alias untuk akses yang lebih mudah
        primary: "#1F9FFF",
        secondary: "#1977D2",
        accent: "#0F4A8A",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
      },
      animation: {
        // Nama class jadi 'animate-float'
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
