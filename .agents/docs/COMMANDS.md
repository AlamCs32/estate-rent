# Commands — EstateRent Monorepo

All commands run from the repository root.

## Install

```bash
pnpm install                          # Install all dependencies
pnpm install --frozen-lockfile        # CI install (no lockfile changes)
pnpm add <pkg> --filter @repo/api     # Add dependency to specific package
pnpm add <pkg> -w                     # Add root dev dependency
pnpm up --recursive                   # Upgrade all dependencies
```

## Development

```bash
pnpm dev                              # Run all apps in parallel
pnpm dev:api                          # Run API only
pnpm dev:web                          # Run web only
pnpm dev --filter @repo/api           # Turbo filter: run API
pnpm dev --filter @repo/web           # Turbo filter: run web
pnpm dev:app @repo/api                # Run any app by name
```

## Build

```bash
pnpm build                            # Build all apps and packages
pnpm build --filter @repo/api         # Build API only
pnpm build --filter @repo/web^...     # Build web and its dependencies
```

## Test

```bash
pnpm test                             # Run all tests
pnpm test --filter @repo/api          # Run API tests only
pnpm test --filter @repo/web          # Run web tests only
pnpm --filter @repo/api test:e2e     # Run API e2e tests
```

## Lint & Format

```bash
pnpm lint                             # Lint everything
pnpm lint --filter @repo/api          # Lint API only
pnpm format                           # Format all files with Prettier
pnpm check-types                      # Type-check all projects
```

## Clean

```bash
pnpm clean                            # Remove all dist/, .turbo/, node_modules
pnpm turbo clean --daemon             # Clear Turbo cache if corrupted
```

## TypeORM Migrations

```bash
pnpm --filter @repo/api migration:create ./src/migrations/<Name>  # Create a new migration file
pnpm --filter @repo/api migration:generate                        # Auto-generate from entities
pnpm --filter @repo/api migration:run                             # Run pending migrations
pnpm --filter @repo/api migration:revert                          # Revert last migration
pnpm --filter @repo/api schema:sync                               # Dev only — sync without migration
pnpm --filter @repo/api seed                                      # Seed database
```

## Database

```bash
docker compose up -d db                # Start PostgreSQL only
docker compose down                    # Stop all containers
docker compose down -v                 # Stop and delete volumes
```

## Docker

```bash
docker compose up -d                   # Start full stack
docker compose up -d --build           # Rebuild and start
docker compose logs -f                 # Tail logs
```

## Turborepo

```bash
pnpm turbo build --dry-run             # Preview build plan
pnpm turbo build --graph               # Visualize dependency graph
pnpm turbo build --filter=@repo/api    # Filter to specific package
pnpm turbo ls                          # List all workspace packages
pnpm turbo daemon status               # Check Turbo daemon status
pnpm turbo link                        # Link to remote cache (Vercel)
```

## Git

```bash
git add -A && pnpm commit              # Stage and commit with commitlint
pnpm prepare                           # Reinstall Husky hooks
```
