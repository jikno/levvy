<script lang="ts">
	import { fly } from 'svelte/transition'
	import { db } from '../db'

	export let onUnlock: () => void

	let didUnlock = false
	let currentPin = ''
	let escapeCount = 0
	let shake = false

	let screenType: 'mouse' | 'touch' | null = null

	const keypad = [
		{ digit: '1', letters: '' },
		{ digit: '2', letters: 'abc' },
		{ digit: '3', letters: 'def' },
		{ digit: '4', letters: 'ghi' },
		{ digit: '5', letters: 'jkl' },
		{ digit: '6', letters: 'mno' },
		{ digit: '7', letters: 'pqrs' },
		{ digit: '8', letters: 'tuv' },
		{ digit: '9', letters: 'wyxz' },
		{ digit: null, letters: '' },
		{ digit: '0', letters: '' },
		{ digit: null, letters: '', backspace: true },
	]

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			escapeCount++
			return tryUnlock()
		}

		if (event.key === 'Backspace' || event.key === 'Delete') return applyBackspace()

		// Only digits are supported
		if (!/\d/.test(event.key)) return

		return applyDigit(event.key)
	}

	function applyBackspace() {
		currentPin = currentPin.slice(0, -1)
		return tryUnlock()
	}

	function applyDigit(digit: string) {
		currentPin += digit
		return tryUnlock()
	}

	function tryUnlock() {
		if (escapeCount >= 4) return unlock()
		if ($db.pin === currentPin) return unlock()

		if (currentPin.length < $db.pin!.length) return // do nothing

		// so now, we have a pin that is too long or just the right length, but incorrect
		informOfWrongPin()
	}

	function unlock() {
		didUnlock = true
		onUnlock()
	}

	async function informOfWrongPin() {
		shake = true

		await new Promise(resolve => setTimeout(resolve, 300))

		shake = false
		currentPin = ''
	}
</script>

<svelte:window on:keydown={keydown} />

<div class="absolute inset-0 bg-base-100 flex items-center flex-col justify-center z-50" out:fly={{ delay: 500, y: -1000 }}>
	{#if didUnlock}
		<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 spin" viewBox="0 0 20 20" fill="currentColor">
			<path
				d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"
			/>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" class:shake viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
				clip-rule="evenodd"
			/>
		</svg>
	{/if}

	<div class="h-20" />

	{#if !$db.pin}
		<button class="btn" on:click={unlock}>Unlock</button>
	{:else}
		<div class="flex gap-4" class:shake>
			{#each $db.pin.split('') as _, i}
				<div class="bg-content w-5 h-5 rounded-full border-2 border-base-content {!!currentPin[i] ? 'bg-base-content' : ''}" />
			{/each}
		</div>

		<div class="h-8" />

		<div class="grid grid-cols-3 gap-2">
			{#each keypad as { digit, letters, backspace }}
				{#if digit}
					<div
						class="
							w-20 h-20 bg-base-200 active:bg-base-300 transition-colors
							flex items-center justify-center
							text-2xl rounded-full relative
							cursor-pointer select-none
						"
						on:mousedown={() => {
							if (!screenType) screenType = 'mouse'
							if (screenType === 'touch') return

							applyDigit(digit)
						}}
						on:touchstart={() => {
							if (!screenType) screenType = 'touch'
							if (screenType === 'mouse') return

							applyDigit(digit)
						}}
					>
						<div class="relative bottom-1">{digit}</div>

						<div class="absolute text-xs right-0 left-0 bottom-3 uppercase text-center opacity-30">
							{letters}
						</div>
					</div>
				{:else}
					<div class="w-20 h-20 flex items-center justify-center">
						{#if backspace && currentPin.length}
							<div class="cursor-pointer active:opacity-60 transition-opacity" on:click={applyBackspace}>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.shake {
		animation-iteration-count: infinite;
		animation-duration: 100ms;
		animation-name: shake;
		position: relative;
	}

	@keyframes shake {
		0% {
			left: 0;
			right: 0;
		}
		25% {
			left: 5px;
		}
		50% {
			left: 0;
		}
		75% {
			right: 5px;
		}
		100% {
			right: 0;
		}
	}

	.spin {
		animation-duration: 300ms;
		animation-name: spin;
	}

	@keyframes spin {
		0% {
			transform: rotateY(0deg);
		}
		25% {
			transform: rotateY(90deg);
		}
		50% {
			transform: rotateY(180deg);
		}
		75% {
			transform: rotateY(270deg);
		}
		100% {
			transform: rotateY(360deg);
		}
	}
</style>
