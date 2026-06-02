<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Command.Empty> = $props();
</script>

<Command.Empty
	bind:ref
	data-slot="combobox-empty"
	class={cn("cn-combobox-empty", className)}
	{...restProps}
/>
