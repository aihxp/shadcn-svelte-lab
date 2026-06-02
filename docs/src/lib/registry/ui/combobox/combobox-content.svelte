<script lang="ts">
	import type { ComponentProps, Snippet } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import type { CommandRootApi } from "$lib/registry/ui/command/command.svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		commandRef = $bindable(null),
		commandApi = $bindable(null),
		value = $bindable(""),
		class: className,
		commandClass,
		sideOffset = 6,
		align = "start",
		children,
		...restProps
	}: WithoutChildrenOrChild<ComponentProps<typeof Popover.Content>> & {
		commandRef?: HTMLElement | null;
		commandApi?: CommandRootApi | null;
		value?: string;
		commandClass?: string;
		children?: Snippet;
	} = $props();
</script>

<Popover.Content
	bind:ref
	{sideOffset}
	{align}
	data-slot="combobox-content"
	class={cn(
		"cn-combobox-content cn-combobox-content-logical w-(--bits-popover-anchor-width)",
		className
	)}
	{...restProps}
>
	<Command.Root
		bind:ref={commandRef}
		bind:api={commandApi}
		bind:value
		class={cn("rounded-none! bg-transparent p-0", commandClass)}
	>
		{@render children?.()}
	</Command.Root>
</Popover.Content>
