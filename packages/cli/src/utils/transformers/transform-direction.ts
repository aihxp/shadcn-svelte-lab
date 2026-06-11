// !! BROWSER SAFE !!

import type { Transformer } from "./index.js";

const RTL_FLIP_MARKER = "cn-rtl-flip";

const RTL_MAPPINGS: [string, string][] = [
	["-ml-", "-ms-"],
	["-mr-", "-me-"],
	["ml-", "ms-"],
	["mr-", "me-"],
	["pl-", "ps-"],
	["pr-", "pe-"],
	["-left-", "-start-"],
	["-right-", "-end-"],
	["left-", "start-"],
	["right-", "end-"],
	["inset-l-", "inset-inline-start-"],
	["inset-r-", "inset-inline-end-"],
	["rounded-tl-", "rounded-ss-"],
	["rounded-tr-", "rounded-se-"],
	["rounded-bl-", "rounded-es-"],
	["rounded-br-", "rounded-ee-"],
	["rounded-tl", "rounded-ss"],
	["rounded-tr", "rounded-se"],
	["rounded-bl", "rounded-es"],
	["rounded-br", "rounded-ee"],
	["rounded-l-", "rounded-s-"],
	["rounded-r-", "rounded-e-"],
	["rounded-l", "rounded-s"],
	["rounded-r", "rounded-e"],
	["border-l-", "border-s-"],
	["border-r-", "border-e-"],
	["border-l", "border-s"],
	["border-r", "border-e"],
	["text-left", "text-start"],
	["text-right", "text-end"],
	["scroll-ml-", "scroll-ms-"],
	["scroll-mr-", "scroll-me-"],
	["scroll-pl-", "scroll-ps-"],
	["scroll-pr-", "scroll-pe-"],
	["float-left", "float-start"],
	["float-right", "float-end"],
	["clear-left", "clear-start"],
	["clear-right", "clear-end"],
	["origin-top-left", "origin-top-start"],
	["origin-top-right", "origin-top-end"],
	["origin-bottom-left", "origin-bottom-start"],
	["origin-bottom-right", "origin-bottom-end"],
	["origin-left", "origin-start"],
	["origin-right", "origin-end"],
];

const RTL_TRANSLATE_X_MAPPINGS: [string, string][] = [
	["-translate-x-", "translate-x-"],
	["translate-x-", "-translate-x-"],
];

const RTL_REVERSE_MAPPINGS: [string, string][] = [
	["space-x-", "space-x-reverse"],
	["divide-x-", "divide-x-reverse"],
];

const RTL_SWAP_MAPPINGS: [string, string][] = [
	["cursor-w-resize", "cursor-e-resize"],
	["cursor-e-resize", "cursor-w-resize"],
];

const POSITIONING_PREFIXES = ["-left-", "-right-", "left-", "right-"];
const QUOTED_STRING = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
const DIRECTION_CANDIDATE =
	/(?:-?m[lr]-|-?left-|-?right-|p[lr]-|rounded-[tblr][lr]?-?|border-[lr](?:-|\b)|text-(?:left|right)\b|space-x-|divide-x-|-?translate-x-|scroll-[mp][lr]-|float-(?:left|right)\b|clear-(?:left|right)\b|origin-(?:top-|bottom-)?(?:left|right)\b|cursor-[ew]-resize\b|cn-rtl-flip\b)/;

export const transformRtl: Transformer = async ({ content }) => ({
	content: transformDirection(content, true),
});

export function transformDirection(source: string, rtl: boolean) {
	if (!rtl || !DIRECTION_CANDIDATE.test(source)) {
		return source;
	}

	return source.replace(QUOTED_STRING, (match: string, quote: string, body: string) => {
		if (!DIRECTION_CANDIDATE.test(body)) {
			return match;
		}

		return `${quote}${applyDirectionMapping(body)}${quote}`;
	});
}

export function applyDirectionMapping(input: string) {
	const parts = input.split(/(\s+)/);
	const seen = new Set(parts.filter((part) => part && !/\s+/.test(part)));

	return parts
		.map((part) => {
			if (/\s+/.test(part)) {
				return part;
			}

			return mapClassName(part)
				.filter((className) => {
					if (className !== part && seen.has(className)) {
						return false;
					}

					seen.add(className);
					return true;
				})
				.join(" ");
		})
		.join("");
}

