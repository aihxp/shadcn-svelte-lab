import process from "node:process";
import color from "picocolors";
import * as p from "@clack/prompts";
import { exec } from "tinyexec";
import { highlight } from "./colors.js";
import { error } from "./errors.js";
import type { ResolvedConfig } from "./config/index.js";

export type LifecycleHook = "postAdd" | "postUpdate";

type RunConfigHooksOptions = {
	cwd: string;
	config: Pick<ResolvedConfig, "hooks">;
	hook: LifecycleHook;
};

export function resolveHookCommand(command: string) {
	if (process.platform === "win32") {
		return { command: "cmd", args: ["/d", "/s", "/c", command] };
	}

	return { command: "sh", args: ["-c", command] };
}

export async function runConfigHooks({ cwd, config, hook }: RunConfigHooksOptions) {
	const commands = config.hooks?.[hook] ?? [];
	if (commands.length === 0) return;

	const label = `${hook} ${commands.length === 1 ? "hook" : "hooks"}`;
	const task = p.taskLog({
		title: `Running ${highlight(label)}...`,
		limit: Math.max(1, Math.ceil((process.stdout.rows ?? 20) / 2)),
		spacing: 0,
		retainLog: true,
	});

	for (const command of commands) {
		task.message(`${color.dim("$")} ${command}`);
		const shellCommand = resolveHookCommand(command);
		const proc = exec(shellCommand.command, shellCommand.args, {
			throwOnError: true,
			nodeOptions: { cwd },
		});

		proc.process?.stdout?.on("data", (data) => task.message(data.toString(), { raw: true }));
		proc.process?.stderr?.on("data", (data) => task.message(data.toString(), { raw: true }));

		try {
			await proc;
		} catch (e) {
			task.error(`Failed to run ${hook} hook`);
			throw error(`Failed to run ${hook} hook command: ${command}`, e);
		}
	}

	task.success(`Ran ${label}`);
}
