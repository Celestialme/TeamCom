<script lang="ts">
	import { userID, screen } from '@src/stores/store';
	import { obj2formData } from '@src/utils';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { baseUrl } from '@src/config';

	let email = '';
	let password = '';
	let form: HTMLFormElement;
	let wrongCredentials: boolean = false;
	onMount(() => {
		form.onsubmit = async (e) => {
			e.preventDefault();
			let formData = obj2formData({
				role: 'user',
				email,
				password
			});
			$userID = (await axios.post(baseUrl + '/api/login', formData)).data?.id || null;
			if ($userID) {
				$screen = 'Archive';
			} else {
				wrongCredentials = true;
				setTimeout(() => {
					wrongCredentials = false;
				}, 500);
			}
		};
	});
</script>

<div class="body">
	<header data-tauri-drag-region>
		<p data-tauri-drag-region>TeamCom</p>
	</header>
	<form bind:this={form} class:wrongCredentials>
		<input
			type="text"
			placeholder="Username"
			autocomplete="off"
			required
			class="username"
			bind:value={email}
		/>
		<input
			type="password"
			placeholder="Password"
			autocomplete="off"
			required
			bind:value={password}
		/>
		<button class="login">Login</button>
	</form>
</div>

<style>
	.body {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		font-family: 'Raleway', sans-serif;
		overflow: hidden;
	}
	header {
		top: 0;
		width: 100%;
		text-align: center;
		padding: 15px;
		box-shadow: 0 3px 18px 0px rgb(0 0 0 / 8%);
		position: fixed;
		background-color: #fff;
		user-select: none;
	}
	header p {
		font-family: inherit;
		color: #014a7f;
		font-size: 24px;
		font-weight: 500;
		height: 36px;
		line-height: 36px;
	}
	form {
		width: 350px;
	}
	input {
		display: block;
		width: 100%;
		padding: 14px 5px;
		border: none;
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		outline: none;
		font-size: 20px;
		font-weight: 400;
		line-height: 1.5;
		color: #495057;
		background-color: #fff;
		background-clip: padding-box;
		transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
		font-family: inherit;
	}
	.username {
		margin-bottom: 30px;
	}

	.login {
		cursor: pointer;
		width: 100%;
		padding: 12px;
		border-radius: 50px;
		background-color: #004a7f;
		color: #fff;
		text-align: center;
		border: none;
		margin-top: 50px;
		font-size: 24px;
		font-weight: 500;
		font-family: inherit;
	}
	.login:active {
		transform: scale(0.9);
	}
	.wrongCredentials {
		animation: wiggle 0.3s ease-in-out;
	}
	@keyframes wiggle {
		0% {
			transform: translate(-100px);
		}
		25% {
			transform: translate(150px);
		}
		50% {
			transform: translate(-200px);
		}
		100% {
			transform: translate(0px);
		}
	}
</style>
