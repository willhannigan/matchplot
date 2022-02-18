module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
        colors: {
        //primary: "#652D91",
        primary: "#C9E3AC",
        accent: "#98999b",
        secondary: "#90BE6D",
        secondary_accent: '#de9818'
      }
    }
    
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'group-hover', 'focus-within'],
  },
  plugins: [],
}