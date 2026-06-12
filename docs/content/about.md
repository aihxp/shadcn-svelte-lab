---
title: About shadcn-svelte-lab
description: Credits, fork status, and license notes.
---

## About This Lab

This documentation describes `shadcn-svelte-lab`, a heavily modified fork of [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte), the Svelte port of [shadcn/ui](https://ui.shadcn.com).

This lab is not the canonical shadcn-svelte project, is not affiliated with shadcn, and is not affiliated with the upstream shadcn-svelte maintainers. It is not expected to be maintained regularly.

Use the canonical projects when you need the maintained upstream path:

- [shadcn/ui](https://ui.shadcn.com) for React and the original registry model.
- [shadcn-svelte](https://www.shadcn-svelte.com) for the maintained Svelte port.

## Feature Comparison

| Feature                             | shadcn/ui                   | shadcn-svelte                               | shadcn-svelte-lab                              |
| ----------------------------------- | --------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Ecosystem                           | React and Next.js           | Svelte and SvelteKit                        | Svelte and SvelteKit                           |
| Project role                        | Canonical shadcn project    | Canonical community Svelte port             | Experimental lab fork                          |
| Component model                     | Copy-paste React components | Copy-paste Svelte components                | Copy-paste Svelte components                   |
| Registry installs                   | Yes                         | Yes                                         | Yes                                            |
| Registry namespaces                 | Yes                         | Limited or upstream-dependent               | Yes                                            |
| Private registry auth               | Yes                         | Limited or upstream-dependent               | Yes                                            |
| Search, view, and docs CLI commands | Yes                         | Limited or upstream-dependent               | Yes                                            |
| MCP and agent tooling               | Yes                         | Limited or upstream-dependent               | Yes                                            |
| Starter templates                   | React framework templates   | Svelte starter coverage depends on upstream | SvelteKit, Vite, Astro, and monorepo templates |
| Maintenance expectation             | Canonical React source      | Canonical Svelte source                     | Not maintained regularly                       |

## What This Lab Explores

This lab keeps the Svelte component model and adapts additional upstream registry platform ideas, including namespaces, private registry authentication, registry search and view commands, docs lookup, MCP tools, templates, migrations, and fixture-based e2e tests.

## Credits

- [shadcn](https://github.com/shadcn) and [shadcn/ui](https://ui.shadcn.com) for the original designs, methodology, registry model, and React implementation.
- [Hunter Johnston](https://github.com/huntabyte), [CokaKoala](https://github.com/adriangonz97), Aidan Bleser, and the [shadcn-svelte contributors](https://github.com/huntabyte/shadcn-svelte/graphs/contributors) for the Svelte port.
- [Bits UI](https://bits-ui.com) for the headless components that power the Svelte implementation.
- [Formsnap](https://formsnap.dev) for form primitives.
- [Paneforge](https://paneforge.com) for resizable primitives.
- [Vaul Svelte](https://vaul-svelte.com) for drawer primitives.
- [Radix UI](https://radix-ui.com) for the headless component work and examples that influenced the original shadcn/ui project.
- [Shu Ding](https://shud.in) for typography work adapted through the upstream projects.
- [Cal](https://cal.com) for the first component style inspiration in the original shadcn/ui project.

## License

This repository remains under the MIT license. Keep `LICENSE.md`, package license files, and upstream notices intact when redistributing this lab or substantial portions of it.
