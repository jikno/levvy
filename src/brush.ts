export interface HighlightStyles {
	color?: string
	background?: string
	roundCornersBy?: number
	ringWidth?: number
	ringColor?: string
}

export interface Highlight {
	loc: [number, number]
	text: string
	style: HighlightStyles
}

export type PaintFn = (loc: [number, number], style: HighlightStyles) => void

export interface BrushParams {
	initialText: string
	defaultStyle: HighlightStyles
	onChange(text: string): void
	highlight(text: string, paint: PaintFn): void
	element: HTMLElement
	caretColor?: string
	font?: string
}

export function makeBrush(params: BrushParams) {
	const container = document.createElement('div')
	const highlightsDiv = document.createElement('div')
	const textarea = document.createElement('textarea')

	// Style the div to display static text like the textarea
	highlightsDiv.style.whiteSpace = 'pre'
	highlightsDiv.style.fontFamily = params.font || 'monospace'

	// Style the divs so that it grows and shrinks to the size of the text
	highlightsDiv.style.width = 'fit-content'
	container.style.width = 'fit-content'

	// Keep the textarea from looking odd
	textarea.style.resize = 'none'
	textarea.style.overflow = 'hidden'
	textarea.style.border = 'none'
	textarea.style.outline = 'none'
	textarea.style.margin = 'none'
	textarea.style.padding = '0'
	textarea.style.whiteSpace = 'pre'
	textarea.style.fontFamily = params.font || 'monospace'
	textarea.spellcheck = false

	// Make the text, but not the caret, of the textarea transparent
	textarea.style.color = 'transparent'
	textarea.style.background = 'transparent'
	textarea.style.caretColor = params.caretColor || 'black'

	// position the textarea so that it takes up all the space in it's parent
	textarea.style.position = 'absolute'
	textarea.style.top = '0'
	textarea.style.right = '0'
	textarea.style.bottom = '0'
	textarea.style.left = '0'

	// make the highlights and textarea the only children of the container
	container.style.position = 'relative'
	container.appendChild(highlightsDiv)
	container.appendChild(textarea)

	// Set the text of both the textarea and the highlights div to the same content
	textarea.value = params.initialText
	highlightsDiv.innerHTML = highlight(textarea.value)

	// Append the container to the parent
	params.element.appendChild(container)

	// Anytime the text in the textarea changes, sync it to the highlights div
	const unsubscribe = (() => {
		const handler = () => {
			params.onChange(textarea.value)
			highlightsDiv.innerHTML = highlight(textarea.value)
		}

		textarea.addEventListener('input', handler)

		return () => {
			textarea.removeEventListener('input', handler)
		}
	})()

	function highlight(value: string) {
		const highlights: Highlight[] = []
		params.highlight(value, (loc, style) => highlights.push({ loc, style, text: value.slice(...loc) }))

		// Here we should have all the highlights...
		// Sort them by their start index - least to greatest
		const sorted = highlights.sort((a, b) => a.loc[0] - b.loc[0])
		const normalized = normalizeHighlights(sorted, value)

		// ... compile them and return them
		return compileHighlights(normalized)
	}

	function normalizeHighlights(highlights: Highlight[], value: string) {
		let currentIndex = 0
		const allHighlights: Highlight[] = []

		for (const highlight of highlights) {
			const [start, end] = highlight.loc

			if (start < currentIndex) throw new Error('Highlights cannot overlap each other')

			// If there is empty space between highlights, fill it with the default style
			if (start > currentIndex)
				allHighlights.push({
					loc: [currentIndex, start],
					style: params.defaultStyle,
					text: value.slice(currentIndex, start),
				})

			allHighlights.push(highlight)
			currentIndex = end
		}

		if (currentIndex < value.length)
			allHighlights.push({
				loc: [currentIndex, value.length],
				style: params.defaultStyle,
				text: value.slice(currentIndex, value.length),
			})

		return allHighlights
	}

	function compileHighlights(highlights: Highlight[]) {
		return highlights.map(compileHighlight).join('')
	}

	function compileHighlight(highlight: Highlight) {
		const style = stringifyHighlightStyle(highlight.style)
		const text = sterilizeText(highlight.text)

		return `<span style="${style}">${text}</span>`
	}

	function stringifyHighlightStyle(style: HighlightStyles) {
		let strungStyle = ``

		if (style.color) strungStyle += `color: ${style.color};`
		if (style.background) strungStyle += `background: ${style.background};`
		if (style.ringColor) strungStyle += `outline-color: ${style.ringColor};`
		if (style.ringWidth) strungStyle += `outline-width: ${style.ringWidth}px;`
		if (style.roundCornersBy) strungStyle += `border-radius: ${style.roundCornersBy}px`

		return strungStyle
	}

	function sterilizeText(text: string) {
		return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
	}

	return {
		destroy() {
			unsubscribe()
		},
	}
}
