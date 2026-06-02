<script lang="ts">
	import type { ComponentProps } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Command.Group> = $props();
</script>

<Command.Group bind:ref data-slot="combobox-group" class={cn(className)} {...restProps} />
