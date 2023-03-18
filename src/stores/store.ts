
import { get, writable, type Writable } from 'svelte/store';
import {io} from "socket.io-client"
import { baseUrl } from '@src/config';
import type { CurrentContact, User } from '@src/app';
export let currentContact:Writable<CurrentContact> = writable({name:"",ID:"",conversationID:"",notSeen:{}});
export let usersOnline = writable([] as string[])
export let socket = writable(io(baseUrl,{transports: ['websocket'],forceNew: true}))
export let userID:Writable<string|null> = writable(globalThis?.localStorage?.getItem('userID'));
export let screen=writable(get(userID)==null?"Login":"Archive")
export let userList: Writable<Array<User>> = writable([]);
export let calling:Writable<boolean> = writable(false);
export let callSession:Writable<boolean> = writable(false);
export let anyActive:Writable<boolean> = writable(false);
export let peerConnection = writable( {
    connection:new RTCPeerConnection(),
    reset:function (){
        this.connection.close();
        this.connection = new RTCPeerConnection()
        peerConnection.set(get(peerConnection))
    }
});
export let micStream:Writable<MediaStream> = writable();
