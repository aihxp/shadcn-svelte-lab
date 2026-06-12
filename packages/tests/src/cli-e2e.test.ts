import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	copyTemplate,
	createStaticServer,
	createTempDir,
	docsStaticDir,
	ensureBuiltArtifacts,
	expectSuccess,
	prepareSvelteKitFixture,
	resetTempRoot,
	runCli,
	tempRoot,
} from "./utils.js";

let registry: Awaited<ReturnType<typeof createStaticServer>>;

function registryEnv() {
	return {
		REGISTRY_URL: `${registry.url}/registry`,
	};
}

describe("CLI e2e fixtures", () => {
	beforeAll(async () => {
		await ensureBuiltArtifacts();
		await resetTempRoot();
		registry = await createStaticServer(docsStaticDir);
	});

	afterAll(async () => {
		await registry?.close();
		await rm(tempRoot, { recursive: true, force: true });
	});

	it("adds a registry component to the SvelteKit app fixture", async () => {
		const cwd = await copyTemplate("sveltekit-app");
		await prepareSvelteKitFixture(cwd);

		const result = await runCli(
			cwd,
			["add", "button", "--yes", "--overwrite", "--no-deps", "--skip-preflight"],
			registryEnv()
		);

		expectSuccess(result);
		await expectFile(path.join(cwd, "src/lib/components/ui/button/button.svelte"));
		await expectFile(path.join(cwd, "src/lib/components/ui/button/index.ts"));
	});

	it("adds a registry component to the SvelteKit monorepo shared UI package", async () => {
		const cwd = await copyTemplate("sveltekit-monorepo");
		const appCwd = path.join(cwd, "apps/web");
		await prepareSvelteKitFixture(appCwd);

		const result = await runCli(
			appCwd,
			["add", "button", "--yes", "--overwrite", "--no-deps", "--skip-preflight"],
			registryEnv()
		);

		expectSuccess(result);
		await expectFile(path.join(cwd, "packages/ui/src/lib/components/ui/button/button.svelte"));
		await expectFile(path.join(cwd, "packages/ui/src/lib/components/ui/button/index.ts"));
	});

	it("runs the RTL migration against a SvelteKit fixture", async () => {
		const cwd = await copyTemplate("sveltekit-app");
		await prepareSvelteKitFixture(cwd);

		const demoDir = path.join(cwd, "src/lib/components/ui/demo");
		const demoFile = path.join(demoDir, "demo.svelte");
		await mkdir(demoDir, { recursive: true });
		await writeFile(
			demoFile,
			`<script lang="ts">
	import { cn } from "$lib/utils";
</script>

<div class={cn("ml-2 text-left", true && "pl-4")}>
	<span class="cn-rtl-flip -translate-x-1/2">Demo</span>
</div>
`,
			"utf8"
		);

		const result = await runCli(cwd, ["migrate", "rtl", "--yes"], registryEnv());

		expectSuccess(result);

		const content = await readFile(demoFile, "utf8");
		const config = JSON.parse(await readFile(path.join(cwd, "components.json"), "utf8"));
		expect(config.rtl).toBe(true);
		expect(content).toContain("ms-2 text-start");
		expect(content).toContain("ps-4");
		expect(content).toContain("rtl:rotate-180");
		expect(content).toContain("-translate-x-1/2 rtl:translate-x-1/2");
	});

	it("builds a fixture registry with the top-level build command", async () => {
		const cwd = await createTempDir("registry-build");
		await mkdir(path.join(cwd, "src"), { recursive: true });
		await writeFile(
			path.join(cwd, "package.json"),
			`${JSON.stringify({ type: "module", dependencies: {}, devDependencies: {} }, null, "\t")}\n`,
			"utf8"
		);
		await writeFile(path.join(cwd, "src/hello.svelte"), `<p>Hello registry</p>\n`, "utf8");
		await writeFile(
			path.join(cwd, "registry.json"),
			`${JSON.stringify(
				{
					name: "fixture",
					homepage: "https://example.com",
					items: [
						{
							name: "hello",
							type: "registry:component",
							title: "Hello",
							description: "Fixture component",
							registryDependencies: [],
							files: [
								{
									path: "src/hello.svelte",
									type: "registry:component",
								},
							],
						},
					],
				},
				null,
				"\t"
			)}\n`,
			"utf8"
		);

		const result = await runCli(
			cwd,
			["build", "registry.json", "--output", "out"],
			registryEnv()
		);

		expectSuccess(result);
		await expectFile(path.join(cwd, "out/index.json"));
		const item = JSON.parse(await readFile(path.join(cwd, "out/hello.json"), "utf8"));
		expect(item.name).toBe("hello");
		expect(item.files[0].content).toContain("Hello registry");
	});
});

async function expectFile(filePath: string) {
	await expect(readFile(filePath, "utf8")).resolves.toBeTruthy();
}
