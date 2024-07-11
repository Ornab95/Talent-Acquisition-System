/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/*.html"],
  theme: {
    extend: {
      backgroundImage: {
        'seu1': "url('seu1.png')", 
      }
    },
  },
  plugins: [],
}

