import { renderWidget, requestWindow, Ui } from './deps.ts'

/**
 * @appName Levvy
 * @uiInvocable
 *
 * @appIcon ./appicon.png
 */
export async function ui() {
	const outletId = await requestWindow({ allowClose: true, allowMinimization: true, allowFullscreen: true, allowResize: true })

	renderWidget(outletId, Ui.Center({ child: Ui.Text('Hello, Elijah!') }))
}
