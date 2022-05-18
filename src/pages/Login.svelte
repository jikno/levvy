<script lang="ts">
	export let onVerify: (email: string) => unknown

	let email = ''
	let password = ''
	let error: string | null = null

	let loading = false

	$: valid = /^.+@.+\..+$/.test(email) && password.length >= 3

	async function submit() {
		if (!valid) return

		loading = true
		error = null

		try {
			await onVerify(`${email}:${password}`)
		} catch (e: any) {
			console.error(e)
			error = e.message
		}

		loading = false
	}
</script>

<form class="form-control max-w-sm m-auto h-full flex justify-center p-4" on:submit|preventDefault={submit}>
	<div class="text-lg font-semibold">Get started...</div>
	<div class="h-2" />
	<p class="text-sm opacity-50">Create a new account or login to an existing one.</p>

	<div class="h-8 flex items-center my-2 px-4 bg-error text-error-content rounded-lg" class:invisible={!error}>
		{#if error}{error}{/if}
	</div>

	<input type="email" placeholder="johndoe@exampe.com" class="input input-bordered w-full placeholder:opacity-50" bind:value={email} />
	<div class="h-4" />
	<input type="password" placeholder="password..." class="input input-bordered w-full placeholder:opacity-50" bind:value={password} />

	<div class="h-10" />

	<button class="btn btn-primary" disabled={loading || !valid}>Get Started</button>
</form>
