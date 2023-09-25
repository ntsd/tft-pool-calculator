/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,svelte,ts,svx,md}"],
  safelist: [
    {
      pattern: /(text|bg)-.*-600/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  darkMode: ["media"],
  daisyui: {
    styled: true,
    base: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: "",
    theme: [...require("daisyui-ntsd")],
  },
};