function mapClassName(className: string): string[] {
	if (!className || className.startsWith("rtl:") || className.startsWith("ltr:")) {
		return [className];
	}

	const { variant, value } = splitClassName(className);
	const variantParts = variant ? splitVariants(variant) : [];
	if (variantParts.includes("rtl") || variantParts.includes("ltr")) {
		return [className];
	}

	const important = value.startsWith("!") ? "!" : "";
	const rawValue = important ? value.slice(1) : value;

	if (rawValue === RTL_FLIP_MARKER) {
		return [buildClassName(variant, "rtl:rotate-180")];
	}

	for (const [physical, rtlPhysical] of RTL_TRANSLATE_X_MAPPINGS) {
		if (rawValue.startsWith(physical)) {
			const rtlValue = rawValue.replace(physical, rtlPhysical);
			return [className, buildRtlVariant(variant, `${important}${rtlValue}`)];
		}
	}

	for (const [prefix, reverseClass] of RTL_REVERSE_MAPPINGS) {
		if (rawValue.startsWith(prefix)) {
			return [className, buildRtlVariant(variant, reverseClass)];
		}
	}

	for (const [physical, swapped] of RTL_SWAP_MAPPINGS) {
		if (rawValue === physical) {
			return [className, buildRtlVariant(variant, swapped)];
		}
	}

	const isPhysicalSideVariant =
		variant.includes("data-[side=left]") ||
		variant.includes("data-[side=right]") ||
		variant.includes("data-side=left") ||
		variant.includes("data-side=right");

	for (const [physical, logical] of RTL_MAPPINGS) {
		if (
			isPhysicalSideVariant &&
			POSITIONING_PREFIXES.some((prefix) => physical.startsWith(prefix))
		) {
			continue;
		}

		if (matchesMapping(rawValue, physical)) {
			const mappedValue = `${important}${rawValue.replace(physical, logical)}`;
			return [buildClassName(variant, mappedValue)];
		}
	}

	return [className];
}

function matchesMapping(value: string, physical: string) {
	if (physical.endsWith("-")) {
		if (isSidePositionPrefix(physical) && value.slice(physical.length).startsWith("to-")) {
			return false;
		}
		return value.startsWith(physical);
	}

	return value === physical;
}

function isSidePositionPrefix(physical: string) {
	return (
		physical === "left-" ||
		physical === "right-" ||
		physical === "-left-" ||
		physical === "-right-"
	);
}

function splitClassName(className: string) {
	const index = findLastTopLevelColon(className);
	if (index === -1) {
		return { variant: "", value: className };
	}

	return {
		variant: className.slice(0, index),
		value: className.slice(index + 1),
	};
}

function splitVariants(variant: string) {
	const variants: string[] = [];
	let current = "";
	let depth = 0;

	for (let index = 0; index < variant.length; index++) {
		const char = variant[index];

		if (char === "[" || char === "(" || char === "{") {
			depth++;
		} else if (char === "]" || char === ")" || char === "}") {
			depth = Math.max(0, depth - 1);
		}

		if (char === ":" && depth === 0) {
			variants.push(current);
			current = "";
			continue;
		}

		current += char;
	}

	if (current) {
		variants.push(current);
	}

	return variants;
}

function findLastTopLevelColon(className: string) {
	let lastIndex = -1;
	let depth = 0;

	for (let index = 0; index < className.length; index++) {
		const char = className[index];

		if (char === "[" || char === "(" || char === "{") {
			depth++;
		} else if (char === "]" || char === ")" || char === "}") {
			depth = Math.max(0, depth - 1);
		} else if (char === ":" && depth === 0) {
			lastIndex = index;
		}
	}

	return lastIndex;
}

function buildClassName(variant: string, value: string) {
	return variant ? `${variant}:${value}` : value;
}

function buildRtlVariant(variant: string, value: string) {
	return variant ? `rtl:${variant}:${value}` : `rtl:${value}`;
}
