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
docker exec -u node -w /workspaces/zou-minowa-portfolio/frontend zou-minowa-portfolio-dev <command>
```

See `frontend/package.json` scripts for available commands.

## Conventions

- Components live in `frontend/src/components/`.
- Layouts live in `frontend/src/layouts/`.
- Pages live in `frontend/src/pages/`.
- Terraform infrastructure lives in `infra/`.

## Coding style

- Keep components small and focused.
- Use semantic, mobile-first markup; keep unprefixed utilities as the mobile default and only add `sm:`/`md:`/`lg:` for larger screens.
- Follow existing Tailwind utility patterns.
- Keep visibility/positioning classes in the parent; child components should not control layout.
- Never use hardcoded pixel values.
- Never use `<style>` tags in components; use Tailwind utility classes only.
- Use `UPPER_SNAKE_CASE` for constants with static literal values (strings, numbers).
- Always mock external dependencies (e.g. `getCollection`, `getEntry`) in tests instead of skipping them.

## Language

- All project files (code, comments, config, docs) must be written in English.
