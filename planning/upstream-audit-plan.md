# Upstream Audit Plan

## Purpose

Track and evaluate upstream work from `huntabyte/shadcn-svelte` against this workspace. The audit should answer one question for each upstream issue, pull request, or discussion item: is the concern already present in this codebase, does it need local work, or is it not actionable here yet?

## Sources

- Issues: https://github.com/huntabyte/shadcn-svelte/issues?page=1
- Pull requests: https://github.com/huntabyte/shadcn-svelte/pulls
- Discussions: https://github.com/huntabyte/shadcn-svelte/discussions

## Baseline

- Snapshot date: 2026-06-02
- Local branch: `component-parity-shadcn-ui-2026-06-02`
- Local HEAD: `e145dda`
- Fork `origin/main`: `e145dda`
- Upstream `huntabyte/shadcn-svelte` main: `e145dda`
- Local note: this fork has current working tree updates that may already address upstream items. Treat those changes as first-class audit evidence, but do not mark an item complete until the relevant files, generated registry output, and verification notes are recorded.

## Workflow

1. Refresh the upstream snapshot.
   - Run the GitHub commands in the task file.
   - Compare the refreshed list to the current checklist.
   - Add new source items and keep completed historical items with their notes.
2. Inspect the fork state before creating new work.
   - Check committed fork code.
   - Check uncommitted fork changes in the current working tree.
   - Compare source files before generated registry JSON.
   - Record when an upstream item is already addressed in the fork.
3. Classify every source item.
   - `present`: already implemented locally.
   - `present-in-fork`: already implemented in this fork, including current working tree changes.
   - `needs-work`: valid gap in this workspace.
   - `blocked-upstream`: waiting on `shadcn-ui/ui`, Bits UI, Svelte, Tailwind, or another upstream source.
   - `needs-repro`: cannot verify without a reproduction.
   - `support-signal`: discussion or support thread that may become docs work.
   - `not-applicable`: intentionally out of scope for this workspace.
4. Inspect local evidence before marking a source item complete.
   - Search the repo with `rg`.
   - Inspect generated registry JSON only after checking source files.
   - Review upstream PR diffs with `gh pr diff`.
   - For issues, read the issue body and maintainer comments before deciding.
   - For discussions, require a concrete code, docs, or CLI action before creating implementation work.
5. Convert actionable items into implementation tasks.
   - Add a short implementation task under the relevant section in `upstream-audit-tasks.md`.
   - Include the source link, expected local files, and verification command.
   - Keep source audit tasks separate from implementation tasks.
6. Mark completion only with evidence.
   - A source item can be checked when it has a disposition and supporting local evidence.
   - An implementation item can be checked when code or docs are updated and verification is recorded.

## Priority Rules

1. Open upstream pull requests that touch CLI behavior, registry schemas, or core components.
2. Open bugs with reproduction or clear maintainer diagnosis.
3. Parity issues against `shadcn-ui/ui`.
4. Documentation issues that reduce setup failures or recurring support questions.
5. Discussions with repeated support activity or a concrete feature request.
6. Dependency-only PRs, unless they unblock a security, compatibility, or CI failure.

## Verification Expectations

- CLI or registry changes: run focused package tests, then `pnpm check` if the blast radius is broad.
- Docs-only changes: run `pnpm -F docs check`.
- Component changes: run `pnpm -F docs check`; add focused interaction or visual checks when behavior changes.
- Generated registry changes: rebuild registry output with the repo script and inspect the diff.
- Browser-sensitive issues: verify in the named browser when possible, especially Safari issues.

## Review Cadence

- Refresh the upstream source lists before each audit session.
- Revisit `blocked-upstream` items weekly or when the linked upstream issue changes.
- Revisit `needs-repro` items only when a reproduction, maintainer note, or local failure appears.
- Promote recurring discussion topics into docs tasks when two or more threads point to the same confusion.
