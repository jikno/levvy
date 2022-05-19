import { get, writable } from 'svelte/store'
import { makeEncryptor } from './utils'

export interface DB {
	email: string | null
	incomeTypes: IncomeType[]
	envelopes: Record<string, Envelope> // id -> Envelope
	transactions: Record<string, Transaction> // id -> Transaction
}

export interface IncomeType {
	id: string
	name: string
	operations: IncomeTypeOperation[]
}

export type IncomeTypeOperation = FixedTakeOperation | VariableTakeOperation | SplitOperation

export interface FixedTakeOperation {
	operation: 'fixed-take'
	envelopeId: string
	amount: number
}

export interface VariableTakeOperation {
	operation: 'variable-take'
	envelopeId: string
	percentage: number
	maxAmount?: number
	minAmount?: number
}

export interface SplitOperation {
	operation: 'split'
	envelopePercentages: Record<string, number>
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
	amount: number
	envelopes: Record<string, number> // envelope id -> transaction amount as applies to envelope
	label: string | null
	date: number
}

export const defaultDbData: DB = { email: null, incomeTypes: [], envelopes: {}, transactions: {} }

export const db = writable<DB>(defaultDbData)
let stashedPasswordForSaves: string | null = null

const dbUrl = `https://vehmloewff-keyed-db.deno.dev/finance`

export async function populateDb(userString: string) {
	const [email, password] = userString.split(':')
	if (!email || !password) throw new Error('Expected an email and password to be supplied')

	stashedPasswordForSaves = password
	const encryptor = makeEncryptor(password)

	console.log('Loading data from cloud...')

	const text = await fetch(`${dbUrl}/${email}`).then(async res => {
		if (!res.ok) {
			if (res.status === 404) return null

			throw new Error(`Error when populating db: ${await res.text()}`)
		}

		return res.text()
	})

	// If the email is not in the cloud, create a local version...
	if (!text) {
		console.log('Email is not in the cloud.  Creating a new account...')

		db.set({ ...get(db), email })

		// ... and upload it to the cloud
		return await saveDb()
	}

	// If the data retrieved from the cloud is not encrypted, that is ok.
	try {
		// ... just parse it...
		const json = JSON.parse(text)

		console.log('Retrieved un-encrypted data from the cloud.  Going to encrypt and re-upload it...')

		// ... stash it...
		db.set(json)

		// ... and upload the encrypted version
		return await saveDb()
	} catch (_) {}

	// At this point, we have retrieved encrypted data from the cloud
	try {
		console.log('Trying to decrypt data retrieved from the cloud...')

		const json = JSON.parse(encryptor.decrypt(text))
		console.log('Successfully decrypted!')

		return db.set(json)
	} catch (_) {
		console.log('Could not parse decrypted data sent from the cloud :(')

		// But if we cannot decrypt it, this is the wrong password for this email
		throw new Error('Incorrect email or password')
	}
}

export async function saveDb() {
	const $db = get(db)
	if (!$db.email || !stashedPasswordForSaves) throw new Error('Database cannot be saved because user is not logged in')

	const encryptor = makeEncryptor(stashedPasswordForSaves)

	const encrypted = encryptor.encrypt(JSON.stringify($db))
	await fetch(`${dbUrl}/${$db.email}`, { body: encrypted, method: 'PUT' })

	console.log(`Encrypted and saved local data to cloud under email "${$db.email}"`)
}
