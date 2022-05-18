<script lang="ts">
	import { fade, scale } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'

	export let isOpen = false
	export let title: string | null = null
</script>

<svelte:window
	on:keyup={event => {
		if (event.key === 'Escape') isOpen = false
	}}
/>

{#if isOpen}
	<div class="modal modal-bottom sm:modal-middle" style="visibility: visibile; opacity: 1; pointer-events: auto;" in:fade>
		<div class="modal-box" in:scale={{ delay: 100, start: 0.8, easing: elasticOut }}>
			{#if title}
				<h3 class="font-bold text-2xl">{title}</h3>
				<div class="h-4" />
			{/if}

			<slot {isOpen} />
		</div>
	</div>
{/if}
