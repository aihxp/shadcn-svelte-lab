# shadcn-ui/ui Parity Plan

## Purpose

Bridge the remaining gap between `shadcn-ui/ui` (the upstream React project) and this fork (`aihxp/shadcn-svelte`). The previous audit cycle (`upstream-audit-plan.md`) tracked `huntabyte/shadcn-svelte`; this plan tracks the React original directly via the `upstream-ui` remote. For each upstream feature the question is: is it already present here, does it need a Svelte port, or is it intentionally not applicable to a Bits UI based ecosystem?

## Baseline

- Snapshot date: 2026-06-11
- Upstream remote: `upstream-ui` -> `https://github.com/shadcn-ui/ui.git`
- Upstream `upstream-ui/main`: `1994caba0b2140d4d5aa765bb9d7d4412d6aaabb`
- Upstream CLI: `shadcn` `4.11.0` (`packages/shadcn`)
- Local branch: `main`, HEAD `3992ed61d`, clean working tree
- Local CLI: `shadcn-svelte` `1.3.0` (`packages/cli`)

## Verified Parity (do not redo)

These were verified against the upstream tree at the snapshot commit. Re-verify only when refreshing the snapshot.

- UI components: all 55 upstream `registry/bases/base/ui` components exist under `docs/src/lib/registry/ui/`, including the newer Spinner, Kbd, Button Group, Empty, Field, Item, Input Group, Native Select, Direction, and Combobox. Local extras (`data-table`, `form`, `range-calendar`) are intentional Svelte additions.
- Blocks: all 28 `new-york-v4` blocks exist locally. Only `preview` and `preview-02` (internal create-page previews from `bases/base/blocks`) are missing.
- Charts: all 70 chart items exist locally.
- Hooks: `is-mobile.svelte.ts` covers upstream `use-mobile.ts`.
- Styles: all 8 style sheets (`luma`, `lyra`, `maia`, `mira`, `nova`, `rhea`, `sera`, `vega`) match upstream `registry/styles/`.
- Docs site infrastructure: `(view)` preview routes, `api/block`, `api/search.json`, `og`, `registry` routes, llms.txt generation (`docs/scripts/build-llms.ts`), FlexSearch-based search, changelog collection.
- GitHub registries: `owner/repo/item#ref` installs, source registry `include`, `registry validate`, schema, and docs (ported during the previous audit cycle).
- Skill: `skills/shadcn-svelte/` mirrors the upstream skill layout (gaps listed in Workstream C).

## Gap Inventory

### A. CLI command parity (`packages/cli` vs `packages/shadcn` 4.11.0)

Upstream commands missing locally:

| Command                  | Upstream description                                        | Notes for the Svelte port                                                                                                         |
| ------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `mcp` and `registry mcp` | MCP server for agents                                       | No MCP code exists anywhere in this repo. Highest-leverage single gap.                                                            |
| `search`                 | search items from registries                                | Needs the registry search module.                                                                                                 |
| `view`                   | view items from the registry                                | Prints item files and metadata; agent-friendly.                                                                                   |
| `info`                   | get information about your project                          | Reads `components.json` plus framework detection.                                                                                 |
| `docs`                   | get docs, api references, and usage examples for components | Powers agent workflows; pairs with MCP.                                                                                           |
| `diff`                   | check for component updates                                 | Local has a hidden `update` command that applies updates; decide whether to add `diff` semantics or unhide and document `update`. |
| `apply`                  | apply a preset (theme, font) to an existing project         | Local preset utilities exist (`packages/cli/src/preset/`); no command wiring.                                                     |
| `preset`                 | decode, resolve, and open preset codes                      | Same foundation as `apply`.                                                                                                       |
| `eject`                  | inline tailwind.css and remove the shadcn dependency        | Confirm the Svelte equivalent semantics before porting.                                                                           |
| `migrate`                | run codemod migrations                                      | Migration runner with `--list`.                                                                                                   |
| `build` (top level)      | build registry JSON                                         | Local equivalent exists as `registry build`; consider a top-level alias for command-line compatibility.                           |

