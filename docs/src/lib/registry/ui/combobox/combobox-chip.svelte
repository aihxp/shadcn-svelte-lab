<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "secondary",
		children,
		...restProps
	}: ComponentProps<typeof Badge> = $props();
</script>

<Badge
	bind:ref
	{variant}
	data-slot="combobox-chip"
	class={cn("cn-combobox-chip", className)}
	{...restProps}
>
	{@render children?.()}
</Badge>
