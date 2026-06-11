import path from "node:path";
import { mkdtemp, cp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as p from "@clack/prompts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PRESETS, encodePreset } from "../../src/preset/index.js";
import * as registry from "../../src/utils/registry/index.js";
import { addRegistryItems } from "../../src/utils/add-registry-items.js";
import {
	cleanPresetInput,
	resolveApplyPreset,
	resolvePresetConfig,
	runApply,
} from "../../src/commands/apply/index.js";

vi.mock("@clack/prompts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@clack/prompts")>();
	return {
		...actual,
		confirm: vi.fn(),
		isCancel: vi.fn(() => false),
		log: {
			info: vi.fn(),
			step: vi.fn(),
			warn: vi.fn(),
		},
	};
});

vi.mock("../../src/utils/add-registry-items.js", () => ({
	addRegistryItems: vi.fn().mockResolvedValue({
		dependencies: new Set<string>(),
		devDependencies: new Set<string>(),
		skippedDeps: new Set<string>(),
	}),
}));

vi.mock("../../src/utils/install-deps.js", () => ({
	installDependencies: vi.fn(),
}));

vi.mock("../../src/utils/registry/index.js", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../src/utils/registry/index.js")>();
	return {
		...actual,
		getRegistryIndex: vi.fn().mockResolvedValue([
			{
				name: "button",
				type: "registry:ui",
				relativeUrl: "button.json",
			},
			{
				name: "utils",
				type: "registry:lib",
				relativeUrl: "utils.json",
			},
		]),
	};
});

describe("apply command helpers", () => {
	it("cleans copied preset flags", () => {
		expect(cleanPresetInput("--preset b123")).toBe("b123");
		expect(cleanPresetInput(" b123 ")).toBe("b123");
	});

	it("rejects conflicting positional and flag presets", () => {
		expect(() => resolveApplyPreset({ positionalPreset: "nova", preset: "vega" })).toThrow(
			"Received two different preset values"
		);
	});

	it("resolves named presets, preset codes, and init URLs", () => {
		const presetCode = encodePreset({ style: "lyra" });

		expect(resolvePresetConfig("lyra").style).toBe("lyra");
		expect(resolvePresetConfig(presetCode).style).toBe("lyra");
		expect(
			resolvePresetConfig(`https://shadcn-svelte.com/init?preset=${presetCode}`).style
		).toBe("lyra");
	});
});

describe("runApply", () => {
	const tempDirs: string[] = [];

	afterEach(async () => {
		vi.clearAllMocks();
		for (const dir of tempDirs.splice(0)) {
			await rm(dir, { recursive: true, force: true });
		}
	});

	async function copyViteFixture() {
		const targetDir = await mkdtemp(path.join(tmpdir(), "shadcn-svelte-apply-"));
		tempDirs.push(targetDir);

		await cp(path.resolve(__dirname, "../../../../templates/vite-app"), targetDir, {
			recursive: true,
		});

		return targetDir;
	}

	it("applies a named preset and queues existing components for reinstall", async () => {
		const cwd = await copyViteFixture();
		await mkdir(path.join(cwd, "src/lib/components/ui/button"), { recursive: true });

		await runApply({
			cwd,
			positionalPreset: "lyra",
			yes: true,
			overwrite: false,
			deps: false,
			reinstall: true,
			skipPreflight: true,
		});

		const writtenConfig = JSON.parse(await readFile(path.join(cwd, "components.json"), "utf8"));
		expect(writtenConfig.style).toBe("lyra");
		expect(writtenConfig.iconLibrary).toBe(DEFAULT_PRESETS.lyra.iconLibrary);
		expect(writtenConfig.tailwind.baseColor).toBe(DEFAULT_PRESETS.lyra.baseColor);

		expect(addRegistryItems).toHaveBeenCalledWith(
			expect.objectContaining({
				selectedItems: expect.arrayContaining([
					expect.stringMatching(/\/init\?preset=/),
					"button",
				]),
				overwrite: true,
				deps: false,
			})
		);
		expect(registry.getRegistryIndex).toHaveBeenCalled();
		expect(p.confirm).not.toHaveBeenCalled();
	});

	it("can apply without reinstalling existing components", async () => {
		const cwd = await copyViteFixture();
		await mkdir(path.join(cwd, "src/lib/components/ui/button"), { recursive: true });

		await runApply({
			cwd,
			positionalPreset: "lyra",
			yes: true,
			overwrite: false,
			deps: false,
			reinstall: false,
			skipPreflight: true,
		});

		expect(addRegistryItems).toHaveBeenCalledWith(
			expect.objectContaining({
				selectedItems: [expect.stringMatching(/\/init\?preset=/)],
			})
		);
		expect(registry.getRegistryIndex).not.toHaveBeenCalled();
	});
});
