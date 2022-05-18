<script lang="ts">
	import { db } from '../db'

	import Modal from '../components/Modal.svelte'

	export let isOpen = false
	export let onLogout: () => void

	let loading = false
	let valid = true
	let changesMade = false
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

	<div class="modal-action">
		<button class="btn" on:click={() => (isOpen = false)}>Close</button>
		<div class="flex-auto" />

		{#if changesMade}
			<button class="btn" on:click={() => (isOpen = false)}>Save</button>
		{/if}
	</div>
</Modal>
