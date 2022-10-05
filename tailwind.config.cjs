/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        header: "7rem",
        main: "calc(100vh - 7rem)"
      }
    },
  },
  plugins: [],
};
