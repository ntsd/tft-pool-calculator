/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /(text|bg)-.*-600/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  darkMode: ["media"],
  daisyui: {
    styled: true,
    utils: true,
    base: false, // don't apply base color, eg. default background
    logs: false,
    rtl: false,
    prefix: "",
    theme: [...require("daisyui-ntsd")],
  },
};
