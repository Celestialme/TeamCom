<script lang="ts">
	import type { Message } from '@src/app';
	import { currentContact,  screen, anyActive } from '@src/stores/store';
	import { generateTime } from '@src/utils';
	import ProfilePicture from './profilePicture.svelte';
	import { appWindow } from '@tauri-apps/api/window';
	export let online: boolean = false;
	export let message: Message;
	export let count = 0;
	export let index = 0
	export let notSeen:{[key:number]:boolean}={}
	$:_(count)
	$: time = generateTime(message.date);
	function clickHandler(e: MouseEvent) {
		$screen = 'Chat';
		$currentContact.name = message.contactName;
		$currentContact.ID = message.contactID;
		$currentContact.conversationID = message.conversationID;
		$currentContact.notSeen = message.notSeen
	}
	$:if(message.contactID==$currentContact.ID)message.notSeen = $currentContact.notSeen
	function _(count: number) {
		
		notSeen[index] = count > 0;
		$anyActive = Object.values(notSeen).filter((item) => item == true).length > 0;
		notSeen = notSeen;
		if ($anyActive) {
			appWindow.setAlwaysOnTop(true);
		} else {
			appWindow.setAlwaysOnTop(false);
		}
	}
</script>

<div class="conversation" class:active={count > 0} on:click={clickHandler}>
	<ProfilePicture {online} name={message.contactName} />
	<div class="content">
		<h4 class="name">{message.contactName}</h4>
		<p class="last_message">{message.message}</p>
	</div>
	<div class="details">
		<p class="time">{time}</p>
		{#if count}
			<p class="notification">{count}</p>
		{/if}
	</div>
</div>

<style>
	.conversation {
		display: flex;
		justify-content: space-between;
		width: 100%;
		height: 100px;
		gap: 15px;
		padding: 15px;
		background-color: #f5f5f5;
		box-shadow: 5px 4px 16px 0px grey;
	}

	.content {
		padding: 5px 0;
		flex-grow: 1;
	}
	h4 {
		font-weight: 600;
		color: #1c1c1c;
		font-size: 19px;
	}
	.last_message {
		color: #191919;
		margin: 3px 0 0;
	}
	.details {
		flex: none;
		display: flex;
		flex-direction: column;
		align-items: end;
		justify-content: space-between;
	}
	.time {
		color: #7f7f7f;
	}
	.notification {
		margin-bottom: 5px;
		background-color: #014a7f;
		width: 24px;
		height: 24px;
		line-height: 24px;
		text-align: center;
		color: #fff;
		border-radius: 100%;
	}
	.active {
		background-color: #f9fafd !important;
	}
</style>
