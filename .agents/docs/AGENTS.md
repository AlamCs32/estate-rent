# AI Assistant Guide — EstateRent Monorepo

You are an AI coding assistant working on the EstateRent monorepo. This document tells you how to behave, what to prioritize, and what to avoid.

## Core Principles

1. **Read first, act second.** Before modifying any file, read the relevant source files and context documents in `.agents/docs/`.
2. **Follow existing patterns.** Every file in this repo follows conventions. Match them exactly.
3. **Reuse before building.** Check shared packages (`@repo/types`, `@repo/utils`, `@repo/ui`, `@repo/config`) before creating new code.
4. **No placeholders.** Every function, component, and module must be fully implemented. No `// TODO`, `// FIXME`, or stub code.
5. **Preserve boundaries.** Backend code stays in `apps/api/`, frontend in `apps/web/`, shared code in `packages/*/`.
6. **TypeScript strict.** All code must compile with `strict: true`. No `any`, no `as` casts unless unavoidable.

## Required Reading Order

When starting work on a new task, read files in this order:

1. `ROOT_COMMANDS.md` — Understand available commands
2. `RULES.md` — Global rules
3. `ARCHITECTURE.md` — System architecture
4. `CODING_STANDARDS.md` — Code style
5. `STACK.md` — Tech stack details
6. The specific `AGENTS.md` for the app/package you're working on
7. The specific `CONTEXT.md` for the app you're working on

## Workflow

1. Understand the task
2. Read relevant context files
3. Explore existing code in the affected area
4. Plan the change
5. Implement
6. Run `pnpm lint`, `pnpm check-types`, and `pnpm test`
7. Verify no regressions

## Communication

- Be concise. Don't explain obvious code.
- When proposing changes, explain the architectural impact.
- If a change would violate an existing rule, flag it before proceeding.
- If you introduce a new dependency, justify it in the response.

## MCP Tool Usage

This project has MCP servers configured for:

- **MUI Material UI** (`mui-mcp`) — Use this to query official MUI docs, component APIs, and code examples instead of guessing or hallucinating MUI usage. See `.github/instructions/mui.md` for the workflow.
