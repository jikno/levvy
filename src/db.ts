import { get, writable } from 'svelte/store'

export interface DB {
	email: string | null
	envelopes: Record<string, Envelope> // id -> Envelope
	transactions: Record<string, Transaction> // id -> Transaction
}

export interface Envelope {
	id: string
	name: string
	photo: string
	startingBalance: number
	balance: number
}

export interface Transaction {
	id: string
	type: 'income' | 'expense'
	envelopes: Record<string, number> // envelope id -> transaction amount as applies to envelope
	label: string | null
	date: number
}

export const db = writable<DB>({
	email: null,
	envelopes: {},
	transactions: {},
})

const dbUrl = `https://vehmloewff-keyed-db.deno.dev/finance`

export async function populateDb(email: string) {
	db.set(
		await fetch(`${dbUrl}/${email}`).then(async res => {
			if (!res.ok) {
				if (res.status === 404) return { ...get(db), email }

				throw new Error(`Error when populating db: ${await res.text()}`)
			}

			return res.json()
		})
	)
}

export async function saveDb() {
	const $db = get(db)
	if (!$db.email) throw new Error('Database cannot be saved because user is not logged in')

	await fetch(`${dbUrl}/${$db.email}`, { body: JSON.stringify($db), method: 'PUT' })
}
