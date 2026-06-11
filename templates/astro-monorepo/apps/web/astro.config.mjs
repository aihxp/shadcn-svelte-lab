import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	integrations: [svelte()],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				$lib: path.resolve(dirname, "src/lib"),
			},
			dedupe: ["svelte"],
		},
		ssr: {
			noExternal: ["@workspace/ui", "bits-ui"],
		},
	},
});
