<script lang="ts">
	import type { Message } from '@src/app';
	import Conversation from '@src/components/Conversation.svelte';
	import Drawer from '@src/components/Drawer.svelte';
	import { baseUrl } from '@src/config';
	import { usersOnline, screen, userID, socket, currentContact } from '@src/stores/store';
	import { appWindow } from '@tauri-apps/api/window';
	import axios from 'axios';
	import { onMount } from 'svelte';
	export let hide = false;
	let notSeen = {};
	let messages: Array<Message> = [];
	let showDrawer: boolean = false;
	let messageSound = new Audio('/newMessage.wav')
	messageSound.volume = 0.05;
	onMount(async () => {
		messages = await axios
			.get(baseUrl + '/api/getMessages?limit=1&userID=' + $userID)
			.then((r) => r.data);
	});
	$: if (!hide) {
		$socket.off('newMessage');
		$socket.on('newMessage', async (data: Message) => {
		
			await appWindow.unminimize();
			await appWindow.setAlwaysOnTop(true);
			await appWindow.setAlwaysOnTop(false);
			if (data.contactID == $userID) {
				// if we are sender
				let msg = messages.find((m) => data.receiver == m.contactID) as Message;
				msg.message = data.message;
				msg.date = data.date;
				msg.notSeen = { ...data.notSeen, ...{ [$userID as string]: 0 } };
				messages = messages;
				console.log(messages);
				return;
			}
			messageSound.play()
			messages = messages.filter((message) => message.contactID != data.contactID);
			messages.unshift(data);
			messages = messages;
			console.log(data);
		});
	}
	
</script>

<div class="body" class:hide on:click|self={() => (showDrawer = false)}>
	<header data-tauri-drag-region class="titlebar">
		<img src="/images/menu-icon.png" alt="menu icon" on:click={() => (showDrawer = !showDrawer)} />
		<p>TeamCom</p>
		<img src="/images/logout.png" alt="" class="logout" on:click={() => ($userID = null)} />
	</header>
	{#each messages as message, index}
		<Conversation
			bind:message
			{index}
			bind:notSeen
			count={message?.notSeen?.[$userID || ''] || 0}
			online={$usersOnline.includes(message.contactID)}
		/>
	{/each}
	<Drawer show={showDrawer} />
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
		z-index: 2;
	}
	header img {
		float: left;
	}
	header p {
		font-family: inherit;
		color: #014a7f;
		font-size: 24px;
		font-weight: 500;
		height: 36px;
		line-height: 36px;
		margin: auto;
		user-select: none;
		pointer-events: none;
	}
	.hide {
		display: none;
	}
</style>
