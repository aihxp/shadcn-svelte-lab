<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		...restProps
	}: ComponentProps<typeof Command.Input> = $props();
</script>

<Command.Input
	bind:ref
	bind:value
	data-slot="combobox-input"
	class={cn(className)}
	{...restProps}
/>
