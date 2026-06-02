<script lang="ts" module>
	import { z } from "zod";

	const languages = [
		{ label: "English", value: "en" },
		{ label: "French", value: "fr" },
		{ label: "German", value: "de" },
		{ label: "Spanish", value: "es" },
		{ label: "Portuguese", value: "pt" },
		{ label: "Russian", value: "ru" },
		{ label: "Japanese", value: "ja" },
		{ label: "Korean", value: "ko" },
		{ label: "Chinese", value: "zh" },
	] as const;

	const formSchema = z.object({
		language: z.enum(["en", "fr", "de", "es", "pt", "ru", "ja", "ko", "zh"]),
	});
</script>

<script lang="ts">
	import { defaults, superForm } from "sveltekit-superforms";
	import { tick } from "svelte";
	import { zod4 } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import * as Combobox from "$lib/registry/ui/combobox/index.js";
	import * as Form from "$lib/registry/ui/form/index.js";
	import { cn } from "$lib/utils.js";

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error("Please fix the errors in the form.");
			}
		},
	});

	const { form: formData, enhance } = form;

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<form method="POST" class="space-y-6" use:enhance>
	<Form.Field {form} name="language" class="flex flex-col">
		<Combobox.Root bind:open>
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Language</Form.Label>
					<Combobox.Trigger
						bind:ref={triggerRef}
						class={cn(
							"w-[200px] justify-between",
							!$formData.language && "text-muted-foreground"
						)}
						{...props}
					>
						<Combobox.Value>
							{languages.find((f) => f.value === $formData.language)?.label ??
								"Select language"}
						</Combobox.Value>
					</Combobox.Trigger>
					<input hidden value={$formData.language} name={props.name} />
				{/snippet}
			</Form.Control>
			<Combobox.Content class="w-[200px] p-0">
				<Combobox.Input autofocus placeholder="Search language..." class="h-9" />
				<Combobox.List>
					<Combobox.Empty>No language found.</Combobox.Empty>
					<Combobox.Group value="languages">
						{#each languages as language (language.value)}
							<Combobox.Item
								value={language.label}
								checked={language.value === $formData.language}
								onSelect={() => {
									$formData.language = language.value;
									closeAndFocusTrigger();
								}}
							>
								{language.label}
							</Combobox.Item>
						{/each}
					</Combobox.Group>
				</Combobox.List>
			</Combobox.Content>
		</Combobox.Root>
		<Form.Description>
			This is the language that will be used in the dashboard.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
