import { Command } from "commander";
import { describe, expect, it } from "vitest";
import { update } from "../../src/commands/update/index.js";

describe("update command", () => {
	it("is visible in command help", () => {
		const program = new Command().name("shadcn-svelte").addCommand(update);

		expect(program.helpInformation()).toContain("update [options] [components...]");
	});
});
