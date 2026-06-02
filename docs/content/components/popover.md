---
title: Popover
description: Displays rich content in a portal, triggered by a button.
component: true
links:
  source: https://github.com/huntabyte/shadcn-svelte/tree/next/sites/docs/src/lib/registry/ui/popover
  doc: https://bits-ui.com/docs/components/popover
  api: https://bits-ui.com/docs/components/popover#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="popover-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="popover" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

Install `bits-ui`:

</Step>

<PMInstall command="bits-ui -D" />

<Step>

Copy and paste the following code into your project.

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## Usage

```svelte showLineNumbers
<script lang="ts">
  import * as Popover from "$lib/components/ui/popover/index.js";
</script>
```

```svelte showLineNumbers
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content>Place content for the popover here.</Popover.Content>
</Popover.Root>
```

## Troubleshooting Floating Layers

Popover, Tooltip, Select, Dropdown Menu, Context Menu, and related overlays use floating primitives from Bits UI. If floating layers stop opening, block navigation, or leave inline positioning styles behind, start with these checks:

- Keep each `Root`, `Trigger`, `Content`, and `Portal` imported from the same shadcn-svelte component entrypoint.
- Avoid mixing multiple Bits UI major versions or different wrapped UI libraries on the same route.
- Avoid wrapping one trigger component in another trigger unless both overlays should open.
- For long-lived layout components, bind `open` and close the overlay when the route or owning data changes.
- In SvelteKit SSR or monorepos, follow the [SvelteKit dependency setup](/docs/installation/sveltekit#configure-vite-ssr-dependencies) so Vite processes Bits UI through the Svelte plugin.

If the issue persists, capture the smallest route that can reproduce it before changing overlay styles globally.
