# Git Workflow — EstateRent Monorepo

## Branch Strategy

```
main ─────── production-ready code
  │
  └── develop ─── integration branch
       │
       ├── feat/estate-search     ── feature branches
       ├── fix/pagination-bug
       ├── refactor/api-auth
       ├── perf/query-optimization
       ├── chore/update-deps
       └── ci/docker-cache
```

- `main` — Protected. Only merge from `develop` via PR. Deploys to production.
- `develop` — Integration branch. Feature branches merge here.
- `feat/*` — New features. Branch from `develop`, merge back via PR.
- `fix/*` — Bug fixes. Branch from `develop`, merge back via PR.
- `refactor/*` — Code improvements without feature changes.
- `perf/*` — Performance optimizations.
- `chore/*` — Maintenance, dependency updates, tooling.
- `ci/*` — CI/CD configuration changes.

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Usage                                   |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `docs`     | Documentation only                      |
| `style`    | Formatting, whitespace (no code change) |
| `refactor` | Code change that neither fixes nor adds |
| `perf`     | Performance improvement                 |
| `test`     | Adding/fixing tests                     |
| `chore`    | Build, deps, config                     |
| `ci`       | CI/CD changes                           |

### Scopes

| Scope      | Package/Area             |
| ---------- | ------------------------ |
| `api`      | `apps/api`               |
| `web`      | `apps/web`               |
| `ui`       | `packages/ui`            |
| `types`    | `packages/types`         |
| `utils`    | `packages/utils`         |
| `config`   | `packages/config`        |
| `eslint`   | `packages/eslint-config` |
| `tsconfig` | `packages/tsconfig`      |
| `deps`     | Dependency changes       |
| `ci`       | CI/CD                    |
| `docker`   | Docker config            |

### Examples

```
feat(api): add estate search endpoint
fix(web): correct pagination offset on estate list
refactor(api): extract estate validation to shared dto
chore(deps): upgrade nestjs to 11.1.0
ci: add lint step to github actions
```

## PR Workflow

1. Create feature/fix branch from `develop`
2. Implement changes with atomic commits
3. Push branch and open PR to `develop`
4. PR title must follow conventional commit format
5. CI must pass (lint + typecheck + test + build)
6. At least one reviewer approves
7. Squash-merge into `develop`
8. Delete the feature branch

## PR Template

```markdown
## Description

Brief description of what this PR does.

## Type

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] test
- [ ] chore

## Affected Packages

- [ ] api
- [ ] web
- [ ] shared packages (specify)

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project standards
- [ ] No new warnings/errors
- [ ] Documentation updated (if needed)
- [ ] Commits follow conventional commit format
```
