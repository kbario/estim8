/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  daisyui: {
    themes: ["dracula"],
  },
  plugins: [require("daisyui")],
  theme: {
    extend: {
      minHeight: {
        viewi: "calc(100svh - 120px)",
      },
    },
  },
};
