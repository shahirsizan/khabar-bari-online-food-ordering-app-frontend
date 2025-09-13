/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			gridTemplateColumns: {
				"fluid-grid": "repeat(auto-fit, minmax(250px, 1fr))",
			},

			fontFamily: {
				sans: ["Poppins", "sans-serif"],
			},

			keyframes: {
				float: {
					"0%, 100%": { transform: "translate(0, 0)" },
					"20%": { transform: "translate(4px, -4px)" },
					"50%": { transform: "translate(-10px, -5px)" },
					"80%": { transform: "translate(10px, -5px)" },
				},
			},
			colors: {
				primary: "#ffc001",
				secondary: "#ff9c01",
				dark: "#1e1e1e",
				light: "#f5f5f5",
			},
			container: {
				center: true,
				padding: {
					DEFAULT: "1rem",
					sm: "3rem",
				},
			},
			animation: {
				"spin-slow": "spin 40s linear infinite",
				float: "float 7s ease-in-out infinite",
			},
		},
	},
	plugins: [],
};
