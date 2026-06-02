<script lang="ts" module>
	import { getContext, setContext } from "svelte";
	import type { ComponentProps } from "svelte";
	import * as Popover from "$lib/registry/ui/popover/index.js";

	export type ComboboxContext = {
		readonly open: boolean;
		readonly disabled: boolean;
		close: () => void;
	};

	export type ComboboxProps = ComponentProps<typeof Popover.Root> & {
		disabled?: boolean;
	};

	const COMBOBOX_CONTEXT = Symbol("combobox");

	export function setComboboxContext(context: ComboboxContext) {
		setContext(COMBOBOX_CONTEXT, context);
	}

	export function getComboboxContext() {
		return getContext<ComboboxContext | undefined>(COMBOBOX_CONTEXT);
	}
</script>

<script lang="ts">
	let { open = $bindable(false), disabled = false, ...restProps }: ComboboxProps = $props();

	setComboboxContext({
		get open() {
			return open;
		},
		get disabled() {
			return disabled;
		},
		close() {
			open = false;
		},
	});
</script>

<Popover.Root bind:open {...restProps} />