Registry engine gaps behind those commands. Upstream refactored `packages/shadcn/src/registry/` into modules with per-module tests: `api`, `fetcher`, `loader`, `parser`, `resolver`, `builder`, `validator`, `namespaces`, `context`, `env`, `errors`, `search`. Local has a leaner set (`address`, `github`, `github-ref`, `schema`, `source`). The two concrete functional gaps:

1. Namespaced registries: the `registries` map in `components.json`, `@namespace/item` resolution, and per-registry auth (headers, env var expansion). Confirmed absent: no `registries` config key anywhere in `packages/cli/src` or `packages/registry/src`. This was also flagged as the remaining gap in discussion 2525 during the previous audit.
2. Registry search and item-listing APIs that `search`, `view`, `docs`, MCP, and the directory page all consume.

### B. Registry platform

- Registry directory: upstream ships `apps/v4/registry/directory.json` (a curated index of third-party registries with `@namespace` entries) plus a directory docs page. Local has none. Decide whether to mirror upstream entries that are framework-agnostic or curate a Svelte-ecosystem directory.
- Registry docs missing locally (`docs/content/registry/` vs upstream): `api-reference`, `authentication`, `namespace`, `mcp`, `registry-index`. Local already has `getting-started`, `github`, `examples`, `faq`, `registry-json`, `registry-item-json`. Upstream `open-in-v0` is React-platform specific; record a disposition rather than porting.

### C. MCP and agent ecosystem

- `shadcn-svelte mcp` server exposing init, search, view, docs, and add flows to agents (upstream `commands/mcp.ts` and `commands/registry/mcp.ts`).
- Docs pages: root `mcp.mdx` and `skills.mdx` equivalents.
- Skill sync: `skills/shadcn-svelte/` is missing `mcp.md` and `registry.md`; upstream `rules/base-vs-radix.md` is not applicable (Bits UI is the only primitive layer here) but consider a `rules/bits-ui.md` covering the same decision space.
- `.cursor-plugin/plugin.json`: small marketing surface for the Cursor plugin directory.

### D. Docs content parity (`docs/content/` vs `apps/v4/content/docs/`)

- `forms/` section: upstream has `index`, `next`, `react-hook-form`, `tanstack-form`, `formisch`. Svelte adaptation: `index`, `sveltekit` (remote functions and progressive enhancement), `formsnap` (Superforms), and evaluate `tanstack-form` and `formisch` (both ship Svelte adapters). Existing scattered form guidance in `components/form.md` can seed the section.
- `rtl/` section: upstream has `index`, `next`, `vite`, `start`. Svelte adaptation: `index`, `sveltekit`, `vite`, `astro`, building on the existing Direction component and provider. This also closes the remaining `partial` on issue 2512 (RTL docs; the CLI migration piece stays in Workstream A under `migrate`).
- Root pages missing: `mcp`, `skills`, `directory`, `monorepo`, `package-imports` (adapt to Svelte aliasing), `new` (latest-additions page). Not applicable: `react-19`, `tailwind-v4` (local `migration/` covers the Svelte equivalents), `_v0`, `_blocks` (underscore drafts).
- RSS feed: upstream serves `rss.xml`; local route is missing (changelog collection already exists to feed it).

### E. Templates

Upstream ships 10 starter templates under `templates/` (next, astro, vite, react-router, start; each in app and monorepo variants) plus `scripts/sync-templates.sh`. Local has only `registry-template/`. Svelte target set:

- `sveltekit-app`, `sveltekit-monorepo`
- `vite-app`, `vite-monorepo` (Svelte via Vite)
- `astro-app`, `astro-monorepo`

Wire these into the `monorepo` docs page (Workstream D) and the create flow where relevant.

### F. Site residuals (create page and style demos)

Carried over from the previous audit cycle, re-verified missing at this snapshot:

