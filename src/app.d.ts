// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}
export type Message = {
	conversationID: string;
	sender: string;
	receiver?: string;
	message: string;
	contactName: string;
	contactID: string;
	notSeen: {
		[key: string]: number;
	};
	date: { seconds: number; nanoseconds: number };
};
export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
	lastOnline: { seconds: number; nanoseconds: number };
	online?: boolean;
};
export type CurrentContact = {
	name: string;
	ID: string;
	conversationID: string;
	notSeen: { [key: string]: number}
};
export {};
