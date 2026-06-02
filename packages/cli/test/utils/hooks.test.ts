import * as p from "@clack/prompts";
import { exec } from "tinyexec";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveHookCommand, runConfigHooks } from "../../src/utils/hooks";
import type { ResolvedConfig } from "../../src/utils/config/index";

vi.mock("tinyexec", () => ({
	exec: vi.fn().mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 }),
}));

const task = {
	message: vi.fn(),
	success: vi.fn(),
	error: vi.fn(),
};

vi.mock("@clack/prompts", () => ({
	taskLog: vi.fn(() => task),
}));

describe("runConfigHooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("skips missing hooks", async () => {
		await runConfigHooks({
			cwd: "/project",
			config: {} as ResolvedConfig,
			hook: "postAdd",
		});

		expect(p.taskLog).not.toHaveBeenCalled();
		expect(exec).not.toHaveBeenCalled();
	});

	it("runs configured hooks from the project cwd", async () => {
		await runConfigHooks({
			cwd: "/project",
			config: {
				hooks: {
					postAdd: ["pnpm exec prettier --write src/lib", "pnpm exec eslint --fix src/lib"],
				},
			} as ResolvedConfig,
			hook: "postAdd",
		});

		const prettier = resolveHookCommand("pnpm exec prettier --write src/lib");
		const eslint = resolveHookCommand("pnpm exec eslint --fix src/lib");

		expect(exec).toHaveBeenCalledTimes(2);
		expect(exec).toHaveBeenNthCalledWith(
			1,
			prettier.command,
			prettier.args,
			expect.objectContaining({
				throwOnError: true,
				nodeOptions: { cwd: "/project" },
			})
		);
		expect(exec).toHaveBeenNthCalledWith(
			2,
			eslint.command,
			eslint.args,
			expect.objectContaining({
				throwOnError: true,
				nodeOptions: { cwd: "/project" },
			})
		);
		expect(task.success).toHaveBeenCalledWith("Ran postAdd hooks");
	});
});
