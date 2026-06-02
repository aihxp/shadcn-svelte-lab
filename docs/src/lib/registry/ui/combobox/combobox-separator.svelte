<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Command.Separator> = $props();
</script>

<Command.Separator
	bind:ref
	data-slot="combobox-separator"
	class={cn("cn-combobox-separator", className)}
	{...restProps}
/>
