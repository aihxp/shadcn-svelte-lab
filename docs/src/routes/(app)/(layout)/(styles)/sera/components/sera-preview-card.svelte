<script lang="ts">
	import { cn } from "$lib/utils.js";

	type Props = {
		name: string;
		title: string;
		description: string;
		width: number;
		height: number;
		priority?: boolean;
		class?: string;
	};

	let {
		name,
		title,
		description,
		width,
		height,
		priority = false,
		class: className,
	}: Props = $props();
</script>

<article class={cn("bg-background overflow-hidden border shadow-sm transition-colors", className)}>
	<div class="bg-muted/50 border-b px-4 py-3 md:px-5">
		<p class="text-foreground font-heading text-sm font-semibold tracking-normal uppercase">
			{title}
		</p>
		<p class="text-muted-foreground mt-1 text-sm">{description}</p>
	</div>
	<div class="bg-muted/60 p-2 md:p-3">
		<img
			src={`/img/styles/${name}-light.png`}
			alt={`${title} preview`}
			{width}
			{height}
			class="block h-auto w-full border dark:hidden"
			loading={priority ? "eager" : "lazy"}
			decoding="async"
		/>
		<img
			src={`/img/styles/${name}-dark.png`}
			alt={`${title} preview`}
			{width}
			{height}
			class="hidden h-auto w-full border dark:block"
			loading={priority ? "eager" : "lazy"}
			decoding="async"
		/>
	</div>
</article>
