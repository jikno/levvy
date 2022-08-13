import { registerPlugin } from '@capacitor/core'
import { SplashScreenWeb } from '@capacitor/splash-screen/dist/esm/web'
import type { SplashScreenPlugin } from '@capacitor/splash-screen'

const SplashScreen: SplashScreenPlugin = registerPlugin('SplashScreen', {
	web: () => new SplashScreenWeb()
})

export { SplashScreen }
