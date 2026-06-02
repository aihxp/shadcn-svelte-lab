<script lang="ts">
	import * as Combobox from "$lib/registry/ui/combobox/index.js";

	const frameworks = [
		{ value: "sveltekit", label: "SvelteKit" },
		{ value: "next.js", label: "Next.js" },
		{ value: "nuxt.js", label: "Nuxt.js" },
		{ value: "remix", label: "Remix" },
		{ value: "astro", label: "Astro" },
	];

	let value = $state<string[]>(["sveltekit"]);

	const selectedFrameworks = $derived(
		frameworks.filter((framework) => value.includes(framework.value))
	);

	function toggleValue(nextValue: string) {
		value = value.includes(nextValue)
			? value.filter((item) => item !== nextValue)
			: [...value, nextValue];
	}

	function removeValue(event: MouseEvent, nextValue: string) {
		event.stopPropagation();
		value = value.filter((item) => item !== nextValue);
	}
</script>

<Combobox.Root>
	<Combobox.ChipsInput class="w-[300px]">
		{#if selectedFrameworks.length}
			<Combobox.Chips>
				{#each selectedFrameworks as framework (framework.value)}
					<Combobox.Chip>
						{framework.label}
						<Combobox.ChipRemove onclick={(event) => removeValue(event, framework.value)} />
					</Combobox.Chip>
				{/each}
			</Combobox.Chips>
		{/if}
		<span class="text-muted-foreground flex-1 py-1 text-start">
			Select frameworks...
		</span>
	</Combobox.ChipsInput>
	<Combobox.Content class="w-[300px] p-0">
		<Combobox.Input placeholder="Search framework..." />
		<Combobox.List>
			<Combobox.Empty>No framework found.</Combobox.Empty>
			<Combobox.Group value="frameworks">
				{#each frameworks as framework (framework.value)}
					<Combobox.Item
						value={framework.value}
						checked={value.includes(framework.value)}
						onSelect={() => toggleValue(framework.value)}
					>
						{framework.label}
					</Combobox.Item>
				{/each}
			</Combobox.Group>
		</Combobox.List>
	</Combobox.Content>
</Combobox.Root>
