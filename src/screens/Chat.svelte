<script lang="ts">
	import type { Message } from '@src/app';
	import ProfilePicture from '@src/components/profilePicture.svelte';
	import { baseUrl } from '@src/config';
	import {
		screen,
		currentContact,
		usersOnline,
		userID,
		socket,
		userList,
		peerConnection,
		calling,
		callSession,
		micStream
	} from '@src/stores/store';
	import { generateTime } from '@src/utils';
	import axios from 'axios';
	import { onMount, onDestroy } from 'svelte';
	import { tick } from 'svelte';
	import Calling from '@src/components/Calling.svelte';
	import { appWindow } from '@tauri-apps/api/window';
	let inputElement:HTMLInputElement
	let disabled = false;
	let online: boolean = $usersOnline.includes($currentContact.ID);
	$: online = $usersOnline.includes($currentContact.ID);
	let messages: Array<Message> = [];
	let input: string = '';
	let message_container: HTMLDivElement;
	let lastSeen: number = 0;
	$: lastOnline = $userList.find((user) => user.id === $currentContact.ID)?.lastOnline || {
		seconds: 0,
		nanoseconds: 0
	};
	onMount(async () => {
		messages = await axios
			.get(
				baseUrl +
					`/api/getMessages?userID=${$userID}&conversationID=${$currentContact.conversationID}&
					${$currentContact.ID ? 'contactID=' + $currentContact.ID : ''}`
			)
			.then((r) => r.data);
		await tick();
		lastSeen = messages[messages.length - 1]?.notSeen[$currentContact.ID] || 0;
		message_container.scrollTop = message_container.scrollHeight;
	
		$currentContact.conversationID = messages[messages.length - 1]?.conversationID;
		
	});

	async function send() {
		if (!input.length) return;
		$socket.emit('sendMessage', {
			sender: $userID,
			receiver: $currentContact.ID,
			message: input,
			conversationID: $currentContact.conversationID
		});
		input = '';
		disabled=true
	}
	async function call() {
		if(!online) return
		$peerConnection.reset()
		let channel = $peerConnection.connection.createDataChannel('channel');

		channel.onopen = () => {
			$callSession = true;
		};
		channel.onclose = () => {
			$micStream.getAudioTracks().forEach((track) => track.stop());
			$callSession = false;
		};
		try{

			$micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
		}catch(e){
			$micStream = new MediaStream()
		}
		$micStream.getAudioTracks().forEach((track) => $peerConnection.connection.addTrack(track, $micStream));
		$calling = true;
		let offer = await $peerConnection.connection.createOffer({offerToReceiveAudio:true});
		await $peerConnection.connection.setLocalDescription(offer);
		$socket.emit('call', {
			sender: $userID,
			receiver: $currentContact.ID,
			name: $userList.find((user) => user.id === $userID)?.name,
			offer: $peerConnection.connection.localDescription
		});
	}
	$socket.on('newMessage', async (data: Message) => {

		if($currentContact.ID != data.sender && $userID != data.sender){
			return
		}
		$currentContact.conversationID = data.conversationID;
		data.notSeen = {
			...data.notSeen,
			...{ [$userID as string]: 0 }
		};
		messages.push(data);
		messages = messages;
		await tick();
		message_container.scrollTop = message_container.scrollHeight;
		$socket.emit('seen', {
			conversationID: $currentContact.conversationID,
			contactID: $currentContact.ID
		});
		lastSeen = data.notSeen[$currentContact.ID];
		disabled=false
		await tick();
		inputElement.focus()
	});
	$socket.on('seen', async (data: any) => {
		messages[messages.length - 1].notSeen = {
			[$currentContact.ID]: 0,
			[$userID as string]: 0
		};
		messages = messages;
		lastSeen = 0;
	});
	onDestroy(() => {
		$socket.off('newMessage');
	});


	function inputClick() {
		$currentContact.notSeen = {
			[$userID as string]: 0,
			[$currentContact.ID]: 0
		}
		$socket.emit('seen', {
			conversationID: $currentContact.conversationID,
			contactID: $currentContact.ID
		});
	}
</script>

