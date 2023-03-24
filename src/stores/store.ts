import { get, writable, type Writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { baseUrl } from '@src/config';
import type { CurrentContact, User } from '@src/app';
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
let iceServers =   [
    {
      urls:[
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",]
    },
    {
      urls: "stun:relay.metered.ca:80",
    },
    {
      urls: "turn:relay.metered.ca:80",
      username: "b7ddadd7f2dc677005b15108",
      credential: "xABzLc9XLWLvIgYT",
    },
    {
      urls: "turn:relay.metered.ca:443",
      username: "b7ddadd7f2dc677005b15108",
      credential: "xABzLc9XLWLvIgYT",
    },
    {
      urls: "turn:relay.metered.ca:443?transport=tcp",
      username: "b7ddadd7f2dc677005b15108",
      credential: "xABzLc9XLWLvIgYT",
    },
]

export let peerConnection = writable({
	connection: new RTCPeerConnection({
		iceServers

	}),
  caller:"",
	reset: function () {
    this.caller = "";
		this.connection.close();
		this.connection = new RTCPeerConnection({
            iceServers
        });
		peerConnection.set(get(peerConnection));
	}
});
export let micStream: Writable<MediaStream> = writable();
