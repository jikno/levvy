<script lang="ts">
	import { elasticOut } from 'svelte/easing'
	import { scale } from 'svelte/transition'
	import type { Toast } from '../toast'

	import Icon from './Icon.svelte'

	export let params: Toast
</script>

<div
	class="fixed h-14 rounded-lg bg-{params.type} text-{params.type}-content bottom-7 right-10 shadow-xl flex m-w-150 z-50 px-5 font-bold overflow-hidden items-center w-60 justify-between"
	in:scale={{ delay: 100, start: 0.8, easing: elasticOut }}
>
	{params.message}
	<button class="rounded-full text-{params.type}-content opacity-50 hover:opacity-75" on:click={params.close}>
		<Icon icon="x-circle" size={20} />
	</button>
</div>
