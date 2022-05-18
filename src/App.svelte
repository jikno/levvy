<script lang="ts">
	import { db, populateDb } from './db'

	import NewTransactionModal from './modals/NewTransaction.svelte'
	import SettingsModal from './modals/Settings.svelte'
	import Envelope from './pages/Envelope.svelte'

	import Envelopes from './pages/Envelopes.svelte'
	import Login from './pages/Login.svelte'
	import { formatMoney, getUserTotalBalance } from './utils'

	let loading = false
	let email: string | null = localStorage.getItem('stashed-email') || null
	let selectedEnvelope: string | null = null

	let settingsModalIsOpen = false
	let newTransactionModalIsOpen = false

	// If the email was loaded from localstorage, load it's data
	if (email) {
		loading = true
		populateDb(email).then(() => (loading = false))
	}

	async function onVerify(newEmail: string) {
		await populateDb(newEmail)

		email = newEmail
		localStorage.setItem('stashed-email', email)
	}
</script>

{#if loading}
	<div class="h-full flex items-center justify-center">Loading...</div>
{:else if !email}
	<Login {onVerify} />
{:else}
	<div class="grid grid-cols-2 grid-rows-1" style="height: calc(100% - 5rem - 2px)">
		<div class="border-r-2 border-base-200 overflow-auto">
			<Envelopes bind:selectedEnvelope />
		</div>
		{#if selectedEnvelope}
			<div class="overflow-auto">
				<Envelope id={selectedEnvelope} />
			</div>
		{:else}
			<div class="flex justify-center items-center opacity-50 italic">Select an envelope to view it in detail</div>
		{/if}
	</div>

	<div class="h-20 border-t-2 border-base-200 flex items-center">
		<div
			class="flex items-center gap-1 select-none cursor-pointer p-4 hover:opacity-80 transition-opacity"
			on:click={() => (newTransactionModalIsOpen = true)}
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
					clip-rule="evenodd"
				/>
			</svg>
			Record Transaction
		</div>

		<div class="flex-auto" />

		<div class="text-small">{formatMoney(getUserTotalBalance($db))}</div>

		<div class="p-4 select-none cursor-pointer hover:opacity-80 transition-opacity" on:click={() => (settingsModalIsOpen = true)}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	</div>
{/if}

<SettingsModal bind:isOpen={settingsModalIsOpen} />
<NewTransactionModal bind:isOpen={newTransactionModalIsOpen} />
