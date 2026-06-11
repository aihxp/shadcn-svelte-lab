<script lang="ts">
	import Metadata from "$lib/components/metadata.svelte";
	import PageActions from "$lib/components/page-header/page-actions.svelte";
	import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
	import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
	import PageHeader from "$lib/components/page-header/page-header.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import SeraPreviewGrid from "./components/sera-preview-grid.svelte";

	const title = "Introducing Sera";
	const description =
		"Minimal. Editorial. Typographic. Underline controls and uppercase headings, shaped by print design principles.";
</script>

<Metadata
	{title}
	{description}
	ogImage={{
		url: "/img/styles/sera-01-light.png",
		width: "1440",
		height: "900",
	}}
/>

<div class="flex flex-1 flex-col">
	<PageHeader class="md:**:[.container]:pb-8 lg:**:[.container]:pb-12">
		<PageHeaderHeading
			class="font-heading max-w-3xl text-[2.875rem] font-semibold tracking-normal"
		>
			{title}
		</PageHeaderHeading>
		<PageHeaderDescription class="max-w-2xl text-pretty md:text-balance">
			{description}
		</PageHeaderDescription>
		<PageActions class="**:[.container]:justify-start">
			<Button href="/create?preset=b4xFeBLg4O" size="sm">
				Open in shadcn/create
				<ArrowRightIcon data-icon="inline-end" />
			</Button>
		</PageActions>
	</PageHeader>

	<div class="container-wrapper section-soft flex-1 px-0 md:px-2 md:py-12">
		<div class="container max-w-screen-2xl px-4 md:px-6">
			<SeraPreviewGrid />
		</div>
	</div>
</div>
