# Bits UI Primitive Layer

shadcn-svelte uses Bits UI as its primitive layer. Do not copy upstream React guidance for the `base` versus `radix` split into Svelte projects.

## Key Rules

- There is no `base` or `radix` config axis in shadcn-svelte.
- Do not use React-only APIs such as `asChild`, `render`, `className`, hooks, or JSX children.
- Use Svelte component APIs, snippets, `bind:` bindings, and event attributes.
- Use the barrel exports from the installed component folder. Multi-part components usually use namespace imports such as `import * as Dialog from "$lib/components/ui/dialog"`.
- Single-component barrels usually use named imports such as `import { Button } from "$lib/components/ui/button"`.
- When a trigger needs to render a custom control, follow the local component docs or bind root state with `bind:open`. Do not invent an `asChild` prop.

## Common Translations

| React upstream concept | Svelte guidance                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| `className`            | `class`                                                                  |
| `asChild` or `render`  | Component-specific child snippets, trigger wrappers, or controlled state |
| JSX children functions | Svelte snippets                                                          |
| `onClick`              | `onclick`                                                                |
| `useState`             | `$state`                                                                 |
| `useEffect`            | `$effect`                                                                |
| `lucide-react`         | The configured Svelte icon library, for example `@lucide/svelte`         |

## Trigger Pattern

Prefer documented trigger composition:

```svelte
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Update your profile details.</Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
```

For custom flows, control state explicitly:

```svelte
<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";

  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open</Button>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Title>Edit profile</Dialog.Title>
  </Dialog.Content>
</Dialog.Root>
```
