<script lang="ts">
	import type { User } from '@src/app';
	import CallSession from '@src/components/CallSession.svelte';
	import Prompt from '@src/components/Prompt.svelte';
	import { baseUrl } from '@src/config';
	import { appWindow } from '@tauri-apps/api/window';
	import {
		socket,
		userID,
		userList,
		usersOnline,
		peerConnection,
		calling,
		callSession,
		screen,
		micStream,
		anyActive
	} from '@src/stores/store';
	import axios from 'axios';
	let prompt: { show: boolean; callDetails: any } = { show: false, callDetails: {} };
	let caller: string;

	peerConnection.subscribe((peer) => {
		peer.connection.ontrack = (e) => {
			let audio = new Audio();
			audio.srcObject = e.streams[0];
			audio.play();
		};
		peer.connection.onicecandidate = async (e) => {
			if (!e.candidate) return;
			$socket.emit('candidate', { sender: $userID, receiver: caller, candidate: e.candidate });
		};

		peer.connection.ondatachannel = (e) => {
			e.channel.onopen = () => {
				$callSession = true;
				console.log('channel open');
			};

			e.channel.onclose = () => {
				console.log('channel closed');
				$peerConnection.reset();
				$micStream.getAudioTracks().forEach((track) => track.stop());
				$callSession = false;
			};
		};
	});

	function answerOrHang(confirm: boolean) {
		if (confirm) {
			answer();
		} else {
			$socket.emit('cancelCall', {
				sender: $userID,
				receiver: prompt.callDetails.sender
			});
		}
	}
	async function answer() {
		let data = prompt.callDetails;
		console.log($peerConnection);
		caller = data.sender;
		$micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		$micStream
			.getAudioTracks()
			.forEach((track) => $peerConnection.connection.addTrack(track, $micStream));
		await $peerConnection.connection.setRemoteDescription(data.offer);
		let answer = await $peerConnection.connection.createAnswer();
		await $peerConnection.connection.setLocalDescription(answer);
		$socket.emit('answer', { sender: $userID, receiver: caller, answer });
	}

	$socket.on('usersOnline', (data) => {
		console.log('online', data);
		usersOnline.set(data);
	});
	userID.subscribe((value) => {
		$peerConnection.reset();
		if (!value) {
			$socket.emit('setUserID', value);
			globalThis?.localStorage?.removeItem('userID');
			screen.set('Login');
			return;
		}
		$socket.emit('setUserID', value);
		globalThis?.localStorage?.setItem('userID', value);
	});

	$socket.on('lastOnline', (data) => {
		console.log('data', data);
		let user = $userList.find((user) => user.id === data.id) as User;
		user.lastOnline = data.time;
		$userList = $userList;
	});
	$socket.on('call', async (data) => {
		prompt.show = true;
		prompt.callDetails = data;
	});
	$socket.on('answer', async (data) => {
		console.log(data);
		await $peerConnection?.connection.setRemoteDescription(data.answer);
		$calling = false;
	});
	$socket.on('candidate', async (data) => {
		if (!data.candidate) return;
		await $peerConnection?.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
	});
	$socket.on('cancelCall', async (data) => {
		$micStream && $micStream.getAudioTracks().forEach((track) => track.stop());
		prompt.show = false;
		$calling = false;
	});
	axios
		.get(baseUrl + '/api/getUsers?userID=' + $userID)
		.then((r) => (($userList = r.data), console.log($userList)));
	appWindow.onCloseRequested(() => {
		$peerConnection.connection.close();
	});
	let focusTimeOut:NodeJS.Timeout
	appWindow.onFocusChanged(({ payload: focused }) => {
		
		if (focusTimeOut) {
			clearTimeout(focusTimeOut)
		}
		focusTimeOut = setTimeout(() => {
		if (focused==false && !$anyActive) {
				appWindow.minimize();
			}
		},200);
	});
</script>


<slot />
{#if prompt.show}
	<Prompt name={prompt.callDetails.name} cb={answerOrHang} bind:show={prompt.show} />
{/if}
{#if $callSession}
	<CallSession />
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap');
	
</style>
