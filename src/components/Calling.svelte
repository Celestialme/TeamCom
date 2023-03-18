<script lang="ts">
	import { currentContact, micStream, socket, userID } from "@src/stores/store";


	export let name = '';
	export let show = false;
	function cancel() {
		show = false;
		$micStream.getAudioTracks().forEach((track) => track.stop());
        $socket.emit("cancelCall",{
            sender: $userID,
			receiver: $currentContact.ID,

        });
	}
</script>

<div class="container">
	<p>calling to {name}</p>
	<div class="dot-pulse" />
	<button on:click={cancel}>Cancel</button>
</div>

<style>
	p {
		font-size: 20px;
		font-family: 'Raleway', sans-serif;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;
	}
	button {
		width: 40%;
		padding: 5px;
		font-size: 20px;
		font-family: 'Raleway', sans-serif;
	}
	.dot-pulse {
		position: relative;
		left: -9999px;
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background-color: #9880ff;
		color: #9880ff;
		box-shadow: 9999px 0 0 -5px;
		animation: dot-pulse 1.5s infinite linear;
		animation-delay: 0.25s;
	}
	.dot-pulse::before,
	.dot-pulse::after {
		content: '';
		display: inline-block;
		position: absolute;
		top: 0;
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background-color: #9880ff;
		color: #9880ff;
	}
	.dot-pulse::before {
		box-shadow: 9984px 0 0 -5px;
		animation: dot-pulse-before 1.5s infinite linear;
		animation-delay: 0s;
	}
	.dot-pulse::after {
		box-shadow: 10014px 0 0 -5px;
		animation: dot-pulse-after 1.5s infinite linear;
		animation-delay: 0.5s;
	}

	@keyframes dot-pulse-before {
		0% {
			box-shadow: 9984px 0 0 -5px;
		}
		30% {
			box-shadow: 9984px 0 0 2px;
		}
		60%,
		100% {
			box-shadow: 9984px 0 0 -5px;
		}
	}
	@keyframes dot-pulse {
		0% {
			box-shadow: 9999px 0 0 -5px;
		}
		30% {
			box-shadow: 9999px 0 0 2px;
		}
		60%,
		100% {
			box-shadow: 9999px 0 0 -5px;
		}
	}
	@keyframes dot-pulse-after {
		0% {
			box-shadow: 10014px 0 0 -5px;
		}
		30% {
			box-shadow: 10014px 0 0 2px;
		}
		60%,
		100% {
			box-shadow: 10014px 0 0 -5px;
		}
	}
</style>
