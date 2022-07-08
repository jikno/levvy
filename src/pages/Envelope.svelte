<script lang="ts">
	import { db } from '../db'
	import { compileEnvelopeTransactions, formatDate, formatMoney } from '../utils'
	import EnvelopeDetailsModal from '../modals/EnvelopeDetails.svelte'
	import TransactionModal from '../modals/Transaction.svelte'

	export let id: string
	export let onBack: () => unknown

	let showEditModal = false
	let showTransactionModal = false
	let lastSelectedTransactionId: string | null = null

	$: envelope = $db.envelopes[id]
</script>

<div
	class="h-96 bg-no-repeat bg-center bg-cover relative flex items-center justify-center"
	style="background-image: url('{envelope.photo}')"
>
	<div class="absolute top-0 right-0 left-0">
		<div style="background: rgba(0, 0, 0, 0.7)">
			<div class="sm:hidden text-primary flex items-center gap-1 py-4 px-3 select-none cursor-pointer" on:click={onBack}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>

				Back
			</div>

			<div class="flex p-4 items-center">
				<h1 class="font-semibold text-3xl">{envelope.name}</h1>

				<div class="flex-auto" />

				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-primary select-none cursor-pointer"
					viewBox="0 0 20 20"
					fill="currentColor"
					on:click={() => (showEditModal = true)}
				>
					<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
					<path
						fill-rule="evenodd"
						d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
		</div>

		<!-- the part that fades down -->
		<div class="h-20" style="background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))" />
	</div>

	<div
		class="
			text-3xl py-2 px-3 rounded-lg
			{envelope.balance < 0 ? 'bg-error text-error-content' : 'bg-success text-success-content'}
		"
	>
		{formatMoney(envelope.balance)}
	</div>
</div>

<div class="p-2">
	{#each compileEnvelopeTransactions(id, $db) as transaction}
		<div
			class="rounded-lg bg-base-200 select-none cursor-pointer p-4 my-2"
			on:click={() => {
				showTransactionModal = true
				lastSelectedTransactionId = transaction.transactionId
			}}
		>
			<div class="flex">
				<div class="flex-auto">
					{transaction.label}
				</div>

				<div class={transaction.type === 'income' ? 'text-success' : 'text-error'}>
					{formatMoney(transaction.amount)}
				</div>
			</div>

			<div class="h-2" />

			<div class="flex opacity-50 text-sm">
				<div class="italic">
					Balance: {formatMoney(transaction.balanceAt)}
				</div>

				<div class="flex-auto" />

				{formatDate(transaction.date)}
			</div>
		</div>
	{:else}
		<div class="pt-10 opacity-50 italic text-center">No Transactions</div>
	{/each}
</div>

<div class="py-10 text-center">
	Starting balance: {formatMoney(envelope.startingBalance)}
</div>

<!-- Modals -->
{#key id}
	<EnvelopeDetailsModal bind:isOpen={showEditModal} {id} />
{/key}

{#if lastSelectedTransactionId}
	<TransactionModal bind:isOpen={showTransactionModal} id={lastSelectedTransactionId} />
{/if}
