# EstateRent Monorepo

A production-ready monorepo for a rental property marketplace.

## Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS
- **Frontend**: React 19 + Vite + TypeScript
- **Shared**: UI components, types, utilities, config
- **CI/CD**: GitHub Actions
- **Containers**: Docker + docker-compose

## Getting Started

```bash
pnpm install
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api

## Scripts

| Command            | Description                 |
| ------------------ | --------------------------- |
| `pnpm dev`         | Start all apps in dev mode  |
| `pnpm build`       | Build all apps and packages |
| `pnpm lint`        | Lint all projects           |
| `pnpm test`        | Run all tests               |
| `pnpm clean`       | Clean all build artifacts   |
| `pnpm format`      | Format code with Prettier   |
| `pnpm check-types` | Type-check all projects     |

## Project Structure

```
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # React + Vite frontend
├── packages/
│   ├── ui/           # Shared React components
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   ├── config/       # Shared configuration
│   ├── tsconfig/     # Shared TS configs
│   └── eslint-config/# Shared ESLint config
```

## Docker

```bash
docker compose up -d
```
