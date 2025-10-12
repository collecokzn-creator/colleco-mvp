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
          DEFAULT: "#FFF8F1", // off-white/beige background
          sand: "#F3E9DC",    // panels (sidebar)
          hover: "#EADAC8",   // hover cream
          border: "#E7DAC6",  // subtle borders
        },
        brand: {
          // Use a vivid, solid orange close to the bird logo
          // If we later get the exact hex, we can swap it here.
          orange: "#F47C20", // primary brand (bright, modern orange)
          brown: "#3A2C1A",  // deep brown for headers/text
          // Distinct rust tone for app-wide text, separate from orange brand accents
          russty: "#B3541E",
          gold: "#E6B422",   // highlight gold
          highlight: "#FFB347", // legacy highlight
        },
        surface: {
          // Use pure white for surfaces (cards/panels) to increase visual purity
          DEFAULT: "#FFFFFF",
        },
        text: {
          DEFAULT: "#3A2C1A", // deep brown
        },
        amber: {
          50: "#FFF8F1",
          100: "#FFEEDB",
          200: "#FFD8A8",
        },
        neutral: {
          100: "#F5F5F5",
          200: "#E5E5E5",
        },
      },
    },
  },
  plugins: [],
}
