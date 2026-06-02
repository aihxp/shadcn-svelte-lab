<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getComboboxContext } from "./combobox.svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		disabled,
		tabindex = 0,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		disabled?: boolean;
		children?: Snippet;
	} = $props();

	const context = getComboboxContext();
	const isDisabled = $derived(disabled ?? context?.disabled ?? false);
</script>

<Popover.Trigger>
	{#snippet child({ props })}
		<div
			{...props}
			{...restProps}
			bind:this={ref}
			role="combobox"
			aria-expanded={context?.open}
			aria-disabled={isDisabled}
			data-disabled={isDisabled}
			data-slot="combobox-chips-input"
			tabindex={isDisabled ? undefined : tabindex}
			class={cn("cn-combobox-chips", className)}
		>
			{@render children?.()}
		</div>
	{/snippet}
</Popover.Trigger>
