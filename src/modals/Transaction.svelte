<script lang="ts">
	import Modal from '../components/Modal.svelte'
	import { db } from '../db'
	import { formatMoney } from '../utils'

	export let isOpen = false
	export let id: string

	export let transaction = $db.transactions[id]
</script>

<Modal bind:isOpen>
	<div class="h-56 flex flex-col items-center justify-center">
		<div class="text-lg">{transaction.label}</div>
		<div class="h-4" />
		<div class="text-xl {transaction.type === 'expense' ? 'text-error' : 'text-success'}">
			{#if transaction.type === 'expense'}-{/if}
			{formatMoney(transaction.amount)}
		</div>
	</div>

	{#each Object.entries(transaction.envelopes) as [envelopeId, amount]}
		<div class="flex border-b-2 border-base-300 pb-1 mb-1">
			{$db.envelopes[envelopeId].name}

			<div class="flex-auto" />

			{formatMoney(amount)}
		</div>
	{/each}

	<div class="h-4" />

	<div class="modal-action">
		<button class="btn" on:click={() => (isOpen = false)}>Close</button>
	</div>
</Modal>
