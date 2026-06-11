import path from "node:path";
import open from "open";
import { afterEach, describe, expect, it, vi } from "vitest";
import { encodePreset } from "../../src/preset/index.js";
import {
	decodePresetCode,
	getPresetUrl,
	openCommand,
	preset,
	resolve as resolveCommand,
	resolveProjectPreset,
	url,
} from "../../src/commands/preset/index.js";

vi.mock("open", () => ({
	default: vi.fn(),
}));

describe("preset command helpers", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("decodes current preset codes", () => {
		const result = decodePresetCode("b0");

		expect(result).toEqual({
			code: "b0",
			version: "b",
			values: {
				style: "nova",
				baseColor: "neutral",
				theme: "neutral",
				chartColor: "neutral",
				iconLibrary: "lucide",
				font: "inter",
				fontHeading: "inherit",
				radius: "default",
				menuAccent: "subtle",
				menuColor: "default",
			},
			derived: [],
			url: getPresetUrl("b0"),
		});
	});

	it("derives chart color for older preset codes", () => {
		const result = decodePresetCode("a0");

		expect(result.version).toBe("a");
		expect(result.values.chartColor).toBe("blue");
		expect(result.derived).toEqual(["chartColor"]);
	});

	it("rejects invalid preset codes", () => {
		expect(() => decodePresetCode("c0")).toThrow("Invalid preset code: c0");
	});

	it("resolves a project preset from components.json", () => {
		const cwd = path.resolve(__dirname, "../fixtures/config-vite");
		const result = resolveProjectPreset(cwd);

		expect(result.values).toMatchObject({
			style: "nova",
			baseColor: "zinc",
			theme: "zinc",
			chartColor: "zinc",
			iconLibrary: "lucide",
			font: "geist",
			fontHeading: "inherit",
			radius: "default",
			menuAccent: "subtle",
			menuColor: "default",
		});
		expect(result.code).toBe(encodePreset(result.values!));
		expect(result.url).toBe(getPresetUrl(result.code!));
		expect(result.fallbacks).toEqual([
			"theme",
			"chartColor",
			"iconLibrary",
			"font",
			"fontHeading",
			"radius",
			"menuAccent",
			"menuColor",
		]);
	});

	it("maps legacy design system radius values", () => {
		const cwd = path.resolve(__dirname, "../fixtures/config-full");
		const result = resolveProjectPreset(cwd);

		expect(result.values).toMatchObject({
			style: "vega",
			baseColor: "zinc",
			theme: "neutral",
			font: "inter",
			radius: "default",
			iconLibrary: "lucide",
		});
	});

	it("returns null fields when no components.json exists", () => {
		const cwd = path.resolve(__dirname, "../fixtures/config-none");

		expect(resolveProjectPreset(cwd)).toEqual({
			code: null,
			fallbacks: [],
			values: null,
			url: null,
		});
	});
});

describe("preset command", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("prints decoded preset JSON", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await preset.parseAsync(["decode", "a0", "--json"], { from: "user" });

		expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({
			code: "a0",
			version: "a",
			derived: ["chartColor"],
			values: {
				chartColor: "blue",
			},
			url: getPresetUrl("a0"),
		});
	});

	it("prints create URLs", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await url.parseAsync(["a0"], { from: "user" });

		expect(log).toHaveBeenCalledWith(getPresetUrl("a0"));
	});

	it("opens create URLs", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.mocked(open).mockResolvedValue({} as Awaited<ReturnType<typeof open>>);

		await openCommand.parseAsync(["a0"], { from: "user" });

		expect(log).toHaveBeenCalledWith(`Opening ${getPresetUrl("a0")} in your browser.`);
		expect(open).toHaveBeenCalledWith(getPresetUrl("a0"));
	});

	it("prints resolved project preset JSON", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const cwd = path.resolve(__dirname, "../fixtures/config-vite");

		await resolveCommand.parseAsync(["--cwd", cwd, "--json"], { from: "user" });

		expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({
			values: {
				style: "nova",
				baseColor: "zinc",
			},
			fallbacks: expect.arrayContaining(["font", "radius"]),
		});
	});

	it("prints null JSON when no preset can be resolved", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const cwd = path.resolve(__dirname, "../fixtures/config-none");

		await resolveCommand.parseAsync(["--cwd", cwd, "--json"], { from: "user" });

		expect(JSON.parse(log.mock.calls[0][0] as string)).toBeNull();
	});
});
