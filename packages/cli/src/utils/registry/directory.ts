import { z } from "zod";
import type { RegistryConfigItem } from "../config/schema.js";

const registryDirectoryItemSchema = z.object({
	name: z.string().regex(/^@[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/),
	homepage: z.string().url(),
	url: z
		.string()
		.min(1)
		.refine((value) => value.includes("{name}"), {
			message: 'Registry URL must include "{name}".',
		}),
	catalogUrl: z.string().url().optional(),
	description: z.string().optional(),
	featured: z.boolean().optional(),
});

const registryDirectorySchema = z.array(registryDirectoryItemSchema);

export type RegistryDirectoryItem = z.infer<typeof registryDirectoryItemSchema>;

const registryDirectory = registryDirectorySchema.parse([
	{
		name: "@ofkm",
		homepage: "https://github.com/ofkm/shadcn-svelte-registry",
		url: "https://shadcn.ofkm.dev/r/{name}.json",
		catalogUrl: "https://shadcn.ofkm.dev/r/index.json",
		description: "A public shadcn-svelte registry with components, hooks, and utilities.",
		featured: true,
	},
]);

export function getRegistryDirectory(): RegistryDirectoryItem[] {
	return registryDirectory;
}

export function getDirectoryRegistry(registry: string): RegistryDirectoryItem | undefined {
	return registryDirectory.find((entry) => entry.name === registry);
}

export function getDirectoryRegistryConfig(registry: string): RegistryConfigItem | undefined {
	return getDirectoryRegistry(registry)?.url;
}
