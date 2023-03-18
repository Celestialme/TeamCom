<script lang="ts">
	import { generateColorFromName } from '@src/utils';

	export let online = false;
	export let name = 'A';
	export let size = [60, 18];
	let color = generateColorFromName(name);
</script>

<div class="picture_wrapper" style="width:{size[0]}px;height:{size[0]}px">
	<div class="img" style="background: {color.bg}">
		<p style="color: {color.text}">{name[0].toUpperCase()}</p>
	</div>
	<div class:online style="width:{size[1]}px;height:{size[1]}px" />
</div>

<style>
	.picture_wrapper {
		position: relative;
	}
	.picture_wrapper .img {
		border-radius: 100%;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background-color: red;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.picture_wrapper .img p {
		font-size: 30px;
		font-family: 'Raleway', sans-serif;
	}
	.online {
		border: 2px solid #fff;
		border-radius: 100%;
		background-color: #3bdb1d;
		position: absolute;
		bottom: 0;
		right: 0;
		z-index: 1;
	}
</style>
