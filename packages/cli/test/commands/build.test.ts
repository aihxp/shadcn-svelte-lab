import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Command } from "commander";
import { afterEach } from "vitest";
import { describe, expect, it } from "vitest";
import { build } from "../../src/commands/build/index.js";
import { runBuild } from "../../src/commands/registry/build.js";
import { registry } from "../../src/commands/registry/index.js";

describe("build command", () => {
	const tempDirs: string[] = [];

	afterEach(async () => {
		for (const dir of tempDirs.splice(0)) {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it("is visible in command help", () => {
		const program = new Command().name("shadcn-svelte").addCommand(build);

		expect(program.helpInformation()).toContain("build [options] [registry]");
	});

	it("keeps registry build available", () => {
		expect(registry.helpInformation()).toContain("build [options] [registry]");
	});

	it("builds registry item files relative to cwd", async () => {
		const cwd = await mkdtemp(path.join(tmpdir(), "shadcn-svelte-build-"));
		tempDirs.push(cwd);
		await mkdir(path.join(cwd, "src"), { recursive: true });
		await writeFile(
			path.join(cwd, "package.json"),
			`${JSON.stringify({ type: "module", dependencies: {}, devDependencies: {} })}\n`,
			"utf8"
		);
		await writeFile(
			path.join(cwd, "src", "hello.svelte"),
			`<script lang="ts">\n\tlet message = "Hello";\n</script>\n\n<div>{message}</div>\n`,
			"utf8"
		);
		await writeFile(
			path.join(cwd, "registry.json"),
			`${JSON.stringify(
				{
					name: "smoke",
					homepage: "https://example.com",
					items: [
						{
							name: "hello",
							type: "registry:ui",
							registryDependencies: [],
							files: [{ path: "src/hello.svelte", type: "registry:ui" }],
						},
					],
				},
				null,
				"\t"
			)}\n`,
			"utf8"
		);

		await runBuild({
			cwd,
			registry: path.join(cwd, "registry.json"),
			output: path.join(cwd, "out"),
		});

		const item = JSON.parse(await readFile(path.join(cwd, "out", "hello.json"), "utf8"));
		const index = JSON.parse(await readFile(path.join(cwd, "out", "index.json"), "utf8"));

		expect(item.name).toBe("hello");
		expect(item.files[0].content).toContain("Hello");
		expect(index[0].relativeUrl).toBe("hello.json");
	});
});
