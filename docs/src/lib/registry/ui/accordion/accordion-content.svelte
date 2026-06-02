<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		motion = "auto",
		...restProps
	}: WithoutChild<AccordionPrimitive.ContentProps> & {
		motion?: "auto" | "none";
	} = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	data-motion={motion === "none" ? "none" : undefined}
	class="cn-accordion-content overflow-hidden"
	{...restProps}
>
	<div
		class={cn(
			"cn-accordion-content-inner [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
			className
		)}
	>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
