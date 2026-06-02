<script lang="ts">
	import { tick } from "svelte";
	import * as Combobox from "$lib/registry/ui/combobox/index.js";

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

	const selectedValue = $derived(frameworks.find((f) => f.value === value)?.label);

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
