<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	let filters = $state<string[]>(["releases"]);
</script>

<div class="flex items-center gap-3">
	<InputGroup.Root class="flex-1">
		<InputGroup.Addon>
			<IconPlaceholder
				lucide="SearchIcon"
				tabler="IconSearch"
				hugeicons="Search01Icon"
				phosphor="MagnifyingGlassIcon"
				remixicon="RiSearchLine"
			/>
		</InputGroup.Addon>
		<InputGroup.Input placeholder="Search releases or catalog..." />
	</InputGroup.Root>
	<Button>
		<IconPlaceholder
			lucide="PlusIcon"
			tabler="IconPlus"
			hugeicons="Add01Icon"
			phosphor="PlusIcon"
			remixicon="RiAddLine"
		/>
		Upload New Release
	</Button>
	<ToggleGroup.Root type="multiple" bind:value={filters} variant="outline">
		<ToggleGroup.Item value="all-tracks">All Tracks</ToggleGroup.Item>
		<ToggleGroup.Item value="releases">Releases</ToggleGroup.Item>
		<ToggleGroup.Item value="top-earners">Top Earners</ToggleGroup.Item>
	</ToggleGroup.Root>
</div>
