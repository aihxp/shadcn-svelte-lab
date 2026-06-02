<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { cn } from "$lib/utils.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { getComboboxContext } from "./combobox.svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		variant = "outline",
		size = "default",
		type = "button",
		disabled,
		showIcon = true,
		...restProps
	}: ComponentProps<typeof Button> & {
		showIcon?: boolean;
	} = $props();

	const context = getComboboxContext();
</script>

<Popover.Trigger bind:ref>
	{#snippet child({ props })}
		<Button
			{...props}
			{...restProps}
			{type}
			{variant}
			{size}
			disabled={disabled ?? context?.disabled}
			role="combobox"
			aria-expanded={context?.open}
			data-slot="combobox-trigger"
			class={cn("cn-combobox-trigger", className)}
		>
			{@render children?.()}
			{#if showIcon}
				<IconPlaceholder
					lucide="ChevronDownIcon"
					tabler="IconChevronDown"
					hugeicons="ArrowDown01Icon"
					phosphor="CaretDownIcon"
					remixicon="RiArrowDownSLine"
					class="cn-combobox-trigger-icon pointer-events-none"
				/>
			{/if}
		</Button>
	{/snippet}
</Popover.Trigger>
