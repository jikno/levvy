<script lang="ts">
	import Modal from '../components/Modal.svelte'
	import { db, saveDb, type Envelope } from '../db'

	/** If this param is supplied, the envelope will be edited instead of a new one created */
	export let id: string | null = null
	export let isOpen = false

	const defaultPhoto =
		'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGZpbmFuY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60'
	const existingEnvelope = id ? $db.envelopes[id] : null

	let name = existingEnvelope?.name || ''
	let photo = existingEnvelope?.photo || defaultPhoto
	let initialBalance = existingEnvelope ? `${existingEnvelope.startingBalance}` : '0'

	$: valid = name.length && /^https?:\/\/.+$/.test(photo) && initialBalance !== null
	let loading = false

	async function save() {
		if (!valid) return

		loading = true

		const envelope: Envelope = {
			id: id || crypto.randomUUID(),
			name,
			photo,
			startingBalance: parseFloat(initialBalance),
			balance: parseFloat(initialBalance),
		}
		$db.envelopes[envelope.id] = envelope

		await saveDb()
		isOpen = false

		name = ''
		photo = defaultPhoto
		initialBalance = '0'

		loading = false
	}
</script>

<Modal bind:isOpen title={id ? 'Edit Envelope' : 'Create an envelope'}>
	<form on:submit|preventDefault={save}>
		<p>Give this envelope a name:</p>
		<input type="text" class="input input-bordered w-full placeholder:opacity-50" placeholder="eg. Groceries" bind:value={name} />
		<div class="h-4" />

		<p>Set an initial balance: (can be nagative)</p>
		<input type="decimal" class="input input-bordered w-full" placeholder="eg. Groceries" bind:value={initialBalance} />
		<div class="h-4" />

		<p>Set a photo:</p>
		<input type="text" class="input input-bordered w-full" placeholder="Insert a url..." bind:value={photo} />
		<div class="h-4" />

		<div class="modal-action flex justify-end">
			<div on:click={() => (isOpen = false)} class="btn">Cancel</div>
			<button class="btn btn-primary" disabled={!valid || loading}>Save</button>
		</div>
	</form>
</Modal>
