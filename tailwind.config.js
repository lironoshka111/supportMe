const { colors } = require("./src/theme/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "header-color": colors.primary.teal,
        "sidebar-color": colors.primary.teal,
      },
      spacing: {
        2.5: "10px",
        5: "20px",
        7.5: "30px",
        15: "60px",
      },
      flex: {
        "1/3": "0.3",
        "1/6": "0.15",
        "2/5": "0.4",
      },
    },
  },
  plugins: [],
};
