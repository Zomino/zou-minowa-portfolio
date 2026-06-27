# CLAUDE.md

Guidelines for working in this repo.

## Project basics

- Framework: Astro with Tailwind CSS.
- Package manager: pnpm.
- Tests: Vitest.

## Dev container

Dev tools (pnpm, Vercel CLI, etc.) are installed inside the dev container, not on the host. Always run dev commands inside the container.

Open the project in VS Code and use **Dev Containers: Reopen in Container** to start the dev container.

## Commands

All commands — including git, pnpm, and any other CLI tool — must be run inside the dev container. Never run them on the host.

```bash
docker exec -u node -w /workspaces/zou-minowa-portfolio zou-minowa-portfolio-dev <command>
```

This is a pnpm workspace. Run install at the repo root, and run app scripts with `pnpm -F frontend <script>` (e.g. `pnpm -F frontend build`) or by setting the working directory to `apps/frontend`.

See `apps/frontend/package.json` scripts for available commands.

## Conventions

- Components live in `apps/frontend/src/components/`.
- Layouts live in `apps/frontend/src/layouts/`.
- Pages live in `apps/frontend/src/pages/`.
- Terraform infrastructure lives in `infra/`.
- `index.ts` files re-export only. Implementation lives in a named file inside its own folder (`foo/foo.ts` with co-located `foo.test.ts`).
- When building a shared package or contract, include only what both consumers actually use. Start minimal and let it grow; do not port a whole existing surface or add speculative helpers, fixtures, or constants. Derive types from the schema (one source of truth), and keep the export surface as small as possible.

## Coding style

- Keep components small and focused.
- Use semantic, mobile-first markup; keep unprefixed utilities as the mobile default and only add `sm:`/`md:`/`lg:` for larger screens.
- Follow existing Tailwind utility patterns.
- Keep visibility/positioning classes in the parent; child components should not control layout.
- Never use hardcoded pixel values.
- Never use `<style>` tags in components; use Tailwind utility classes only.
- Use `UPPER_SNAKE_CASE` for constants with static literal values (strings, numbers).
- Always mock external dependencies (e.g. `getCollection`, `getEntry`) in tests instead of skipping them.
- Run `prettier --write` on newly written or edited files before verifying, so formatting is not a separate round of fixes.
- Never add code comments or documentation unless explicitly requested.
- Always delete temporary or test files (scratch renders, throwaway scripts, debug output) once the task is done. Never leave them lying around.

## Git

- Never commit without explicit permission from the user.
- Never open a pull request without explicit permission from the user. Plan approval does not count as permission to commit or open a PR; ask again at the point of doing it.
- Never merge a pull request yourself, under any circumstances. The user always merges in the UI. Running a merge (gh pr merge, git merge into main, etc.) is not allowed.
- fetch and push fail in the container (no SSH key). Run them on the host; local git (branch, commit, status, log) works in the container.
- Open PRs from the host with `gh`.

## Writing style

- Never use hyphens or dashes as punctuation in written content (no em dashes, en dashes, or hyphen separators). Use commas or full stops instead.
- Keep explanations brief by default. Only go into line by line or low level specifics when explicitly asked.
- Never use the second person ("you", "your") in written content. Write in the first person or rephrase impersonally.

## Language

- All project files (code, comments, config, docs) must be written in English.
- Always use British English spelling (e.g. colour, optimise, behaviour, organise).
