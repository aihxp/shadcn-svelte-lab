<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		type = "button",
		variant = "ghost",
		size = "icon-xs",
		"aria-label": ariaLabel = "Remove",
		...restProps
	}: ComponentProps<typeof Button> = $props();
</script>

<Button
	bind:ref
	{type}
	{variant}
	{size}
	aria-label={ariaLabel}
	data-slot="combobox-chip-remove"
	class={cn("cn-combobox-chip-remove", className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<IconPlaceholder
			lucide="XIcon"
			tabler="IconX"
			hugeicons="Cancel01Icon"
			phosphor="XIcon"
			remixicon="RiCloseLine"
		/>
	{/if}
</Button>
