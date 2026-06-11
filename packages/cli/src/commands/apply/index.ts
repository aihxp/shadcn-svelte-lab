import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { Command } from "commander";
import color from "picocolors";
import { z } from "zod";
import * as p from "@clack/prompts";
import {
	DEFAULT_PRESETS,
	decodePreset,
	encodePreset,
	isPresetCode,
	type PresetConfig,
} from "../../preset/index.js";
import { checkPreconditions } from "../../utils/preconditions.js";
import * as cliConfig from "../../utils/config/index.js";
import { error } from "../../utils/errors.js";
import { getEnvProxy } from "../../utils/get-env-proxy.js";
import { installDependencies } from "../../utils/install-deps.js";
import * as project from "../../utils/project.js";
import { addRegistryItems } from "../../utils/add-registry-items.js";
import * as registry from "../../utils/registry/index.js";
import { cancel, handleError, intro, prettifyList } from "../../utils/prompt-helpers.js";
import { highlight } from "../../utils/colors.js";
import { promptForPreset } from "../../preset/presets.js";

const applyOptionsSchema = z.object({
	cwd: z.string(),
	positionalPreset: z.string().optional(),
	preset: z.string().optional(),
	yes: z.boolean(),
	overwrite: z.boolean(),
	deps: z.boolean(),
	reinstall: z.boolean(),
	proxy: z.string().optional(),
	skipPreflight: z.boolean(),
});

type ApplyOptions = z.infer<typeof applyOptionsSchema>;

export const apply = new Command()
	.command("apply")
	.description("apply a preset to an existing project")
	.argument("[preset]", "the preset code or preset name to apply")
	.option("--preset <preset>", "the preset code or preset name to apply")
	.option("-c, --cwd <path>", "the working directory", process.cwd())
	.option("--no-deps", "skips adding & installing package dependencies")
	.option("--skip-preflight", "ignore preflight checks and continue", false)
	.option("-y, --yes", "skip confirmation prompt", false)
	.option("-o, --overwrite", "overwrite existing component and stylesheet files", false)
	.option("--no-reinstall", "skip reinstalling existing components when style settings change")
	.option("--proxy <proxy>", "fetch preset registry payload using a proxy", getEnvProxy())
	.action(async (positionalPreset, opts) => {
		intro();

		try {
			const options = applyOptionsSchema.parse({
				...opts,
				cwd: path.resolve(opts.cwd),
				positionalPreset,
			});

			await runApply(options);

			p.outro(`${color.green("Success!")} Preset applied.`);
		} catch (e) {
			handleError(e);
		}
	});

