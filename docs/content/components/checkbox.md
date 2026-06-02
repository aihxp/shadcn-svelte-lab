---
title: Checkbox
description: A control that allows the user to toggle between checked and not checked.
component: true
links:
  source: https://github.com/huntabyte/shadcn-svelte/tree/next/sites/docs/src/lib/registry/ui/checkbox
  doc: https://bits-ui.com/docs/components/checkbox
  api: https://bits-ui.com/docs/components/checkbox#api-reference
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

<ComponentPreview name="checkbox-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="checkbox" />
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

```svelte
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
</script>
```

```svelte
<Checkbox />
```

## Controlled

Bind `checked` when the checkbox state should update a local value.

```svelte showLineNumbers
<script>
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  let checked = $state(false);
</script>

<div class="flex items-center gap-3">
  <Checkbox id="notifications" bind:checked />
  <Label for="notifications">Enable notifications</Label>
</div>
```

## Persisted State

When persisting checkbox state in `localStorage`, only read and write storage in the browser.

```svelte showLineNumbers
<script>
  import { browser } from "$app/environment";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  let checked = $state(false);

  if (browser) {
    checked = localStorage.getItem("notifications") === "true";
  }

  $effect(() => {
    if (browser) {
      localStorage.setItem("notifications", String(checked));
    }
  });
</script>

<div class="flex items-center gap-3">
  <Checkbox id="notifications" bind:checked />
  <Label for="notifications">Enable notifications</Label>
</div>
```