- `docs/src/routes/(app)/(layout)/(create)/components/menu-picker.svelte`
- `docs/src/routes/(app)/(layout)/(create)/components/project-form.svelte`
- Create page mobile layout rewrite (`create/+page.svelte`)
- `(styles)/sera/` demo route tree and example images (upstream `apps/v4/app/(app)/(styles)/sera`)
- `preview` and `preview-02` blocks (internal create previews)
- `docs/src/hooks.server.ts`, `docs/src/lib/components/setup-cards.svelte`, `docs/src/lib/types/block.ts`
- `docs/src/routes/rss.xml/+server.ts` (also listed in Workstream D)

### G. Not applicable, watch only

- `registry/bases/{base,radix}` multi-primitive architecture: upstream now builds every component twice (Base UI and Radix). This fork has a single primitive layer (Bits UI), so the architecture itself does not port. Watch for schema and `components.json` changes leaking out of it (`bases.ts`, `config.ts`, `eject`, `apply`) that affect cross-ecosystem registry compatibility.
- `packages/tests` fixture-based e2e suite: optional hardening; a SvelteKit fixture equivalent is listed as a stretch task.
- React-specific docs (`react-19`, `react-hook-form`, `open-in-v0`, `_v0`): record dispositions, do not port.

## Execution Order

Phases are ordered by leverage; each phase is independently shippable.

1. Phase 1, registry engine foundation: namespaced registries (`registries` map, `@namespace/item`, auth headers and env expansion), then the search and item-listing modules. Everything in phases 2 and 4 sits on this.
2. Phase 2, agent surface: `search`, `view`, `info`, `docs` commands, then the MCP server (`mcp`, `registry mcp`), `.cursor-plugin`, skill sync (`mcp.md`, `registry.md`).
3. Phase 3, docs parity: registry docs (`authentication`, `namespace`, `api-reference`, `mcp`, `registry-index`) immediately after phase 1 lands so the features ship documented; then `forms/`, `rtl/`, root pages (`mcp`, `skills`, `monorepo`, `package-imports`, `new`), RSS.
4. Phase 4, directory: `directory.json` curation and the directory docs page.
5. Phase 5, templates: the six Svelte templates plus sync script and monorepo docs wiring.
6. Phase 6, site residuals: create page components, sera demo route, preview blocks, `hooks.server.ts`, remaining files from Workstream F.
7. Phase 7, long tail: `apply` and `preset` commands, `eject`, `migrate` (including the RTL migration from issue 2512), `diff` or unhidden `update`, top-level `build` alias, optional e2e fixture package.

## Priority Rules

1. Features that unblock agents and third-party registries (namespaces, search, MCP) come first; they are the widest ecosystem gap and everything else consumes them.
2. Docs for a feature ship in the same phase as the feature.
3. Pure React-platform features get a recorded `not-applicable` disposition instead of silent omission.
4. Site polish (create page, demos, RSS) trails functional parity.

## Verification Expectations

- CLI changes: focused vitest files first (`pnpm -F shadcn-svelte exec vitest <file>`), then `pnpm -F shadcn-svelte check` and `pnpm -F shadcn-svelte build`.
- Registry or schema changes: `pnpm -F @shadcn-svelte/registry build`, regenerate with `pnpm -F docs build:registry`, inspect the JSON diff.
- Docs changes: `pnpm -F docs build:content`, `pnpm -F docs build:search`, `pnpm -F docs check`.
- MCP server: exercise over stdio with an MCP client (Claude Code `claude mcp add` or the inspector) and record the tool list output.
- Templates: scaffold each template, run its own `check` and `build`, and run `shadcn-svelte add button` against it.

## Review Cadence

- Refresh the snapshot with `git fetch upstream-ui main` before each working session; update the baseline commit here when it moves.
- Diff inventories with `git ls-tree upstream-ui/main:<path>` against the local trees rather than relying on memory; upstream moves fast.
- Re-check Workstream G watch items when upstream changes `packages/shadcn/src/registry/config.ts`, `bases.ts`, or the registry item schema.
- Track work in `shadcn-ui-parity-tasks.md` using the same evidence-based completion rules as the previous audit cycle: a task is done only when code or docs exist locally, generated output is rebuilt, and verification commands are recorded.