export async function runApply(options: ApplyOptions) {
	const cwd = path.resolve(options.cwd);

	if (!existsSync(cwd)) {
		throw error(`The path ${color.cyan(cwd)} does not exist. Please try again.`);
	}

	if (options.proxy !== undefined) {
		process.env.HTTP_PROXY = options.proxy;
		p.log.info(`You are using the provided proxy: ${color.green(options.proxy)}`);
	}

	const config = await cliConfig.getConfig(cwd);
	if (!config) {
		throw error(
			`Configuration file is missing. Please run ${color.green("init")} to create a ${highlight("components.json")} file.`
		);
	}

	const currentConfig = checkPreconditions({
		config,
		cwd,
		skipPreflight: options.skipPreflight,
	});

	const preset = resolveApplyPreset(options);
	const presetConfig = preset
		? resolvePresetConfig(preset)
		: await promptForPreset(currentConfig);
	const nextRawConfig = cliConfig.parseRawConfig({
		...currentConfig,
		style: presetConfig.style,
		iconLibrary: presetConfig.iconLibrary,
		menuColor: presetConfig.menuColor,
		menuAccent: presetConfig.menuAccent,
		tailwind: {
			...currentConfig.tailwind,
			baseColor: presetConfig.baseColor,
		},
	});
	const nextConfig = await cliConfig.resolveConfig(cwd, nextRawConfig);

	const registryUrl = registry.getRegistryUrl(nextConfig);
	const presetUrl = new URL(`/init?preset=${encodePreset(presetConfig)}`, registryUrl).toString();
	const selectedItems = [presetUrl];
	const shouldReinstallComponents =
		options.reinstall && hasStyleConfigChanged(currentConfig, nextRawConfig);

	if (shouldReinstallComponents) {
		const registryIndex = await registry.getRegistryIndex(registryUrl);
		const existingComponents = await project.getComponents({
			registryIndex,
			config: nextConfig,
		});
		selectedItems.push(
			...existingComponents
				.filter((component) => component.name !== "utils")
				.map((component) => component.name)
		);
	}

	const overwrite = options.overwrite || options.yes;

	if (!options.yes) {
		p.log.warn(
			`Applying a preset can overwrite ${highlight("components.json")}, stylesheet tokens, fonts, and existing UI components.`
		);

		if (selectedItems.length > 1) {
			const prettyList = prettifyList(selectedItems.slice(1));
			p.log.step(`Components to reinstall:\n${color.gray(prettyList)}`);
		}

		const proceed = await p.confirm({
			message: "Would you like to continue?",
			initialValue: false,
		});

		if (p.isCancel(proceed) || proceed === false) cancel();
	}

	const componentsJsonPath = path.resolve(cwd, "components.json");
	const previousComponentsJson = await fs.readFile(componentsJsonPath, "utf8");

	try {
		cliConfig.writeConfig(cwd, nextRawConfig);

		const result = await addRegistryItems({
			selectedItems,
			config: nextConfig,
			deps: options.deps,
			overwrite,
		});

		if (options.deps) {
			await installDependencies({
				cwd,
				prompt: options.deps,
				dependencies: Array.from(result.dependencies),
				devDependencies: Array.from(result.devDependencies),
			});
		} else if (result.skippedDeps.size) {
			const prettyList = prettifyList([...result.skippedDeps], 7);
			p.log.warn(
				`Preset applied ${color.bold(color.red("without"))} the following ${highlight("dependencies")}:\n${color.gray(prettyList)}`
			);
		}
	} catch (e) {
		await fs.writeFile(componentsJsonPath, previousComponentsJson, "utf8").catch(() => {});
		throw e;
	}
}

export function resolveApplyPreset(options: Pick<ApplyOptions, "positionalPreset" | "preset">) {
	const positionalPreset = cleanPresetInput(options.positionalPreset);
	const flagPreset = cleanPresetInput(options.preset);

	if (positionalPreset && flagPreset && positionalPreset !== flagPreset) {
		throw error(
			`Received two different preset values. Use either the positional preset or ${highlight("--preset")}, or pass the same value to both.`
		);
	}

	return flagPreset ?? positionalPreset;
}

export function cleanPresetInput(value: string | undefined) {
	const trimmed = value?.trim();
	if (!trimmed) return undefined;

	const match = trimmed.match(/^--preset\b\s+(.+)$/i);
	return (match?.[1] ?? trimmed).trim();
}

export function resolvePresetConfig(preset: string): PresetConfig {
	const maybeUrl = getPresetCodeFromUrl(preset);
	if (maybeUrl) {
		return resolvePresetConfig(maybeUrl);
	}

	if (isPresetCode(preset)) {
		const decoded = decodePreset(preset);
		if (decoded) {
			return decoded;
		}
	}

	if (preset in DEFAULT_PRESETS) {
		return DEFAULT_PRESETS[preset as keyof typeof DEFAULT_PRESETS];
	}

	throw error(
		`Invalid preset ${highlight(preset)}. Use a preset code from ${highlight("/create")} or one of: ${Object.keys(DEFAULT_PRESETS).join(", ")}.`
	);
}

function getPresetCodeFromUrl(value: string) {
	try {
		const url = new URL(value);
		if (url.pathname !== "/init") {
			return undefined;
		}
		return url.searchParams.get("preset") ?? undefined;
	} catch {
		return undefined;
	}
}

function hasStyleConfigChanged(
	currentConfig: cliConfig.ResolvedConfig,
	nextConfig: cliConfig.RawConfig
) {
	return (
		currentConfig.style !== nextConfig.style ||
		currentConfig.iconLibrary !== nextConfig.iconLibrary ||
		currentConfig.menuColor !== nextConfig.menuColor ||
		currentConfig.menuAccent !== nextConfig.menuAccent
	);
}
