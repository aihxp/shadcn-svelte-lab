<script lang="ts">
	import type { Snippet } from "svelte";
	import BlockViewerIframe from "./block-viewer-iframe.svelte";
	import { BlockViewerContext } from "./block-viewer.svelte";

	const ctx = BlockViewerContext.get();
	let { children }: { children?: Snippet } = $props();

	const blockPreviewImageNames = new Set([
		"dashboard-01",
		"demo-sidebar",
		"demo-sidebar-controlled",
		"demo-sidebar-footer",
		"demo-sidebar-group",
		"demo-sidebar-group-action",
		"demo-sidebar-group-collapsible",
		"demo-sidebar-header",
		"demo-sidebar-menu",
		"demo-sidebar-menu-action",
		"demo-sidebar-menu-badge",
		"demo-sidebar-menu-collapsible",
		"demo-sidebar-menu-sub",
		"login-01",
		"login-02",
		"login-03",
		"login-04",
		"login-05",
		"sidebar-01",
		"sidebar-02",
		"sidebar-03",
		"sidebar-04",
		"sidebar-05",
		"sidebar-06",
		"sidebar-07",
		"sidebar-08",
		"sidebar-09",
		"sidebar-10",
		"sidebar-11",
		"sidebar-12",
		"sidebar-13",
		"sidebar-14",
		"sidebar-15",
		"sidebar-16",
	]);
	const hasPreviewImage = $derived(blockPreviewImageNames.has(ctx.item.name));
</script>

<div class="flex flex-col gap-2 lg:hidden">
	<div class="flex items-center gap-2 px-2">
		<div class="line-clamp-1 text-sm font-medium">
			{ctx.item.description}
		</div>
		<div class="text-muted-foreground ms-auto shrink-0 font-mono text-xs">
			{ctx.item.name}
		</div>
	</div>
	{#if ctx.item.meta?.mobile === "component"}
		{@render children?.()}
	{:else if hasPreviewImage}
		<div class="overflow-hidden rounded-xl border">
			<img
				src="/img/registry/{ctx.item.name}-light.png"
				alt={ctx.item.name}
				data-block={ctx.item.name}
				width={1440}
				height={900}
				class="object-cover dark:hidden"
			/>
			<img
				src="/img/registry/{ctx.item.name}-dark.png"
				alt={ctx.item.name}
				data-block={ctx.item.name}
				width={1440}
				height={900}
				class="hidden object-cover dark:block"
			/>
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border">
			<BlockViewerIframe />
		</div>
	{/if}
</div>
