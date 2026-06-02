---
title: Combobox
description: Autocomplete input and command palette with a list of suggestions.
component: true
links:
  source: https://github.com/huntabyte/shadcn-svelte/tree/next/sites/docs/src/lib/registry/ui/combobox
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import CodeCollapsibleWrapper from "$lib/components/code-collapsible-wrapper.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="combobox-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="combobox" />
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

<CodeCollapsibleWrapper >

```svelte title="lib/components/example-combobox.svelte"
<script lang="ts">
  import { tick } from "svelte";
  import * as Combobox from "$lib/components/ui/combobox/index.js";

  const frameworks = [
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
  ];

  let open = $state(false);
  let value = $state("");
  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedValue = $derived(
    frameworks.find((f) => f.value === value)?.label
  );

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
</script>

<Combobox.Root bind:open>
  <Combobox.Trigger bind:ref={triggerRef} class="w-[200px] justify-between">
    <Combobox.Value>{selectedValue || "Select a framework..."}</Combobox.Value>
  </Combobox.Trigger>
  <Combobox.Content bind:value class="w-[200px] p-0">
    <Combobox.Input placeholder="Search framework..." />
    <Combobox.List>
      <Combobox.Empty>No framework found.</Combobox.Empty>
      <Combobox.Group value="frameworks">
        {#each frameworks as framework (framework.value)}
          <Combobox.Item
            value={framework.value}
            checked={value === framework.value}
            onSelect={() => {
              value = framework.value;
              closeAndFocusTrigger();
            }}
          >
            {framework.label}
          </Combobox.Item>
        {/each}
      </Combobox.Group>
    </Combobox.List>
  </Combobox.Content>
</Combobox.Root>
```

</CodeCollapsibleWrapper>

## Examples

### Combobox

<ComponentPreview name="combobox-demo">

<div></div>

</ComponentPreview>

### Multiple

<ComponentPreview name="combobox-multiple">

<div></div>

</ComponentPreview>

### Popover

<ComponentPreview name="combobox-popover">

<div></div>

</ComponentPreview>

### Dropdown menu

<ComponentPreview name="combobox-dropdown-menu">

<div></div>

</ComponentPreview>

### Responsive

You can create a responsive combobox by using the `<Combobox />` component on desktop and the `<Drawer />` with `<Command />` components on mobile.

<ComponentPreview name="combobox-responsive" >

<div></div>

</ComponentPreview>
