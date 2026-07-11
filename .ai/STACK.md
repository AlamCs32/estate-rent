# Technology Stack — EstateRent Monorepo

## Monorepo Tooling

| Tool           | Version  | Purpose                         |
| -------------- | -------- | ------------------------------- |
| pnpm           | 10.9.0   | Package manager (Corepack)      |
| Turborepo      | 2.5.2    | Build orchestration and caching |
| Node.js        | >=20.0.0 | Runtime                         |
| TypeScript     | 5.8.3    | Type system                     |
| ESLint         | 9.39.4   | Linting (flat config)           |
| Prettier       | 3.5.3    | Code formatting                 |
| Husky          | 9.1.7    | Git hooks                       |
| Commitlint     | 19.8.0   | Commit message linting          |
| lint-staged    | 15.5.2   | Staged file linting             |
| GitHub Actions | —        | CI/CD                           |

## Backend (`apps/api`)

| Library           | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| NestJS            | 11.1.0  | Application framework           |
| Fastify           | —       | HTTP adapter (planned)          |
| TypeORM           | —       | ORM (planned)                   |
| PostgreSQL        | 16      | Database                        |
| @nestjs/config    | 4.0.0   | Environment configuration       |
| @nestjs/swagger   | —       | API documentation (planned)     |
| class-validator   | —       | DTO validation (planned)        |
| class-transformer | —       | Object transformation (planned) |

## Frontend (`apps/web`)

| Library           | Version | Purpose                           |
| ----------------- | ------- | --------------------------------- |
| React             | 19.1.0  | UI library                        |
| Vite              | 6.3.5   | Build tool                        |
| Material UI (MUI) | —       | Component library (planned)       |
| React Router      | —       | Client-side routing (planned)     |
| RTK Query         | —       | Server state management (planned) |
| React Hook Form   | —       | Form handling (planned)           |
| Zod               | —       | Schema validation (planned)       |
| Vitest            | 3.1.3   | Testing                           |

## Shared Packages

| Package               | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `@repo/types`         | TypeScript interfaces shared between frontend and backend |
| `@repo/utils`         | Pure utility functions (formatting, validation, etc.)     |
| `@repo/ui`            | Shared React UI components                                |
| `@repo/config`        | Runtime configuration from environment variables          |
| `@repo/eslint-config` | Shared ESLint flat configurations                         |
| `@repo/tsconfig`      | Shared TypeScript configuration presets                   |

## Infrastructure

| Tool           | Purpose                                    |
| -------------- | ------------------------------------------ |
| Docker         | Containerization                           |
| docker-compose | Local orchestration (API + DB + Web)       |
| Nginx          | Production web serving (multi-stage build) |
| GitHub Actions | CI pipeline                                |

## Planned / Future Stack Additions

Components marked with _(planned)_ in the tables above are declared in the architectural vision but not yet installed. When you reach a task that requires them:

1. Install the package with `pnpm add -w` (root) or `pnpm add --filter <package>` (per-package)
2. Follow the existing conventions
3. Update this file to mark them as active
