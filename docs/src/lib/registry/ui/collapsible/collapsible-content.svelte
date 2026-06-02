<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		motion = "auto",
		...restProps
	}: CollapsiblePrimitive.ContentProps & {
		motion?: "auto" | "none";
	} = $props();
</script>

<CollapsiblePrimitive.Content
	bind:ref
	data-slot="collapsible-content"
	data-motion={motion === "none" ? "none" : undefined}
	{...restProps}
/>
