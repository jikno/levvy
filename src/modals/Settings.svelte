<script lang="ts">
	import { db, saveDb } from '../db'

	import Modal from '../components/Modal.svelte'
	import { toast } from '../toast'

	export let isOpen = false
	export let onLogout: () => void
	export let showJSON: () => void

	let loading = false
	let valid: boolean | null = null
	let changesMade = false

	function savePin() {
		if (pin === null) return
		if (!/^[0-9]*$/.test(pin)) return toast({ message: 'Pin must be a number', type: 'error' })
		// Save pin
		db.update(data => {
			data.pin = pin!.toString()
			return data
		})
		saveDb()

		// Toast message for pin saved
		toast({ message: 'Pin saved!', type: 'success' })

		// reset pin value
		pin = null
	}

	let pin: string | null = null
	$: valid = pin != null && pin!.toString().length > 0 && pin!.toString().length <= 10
</script>

<Modal bind:isOpen title="Settings">
	<div class="flex items-center">
		<div class="flex-auto">
			<div class="italic text-sm opacity-50">Logged in as</div>
			<div>{$db.email}</div>
		</div>

		<button
			class="btn btn-link btn-primary p-0"
			on:click={() => {
				isOpen = false
				onLogout()
			}}>Logout</button
		>
	</div>

	<div class="h-8" />

	<div class="flex items-center">
		<div class="flex-auto">
			<div class="italic text-sm opacity-50">Income Types</div>
			<a class="link" href="https://github.com/jikno/levvy/blob/master/income-types.md">View Documentation</a>
		</div>

		<button
			class="btn btn-link btn-primary p-0"
			on:click={() => {
				isOpen = false
				showJSON()
			}}>Edit Json</button
		>
	</div>
	<div class="h-8" />
	<div class="flex-auto">
		<div class="italic text-sm opacity-50 pb-2">Pin Protection</div>
		<div class="flex flex-row gap-3">
			<input
				type="password"
				bind:value={pin}
				class="input input-bordered w-full placeholder:opacity-50"
				placeholder="Enter a pin (1-10 digits)"
			/>
			<button class="btn btn-success" on:click={savePin} disabled={!valid}> Save Pin </button>
		</div>
	</div>

	<div class="modal-action">
		<button class="btn" on:click={() => (isOpen = false)}>Close</button>
		<div class="flex-auto" />

		{#if changesMade}
			<button class="btn" on:click={() => (isOpen = false)}>Save</button>
		{/if}
	</div>
</Modal>
