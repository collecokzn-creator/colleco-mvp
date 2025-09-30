module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      zIndex: {
        header: "50",
        footer: "40",
        dropdown: "50",
        floating: "50",
        skiplink: "60",
        banner: "70",
        sticky: "45",
        modal: "80",
        toast: "90"
      },
      colors: {
        cream: {
          DEFAULT: "#f9f6f2", // page background
          sand: "#f3e9dc",    // panels (sidebar)
          hover: "#eadac8",   // hover cream
          border: "#e7dac6",  // subtle borders
        },
        brand: {
          orange: "#e86f00",
          brown: "#b85c00",
          highlight: "#ffb347",
        },
      },
    },
  },
  plugins: [],
}
