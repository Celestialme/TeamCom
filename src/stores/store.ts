import { get, writable, type Writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { baseUrl } from '@src/config';
import type { CurrentContact, User } from '@src/app';
import axios from 'axios';
export let currentContact: Writable<CurrentContact> = writable({
	name: '',
	ID: '',
	conversationID: '',
	notSeen: {}
});
export let usersOnline = writable([] as string[]);
export let socket = writable(io(baseUrl, { transports: ['websocket'], forceNew: true }));
export let userID: Writable<string | null> = writable(globalThis?.localStorage?.getItem('userID'));
export let screen = writable(get(userID) == null ? 'Login' : 'Archive');
export let userList: Writable<Array<User>> = writable([]);
export let calling: Writable<boolean> = writable(false);
export let callSession: Writable<boolean> = writable(false);
export let anyActive: Writable<boolean> = writable(false);
export let isConnected: Writable<boolean> = writable();
async function getServers() {
	let metered = (
		await axios.get(
			`https://teamcom3.metered.live/api/v1/turn/credentials?apiKey=54ee9b577530e9f5680b302ada51650ee1ff`
		)
	).data;
	let iceServers = [
		{
			urls: [
				'stun:stun1.l.google.com:19302',
				'stun:stun2.l.google.com:19302',
				'stun:stun3.l.google.com:19302',
				'stun:stun4.l.google.com:19302'
			]
		},
		...metered
	];
	peerConnection.set({
		connection: new RTCPeerConnection({
			iceServers
		}),
		caller: '',
		reset: function () {
			this.caller = '';
			this.connection.close();
			this.connection = new RTCPeerConnection({
				iceServers
			});
			peerConnection.set(get(peerConnection));
		}
	});
}
getServers()
export let peerConnection: Writable<{
	connection: RTCPeerConnection;
	caller: string;
	reset: () => void;
}> = writable();
export let micStream: Writable<MediaStream> = writable();
