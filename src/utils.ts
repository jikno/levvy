import { get } from 'svelte/store'
import { DB, db, Envelope, IncomeType } from './db'
import { v4 } from '@lukeed/uuid'

export function formatMoney(money: number) {
	if (money < 0) return `- $${(money * -1).toFixed(2)}`

	return `$${money.toFixed(2)}`
}

export interface CompiledTransaction {
	type: 'income' | 'expense'
	amount: number
	label: string | null
	transactionId: string
	balanceAt: number
	date: number
}

export function compileEnvelopeTransactions(envelopeId: string, $db = get(db)) {
	const compiledTransactions: CompiledTransaction[] = []

	// Keep track of the current balance as we walk down
	let currentBalance = $db.envelopes[envelopeId].balance

	const transactions = Object.values($db.transactions).sort((a, b) => b.date - a.date)
	for (const transaction of transactions) {
		// Skip all transactions that have nothing to do with this envelope
		if (!transaction.envelopes[envelopeId]) continue

		const amount = transaction.envelopes[envelopeId]
		compiledTransactions.push({
			type: transaction.type,
			amount,
			label: transaction.label,
			transactionId: transaction.id,
			balanceAt: currentBalance,
			date: transaction.date,
		})

		if (transaction.type === 'income') currentBalance -= amount
		else currentBalance += amount
	}

	return compiledTransactions
}

export interface ClickOutsideParams {
	enabled?: boolean
	cb?: () => unknown
}

export function clickOutside(node: HTMLElement, { enabled, cb }: ClickOutsideParams) {
	const handleOutsideClick = ({ target }: MouseEvent) => {
		if (!node.contains(target as any)) {
			if (cb) cb()
		}
	}

	function update(enabled: boolean) {
		if (enabled) {
			window.addEventListener('click', handleOutsideClick)
		} else {
			window.removeEventListener('click', handleOutsideClick)
		}
	}

	update(enabled || true)
	return {
		update,
		destroy() {
			window.removeEventListener('click', handleOutsideClick)
		},
	}
}

export function onEnter(node: HTMLElement, { enabled, cb }: ClickOutsideParams) {
	function handler(event: KeyboardEvent) {
		if (event.key !== 'Enter') return

		event.preventDefault()
		if (cb) cb()
	}

	function update(enabled: boolean) {
		if (enabled) {
			node.addEventListener('keydown', handler)
		} else {
			node.removeEventListener('keydown', handler)
		}
	}

	update(enabled || true)
	return {
		update,
		destroy() {
			window.removeEventListener('keyup', handler)
		},
	}
}

export function autofocus(node: HTMLElement) {
	node.focus()

	return {}
}

export function getAllocatedAmount(envelopes: Record<string, number>) {
	let amount = 0

	for (const id in envelopes) {
		const envelopeAmount = envelopes[id]

		amount += envelopeAmount
	}

	return amount
}

export function allEnvelopesExist(envelopes: Record<string, number>) {
	for (const id in envelopes) {
		if (!get(db).envelopes[id]) return false
	}

	return true
}

export function pickExpenseEnvelope(alreadySelected: Record<string, number>) {
	let first
	for (const id in get(db).envelopes) {
		first = id

		if (!alreadySelected[id]) return id
	}

	if (!first) throw new Error('No envelopes have been created')
	return first
}

export function envelopesLeft(alreadySelected: Record<string, number>, $db: DB = get(db)) {
	const left: Envelope[] = []

	for (const id in $db.envelopes) {
		if (!alreadySelected[id]) left.push($db.envelopes[id])
	}

	return left
}

export function calculateEnvelopeBalance(envelopeId: string, $db = get(db)) {
	let balance = $db.envelopes[envelopeId].startingBalance

	for (const id in $db.transactions) {
		const transaction = $db.transactions[id]
		if (!transaction.envelopes[envelopeId]) continue

		const amount = transaction.envelopes[envelopeId]

		if (transaction.type === 'income') balance += amount
		else balance -= amount
	}

	return balance
}

export function formatDate(ms: number) {
	const date = new Date(ms)

	return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`
}

export function getUserTotalBalance($db = get(db)) {
	let balance = 0

	for (const id in $db.envelopes) {
		balance += $db.envelopes[id].balance
	}

	return balance
}

export function randomUUID() {
	return v4()
}

export function makeEncryptor(key: string) {
	const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0))
	const byteHex = (n: number) => ('0' + Number(n).toString(16)).substr(-2)
	const applyKeyToChar = (code: number) => textToChars(key).reduce((a, b) => a ^ b, code)

	function decrypt(encoded: string) {
		return (encoded.match(/.{1,2}/g) || [])
			.map(hex => parseInt(hex, 16))
			.map(applyKeyToChar)
			.map(charCode => String.fromCharCode(charCode))
			.join('')
	}

	function encrypt(text: string) {
		return textToChars(text).map(applyKeyToChar).map(byteHex).join('')
	}

	return { encrypt, decrypt }
}

export function applyPercentage(number: number, percent: number) {
	return number * percent * 0.01
}

export function resolveIncomeType(amount: number, envelopes: Record<string, number>, incomeType: IncomeType) {
	let amountLeft = amount

	const addAmount = (envelopeId: string, amount: number) => {
		if (envelopes[envelopeId]) envelopes[envelopeId] += amount
		else envelopes[envelopeId] = amount
	}

	for (const operation of incomeType.operations) {
		if (operation.operation === 'fixed-take') {
			amountLeft -= operation.amount
			addAmount(operation.envelopeId, operation.amount)
		} else if (operation.operation === 'variable-take') {
			let amountToTake = applyPercentage(amountLeft, operation.percentage)

			if (operation.minAmount && amountToTake < operation.minAmount) amountToTake = operation.minAmount
			if (operation.maxAmount && amountToTake > operation.maxAmount) amountToTake = operation.maxAmount

			amountLeft -= amountToTake
			addAmount(operation.envelopeId, amountToTake)
		} else if (operation.operation === 'split') {
			let amountAtStartOfOperation = amountLeft

			for (const envelopeId in operation.envelopePercentages) {
				const percent = operation.envelopePercentages[envelopeId]
				const amountToTake = applyPercentage(amountAtStartOfOperation, percent)

				amountLeft -= amountToTake
				addAmount(envelopeId, amountToTake)
			}
		}
	}

	return {
		amountLeft,
		envelopes,
	}
}
