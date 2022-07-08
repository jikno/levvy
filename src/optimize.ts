import { get } from 'svelte/store'
import { db, saveDb } from './db'

/**
 * Remove transactions older than 30 days
 */
export async function optimize() {
	console.log('[optimization] Looking for older transactions...')

	const $db = get(db)
	const transactionsToRemove: string[] = []

	// Loop through all transactions to remove the older ones
	for (const transactionId in $db.transactions) {
		const transaction = $db.transactions[transactionId]
		const thirtyDays = 1000 * 60 * 60 * 24 * 30

		// If the transaction was less than thirty days ago, skip it
		if (transaction.date + thirtyDays > Date.now()) continue

		// Mark this transaction as "to be deleted"
		transactionsToRemove.push(transactionId)

		// Add this transaction's amount to the envelope's starting balance
		for (const envelopeId in transaction.envelopes) {
			const amount = transaction.envelopes[envelopeId]

			if (transaction.type === 'income') $db.envelopes[envelopeId].startingBalance += amount
			else $db.envelopes[envelopeId].startingBalance -= amount
		}
	}

	// Delete the old envelopes
	for (const transactionId of transactionsToRemove) delete $db.transactions[transactionId]
	console.log(`[optimization] Deleted ${transactionsToRemove.length} older transaction(s)`)

	// Update the database
	if (transactionsToRemove.length) await saveDb()
}
