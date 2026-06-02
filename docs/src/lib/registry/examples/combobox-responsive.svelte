<script lang="ts">
	import { browser } from "$app/environment";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Combobox from "$lib/registry/ui/combobox/index.js";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Drawer from "$lib/registry/ui/drawer/index.js";
	import { onMount } from "svelte";

	type Status = {
		value: string;
		label: string;
	};

	const statuses: Status[] = [
		{
			value: "backlog",
			label: "Backlog",
		},
		{
			value: "todo",
			label: "Todo",
		},
		{
			value: "in progress",
			label: "In Progress",
		},
		{
			value: "done",
			label: "Done",
		},
		{
			value: "canceled",
			label: "Canceled",
		},
	];

	let open = $state(false);
	let value = $state("");
	let isDesktop = $state(false);

	const selectedStatus = $derived(statuses.find((status) => status.value === value) ?? null);

	function checkScreenSize() {
		isDesktop = window.innerWidth >= 768;
	}

	onMount(() => {
		if (browser) {
			checkScreenSize();
			window.addEventListener("resize", checkScreenSize);
			return () => window.removeEventListener("resize", checkScreenSize);
		}
	});

	function handleStatusSelect(selectedValue: string) {
		value = selectedValue;
		open = false;
	}
</script>

{#if isDesktop}
	<Combobox.Root bind:open>
		<Combobox.Trigger showIcon={false} class="w-[150px] justify-start">
			{selectedStatus ? selectedStatus.label : "+ Set status"}
		</Combobox.Trigger>
		<Combobox.Content bind:value class="w-[200px] p-0" align="start">
			<Combobox.Input placeholder="Filter status..." />
			<Combobox.List>
				<Combobox.Empty>No results found.</Combobox.Empty>
				<Combobox.Group>
					{#each statuses as status (status.value)}
						<Combobox.Item
							value={status.value}
							checked={value === status.value}
							onSelect={() => handleStatusSelect(status.value)}
						>
							{status.label}
						</Combobox.Item>
					{/each}
				</Combobox.Group>
			</Combobox.List>
		</Combobox.Content>
	</Combobox.Root>
{:else}
	<Drawer.Root bind:open>
		<Drawer.Trigger>
			<Button variant="outline" class="w-[150px] justify-start">
				{selectedStatus ? selectedStatus.label : "+ Set status"}
			</Button>
		</Drawer.Trigger>
		<Drawer.Content>
			<div class="mt-4 border-t">
				<Command.Root>
					<Command.Input placeholder="Filter status..." />
					<Command.List>
						<Command.Empty>No results found.</Command.Empty>
						<Command.Group>
							{#each statuses as status (status.value)}
								<Command.Item
									value={status.value}
									onSelect={() => handleStatusSelect(status.value)}
								>
									{status.label}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
