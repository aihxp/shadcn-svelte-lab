import { error } from "../errors.js";
import type { RegistryConfig, RegistryConfigItem } from "../config/schema.js";
import { parseRegistryAndItemFromString } from "./address.js";
import { getDirectoryRegistry, getDirectoryRegistryConfig } from "./directory.js";

const NAME_PLACEHOLDER = "{name}";
const STYLE_PLACEHOLDER = "{style}";
const ENV_VAR_PATTERN = /\${(\w+)}/g;

export type RegistryConfigContext = {
	registry?: string;
	registries?: RegistryConfig;
	style?: string;
};

export type RegistryFetchRequest = {
	url: string;
	headers: Record<string, string>;
};

export function buildUrlAndHeadersForRegistryItem(
	address: string,
	config: RegistryConfigContext,
	options: { defaultRegistryUrl?: string } = {}
): RegistryFetchRequest | null {
	const { registry, item } = parseRegistryAndItemFromString(address);
	if (!registry) return null;

	const registryConfig = getRegistryConfig(registry, config, options);
	if (!registryConfig) {
		throw error(
			`Unknown registry "${registry}". Add it to components.json under the "registries" field.`
		);
	}

	return {
		url: buildUrlFromRegistryConfig(item, registryConfig, config),
		headers: buildHeadersFromRegistryConfig(registry, registryConfig),
	};
}

export function buildRegistryCatalogRequest(
	registry: string,
	config: RegistryConfigContext,
	options: { defaultRegistryUrl?: string } = {}
): RegistryFetchRequest {
	const [rawNamespace] = registry.split("/");
	const namespace = registry.startsWith("@") ? rawNamespace : registry;
	if (!namespace) {
		throw error(`Invalid registry namespace "${registry}". Expected a namespace like "@acme".`);
	}

	const catalogItem = registry.includes("/")
		? registry.split("/").slice(1).join("/")
		: "registry";
	const hasConfiguredRegistry = Boolean(config.registries?.[namespace]);
	const directoryRegistry = hasConfiguredRegistry ? undefined : getDirectoryRegistry(namespace);

	if (catalogItem === "registry" && directoryRegistry?.catalogUrl) {
		return {
			url: directoryRegistry.catalogUrl,
			headers: {},
		};
	}

	const request = buildUrlAndHeadersForRegistryItem(
		`${namespace}/${catalogItem}`,
		config,
		options
	);

	if (!request) {
		throw error(`Invalid registry namespace "${registry}". Expected a namespace like "@acme".`);
	}

	return request;
}

export function buildUrlFromRegistryConfig(
	item: string,
	registryConfig: RegistryConfigItem,
	config: RegistryConfigContext = {}
) {
	const rawUrl = typeof registryConfig === "string" ? registryConfig : registryConfig.url;
	let url = rawUrl.replaceAll(NAME_PLACEHOLDER, item);
	url = url.replaceAll(STYLE_PLACEHOLDER, config.style ?? "vega");
	url = expandEnvVars(url);

	if (typeof registryConfig === "string" || !registryConfig.params) {
		return url;
	}

	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(registryConfig.params)) {
		const expanded = expandEnvVars(value);
		if (expanded) {
			params.append(key, expanded);
		}
	}

	const queryString = params.toString();
	if (!queryString) return url;

	return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

export function buildHeadersFromRegistryConfig(
	registry: string,
	registryConfig: RegistryConfigItem
) {
	if (typeof registryConfig === "string" || !registryConfig.headers) {
		return {};
	}

	const headers: Record<string, string> = {};
	for (const [key, value] of Object.entries(registryConfig.headers)) {
		const expanded = expandEnvVars(value, {
			required: true,
			registry,
			label: `header "${key}"`,
		});
		if (expanded.trim()) {
			headers[key] = expanded;
		}
	}

	return headers;
}

export function expandEnvVars(
	value: string,
	options: { required?: boolean; registry?: string; label?: string } = {}
) {
	const missing = new Set<string>();
	const expanded = value.replace(ENV_VAR_PATTERN, (_match, key: string) => {
		const envValue = process.env[key];
		if (envValue === undefined || envValue === "") {
			missing.add(key);
			return "";
		}
		return envValue;
	});

	if (options.required && missing.size > 0) {
		const vars = Array.from(missing).join(", ");
		const context = [options.registry, options.label].filter(Boolean).join(" ");
		throw error(`Missing environment variable ${vars} required by registry ${context}.`);
	}

	return expanded;
}

function getRegistryConfig(
	registry: string,
	config: RegistryConfigContext,
	options: { defaultRegistryUrl?: string }
) {
	if (registry === "@shadcn" && options.defaultRegistryUrl) {
		return `${options.defaultRegistryUrl}/{name}.json`;
	}

	return config.registries?.[registry] ?? getDirectoryRegistryConfig(registry);
}
