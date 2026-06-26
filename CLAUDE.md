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

## File structure

- Every component, hook, and utility lives in its own folder named after it, with its Vitest test co-located in that same folder (e.g. `ChatInput/ChatInput.tsx` + `ChatInput/ChatInput.test.tsx`).
- A helper function scoped to a single consumer goes in a `utils/` subdirectory of that consumer, in its own folder named after the function, with the test alongside (e.g. `ChatMessage/utils/renderMarkdown/renderMarkdown.ts` + `renderMarkdown.test.ts`; `ChatWidget/utils/apiPost/apiPost.ts` + `apiPost.test.ts`).
- Never leave a function file and its test loose in a shared directory; always give them their own named folder.

## Coding style

- Keep components small and focused.
- Never use ternary (`? :`) expressions inside JSX. Use `&&` for conditional rendering, or compute the branch outside the JSX (e.g. a helper or variable).
- Never add explicit type annotations to values or return types that TypeScript can infer. Let them infer. Only annotate when fulfilling an external contract (e.g. a function parameter typed to an imported contract, or a value that must satisfy a shared interface).
- Never nest `if` statements. Flatten with `&&` in the condition, an early return, or a guard clause; keep branching one level deep.
- Use semantic, mobile-first markup; keep unprefixed utilities as the mobile default and only add `sm:`/`md:`/`lg:` for larger screens.
- Follow existing Tailwind utility patterns.
- A component must NEVER be responsible for its own positioning. Placement utilities (`fixed`/`absolute`, `inset-*`, `top/right/bottom/left-*`, `z-*`, and visibility toggles) belong to the parent and are passed in as a `class`/`className` prop. A child owns only its intrinsic appearance, size, and behaviour.
- Never use hardcoded pixel values.
- Never use `<style>` tags in components; use Tailwind utility classes only.
- Use `UPPER_SNAKE_CASE` for constants with static literal values (strings, numbers).
- Always mock external dependencies (e.g. `getCollection`, `getEntry`) in tests instead of skipping them.
- Never add markup hooks (`data-*` attributes, ids, classes) to a component solely so a test can select an element. Assert on semantics or visible output instead. If a test genuinely must target the root element, give the component a rest-props passthrough (`...rest`) and pass the attribute in from the test file, never bake it into the component.
- Never add code comments or documentation unless explicitly requested.

## Git

- Never stage files (`git add`) on the user's behalf. The user stages deliberately, file by file, when satisfied with each. Verification (`check`, `lint`, `test`, `build`) runs against the working tree and never needs staging, so do not stage to verify.
- Never commit without explicit permission from the user.
- Never open a pull request without explicit permission from the user. Plan approval does not count as permission to commit or open a PR; ask again at the point of doing it.
- Never merge a pull request yourself, under any circumstances. The user always merges in the UI. Running a merge (gh pr merge, git merge into main, etc.) is not allowed.
- fetch and push fail in the container (no SSH key). Run them on the host; local git (branch, commit, status, log) works in the container.
- Open PRs from the host with `gh`.

## Writing style

- Never use hyphens or dashes as punctuation in written content (no em dashes, en dashes, or hyphen separators). Use commas or full stops instead.

## Language

- All project files (code, comments, config, docs) must be written in English.
- Always use British English spelling (e.g. colour, optimise, behaviour, organise).
