import fs, { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globby } from "globby";
import removeMd from "remove-markdown";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(SCRIPT_DIR, "../content");
const OUTPUT_PATH = path.resolve(SCRIPT_DIR, "../src/routes/api/search.json/search.json");
const SECTION_ORDER = new Map([
	["", 0],
	["changelog", 1],
	["dark-mode", 2],
	["forms", 3],
	["migration", 4],
	["installation", 5],
	["components", 6],
	["rtl", 7],
	["registry", 8],
]);

type SearchEntry = {
	title: string;
	description: string;
	content: string;
	href: string;
	category: string;
	type: "page" | "heading" | "text";
	pageTitle: string;
};

function sanitizeGeneratedText(raw: string): string {
	return raw
		.replace(/[\u2013\u2014]/g, "-")
		.replace(/\p{Extended_Pictographic}|\p{Emoji_Presentation}/gu, "")
		.replace(/\s+/g, " ")
		.trim();
}

function parseFrontmatter(raw: string): { title: string; description: string; body: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { title: "", description: "", body: raw };

	const frontmatter = match[1];
	const body = match[2];

	const title = frontmatter.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? "";
	const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? "";

	return {
		title: sanitizeGeneratedText(title),
		description: sanitizeGeneratedText(description),
		body,
	};
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

function cleanText(raw: string): string {
	let content = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
	content = content.replace(/<[^>]+>/g, " ");
	content = removeMd(content, {
		replaceLinksWithURL: false,
		gfm: true,
		useImgAltText: true,
	});
	content = content.replace(/```[\s\S]*?```/g, "");
	content = content.replace(/`[^`]+`/g, "");
	content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
	content = content.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");

	return sanitizeGeneratedText(content);
}

function splitIntoTextBlocks(raw: string): string[] {
	const withoutCode = raw
		.replace(/<script[\s\S]*?<\/script>/gi, "\n\n")
		.replace(/```[\s\S]*?```/g, "\n\n");

	return withoutCode
		.split(/\n{2,}|(?=\n[-*]\s+)/)
		.map((block) => cleanText(block))
		.filter((block) => block.length > 20);
}

function createTextEntryTitle(text: string): string {
	return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

function deriveHref(filePath: string): string {
	let rel = path.relative(CONTENT_DIR, filePath);
	rel = rel.replace(/\.md$/, "");
	rel = rel.replace(/\/index$/, "");
	if (rel === "index") return "/docs";
	return `/docs/${rel}`;
}

function deriveCategory(filePath: string): string {
	const rel = path.relative(CONTENT_DIR, filePath);
	const firstSegment = rel.split("/")[0];

	if (!firstSegment) return "Getting Started";

	const categories: Record<string, string> = {
		components: "Components",
		installation: "Installation",
		migration: "Migration",
		"dark-mode": "Dark Mode",
		registry: "Registry",
		changelog: "Changelog",
	};

	if (!rel.includes("/") || firstSegment.endsWith(".md")) {
		return "Getting Started";
	}

	return categories[firstSegment] ?? "Getting Started";
}

function sortContentFiles(a: string, b: string): number {
	const relativeA = path.relative(CONTENT_DIR, a);
	const relativeB = path.relative(CONTENT_DIR, b);
	const [firstSectionA] = relativeA.split("/");
	const [firstSectionB] = relativeB.split("/");
	const sectionA = relativeA.includes("/") ? (firstSectionA ?? "") : "";
	const sectionB = relativeB.includes("/") ? (firstSectionB ?? "") : "";
	const orderA = SECTION_ORDER.get(sectionA) ?? Number.MAX_SAFE_INTEGER;
	const orderB = SECTION_ORDER.get(sectionB) ?? Number.MAX_SAFE_INTEGER;

	return orderA === orderB ? relativeA.localeCompare(relativeB) : orderA - orderB;
}

function parseIntoSections(
	body: string,
	pageTitle: string,
	pageHref: string,
	category: string,
	description: string
): SearchEntry[] {
	const entries: SearchEntry[] = [];
	const lines = body.split("\n");
	const sections: { heading: string | null; level: number; lines: string[] }[] = [];
	let current: { heading: string | null; level: number; lines: string[] } = {
		heading: null,
		level: 0,
		lines: [],
	};

	for (const line of lines) {
		const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
		if (headingMatch) {
			sections.push(current);
			current = {
				heading: headingMatch[2].trim(),
				level: headingMatch[1].length,
				lines: [],
			};
		} else {
			current.lines.push(line);
		}
	}
	sections.push(current);

	let currentAnchor = "";

	for (const section of sections) {
		if (section.heading === null) {
			const introText = cleanText(section.lines.join("\n"));
			if (introText.length > 10) {
				entries.push({
					title: pageTitle,
					description,
					content: introText,
					href: pageHref,
					category,
					type: "page",
					pageTitle,
				});
			}
			continue;
		}

		const headingText = cleanText(section.heading);
		if (!headingText) continue;

		currentAnchor = slugify(headingText);
		const href = `${pageHref}#${currentAnchor}`;

		entries.push({
			title: headingText,
			description: "",
			content: headingText,
			href,
			category,
			type: "heading",
			pageTitle,
		});

		const bodyText = cleanText(section.lines.join("\n"));
		if (bodyText.length > 20) {
			for (const para of splitIntoTextBlocks(section.lines.join("\n"))) {
				entries.push({
					title: createTextEntryTitle(para),
					description: "",
					content: para,
					href: `${pageHref}#${currentAnchor}`,
					category,
					type: "text",
					pageTitle,
				});
			}
		}
	}

	return entries;
}

async function main() {
	const files = (await globby("**/*.md", { cwd: CONTENT_DIR, absolute: true })).sort(
		sortContentFiles
	);
	const entries: SearchEntry[] = [];

	for (const file of files) {
		const raw = fs.readFileSync(file, "utf-8");
		const { title, description, body } = parseFrontmatter(raw);
		if (!title) continue;

		const href = deriveHref(file);
		const category = deriveCategory(file);
		const sections = parseIntoSections(body, title, href, category, description);
		entries.push(...sections);
	}

	const outputDir = path.dirname(OUTPUT_PATH);
	fs.mkdirSync(outputDir, { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2));
	console.log(`Built search index with ${entries.length} entries at ${OUTPUT_PATH}`);
}

const isWatchMode = process.argv.includes("--watch");

if (isWatchMode) {
	await main();

	watch(CONTENT_DIR, { recursive: true }, (_, filename) => {
		if (!filename?.endsWith(".md")) return;
		main().catch((error) => {
			console.error("Search index build failed:", error);
		});
	});
} else {
	await main();
}
