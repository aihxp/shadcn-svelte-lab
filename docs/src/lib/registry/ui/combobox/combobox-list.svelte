<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Command.List> = $props();
</script>

<Command.List
	bind:ref
	data-slot="combobox-list"
	class={cn("cn-combobox-list", className)}
	{...restProps}
/>
