// tailwind.config.js
module.exports = {
    content: [
      './src/**/*.elm', // Scans Elm templates for Tailwind classes
      './src/**/*.html', // Scans any HTML templates
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };