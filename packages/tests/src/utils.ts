import { spawn } from "node:child_process";
import { access, cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(dirname, "../../..");
export const tempRoot = path.join(repoRoot, "packages/tests/temp");
export const cliPath = path.join(repoRoot, "packages/cli/dist/index.mjs");
export const docsStaticDir = path.join(repoRoot, "docs/static");
export const templatesDir = path.join(repoRoot, "templates");

type CommandResult = {
	exitCode: number | null;
	stdout: string;
	stderr: string;
};

type StaticServer = {
	url: string;
	close: () => Promise<void>;
};

const svelteKitTsconfig = {
	compilerOptions: {
		paths: {
			$lib: ["../src/lib"],
			"$lib/*": ["../src/lib/*"],
		},
		rootDirs: ["..", "./types"],
		verbatimModuleSyntax: true,
		isolatedModules: true,
		lib: ["esnext", "DOM", "DOM.Iterable"],
		moduleResolution: "bundler",
		module: "esnext",
		noEmit: true,
		target: "esnext",
	},
	include: [
		"ambient.d.ts",
		"non-ambient.d.ts",
		"./types/**/$types.d.ts",
		"../vite.config.js",
		"../vite.config.ts",
		"../src/**/*.js",
		"../src/**/*.ts",
		"../src/**/*.svelte",
		"../tests/**/*.js",
		"../tests/**/*.ts",
		"../tests/**/*.svelte",
	],
	exclude: [
		"../node_modules/**",
		"../src/service-worker.js",
		"../src/service-worker.ts",
		"../src/service-worker.d.ts",
	],
};

export async function ensureBuiltArtifacts() {
	await assertExists(
		cliPath,
		"Build the CLI before running e2e tests. From the repo root, run pnpm build:cli."
	);
	await assertExists(
		path.join(docsStaticDir, "registry/styles/vega/index.json"),
		"Build the registry before running e2e tests. From the repo root, run pnpm -F docs build:registry."
	);
}

export async function resetTempRoot() {
	await rm(tempRoot, { recursive: true, force: true });
	await mkdir(tempRoot, { recursive: true });
}

export async function createTempDir(prefix: string) {
	await mkdir(tempRoot, { recursive: true });
	return await mkdtemp(path.join(tempRoot, `${prefix}-`));
}

export async function copyTemplate(name: string) {
	const cwd = await createTempDir(name);
	await cp(path.join(templatesDir, name), cwd, { recursive: true });
	return cwd;
}

export async function prepareSvelteKitFixture(cwd: string) {
	const generatedDir = path.join(cwd, ".svelte-kit");
	await mkdir(generatedDir, { recursive: true });
	await writeFile(
		path.join(generatedDir, "tsconfig.json"),
		`${JSON.stringify(svelteKitTsconfig, null, "\t")}\n`,
		"utf8"
	);
}

export function runCli(cwd: string, args: string[], env: NodeJS.ProcessEnv = {}) {
	return runCommand(process.execPath, [cliPath, ...args], {
		cwd,
		env: {
			...process.env,
			CI: "true",
			FORCE_COLOR: "0",
			...env,
		},
	});
}

export function expectSuccess(result: CommandResult) {
	if (result.exitCode !== 0) {
		throw new Error(
			[
				`Expected command to exit with 0, received ${result.exitCode}.`,
				"stdout:",
				result.stdout,
				"stderr:",
				result.stderr,
			].join("\n")
		);
	}
}

export async function createStaticServer(rootDir: string): Promise<StaticServer> {
	const server = http.createServer(async (request, response) => {
		try {
			const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
			const requestedPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
			const relativePath = requestedPath || "index.html";

			if (relativePath.includes("..")) {
				response.writeHead(400);
				response.end("Bad request");
				return;
			}

			const filePath = path.join(rootDir, relativePath);
			const fileStat = await stat(filePath);

			if (!fileStat.isFile()) {
				response.writeHead(404);
				response.end("Not found");
				return;
			}

			response.writeHead(200, {
				"content-type": getContentType(filePath),
			});
			response.end(await readFile(filePath));
		} catch {
			response.writeHead(404);
			response.end("Not found");
		}
	});

	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});

	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Static registry server did not expose a TCP address.");
	}

	return {
		url: `http://127.0.0.1:${address.port}`,
		close: () =>
			new Promise<void>((resolve, reject) => {
				server.close((error) => {
					if (error) reject(error);
					else resolve();
				});
			}),
	};
}

async function assertExists(filePath: string, message: string) {
	try {
		await access(filePath);
	} catch {
		throw new Error(message);
	}
}

function runCommand(
	command: string,
	args: string[],
	options: { cwd: string; env: NodeJS.ProcessEnv }
) {
	return new Promise<CommandResult>((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: options.cwd,
			env: options.env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";

		const timeout = setTimeout(() => {
			child.kill("SIGTERM");
			reject(new Error(`Command timed out: ${command} ${args.join(" ")}`));
		}, 120000);

		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.once("error", (error) => {
			clearTimeout(timeout);
			reject(error);
		});
		child.once("close", (exitCode) => {
			clearTimeout(timeout);
			resolve({ exitCode, stdout, stderr });
		});
	});
}

function getContentType(filePath: string) {
	switch (path.extname(filePath)) {
		case ".css":
			return "text/css; charset=utf-8";
		case ".html":
			return "text/html; charset=utf-8";
		case ".js":
			return "text/javascript; charset=utf-8";
		case ".json":
			return "application/json; charset=utf-8";
		default:
			return "text/plain; charset=utf-8";
	}
}
