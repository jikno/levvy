import type { PaintFn } from './brush'

const KEY_COLOR = `#e46a73`
const STRING_COLOR = `#95c575`
const BRACKETS_COLOR = '#009cff'
const SYNTAX_COLOR = '#4eb6c3'
const NUMBER_COLOR = '#d39b62'
const BOOLEAN_COLOR = NUMBER_COLOR
const NULL_COLOR = NUMBER_COLOR

export function highlightJson(text: string, paint: PaintFn) {
	let stringStart: null | number = null
	let encounteredStringEnd = false

	let standaloneWordStart: null | number = null

	const isWordChar = (char: string) => /[a-z0-9\.]/i.test(char)
	const isWhitespace = (char: string) => /\s/.test(char)

	for (const indexString in text.split('')) {
		const index = parseInt(indexString)
		const char = text[indexString]

		// First, we have to make sure that a highlight operation is not in progress
		{
			// Continue if it is a string
			if (stringStart !== null) {
				let isKey = false

				// If we have already encountered the end quote of the string, we are just
				// continuing on whitespace to see if there is a color after the string
				if (encounteredStringEnd) {
					if (isWhitespace(char)) continue
					else if (char === ':') isKey = true
				}
				// But if we have not encountered the end of the string, do nothing
				else if (char === '"') {
					encounteredStringEnd = true
					continue
				} else continue

				paint([stringStart, index], { color: isKey ? KEY_COLOR : STRING_COLOR })

				stringStart = null
				encounteredStringEnd = false
			}

			// Continue if it is a word
			else if (standaloneWordStart !== null) {
				if (isWordChar(char)) continue

				const loc: [number, number] = [standaloneWordStart, index]
				const word = text.slice(...loc)

				if (/\d+(\.\d+)?/.test(word)) paint(loc, { color: NUMBER_COLOR })
				else if (word === 'null' || word === 'undefined') paint(loc, { color: NULL_COLOR })
				else if (word === 'true' || word === 'false') paint(loc, { color: BOOLEAN_COLOR })

				standaloneWordStart = null
			}
		}

		// Here, we are highlighting nothing.  Be checking for the start of what we should highlight
		{
			// If we encounter a quote, start a string
			if (char === '"') stringStart = index
			// // If we encounter a word character, start a standalone word
			else if (isWordChar(char)) standaloneWordStart = index
			// If we encounter brackets, highlight it
			else if (char === '{' || char === '}' || char === '[' || char === ']') paint([index, index + 1], { color: BRACKETS_COLOR })
			// If we encounter other syntax, highlight it
			else if (char === ':' || char === ',') paint([index, index + 1], { color: SYNTAX_COLOR })
		}
	}
}
