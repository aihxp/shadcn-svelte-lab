# Contributing To shadcn-svelte-lab

`shadcn-svelte-lab` is a heavily modified fork of [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte). It is not the canonical Svelte port and is not expected to be maintained regularly.

Use this guide for changes to this lab only. Please do not send lab-specific support requests, bug reports, or feature requests to `huntabyte/shadcn-svelte` or `shadcn/ui` unless the issue also reproduces in those upstream projects.

## Contribution Scope

Small, focused contributions are the best fit here:

- Documentation corrections that clarify this lab's status or behavior.
- Tests that make the fork easier to evaluate locally.
- Fixes for regressions introduced by this lab's registry, CLI, agent, template, or docs changes.
- Comparison notes that explain how this lab differs from `shadcn/ui` or canonical `shadcn-svelte`.

Large feature work should start with a short written plan so the tradeoffs are visible before code changes begin.

## Local Verification

Install dependencies:

```bash
pnpm install
```

Run the core CLI tests:

```bash
pnpm test
```

Run the fixture-based e2e tests:

```bash
pnpm test:e2e
```

Run checks before sharing larger changes:

```bash
pnpm check
pnpm lint
```

## Upstream First

If a change belongs in the canonical projects, contribute there instead:

- React and registry model changes: [shadcn/ui](https://github.com/shadcn-ui/ui)
- Maintained Svelte port changes: [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte)

This lab may intentionally diverge from both projects, so not every local change is a good upstream candidate.

## Responsible Use Of AI

AI tools are fine for local exploration, tests, and implementation help. For issues, plans, and PR descriptions, keep the final text concise and specific to the change. Maintainers and future readers should be able to see what changed, why it changed, and how it was verified.

## License

By contributing to `shadcn-svelte-lab`, you agree that your contributions are licensed under the repository's [MIT license](LICENSE.md). Keep upstream license notices intact when moving, copying, or redistributing code from this repository.
