import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Command } from "commander";
import { afterEach, describe, expect, it } from "vitest";
import { migrate, runMigrate } from "../../src/commands/migrate/index.js";
import {
	applyDirectionMapping,
	transformDirection,
} from "../../src/utils/transformers/transform-direction.js";

describe("migrate command", () => {
	const tempDirs: string[] = [];

	afterEach(async () => {
		for (const dir of tempDirs.splice(0)) {
			await rm(dir, { recursive: true, force: true });
		}
	});

	async function copyViteTemplate() {
		const cwd = await mkdtemp(path.join(tmpdir(), "shadcn-svelte-migrate-"));
		tempDirs.push(cwd);
		await cp(path.resolve(__dirname, "../../../../templates/vite-app"), cwd, {
			recursive: true,
		});
		return cwd;
	}

	it("is visible in command help", () => {
		const program = new Command().name("shadcn-svelte").addCommand(migrate);

		expect(program.helpInformation()).toContain("migrate [options] [migration] [path]");
	});

	it("maps physical Tailwind utilities to logical utilities", () => {
		expect(
			applyDirectionMapping(
				"ml-2 mr-4 pl-1! text-left rounded-l-md border-r space-x-2 -translate-x-1/2 cn-rtl-flip"
			)
		).toBe(
			"ms-2 me-4 ps-1! text-start rounded-s-md border-e space-x-2 rtl:space-x-reverse -translate-x-1/2 rtl:translate-x-1/2 rtl:rotate-180"
		);
	});

	it("preserves prose that looks directional but is not a utility class", () => {
		expect(transformDirection('const label = "right-to-left layout";', true)).toContain(
			'"right-to-left layout"'
		);
	});

	it("does not duplicate additive RTL helpers on repeat runs", () => {
		const input = '"space-x-2 rtl:space-x-reverse -translate-x-1/2 rtl:translate-x-1/2"';

		expect(transformDirection(input, true)).toBe(input);
	});

	it("migrates the default ui directory and writes rtl to components.json", async () => {
		const cwd = await copyViteTemplate();
		const uiDir = path.join(cwd, "src/lib/components/ui/demo");
		await mkdir(uiDir, { recursive: true });
		await writeFile(
			path.join(uiDir, "demo.svelte"),
			`<script lang="ts">
  import { cn } from "$lib/utils";
</script>

<div class={cn("ml-2 text-left", true && "pl-4")}>
  <span class="cn-rtl-flip -translate-x-1/2">Demo</span>
</div>
`,
			"utf8"
		);

		const result = await runMigrate({
			cwd,
			migration: "rtl",
			path: undefined,
			list: false,
			yes: true,
		});

		const content = await readFile(path.join(uiDir, "demo.svelte"), "utf8");
		const componentsJson = JSON.parse(
			await readFile(path.join(cwd, "components.json"), "utf8")
		);

		expect(result.transformed).toEqual(["src/lib/components/ui/demo/demo.svelte"]);
		expect(result.configUpdated).toBe(true);
		expect(componentsJson.rtl).toBe(true);
		expect(content).toContain("ms-2 text-start");
		expect(content).toContain("ps-4");
		expect(content).toContain("rtl:rotate-180");
		expect(content).toContain("-translate-x-1/2 rtl:translate-x-1/2");
	});

	it("supports glob paths and reports manual review files", async () => {
		const cwd = await copyViteTemplate();
		const uiDir = path.join(cwd, "src/lib/components/ui/sidebar");
		await mkdir(uiDir, { recursive: true });
		await writeFile(
			path.join(uiDir, "sidebar.svelte"),
			`<div class="absolute left-0 ml-2">Sidebar</div>\n`,
			"utf8"
		);

		const result = await runMigrate({
			cwd,
			migration: "rtl",
			path: "src/lib/components/ui/**/*.svelte",
			list: false,
			yes: true,
		});

		const content = await readFile(path.join(uiDir, "sidebar.svelte"), "utf8");

		expect(result.transformed).toEqual(["src/lib/components/ui/sidebar/sidebar.svelte"]);
		expect(result.manualReview).toEqual(["src/lib/components/ui/sidebar/sidebar.svelte"]);
		expect(content).toContain("absolute start-0 ms-2");
	});
});
