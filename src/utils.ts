import moment from 'moment';
import type { Message } from './app';

export const obj2formData = (obj: any) => {
	const formData = new FormData();
	for (const key in obj) {
		formData.append(key, obj[key]);
	}
	return formData;
};

export function generateTime(messageDate: Message['date'],clock=true) {
	console.log(messageDate)
	if(messageDate.nanoseconds == 0 && messageDate.seconds == 0) {
		return 'Never';
	}
	let time = '';
	let date = new Date(messageDate.seconds * 1000 + messageDate.nanoseconds / 1000000);
	let M = moment(date);
	if (moment().diff(M, 'days') > 0 || !clock) {
		time = M.fromNow();
	} else {
		time = M.format('HH:mm').toLocaleString();
	}
	return time;
}

export function generateColorFromName(name: string) {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}

	const red = (hash & 0xff0000) >> 16;
	const green = (hash & 0x00ff00) >> 8;
	const blue = hash & 0x0000ff;

	if (red < 64 || green < 64 || blue < 64) {
		const adjust = Math.max(64 - red, 64 - green, 64 - blue);
		const adjustedRed = Math.min(255, red + adjust);
		const adjustedGreen = Math.min(255, green + adjust);
		const adjustedBlue = Math.min(255, blue + adjust);
		let color = (adjustedRed << 16) | (adjustedGreen << 8) | adjustedBlue;
		return { bg: '#' + color.toString(16).padStart(6, '0'), text: getTextColor(color) };
	}
	let color = (red << 16) | (green << 8) | blue;
	return { bg: '#' + color.toString(16).padStart(6, '0'), text: getTextColor(color) };
}

function getTextColor(bgColor: number) {
	const r = (bgColor & 0xff0000) >> 16;
	const g = (bgColor & 0x00ff00) >> 8;
	const b = bgColor & 0x0000ff;
	const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
	if (luminance > 0.5) {
		return '#000000'; // black
	} else {
		return '#FFFFFF'; // white
	}
}
