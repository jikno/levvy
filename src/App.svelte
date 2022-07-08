<script lang="ts">
	import { fly } from 'svelte/transition'
	import { formatMoney, getUserTotalBalance } from './utils'
	import { db, defaultDbData, populateDb } from './db'

	import NewTransactionModal from './modals/NewTransaction.svelte'
	import SettingsModal from './modals/Settings.svelte'
	import Envelope from './pages/Envelope.svelte'
	import Envelopes from './pages/Envelopes.svelte'
	import Login from './pages/Login.svelte'
	import EditJson from './pages/EditJson.svelte'
	import LockScreen from './components/LockScreen.svelte'
	import { optimize } from './optimize'

	let loading = false
	let locked = true
	let windowWidth: number
	let userString: string | null = localStorage.getItem('stashed-user') || null
	let selectedEnvelope: string | null = null
	let editJson = false

	let settingsModalIsOpen = false
	let newTransactionModalIsOpen = false

	// If the user was stashed in localstorage, try to load it
	if (userString) {
		loading = true
		populateDb(userString)
			.catch(() => (userString = null))
			.then(() => (loading = false))
			.then(() => optimize())
	}

	async function onVerify(newUserString: string) {
		await populateDb(newUserString) // function will thow if the user string is incorrect

		userString = newUserString
		localStorage.setItem('stashed-user', userString)
		locked = false
	}

	function onLogout() {
		userString = null
		$db = defaultDbData
		localStorage.clear()
	}

	let lockTimeout: any
	function appBlur() {
		clearTimeout(lockTimeout)

		const fiveMinutes = 1000 * 60 * 5
		setTimeout(() => (locked = true), fiveMinutes)
	}

	function appFocus() {
		clearTimeout(lockTimeout)
	}
</script>

<svelte:window bind:innerWidth={windowWidth} on:blur={appBlur} on:focus={appFocus} />

<div class="fixed inset-0 bg-solid-100 over">
	{#if loading}
		<div class="h-full flex items-center justify-center">Loading...</div>
	{:else if !userString}
		<Login {onVerify} />
	{:else if editJson}
		<EditJson onClose={() => (editJson = false)} />
	{:else}
		<div class="sm:grid sm:grid-cols-2 sm:grid-rows-1 relative" style="height: calc(100% - 5rem - 2px)">
			<div class="sm:border-r-2 sm:border-base-200 overflow-auto h-full">
				<Envelopes bind:selectedEnvelope />
			</div>
			{#if selectedEnvelope}
				<div
					class="overflow-auto absolute sm:relative inset-0 bg-base-100 z-10"
					transition:fly={{ y: 100, duration: windowWidth < 640 ? 300 : 0 }}
				>
					<Envelope id={selectedEnvelope} onBack={() => (selectedEnvelope = null)} />
				</div>
			{:else if windowWidth >= 640}
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
				<div class="hidden sm:block">Record Transaction</div>
			</div>

			<div class="flex-auto" />

			<div class="badge badge-lg badge-primary m-2">{formatMoney(getUserTotalBalance($db))}</div>

			<div class="p-2 select-none cursor-pointer hover:opacity-80 transition-opacity" on:click={() => (editJson = true)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-7 w-7"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
				</svg>
			</div>

			<div class="p-2 select-none cursor-pointer hover:opacity-80 transition-opacity" on:click={() => (settingsModalIsOpen = true)}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>

			<div class="w-2" />
		</div>

		{#if locked}
			<LockScreen onUnlock={() => (locked = false)} />
		{/if}
	{/if}

	<SettingsModal bind:isOpen={settingsModalIsOpen} {onLogout} showJSON={() => (editJson = true)} />
	<NewTransactionModal bind:isOpen={newTransactionModalIsOpen} />
</div>

<style>
	.over {
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
