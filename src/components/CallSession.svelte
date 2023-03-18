<script lang="ts">
	import {  peerConnection } from '@src/stores/store';
	let seconds = 0;
	let interval = setInterval(() => {
		seconds++;
	}, 1000);
	function formatTime(time: number) {
		let hours = Math.floor(time / 3600);
		let minutes = Math.floor(time / 60);
		let seconds = time % 60;
		return (
			(hours < 10 ? '0' + hours : hours) +
			':' +
			(minutes < 10 ? '0' + minutes : minutes) +
			':' +
			(seconds < 10 ? '0' + seconds : seconds)
		);
	}
	$: time = formatTime(seconds);
    function endCall(){
        clearInterval(interval);
        // $peerConnection.close();
        $peerConnection.reset()
    }
</script>

<div class="container">
	<p class="timer">{time}</p>
	<img src="/images/endCall.png" alt="" on:click={endCall} />
</div>

<style>
	.container {
		position: fixed;
		top: 10px;
		left: 50%;
		transform: translate(-50%);
		width: 200px;
		z-index: 11;
		background: #004a7f;
		border-radius: 50px;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
	}
	p {
		font-size: 20px;
		font-family: monospace;
		padding: 5px;
		color: white;
	}
	img {
		width: 50px;
	}
	img:active {
		transform: scale(0.9);
	}
</style>
