<script lang="ts">
	import CircleIcon from "@lucide/svelte/icons/circle";
	import CircleArrowUpIcon from "@lucide/svelte/icons/circle-arrow-up";
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
	import CircleXIcon from "@lucide/svelte/icons/circle-x";
	import { type Component, tick } from "svelte";
	import { cn } from "$lib/utils.js";
	import * as Combobox from "$lib/registry/ui/combobox/index.js";

	type Status = {
		value: string;
		label: string;
		icon: Component;
	};

	const statuses: Status[] = [
		{
			value: "backlog",
			label: "Backlog",
			icon: CircleHelpIcon,
		},
		{
			value: "todo",
			label: "Todo",
			icon: CircleIcon,
		},
		{
			value: "in progress",
			label: "In Progress",
			icon: CircleArrowUpIcon,
		},
		{
			value: "done",
			label: "Done",
			icon: CircleCheckIcon,
		},
		{
			value: "canceled",
			label: "Canceled",
			icon: CircleXIcon,
		},
	];

	let open = $state(false);
	let value = $state("");
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedStatus = $derived(statuses.find((s) => s.value === value));

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

<div class="flex items-center space-x-4">
	<p class="text-muted-foreground text-sm">Status</p>
	<Combobox.Root bind:open>
		<Combobox.Trigger
			bind:ref={triggerRef}
			size="sm"
			showIcon={false}
			class="w-[150px] justify-start"
		>
			{#if selectedStatus}
				{@const Icon = selectedStatus.icon}
				<Icon class="me-2 size-4 shrink-0" />
				{selectedStatus.label}
			{:else}
				+ Set status
			{/if}
		</Combobox.Trigger>
		<Combobox.Content bind:value class="w-[200px] p-0" side="right" align="start">
			<Combobox.Input placeholder="Change status..." />
			<Combobox.List>
				<Combobox.Empty>No results found.</Combobox.Empty>
				<Combobox.Group>
					{#each statuses as status (status.value)}
						<Combobox.Item
							value={status.value}
							checked={value === status.value}
							onSelect={() => {
								value = status.value;
								closeAndFocusTrigger();
							}}
						>
							{@const Icon = status.icon}
							<Icon
								class={cn(
									"me-2 size-4",
									status.value !== selectedStatus?.value && "text-foreground/40"
								)}
							/>

							<span>
								{status.label}
							</span>
						</Combobox.Item>
					{/each}
				</Combobox.Group>
			</Combobox.List>
		</Combobox.Content>
	</Combobox.Root>
</div>
