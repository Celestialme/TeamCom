<script lang="ts">
	import type { User } from '@src/app';
	import { currentContact, userID, usersOnline, screen, userList } from '@src/stores/store';
	import ProfilePicture from './profilePicture.svelte';

	export let show = false;
	function clickHandler(user: User) {
		$screen = 'Chat';
		$currentContact.name = user.name;
		$currentContact.ID = user.id;
		
	}
	$:$userList = $userList.map((user) => {
		 user.online = $usersOnline.find((user_ID) => user_ID == user.id) ? true : false
		 return user
	}).sort((a,b)=>{
		if(a.online && !b.online) return -1
		if(!a.online && b.online) return 1
		return 0
	})
</script>

<div class="container" class:show>
	<div class="main_user">
		<img src="/images/avatar.png" alt="avatar" />
		<p>{$userList.find((user) => user.id == $userID)?.name}</p>
	</div>
	{#each $userList.filter((user) => user.id !== $userID) as user}
		<div class="user" on:click={() => clickHandler(user)}>
			<ProfilePicture
				size={[50, 15]}
				name={user.name}
				online={user.online}
			/>
			<span>{user.name}</span>
		</div>
	{/each}
</div>

<style>
	.container {
		position: absolute;
		left: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		height: calc(100% - 70px);
		width: 200px;
		background-color: #dddddd;
		z-index: 1;
		transform: translate(-100%);
		transition: transform 0.3s ease-in-out;
		overflow-y: auto;
	}
	.show {
		transform: translateX(0%);
	}
	.main_user {
		padding: 10px 0;
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: inherit;
		font-size: 22px;
		border: 1px solid black;
		width: 100%;
		border-radius: 6px;
		box-shadow: 5px 2px 13px 0px #0000007a;
		position: sticky;
		top: 0;
		background: #dddddd;
		z-index: 111;
		user-select: none;
	}
	.main_user img {
		width: 50px;
		margin-left: 15px;
	}
	.user {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 15px;
		gap: 10px;
		border-bottom: 1px solid #acacac;
		cursor: pointer;
	}
	.user span {
		font-family: inherit;
		font-size: 22px;
	}
</style>
