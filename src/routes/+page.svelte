<script lang="ts">
	import Login from '@src/screens/Login.svelte';
	import Archive from '@src/screens/Archive.svelte';
	import Chat from '@src/screens/Chat.svelte';
	import { screen, userID } from '@src/stores/store';
</script>

{#if $screen == 'Login'}
	<Login />
{:else if $screen == 'Chat'}
	<Chat />
{/if}
{#if $userID}
<Archive hide={$screen !== 'Archive'} />
{/if}