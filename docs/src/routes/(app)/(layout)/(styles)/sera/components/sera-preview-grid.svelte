<script lang="ts">
	import SeraPreviewCard from "./sera-preview-card.svelte";

	const previews = [
		{
			name: "sera-01",
			title: "Audience Analytics",
			description: "Editorial traffic, demographics, and top-story metrics.",
			width: 2704,
			height: 3160,
		},
		{
			name: "sera-02",
			title: "Article Directory",
			description: "Dense content lists with crisp divisions and direct actions.",
			width: 2704,
			height: 2058,
		},
		{
			name: "sera-03",
			title: "Empty State",
			description: "A quiet first-run state for editorial workspaces.",
			width: 2704,
			height: 1862,
		},
		{
			name: "sera-04",
			title: "Edit Article",
			description: "A writing surface with structured publishing controls.",
			width: 2704,
			height: 2400,
		},
		{
			name: "sera-05",
			title: "Media Library",
			description: "Image management shaped for scanning and selection.",
			width: 2704,
			height: 2242,
		},
		{
			name: "sera-06",
			title: "Media Table",
			description: "A tabular media view with filters and metadata.",
			width: 2704,
			height: 2714,
		},
	] as const;
</script>

<div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
	{#each previews as preview, index (preview.name)}
		<SeraPreviewCard
			{...preview}
			priority={index === 0}
			class={index === 0 ? "lg:col-span-2" : ""}
		/>
	{/each}
</div>
