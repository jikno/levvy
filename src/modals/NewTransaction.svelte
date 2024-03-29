<script lang="ts">
	import { db, saveDb, Transaction } from '../db'
	import {
		allEnvelopesExist,
		autofocus,
		calculateEnvelopeBalance,
		envelopesLeft,
		formatMoney,
		getAllocatedAmount,
		onEnter,
		pickExpenseEnvelope,
		randomUUID,
		resolveIncomeType,
	} from '../utils'

	import EnvelopeDetails from './EnvelopeDetails.svelte'
	import Modal from '../components/Modal.svelte'

	export let isOpen = false

	let envelopeDetailsIsOpen = false
	let step = 1
	let selectedIncomeTypeId: string | null = null

	let id = randomUUID()
	let type: Transaction['type'] = 'expense'
	let rawAmount = ''
	let envelopes: Record<string, number> = {}
	let label = ''

	$: unallocated = amount - getAllocatedAmount(envelopes)
	$: valid = /^\d+(\.\d+)?$/.test(rawAmount) && allEnvelopesExist(envelopes) && unallocated === 0
	$: amount = parseFloat(rawAmount)

	let loading = false

	function next() {
		if (!valid) return

		step++
	}

	function back() {
		step--
	}

	async function save() {
		if (!valid) return

		loading = true

		const transaction: Transaction = {
			id,
			type,
			envelopes,
			amount,
			label: label || null,
			date: Date.now(),
		}
		$db.transactions[transaction.id] = transaction

		// recalculate the balance of the concerned envelopes
		for (const id in envelopes) {
			$db.envelopes[id].balance = calculateEnvelopeBalance(id)
		}

		await saveDb()
		reset()

		loading = false
	}

	async function saveAndClose() {
		await save()
		isOpen = false
	}

	function reset() {
		id = randomUUID()
		step = 1
		rawAmount = ''
		envelopes = {}
		label = ''
	}

	function applyIncomeType() {
		const incomeType = $db.incomeTypes.find(incomeType => incomeType.id === selectedIncomeTypeId)
		if (!incomeType) throw new Error('Selected id does not exist')

		resolveIncomeType(unallocated, envelopes, incomeType)
		envelopes = envelopes
	}

	let assigningAmountToEnvelope: string | null = null

	// This function basically just tries to initially asign the amount to an envelope.
	// But, if it detects the envelopes have been messed with, it doesn't do anything
	function rawAmountChange() {
		const envelopeIds = Object.keys(envelopes)

		if (!envelopeIds.length) {
			assigningAmountToEnvelope = pickExpenseEnvelope(envelopes)
			envelopes[assigningAmountToEnvelope] = amount
		} else if (envelopeIds.length === 1 && assigningAmountToEnvelope !== null && envelopes[assigningAmountToEnvelope] !== undefined) {
			envelopes[assigningAmountToEnvelope] = amount
		} else {
			assigningAmountToEnvelope = null
		}
	}
</script>

<Modal bind:isOpen title="New Transaction">
	{#if step === 1}
		<div class="flex justify-center">
			<div class="tabs tabs-boxed">
				<span class="tab {type === 'income' ? 'tab-active' : ''}" on:click={() => (type = 'income')}>Income</span>
				<span class="tab {type === 'expense' ? 'tab-active' : ''}" on:click={() => (type = 'expense')}>Expense</span>
			</div>
		</div>

		<div class="h-4" />

		<p>Transaction Amount:</p>
		<div class="h-1" />

		<input
			type="number"
			inputmode="decimal"
			class="input input-bordered w-full {type === 'expense' ? 'text-error' : 'text-success'}"
			bind:value={rawAmount}
			use:onEnter={{ cb: next }}
			use:autofocus
			on:input={rawAmountChange}
		/>
	{:else if step === 2}
		<p>Name this transaction:</p>
		<div class="h-1" />

		<input class="input input-bordered w-full" type="text" bind:value={label} use:onEnter={{ cb: next }} use:autofocus />
	{:else if step === 3}
		<div class="flex">
			<div class="flex-auto">Unallocated Amount</div>
			{formatMoney(unallocated)}
		</div>

		<div class="my-2 h-[2px] bg-base-200" />

		{#each Object.entries(envelopes) as [id, amount]}
			<div class="flex items-center gap-2">
				<div>
					<select
						class="select select-bordered w-full"
						on:input={event => {
							const selectedId = event.currentTarget.value
							const amount = envelopes[id]

							delete envelopes[id]
							envelopes[selectedId] = amount
						}}
					>
						{#each Object.entries($db.envelopes) as [oneEnvelopeId, envelope]}
							<option
								selected={id === oneEnvelopeId}
								disabled={id !== oneEnvelopeId && envelopes[oneEnvelopeId] !== undefined}
								value={oneEnvelopeId}
							>
								{envelope.name}
							</option>
						{/each}
					</select>
				</div>

				<div class="flex-auto" />

				<div>
					<input
						class="input input-bordered w-full"
						type="number"
						inputmode="decimal"
						value={envelopes[id]}
						on:input={event => (envelopes[id] = parseFloat(event.currentTarget.value))}
					/>
				</div>

				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 select-none cursor-pointer text-error"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
					on:click={() => {
						delete envelopes[id]
						envelopes = envelopes
					}}
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</div>

			<p class="p2-2 opacity-50 italic">
				<!-- We just have to be sure that we subtract and add when appropriate -->
				Envelope balance after transaction will be {formatMoney(
					$db.envelopes[id].balance + (type === 'expense' ? -1 * amount : amount)
				)}
			</p>

			<div class="my-2 h-[2px] bg-base-200" />
		{:else}
			<div class="h-10 italic flex items-center justify-center opacity-50">Not allocated to any envelopes yet</div>
		{/each}

		<div class="h-1" />

		{#if envelopesLeft(envelopes, $db).length}
			<button class="btn btn-link p-0" on:click={() => (envelopes[pickExpenseEnvelope(envelopes)] = unallocated)}>
				Add Envelope
			</button>
		{:else}
			<button class="btn btn-link p-0" on:click={() => (envelopeDetailsIsOpen = true)}>Create an Envelope</button>
		{/if}

		{#if type === 'income' && $db.incomeTypes.length}
			<div class="h-2" />

			<p>Apply an income type:</p>
			<div class="h-1" />

			<div class="flex">
				<div>
					<select class="select select-bordered w-full" bind:value={selectedIncomeTypeId}>
						{#each $db.incomeTypes as incomeType}
							<option value={incomeType.id}>{incomeType.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex-auto" />

				<button class="btn" on:click={applyIncomeType}>Apply</button>
			</div>
		{/if}
	{/if}

	<div class="h-4" />
	<div class="modal-action flex">
		<div class="btn" on:click={() => (isOpen = false)}>Cancel</div>
		{#if step !== 1}
			<div class="btn" on:click={back}>Back</div>
		{/if}

		<div class="flex-auto" />

		<button class="btn {step === 3 ? 'btn-primary' : ''}" disabled={!valid || loading} on:click={saveAndClose}>Save</button>
		{#if step !== 3}
			<button class="btn btn-primary" on:click={next}>Next</button>
		{/if}
	</div>
</Modal>

<EnvelopeDetails bind:isOpen={envelopeDetailsIsOpen} />
