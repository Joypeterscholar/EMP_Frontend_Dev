/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			animation: {
				"border-shine": "border-shine 4s linear infinite",
			},
			keyframes: {
				"border-shine": {
					"0%": { backgroundPosition: "200% 0" },
					"100%": { backgroundPosition: "-200% 0" },
				},
			},
			colors: {
				// emp brand colors
				primary: "var(--emp-color-primary)",
				secondary: "var(--emp-color-secondary)",
				secondaryAlt: "var(--emp-color-secondary-alt)",
				tertiary: "var(--emp-color-tertiary)",
				accent: "var(--emp-color-accent)",
				accentAlt: "var(--emp-color-accent-alt)",
				dark: "var(--emp-color-dark)",
				lightPrimary: "var(--emp-color-light-primary)",
				lightSecondary: "var(--emp-color-light-secondary)",
				secondaryAlt2: "var(--emp-color-secondary-alt-2)",
				lightTertiary: "var(--emp-color-light-tertiary)",

				// Status colors
				danger: "var(--emp-color-danger)",
				lightDanger: "var(--emp-color-light-danger)",
				warning: "var(--emp-color-warning)",
				success: "var(--emp-color-success)",

				// Base colors
				white: "var(--emp-color-white)",
				black: "var(--emp-color-black)",
				hover: "var(--emp-color-hover)",

				// Grey variations
				grey: "var(--emp-color-grey)",
				lightGrey: "var(--emp-color-light-grey)",
				darkGrey: "var(--emp-color-dark-grey)",
				lighterGrey: "var(--emp-color-lighter-grey)",

				// Layout colors
				background: "var(--emp-color-background)",
				surface: "var(--emp-color-surface)",
				textPrimary: "var(--emp-color-text-primary)",
				textSecondary: "var(--emp-color-text-secondary)",
				border: "var(--emp-color-border)",
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("daisyui"),
		require("tailwindcss-animate"),
	],
	daisyui: {
		themes: ["winter", "dracula"],
	},
};
