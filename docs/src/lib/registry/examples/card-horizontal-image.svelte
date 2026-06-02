<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
</script>

<Card.Root
	size="sm"
	class="-my-4 w-full max-w-2xl overflow-hidden p-0 md:grid md:grid-cols-[240px_1fr]"
>
	<img
		src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
		alt="Minimal white workspace surface"
		class="h-48 w-full object-cover md:h-full"
	/>
	<div class="flex flex-col">
		<Card.Header>
			<Card.Title>Workspace refresh</Card.Title>
			<Card.Description>Three layout updates are ready for review.</Card.Description>
			<Card.Action>
				<Button variant="outline" size="sm">View</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content class="text-muted-foreground flex-1 text-sm">
			Use a grid on `Card.Root` when an image should sit beside the text on wider screens.
		</Card.Content>
		<Card.Footer>
			<Button size="sm">Open Project</Button>
		</Card.Footer>
	</div>
</Card.Root>
