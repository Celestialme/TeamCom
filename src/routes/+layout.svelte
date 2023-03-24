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
		anyActive,
		currentContact
	} from '@src/stores/store';
	import axios from 'axios';
	let prompt: { show: boolean; callDetails: any } = { show: false, callDetails: {} };


	peerConnection.subscribe((peer) => {
		peer.connection.ontrack = (e) => {
			let audio = new Audio();
			audio.srcObject = e.streams[0];
			audio.play();
		};
		peer.connection.onicecandidate = async (e) => {
			console.log("local-candidate")
			if (e.candidate == null) return;
			if (peer.caller) {
				$socket.emit('candidate', { sender: $userID, receiver: peer.caller, candidate: e.candidate });
			} else {
				$socket.emit('candidate', {
					sender: $userID,
					receiver: $currentContact.ID,
					candidate: e.candidate
				});
			}
		};
		peer.connection.onconnectionstatechange = peer.connection.onconnectionstatechange = (e) => {
			console.log("connection",peer.connection.connectionState,"ice",peer.connection.iceConnectionState )
			if (peer.connection.connectionState  === 'failed' || peer.connection.iceConnectionState === 'disconnected') {
				peer.connection.restartIce();
			}
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
		$peerConnection.caller = data.sender;
		
		try {
			$micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (e) {
			$micStream = new MediaStream();
		}
		$micStream
			.getAudioTracks()
			.forEach((track) => $peerConnection.connection.addTrack(track, $micStream));
		console.log(data.offer)
		await $peerConnection.connection.setRemoteDescription(data.offer);
		let answer = await $peerConnection.connection.createAnswer();
		await $peerConnection.connection.setLocalDescription(answer);
		$socket.emit('answer', { sender: $userID, receiver: $peerConnection.caller, answer });
	}

	$socket.on('usersOnline', (data) => {
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
		let user = $userList.find((user) => user.id === data.id) as User;
		user.lastOnline = data.time;
		$userList = $userList;
	});
	$socket.on('call', async (data) => {
		prompt.show = true;
		prompt.callDetails = data;
	});
	$socket.on('answer', async (data) => {
		await $peerConnection?.connection.setRemoteDescription(data.answer);
		$calling = false;
	});
	$socket.on('candidate', async (data) => {
		console.log("socket-candidate")
		if (data.candidate == null) return;
		try {
			await $peerConnection?.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
		} catch (e) {
			
		}
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
	let focusTimeOut: NodeJS.Timeout;
	appWindow.onFocusChanged(({ payload: focused }) => {
		if (focusTimeOut) {
			clearTimeout(focusTimeOut);
		}
		focusTimeOut = setTimeout(() => {
			if (focused == false && !$anyActive) {
				appWindow.minimize();
			}
		}, 200);
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
