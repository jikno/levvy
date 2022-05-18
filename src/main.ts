// @ts-ignore
import App from './App.svelte'
import './style.css'

const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
})

export default app
