<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'

	export let isOpen = false
	export let title: string | null = null

	let windowWidth: number
</script>

<svelte:window
	on:keyup={event => {
		if (event.key === 'Escape') isOpen = false
	}}
	bind:innerWidth={windowWidth}
/>

{#if isOpen}
	{#if windowWidth < 640}
		<div
			class="fixed inset-0 z-40 bg-base-200 p-6 overflow-auto"
			style="box-shadow: 0 0 25px 5px rgba(0, 0, 0, 0.25);"
			transition:fly={{ duration: 100, y: 50 }}
		>
			<div class="saftey">
				{#if title}
					<h3 class="font-bold text-2xl">{title}</h3>
					<div class="h-4" />
				{/if}

				<slot {isOpen} />
			</div>
		</div>
	{:else}
		<div
			class="fixed inset-0 z-40 backdrop-blur-sm"
			style="background: rgba(0, 0, 0, 0.4)"
			in:fade={{ duration: 150 }}
			out:fade={{ duration: 50 }}
			on:click={() => (isOpen = false)}
		/>

		<div class="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
			<div
				class="w-full max-w-sm bg-base-200 p-6 shadow-2xl rounded-2xl pointer-events-auto overflow-auto"
				style="max-height: calc(100vh * 0.8);"
				in:scale={{ delay: 100, start: 0.8, easing: elasticOut }}
			>
				{#if title}
					<h3 class="font-bold text-2xl">{title}</h3>
					<div class="h-4" />
				{/if}

				<slot {isOpen} />
			</div>
		</div>
	{/if}
{/if}

<style>
	.saftey {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
