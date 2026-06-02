<script lang="ts" module>
	import { getContext, setContext } from "svelte";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithElementRef } from "$lib/utils.js";

	export type Direction = "ltr" | "rtl";

	export type DirectionContext = {
		readonly dir: Direction;
	};

	const DIRECTION_CONTEXT = Symbol("direction");

	export function setDirectionContext(context: DirectionContext) {
		setContext(DIRECTION_CONTEXT, context);
	}

	export function getDirectionContext(fallback: Direction = "ltr") {
		return getContext<DirectionContext | undefined>(DIRECTION_CONTEXT) ?? { dir: fallback };
	}

	export function useDirection(fallback: Direction = "ltr") {
		return getDirectionContext(fallback).dir;
	}
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		dir = "ltr",
		direction,
		class: className,
		children,
		...restProps
	}: WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "dir">, HTMLDivElement> & {
		dir?: Direction;
		direction?: Direction;
		children?: Snippet;
	} = $props();

	const value = $derived(direction ?? dir);

	setDirectionContext({
		get dir() {
			return value;
		},
	});
</script>

<div bind:this={ref} dir={value} data-slot="direction-provider" class={className} {...restProps}>
	{@render children?.()}
</div>
