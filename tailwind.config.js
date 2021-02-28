// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

module.exports = {
  purge: { content: ["./public/**/*.html", "./src/**/*.vue"] },
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        darkOld: {
          primary: "#3a3a3a",
          secondary: "#2d2d2d",
          tertiary: "#3e3e3e"
        },
        dark: {
          DEFAULT: "#2E2E2E",
          "50": "#676767",
          "100": "#616161",
          "200": "#545454",
          "300": "#474747",
          "400": "#3B3B3B",
          "500": "#2E2E2E",
          "600": "#262626",
          "700": "#1F1F1F",
          "800": "#171717",
          "900": "#0F0F0F"
        },
        light: {
          DEFAULT: "#E0E0E0",
          "50": "#FFFFFF",
          "100": "#FFFFFF",
          "200": "#F7F7F7",
          "300": "#F0F0F0",
          "400": "#E8E8E8",
          "500": "#E0E0E0",
          "600": "#CCCCCC",
          "700": "#B8B8B8",
          "800": "#A3A3A3",
          "900": "#8F8F8F"
        },
        text: {
          primary: "#ffffff",
          secondary: "#d5d5d5",
          tertiary: "#c5c5c5"
        },
        orange: colors.orange,
        cyan: colors.cyan,
        lime: colors.lime
      },
      spacing: {
        38: "9.5rem"
      }
    }
  },
  variants: {
    extend: {
      display: ["group-hover", "group-focus"],
      borderRadius: ["group-hover", "group-focus"],
      boxShadow: ["group-hover", "group-focus"],
      padding: ["group-hover", "group-focus"],
      margin: ["group-hover", "group-focus"]
    }
  },
  plugins: []
};
