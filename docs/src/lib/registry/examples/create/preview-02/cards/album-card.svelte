<script lang="ts">
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
</script>

<Card.Root>
	<Card.Content class="flex flex-col gap-4">
		<div class="relative overflow-hidden rounded-lg">
			<img
				src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=800&fit=crop"
				alt="Synthetic Horizons EP cover art"
				class="aspect-square w-full object-cover"
			/>
			<Badge class="absolute top-3 right-3">$26,033.79</Badge>
		</div>
		<div class="flex flex-col gap-1">
			<Card.Title>Synthetic Horizons EP</Card.Title>
			<Card.Description class="text-xs tracking-wider uppercase">
				Released Aug 14, 2023
			</Card.Description>
		</div>
	</Card.Content>
	<Card.Footer class="flex-col gap-4">
		<Separator />
		<div class="grid w-full grid-cols-2 gap-4">
			<div class="flex flex-col gap-0.5">
				<span class="text-muted-foreground text-xs tracking-wider uppercase"> Tracks </span>
				<span class="text-lg font-medium tabular-nums">6 Tracks</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="text-muted-foreground line-clamp-1 text-xs tracking-wider uppercase">
					Cumulative Streams
				</span>
				<span class="text-lg font-medium tabular-nums">6,198,524</span>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
