---
title: Direction
description: Provide left-to-right or right-to-left direction for components.
component: true
links:
  source: https://github.com/huntabyte/shadcn-svelte/tree/next/sites/docs/src/lib/registry/ui/direction
---

<script>
	import ComponentSource from "$lib/components/component-source.svelte";
	import CodeCollapsibleWrapper from "$lib/components/code-collapsible-wrapper.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

Use the Direction component to provide an explicit `dir` attribute and Svelte context for components rendered inside it.

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="direction" />
{/snippet}
{#snippet manual()}
<Steps>

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

<CodeCollapsibleWrapper>

```svelte title="lib/components/rtl-preview.svelte"
<script lang="ts">
  import { DirectionProvider } from "$lib/components/ui/direction/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<DirectionProvider dir="rtl">
  <div class="flex items-center gap-2">
    <Button>Save</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</DirectionProvider>
```

</CodeCollapsibleWrapper>
