<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		checked = false,
		...restProps
	}: CommandPrimitive.ItemProps & {
		checked?: boolean;
	} = $props();
</script>

<CommandPrimitive.Item
	bind:ref
	data-slot="combobox-item"
	data-checked={checked}
	class={cn(
		"group/combobox-item cn-combobox-item relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<span
		data-slot="combobox-item-indicator"
		class="cn-combobox-item-indicator opacity-0 group-data-[checked=true]/combobox-item:opacity-100"
	>
		<IconPlaceholder
			lucide="CheckIcon"
			tabler="IconCheck"
			hugeicons="Tick02Icon"
			phosphor="CheckIcon"
			remixicon="RiCheckLine"
		/>
	</span>
</CommandPrimitive.Item>
