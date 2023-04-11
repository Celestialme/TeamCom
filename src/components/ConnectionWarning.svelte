<script>
	import { socket } from '@src/stores/store';

	function reconnect() {
		$socket.connect();
	}
</script>

<div class="offline-message">
	<p>You are currently offline.</p>
	<button class="reconnect-button" on:click={reconnect}>Reconnect (Retry)</button>
</div>

<style>
	.offline-message {
		position: absolute;
		bottom: 0;
		width: 100%;
		font-family: 'Raleway', sans-serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100px;
        background-color: white;
        border-top: 2px solid #c5c5c5;
	}

	.offline-message p {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.reconnect-button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		border: 2px solid #333;
		border-radius: 4px;
		background-color: #fff;
		color: #333;
		transition: all 0.3s ease-in-out;
		font-family: 'Raleway', sans-serif;
	}

	.reconnect-button:hover {
		background-color: green;
		color: #fff;
		cursor: pointer;
	}
</style>
