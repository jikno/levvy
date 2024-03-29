// const spacing = {
//     full: '100%'
// }
// for (let i = 0; i <= 10000; i++) spacing[`${i}`] = `${i / 16}rem`

// const makeVariants = (red, green, blue) => {
//     const variants = {
//         DEFAULT: `rgb(${red}, ${green}, ${blue})`
//     }

//     for (let i = 1; i <= 100; i++) variants[`${i}`] = `rgba(${red}, ${green}, ${blue}, ${i / 100})`

//     return variants
// }

// const colors = {
//     transparent: 'transparent',
//     primary: makeVariants(43, 186, 146),
//     light: makeVariants(255, 255, 255),
//     dark: makeVariants(17, 15, 26),
//     danger: makeVariants(231, 58, 58),
//     success: makeVariants(25, 162, 25),
//     action: makeVariants(249, 200, 14)
// }

// module.exports = {
//     content: ['./src/**/*.{html,js,svelte,ts}'],
//     content: ['./public/index.html', './src/**/*.svelte'],
//     plugins: [require('daisyui')],
//     daisyui: {
//         themes: []
//     },
//     safelist: ['w-*', 'w-*', 'h-*', 'h-*'],
//     theme: {
//         colors,
//         fontFamily: {
//             sans: ['Poppins']
//         },
//         spacing,
//         fontSize: {
//             small: `${14 / 16}rem`,
//             normal: '1rem',
//             medium: `${20 / 16}rem`,
//             large: `${30 / 16}rem`,
//             'x-large': `${40 / 16}rem`
//         },
//         boxShadow: {
//             sm: 'rgb(0 0 0 / 8%) 0px 1px 1px',
//             md: '0 0 20px 0 rgba(0, 0, 0, 0.25)',
//             lg: '0 0 30px 6px rgba(0, 0, 0, 0.25)',
//             outline: `0 0 5px 0 ${colors.action.DEFAULT}`,
//             'outline-lg': `0 0 10px 5px ${colors.action.DEFAULT}`
//         },
//         backdropBlur: {
//             DEFAULT: '20px',
//             sm: '2px'
//         },
//         zIndex: {
//             'always-top': '5000',
//             top: '4000',
//             medium: '3000'
//         },
//         plugins: [],
//         extend: {
//             maxWidth: spacing
//         }
//     }
// }

module.exports = {
    content: ['./public/index.html', './src/**/*.svelte'],
    daisyui: {
        themes: [{
            dark: {
                // ...require('daisyui/src/colors/themes')['[data-theme=dark]'],
                primary: '#FF6860',
                'primary-focus': '#E34E46',
                // primary: '#60a5fa',
                secondary: '#60a5fa',
                accent: '#FFDD00',
                neutral: '#e5e7eb',
                'base-100': '#110F1A',
                'base-200': '#1C1B25',
                'base-300': '#24242B',
                info: '#FFFFFF',
                success: '#2ACB98',
                warning: '#FF5B67',
                error: '#EE3052'
            }
        }]
    },
    plugins: [require('daisyui')]
}