{#if $calling}
	<Calling bind:show={$calling} />
{/if}
<div class="body">
	<header data-tauri-drag-region>
		<img
			src="/images/back-icon.png"
			class="back"
			alt="menu icon"
			on:click={() => {
				$screen = 'Archive';
				$currentContact = {
					name: '',
					ID: '',
					conversationID: '',
					notSeen:$currentContact.notSeen
				};
			}}
		/>
		<div>
			<h4 class="name">{$currentContact.name} <span class:online /></h4>
			<p>Last seen {online ? 'just now' : generateTime(lastOnline, false)}</p>
		</div>
		<img src="/images/call.svg" alt="call" class="call" class:online on:click={call} />
		<ProfilePicture size={[50]} name={$currentContact.name} />
	</header>
	<div class="message_container" bind:this={message_container}>
		{#each messages as message, index}
			{#if message.sender == $userID}
				<div class="message_sent">
					<p>
						{message.message}
					</p>
				</div>

				{#if lastSeen == messages.length - index - 1}
					<p class="seen">seen</p>
				{/if}
			{:else}
				<div class="message_received">
					<p>
						{message.message}
					</p>
				</div>
			{/if}
		{/each}
	</div>
	<div class="send_container">
		<input
			bind:this={inputElement}
			type="text"
			placeholder="Type a message"
			bind:value={input}
			{disabled}
			on:keydown={(e) => e.key == 'Enter' && send()}
			on:click={inputClick}
		/>
		<button class="send" on:click={send}>
			<img src="/images/sendBtn.png" alt="Send" />
		</button>
	</div>
</div>

<style>
	.body {
		display: flex;
		flex-direction: column;

		align-items: center;
		height: 100vh;
		width: 100vw;
		font-family: 'Raleway', sans-serif;
		overflow: hidden;
		font-size: 16px;
	}
	header {
		display: flex;
		align-items: center;
		top: 0;
		width: 100%;
		padding: 15px;
		box-shadow: 0 3px 18px 0px rgb(0 0 0 / 8%);
		position: sticky;
		background-color: #fff;
		margin-bottom: 10px;
	}
	header .back {
		float: left;
	}
	header div {
		text-align: center;
		margin: auto;
	}
	header .name {
		margin: 0;
		padding-left:15px;
		font-size: 19px;
		font-weight: 500;
		color: #000;
		position: relative;
	}
	header p {
		font-size: 16px;
		color: #7f7f7f;
	}

	.message_container {
		padding: 20px;
		flex-grow: 1;
		overflow-y: auto;
		width: 100%;
	}
	.message_received {
		background-color: #feed99;
		border: 1px solid #ebe8da;
		padding: 15px 25px;
		max-width: 80%;
		margin-bottom: 20px;
		border-radius: 50px 50px 50px 0;
		margin-right: auto;
	}
	.message_sent {
		padding: 15px 25px;
		max-width: 80%;
		margin-bottom: 20px;
		background-color: #9ed1fa;
		border: 1px solid #e2eef4;
		margin-left: auto;
		border-radius: 100px 100px 0 100px;
	}
	.send_container {
		width: calc(100% - 40px);
		display: flex;
		border: 1px solid #d7dce5;
		padding: 10px;
		border-radius: 100px;
		margin-bottom: 20px;
	}
	input {
		width: 100%;
		border: none;
		background: none;
		outline: none;
		box-shadow: none;
		padding: 1px 2px;
	}
	.send {
		flex: none;
		border: none;
		background: none;
		outline: none;
		box-shadow: none;
	}
	.name .online {
		width: 14px;
		height: 14px;
		background-color: #3bdb1d;
		border: 2px solid #fff;
		border-radius: 100%;
		position: absolute;
		left:0;
		top: 50%;
		transform: translateY(-50%);
	}
	.seen {
		text-align: right;
		padding: 10px 0;
		margin-top: -15px;
	}
	.call {
		background: transparent;
		height: 40px;
		position: absolute;
		left: 70px;
		cursor: pointer;
		opacity: 0.5;
	}
	.call.online{
		opacity: 1;
	}
	.call.online:active {
		transform: scale(0.9);
	}
</style>
