# shadcn-svelte Templates

These starters cover the framework shapes tracked in the shadcn-ui parity plan. They are Svelte-native templates, not direct copies from the upstream React templates.

## Available Templates

| Template             | Shape                                      | Install target                      |
| -------------------- | ------------------------------------------ | ----------------------------------- |
| `sveltekit-app`      | Single SvelteKit app                       | `src/lib/components/ui`             |
| `sveltekit-monorepo` | SvelteKit app plus shared UI package       | `packages/ui/src/lib/components/ui` |
| `vite-app`           | Single Svelte and Vite app                 | `src/lib/components/ui`             |
| `vite-monorepo`      | Svelte and Vite app plus shared UI package | `packages/ui/src/lib/components/ui` |
| `astro-app`          | Single Astro app with Svelte integration   | `src/lib/components/ui`             |
| `astro-monorepo`     | Astro app plus shared UI package           | `packages/ui/src/lib/components/ui` |

## Sync Workflow

Use this workflow when refreshing templates after framework, Tailwind, or CLI changes:

1. Refresh upstream parity context with `git fetch upstream-ui main`.
2. Compare the root catalog and `docs/package.json` dependency ranges against the template packages.
3. Keep each `components.json` aligned with the repo defaults for `style`, `tailwind.css`, `baseColor`, and aliases.
4. Copy each template to a temporary directory, install dependencies, run `pnpm check`, run `pnpm build`, then run the local CLI smoke test with `add button`.
5. Do not commit generated lockfiles, build output, `node_modules`, `.svelte-kit`, or `.astro` directories from template verification.

For monorepos, run the CLI from `apps/web` when testing app-level installation. The `ui` and `utils` aliases resolve into `packages/ui`, matching the documented shared package layout.
