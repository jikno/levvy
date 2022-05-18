// const spacing = {
// 	full: '100%',
// }
// for (let i = 0; i <= 10000; i++) spacing[`${i}`] = `${i / 16}rem`

// const makeVariants = (red, green, blue) => {
// 	const variants = {
// 		DEFAULT: `rgb(${red}, ${green}, ${blue})`,
// 	}

// 	for (let i = 1; i <= 100; i++) variants[`${i}`] = `rgba(${red}, ${green}, ${blue}, ${i / 100})`

// 	return variants
// }

// const colors = {
// 	transparent: 'transparent',
// 	primary: makeVariants(43, 186, 146),
// 	light: makeVariants(255, 255, 255),
// 	dark: makeVariants(63, 63, 63),
// 	danger: makeVariants(231, 58, 58),
// 	success: makeVariants(25, 162, 25),
// }

// module.exports = {
// 	// content: ['./src/**/*.{html,js,svelte,ts}'],
// 	// content: ['./public/index.html', './src/**/*.svelte'],
// 	plugins: [require('daisyui')],
// 	daisyui: {
// 		// themes: ['business'],
// 	},
// 	// safelist: ['w-*', 'w-*', 'h-*', 'h-*'],
// 	theme: {
// 		// colors,
// 		// fontFamily: {
// 		// 	sans: ['Poppins'],
// 		// },
// 		spacing,
// 		fontSize: {
// 			small: `${14 / 16}rem`,
// 			normal: '1rem',
// 			medium: `${20 / 16}rem`,
// 			large: `${30 / 16}rem`,
// 			'x-large': `${40 / 16}rem`,
// 		},
// 		// 	boxShadow: {
// 		// 		sm: 'rgb(0 0 0 / 8%) 0px 1px 1px',
// 		// 		md: '0 0 20px 0 rgba(0, 0, 0, 0.25)',
// 		// 		lg: '0 0 30px 6px rgba(0, 0, 0, 0.25)',
// 		// 		outline: `0 0 5px 0 ${colors.action.DEFAULT}`,
// 		// 		'outline-lg': `0 0 10px 5px ${colors.action.DEFAULT}`,
// 		// 	},
// 		// 	backdropBlur: {
// 		// 		DEFAULT: '20px',
// 		// 		sm: '2px',
// 		// 	},
// 		// 	zIndex: {
// 		// 		'always-top': '5000',
// 		// 		top: '4000',
// 		// 		medium: '3000',
// 		// 	},
// 		// 	plugins: [],
// 		extend: {
// 			maxWidth: spacing,
// 		},
// 	},
// }

module.exports = {
	content: ['./public/index.html', './src/**/*.svelte'],
	plugins: [require('daisyui')],
}
