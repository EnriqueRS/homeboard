import type { Config } from 'tailwindcss'

export default {
	content: [
		'./app/components/**/*.{vue,js,ts}',
		'./app/layouts/**/*.{vue,js,ts}',
		'./app/pages/**/*.{vue,js,ts}',
		'./app/plugins/**/*.{js,ts}',
		'./app/app.{vue,js,ts}',
	],
	darkMode: 'class',
	theme: {
		extend: {},
	},
	plugins: [],
} satisfies Config



