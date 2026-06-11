<script lang="ts">
	import MenuAccentPicker from "./menu-accent-picker.svelte";
	import MenuColorPicker from "./menu-color-picker.svelte";

	type Props = {
		submenu?: boolean;
	};

	let { submenu = false }: Props = $props();
</script>

<MenuColorPicker {submenu} />
<MenuAccentPicker {submenu} />
