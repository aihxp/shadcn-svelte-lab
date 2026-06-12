# shadcn-svelte-lab Docs

These docs describe `shadcn-svelte-lab`, a heavily modified fork in this repository. They are not the canonical documentation for [shadcn/ui](https://ui.shadcn.com) or [huntabyte/shadcn-svelte](https://www.shadcn-svelte.com/docs).

## Local Commands

Build content, search data, the SvelteKit site, and LLM docs:

```bash
pnpm -F docs build
```

Build only the registry JSON:

```bash
pnpm -F docs build:registry
```

Run the docs check:

```bash
pnpm -F docs check
```

## Drift Notes

When changing lab status, package names, registry behavior, or maintenance expectations, update the root README, docs content, package readmes, and generated search or LLM artifacts together.

Do not remove upstream attribution or MIT license notices while editing docs.
