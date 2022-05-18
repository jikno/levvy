<script lang="ts">
	export let onVerify: (email: string) => unknown

	let email = ''
	let loading = false

	$: emailIsValid = /^.+@.+\..+$/.test(email)

	async function submit() {
		if (!emailIsValid) return

		loading = true
		await onVerify(email)
		loading = false
	}
</script>

<form class="form-control max-w-sm m-auto h-full flex justify-center p-4" on:submit|preventDefault={submit}>
	<div class="label text-lg font-semibold">Enter your email...</div>
	<input type="email" placeholder="johndoe@exampe.com" class="input input-bordered w-full" bind:value={email} />

	<div class="h-10" />

	<button class="btn btn-primary" disabled={loading || !emailIsValid}>Get Started</button>
</form>
