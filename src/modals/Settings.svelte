<script lang="ts">
	import Modal from '../components/Modal.svelte'

	export let isOpen = false

	let loading = false
	let valid = true
</script>

<Modal bind:isOpen>
	<div class="text-center opacity-50 italic">No Configuration Yet</div>
</Modal>
