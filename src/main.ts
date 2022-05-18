import { SplashScreen } from './plugins/camera'
// @ts-ignore
import App from './App.svelte'
import './style.css'

SplashScreen.hide()

const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
})

export default app
