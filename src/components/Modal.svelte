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
	<div class="fixed inset-0 z-40" style="background: rgba(0, 0, 0, 0.4)" in:fade on:click={() => (isOpen = false)} />

	{#if windowWidth < 640}
		<div
			class="fixed bottom-0 right-0 left-0 z-40 bg-base-200 p-6 overflow-hidden rounded-t-2xl"
			style="box-shadow: 0 0 25px 5px rgba(0, 0, 0, 0.25);"
			in:fly={{ delay: 200, duration: 100, y: 50 }}
		>
			{#if title}
				<h3 class="font-bold text-2xl">{title}</h3>
				<div class="h-4" />
			{/if}

			<slot {isOpen} />
		</div>
	{:else}
		<div class="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
			<div
				class="w-full max-w-sm bg-base-200 p-6 overflow-hidden shadow-2xl rounded-2xl pointer-events-auto"
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
