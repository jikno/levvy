<script lang="ts">
	import { db } from '../db'
	import { formatMoney } from '../utils'

	import CreateEnvelopeModal from '../modals/EnvelopeDetails.svelte'

	export let selectedEnvelope: string | null = null
	let createEnvelopeModalIsOpen = false

	$: envelopes = Object.entries($db.envelopes).map(([id, envelope]) => envelope)
</script>

<div class="flex flex-col h-full">
	<div class="flex p-4 items-center">
		<h1 class="font-semibold text-3xl">Envelopes</h1>

		<div class="flex-auto" />

		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-7 w-7 text-primary select-none cursor-pointer"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			on:click={() => (createEnvelopeModalIsOpen = true)}
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
	</div>

	<div class="grow shrink-0">
		{#if !envelopes.length}
			<div class="h-full flex flex-col gap-4 items-center justify-center">
				<h4 class="text-xl">No Envelopes</h4>
				<p>Why not create one?</p>
				<button on:click={() => (createEnvelopeModalIsOpen = true)} class="btn btn-primary">Create An Envelope</button>
			</div>
		{:else}
			<div class="grid gap-4 p-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
				{#each envelopes as envelope}
					<div
						class="card bg-base-200 shadow-xl relative {selectedEnvelope === envelope.id ? 'ring-4 ring-primary' : ''}"
						on:click={() => (selectedEnvelope = envelope.id)}
					>
						<div class="inset-0 absolute bg-no-repeat bg-center bg-cover" style="background-image: url('{envelope.photo}')" />
						<div class="absolute inset-0" style="background: rgba(0, 0, 0, 0.7)" />

						<div class="card-body z-10 select-none cursor-pointer">
							<div class="flex text-lg">
								<div>{envelope.name}</div>
								<div class="flex-auto" />
								<div>{formatMoney(envelope.balance)}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Modals -->
<CreateEnvelopeModal bind:isOpen={createEnvelopeModalIsOpen} />
