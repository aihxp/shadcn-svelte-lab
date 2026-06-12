---
title: Introduction
description: Re-usable components built with Bits UI and Tailwind CSS.
---

<script>
  import * as Accordion from '$lib/registry/ui/accordion/index.js';
  import Callout from '$lib/components/callout.svelte';
</script>

<Callout class="mt-6">

This documentation describes `shadcn-svelte-lab`, a heavily modified fork of [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte). It is not the canonical Svelte port, it is not affiliated with shadcn or the upstream shadcn-svelte maintainers, and it is not expected to be maintained regularly.

</Callout>

This lab adapts [shadcn/ui](https://ui.shadcn.com) ideas for [Svelte](https://svelte.dev), then adds broader registry, CLI, template, and agent workflow experiments. Use [shadcn/ui](https://ui.shadcn.com/docs) for the canonical React project and [shadcn-svelte](https://www.shadcn-svelte.com/docs) for the maintained Svelte port.

**This is not a component library. It is how you build your component library.**

You know how most traditional component libraries work: you install a package from NPM, import the components, and use them in your app.

This approach works well until you need to customize a component to fit your design system or require one that isn’t included in the library. **Often, you end up wrapping library components, writing workarounds to override styles, or mixing components from different libraries with incompatible APIs.**

This is what the shadcn approach aims to solve. This lab is built around the following principles:

- **Open Code:** The top layer of your component code is open for modification.
- **Composition:** Every component uses a common, composable interface, making them predictable.
- **Distribution:** A flat-file schema and command-line tool make it easy to distribute components.
- **Beautiful Defaults:** Carefully chosen default styles, so you get great design out-of-the-box.
- **AI-Ready:** Open code for LLMs to read, understand, and improve.

## Open Code

The CLI hands you the actual component code. You have full control to customize and extend the components to your needs. This means:

- **Full Transparency:** You see exactly how each component is built.
- **Easy Customization:** Modify any part of a component to fit your design and functionality requirements.
- **AI Integration:** Access to the code makes it straightforward for LLMs to read, understand, and even improve your components.

_In a typical library, if you need to change a button's behavior, you have to override styles or wrap the component. With this approach, you simply edit the button code directly._

<Accordion.Root type="single">

<Accordion.Item value="faq-1" class="border-none">

<Accordion.Trigger>
How do I pull upstream updates in an Open Code approach?
</Accordion.Trigger>

<Accordion.Content>

shadcn-svelte follows a headless component architecture. This means the core of your app can receive fixes by updating your dependencies, for instance, bits-ui or paneforge.

<p class="mt-4">
The topmost layer, i.e., the one closest to your design system, is not
        coupled with the implementation of the library. It stays open for
        modification.
</p>
</Accordion.Content>
</Accordion.Item>
</Accordion.Root>

## Composition

Every component in this lab shares a common, composable interface. **If a component does not exist, the lab workflow brings it in, makes it composable, and adjusts its style to match the rest of the design system.**

_A shared, composable interface means it's predictable for both your team and LLMs. You are not learning different APIs for every new component. Even for third-party ones._

## Distribution

This lab is also a code distribution system. It defines a schema for components and a CLI to distribute them.

- **Schema:** A flat-file structure that defines the components, their dependencies, and properties.
- **CLI:** A command-line tool to distribute and install components across projects with cross-framework support.

_You can use the schema to distribute your components to other projects or have AI generate completely new components based on existing schema._

## Beautiful Defaults

The registry comes with a large collection of components that have carefully chosen default styles. They are designed to look good on their own and to work well together as a consistent system:

- **Good Out-of-the-Box:** Your UI has a clean and minimal look without extra work.
- **Unified Design:** Components naturally fit with one another. Each component is built to match the others, keeping your UI consistent.
- **Easily Customizable:** If you want to change something, it's simple to override and extend the defaults.

## AI-Ready

The design of this lab makes it easy for AI tools to work with your code. Its open code, registry schemas, CLI commands, and MCP server allow AI models to read, understand, and generate components.

_An AI model can learn how your components work and suggest improvements or even create new components that integrate with your existing design._
