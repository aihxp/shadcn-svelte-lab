import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { Command } from "commander";
import open from "open";
import { z } from "zod";
import {
	DEFAULT_PRESETS,
	decodePreset,
	encodePreset,
	PRESET_BASE_COLOR_KEYS,
	PRESET_CHART_COLORS,
	PRESET_FONTS,
	PRESET_ICON_LIBRARIES,
	PRESET_MENU_ACCENTS,
	PRESET_MENU_COLORS,
	PRESET_RADII,
	PRESET_THEME_KEYS,
	type PresetConfig,
} from "../../preset/index.js";
import { PRESET_RADII_KEYS, V1_CHART_COLOR_MAP } from "../../preset/preset.js";
import { SITE_BASE_URL } from "../../constants.js";
import * as cliConfig from "../../utils/config/index.js";
import { handleError } from "../../utils/prompt-helpers.js";
import { error } from "../../utils/errors.js";

type CompletePresetConfig = Omit<PresetConfig, "chartColor"> & {
	chartColor: NonNullable<PresetConfig["chartColor"]>;
};

type PresetDecodeResult = {
	code: string;
	version: string;
	values: CompletePresetConfig;
	derived: string[];
	url: string;
};

type ResolvedProjectPreset = {
	code: string | null;
	fallbacks: string[];
	values: CompletePresetConfig | null;
	url: string | null;
};

export function getPresetUrl(code: string) {
	return `${SITE_BASE_URL}/create?preset=${code}`;
}

export function decodePresetCode(code: string): PresetDecodeResult {
	const decoded = decodePreset(code);

	if (!decoded) {
		throw error(`Invalid preset code: ${code}`);
	}

	const derived: string[] = [];
	const chartColor = (decoded.chartColor ??
		V1_CHART_COLOR_MAP[decoded.theme] ??
		decoded.theme) as CompletePresetConfig["chartColor"];

	if (!decoded.chartColor) {
		derived.push("chartColor");
	}

	return {
		code,
		version: code[0] ?? "",
		values: {
			...decoded,
			chartColor,
		},
		derived,
		url: getPresetUrl(code),
	};
}

export function printPresetInfo(
	result: {
		code: string;
		values: CompletePresetConfig;
		url?: string;
		fallbacks?: string[];
		version?: string;
	},
	options: { fallbackNote?: string } = {}
) {
	console.log("Preset");
	printEntries({
		code: result.code,
		...(result.version ? { version: result.version } : {}),
		style: result.values.style,
		baseColor: result.values.baseColor,
		theme: formatMaybeFallback("theme", result.values.theme, result.fallbacks),
		chartColor: formatMaybeFallback("chartColor", result.values.chartColor, result.fallbacks),
		iconLibrary: formatMaybeFallback(
			"iconLibrary",
			result.values.iconLibrary,
			result.fallbacks
		),
		font: formatMaybeFallback("font", result.values.font, result.fallbacks),
		fontHeading: formatMaybeFallback(
			"fontHeading",
			result.values.fontHeading,
			result.fallbacks
		),
		radius: formatMaybeFallback("radius", result.values.radius, result.fallbacks),
		menuAccent: formatMaybeFallback("menuAccent", result.values.menuAccent, result.fallbacks),
		menuColor: formatMaybeFallback("menuColor", result.values.menuColor, result.fallbacks),
		...(result.url ? { url: result.url } : {}),
	});

	if (result.fallbacks?.length) {
		console.log(options.fallbackNote ?? "  * Inferred from project defaults.");
	}
}

function printEntries(entries: Record<string, string>) {
	const maxKeyLength = Math.max(...Object.keys(entries).map((key) => key.length));
	for (const [key, value] of Object.entries(entries)) {
		console.log(`  ${key.padEnd(maxKeyLength + 2)}${value}`);
	}
}

function formatMaybeFallback(key: string, value: string, fallbacks: string[] = []) {
	return fallbacks.includes(key) ? `${value}*` : value;
}

export function printPresetDecode(result: PresetDecodeResult) {
	printPresetInfo(
		{
			code: result.code,
			version: result.version,
			values: result.values,
			url: result.url,
			fallbacks: result.derived,
		},
		{
			fallbackNote: "  * Compatibility value for older preset versions.",
		}
	);
}

