<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { makeBrush } from '../brush'
	import { type DB, db, saveDb } from '../db'
	import { highlightJson } from '../highlight-json'

	export let onClose: () => unknown

	let loading = false
	let editor: HTMLDivElement

	let lastSavedValue = stringify($db)
	let value = stringify($db)

	$: editing = lastSavedValue !== value
	$: parsed = tryParseJson(value)

	let unsubscribers: (() => unknown)[] = []
	onMount(() => {
		const brush = makeBrush({
			defaultStyle: {},
			element: editor,
			initialText: value,
			highlight: highlightJson,
			onChange(newValue) {
				value = newValue
			},
			caretColor: 'white',
		})

		unsubscribers.push(brush.destroy)
	})

	onDestroy(() => unsubscribers.forEach(fn => fn()))

	function tryParseJson(json: string): DB | null {
		try {
			return JSON.parse(json)
		} catch (_) {
			return null
		}
	}

	function stringify(value: any) {
		return JSON.stringify(value, null, '\t')
	}

	async function save() {
		if (!parsed) return

		loading = true

		lastSavedValue = value
		$db = parsed

		await saveDb()

		loading = false
	}
</script>

<div class="h-full relative flex flex-col">
	<div class="overflow-auto p-6 flex-auto" bind:this={editor} />

	<div class="bg-base-100 flex items-center justify-end gap-4 p-6 relative">
		{#if !parsed}
			<div class="text-sm italic opacity-50">Cannot save while there are errors in the document</div>
		{/if}

		<button class="btn" on:click={onClose}>
			{#if editing}
				Cancel
			{:else}
				Close
			{/if}
		</button>

		{#if editing}
			<button class="btn btn-primary" disabled={!parsed || loading} on:click={save}>Save</button>
		{/if}

		<div class="absolute top-0 right-0 left-0 h-0.5 bg-base-200" />
	</div>
</div>
