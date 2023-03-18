<script lang="ts">
	import { appWindow } from '@tauri-apps/api/window';
	import { onMount ,onDestroy} from 'svelte';

	export let name = '';
	export let cb: Function;
	export let show = false;
    let ring  = new Audio('/ring.wav');
	ring.volume = 0.03;
    ring.loop = true;
	onMount(async () => {
		await appWindow.unminimize()
		await appWindow.setAlwaysOnTop(true);
		await appWindow.setAlwaysOnTop(false);
        ring.play();
	});
	onDestroy(async () => {
		
        ring.pause();
        ring.remove()
	});
</script>

<div class="container">
	<p>{name} is calling, would you like to answer?</p>
	<button
		on:click={() => {
			show = false;
			cb(true);
		}}>Yes</button
	>
	<button
		on:click={() => {
			(show = false), cb(false);
		}}>No</button
	>
</div>

<style>
	p {
		font-size: 20px;
		font-family: 'Raleway', sans-serif;
		margin-bottom: 20px;
		padding: 5px;
	}
	.container {
		padding: 20px;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80%;
		background: #014a7f;
		color: white;
		text-align: center;
		max-width: 300px;
	}
	button {
		width: 40%;
		padding: 5px;
		font-size: 20px;
		font-family: 'Raleway', sans-serif;
	}
</style>