export function resolveProjectPreset(cwd: string): ResolvedProjectPreset {
	const rawConfig = cliConfig.loadConfig(cwd);
	if (!rawConfig) {
		return {
			code: null,
			fallbacks: [],
			values: null,
			url: null,
		};
	}

	const originalConfig = readOriginalConfig(cwd);
	const designSystem = getObject(originalConfig.designSystem);
	const style = resolveOneOf(
		rawConfig.style ?? getString(designSystem.style),
		Object.keys(DEFAULT_PRESETS) as PresetConfig["style"][],
		cliConfig.DEFAULT_CONFIG.style as PresetConfig["style"]
	);
	const styleDefaults = DEFAULT_PRESETS[style] ?? DEFAULT_PRESETS.nova;
	const fallbacks = new Set<string>();

	const baseColor = resolveOneOf(
		rawConfig.tailwind.baseColor,
		PRESET_BASE_COLOR_KEYS,
		styleDefaults.baseColor,
		fallbacks,
		"baseColor"
	);
	const theme = resolveOneOf(
		getString(designSystem.theme),
		PRESET_THEME_KEYS,
		PRESET_THEME_KEYS.includes(baseColor as never) ? baseColor : styleDefaults.theme,
		fallbacks,
		"theme"
	);
	const chartColor = resolveOneOf(
		getString(designSystem.chartColor),
		PRESET_CHART_COLORS,
		theme,
		fallbacks,
		"chartColor"
	);
	const iconLibrary = resolveOneOf(
		rawConfig.iconLibrary ?? getString(designSystem.iconLibrary),
		PRESET_ICON_LIBRARIES,
		styleDefaults.iconLibrary,
		fallbacks,
		"iconLibrary"
	);
	const font = resolveOneOf(
		getString(designSystem.font) ?? getFontFromDesignSystem(designSystem),
		PRESET_FONTS,
		styleDefaults.font,
		fallbacks,
		"font"
	);
	const fontHeading = resolveOneOf(
		getString(designSystem.fontHeading),
		["inherit", ...PRESET_FONTS],
		styleDefaults.fontHeading,
		fallbacks,
		"fontHeading"
	);
	const radius = resolveRadius(getString(designSystem.radius), styleDefaults.radius, fallbacks);
	const menuAccent = resolveOneOf(
		rawConfig.menuAccent ?? getString(designSystem.menuAccent),
		PRESET_MENU_ACCENTS,
		styleDefaults.menuAccent,
		fallbacks,
		"menuAccent"
	);
	const menuColor = resolveOneOf(
		rawConfig.menuColor ?? getString(designSystem.menuColor),
		PRESET_MENU_COLORS,
		styleDefaults.menuColor,
		fallbacks,
		"menuColor"
	);

	const values: CompletePresetConfig = {
		style,
		baseColor,
		theme,
		chartColor,
		iconLibrary,
		font,
		fontHeading,
		radius,
		menuAccent,
		menuColor,
	};
	const code = encodePreset(values);

	return {
		code,
		fallbacks: Array.from(fallbacks),
		values,
		url: getPresetUrl(code),
	};
}

function readOriginalConfig(cwd: string) {
	const configPath = path.resolve(cwd, "components.json");
	if (!existsSync(configPath)) {
		return {};
	}

	try {
		const parsed = JSON.parse(readFileSync(configPath, "utf8"));
		return getObject(parsed);
	} catch {
		return {};
	}
}

function getObject(value: unknown): Record<string, unknown> {
	if (typeof value === "object" && value !== null && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}

	return {};
}

function getString(value: unknown) {
	return typeof value === "string" ? value : undefined;
}

function getFontFromDesignSystem(designSystem: Record<string, unknown>) {
	const fonts = designSystem.fonts;
	if (!Array.isArray(fonts)) {
		return undefined;
	}

	for (const item of fonts) {
		const name = getString(getObject(item).name);
		if (!name?.startsWith("font-")) {
			continue;
		}
		return name.replace(/^font-heading-/, "").replace(/^font-/, "");
	}

	return undefined;
}

function resolveOneOf<T extends string>(
	value: string | undefined,
	allowed: readonly T[],
	fallback: T,
	fallbacks?: Set<string>,
	key?: string
) {
	if (value && allowed.includes(value as T)) {
		return value as T;
	}

	if (fallbacks && key) {
		fallbacks.add(key);
	}

	return fallback;
}

function resolveRadius(
	value: string | undefined,
	fallback: PresetConfig["radius"],
	fallbacks: Set<string>
) {
	if (value && PRESET_RADII_KEYS.includes(value as never)) {
		return value as PresetConfig["radius"];
	}

	const radius = Object.entries(PRESET_RADII).find(
		([, radius]) => radius.value === value
	)?.[0] as PresetConfig["radius"] | undefined;
	if (radius) {
		return radius;
	}

	fallbacks.add("radius");
	return fallback;
}

export const decode = new Command()
	.command("decode")
	.description("decode a preset code")
	.argument("<code>", "the preset code to decode")
	.option("--json", "output as JSON", false)
	.action((code, opts) => {
		try {
			const result = decodePresetCode(code);

			if (opts.json) {
				console.log(JSON.stringify(result, null, 2));
				return;
			}

			printPresetDecode(result);
		} catch (e) {
			handleError(e);
		}
	});

export const url = new Command()
	.command("url")
	.description("get the create URL for a preset code")
	.argument("<code>", "the preset code")
	.action((code) => {
		try {
			console.log(decodePresetCode(code).url);
		} catch (e) {
			handleError(e);
		}
	});

export const openCommand = new Command()
	.command("open")
	.description("open a preset code in the browser")
	.argument("<code>", "the preset code")
	.action(async (code) => {
		try {
			const presetUrl = decodePresetCode(code).url;
			console.log(`Opening ${presetUrl} in your browser.`);
			await open(presetUrl);
		} catch (e) {
			handleError(e);
		}
	});

const resolveOptionsSchema = z.object({
	cwd: z.string(),
	json: z.boolean(),
});

export const resolve = new Command()
	.command("resolve")
	.alias("info")
	.description("resolve a preset from your project")
	.option("-c, --cwd <path>", "the working directory", process.cwd())
	.option("--json", "output as JSON", false)
	.action(async (opts) => {
		try {
			const options = resolveOptionsSchema.parse({
				...opts,
				cwd: path.resolve(opts.cwd),
			});
			const result = resolveProjectPreset(options.cwd);

			if (options.json) {
				console.log(JSON.stringify(result.code ? result : null, null, 2));
				return;
			}

			if (!result.code || !result.values) {
				console.log("No components.json found.");
				return;
			}

			printPresetInfo(
				{
					code: result.code,
					values: result.values,
					url: result.url ?? undefined,
					fallbacks: result.fallbacks,
				},
				{
					fallbackNote:
						"  * Uses preset defaults for values not stored in components.json.",
				}
			);
		} catch (e) {
			handleError(e);
		}
	});

export const preset = new Command()
	.command("preset")
	.description("manage presets")
	.addCommand(decode)
	.addCommand(resolve)
	.addCommand(url)
	.addCommand(openCommand)
	.action(() => {
		preset.outputHelp();
	});
