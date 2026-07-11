# Security Guidelines — EstateRent Monorepo

## General Principles

- **Defense in depth.** Multiple layers of security: network, transport, application, data.
- **Least privilege.** Every function, service, and user should have only the permissions they need.
- **Validate everything.** All external input must be validated, sanitized, and typed.
- **Never trust the client.** Backend must re-validate all data, including authentication tokens.

## Authentication & Authorization

- Use JWT tokens with asymmetric signing (RS256) in production.
- Access tokens: short-lived (15 min). Refresh tokens: long-lived (7 days), stored in httpOnly cookies.
- All protected routes use NestJS `AuthGuard` or custom guards.
- Role-based access (RBAC) with `@Roles()` decorator and `RolesGuard`.
- Never store raw passwords. Use bcrypt (cost factor 12+) or argon2.

## Input Validation

- **Backend**: Use `class-validator` decorators on DTOs. Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **Frontend**: Use Zod schemas for form validation. Validate before sending to API.
- Never pass user input directly to TypeORM queries. Use parameterized queries (TypeORM does this by default).

## API Security

- **CORS**: Restrict origins in production. Use `@repo/config` to manage allowed origins.
- **Helmet**: Set security headers (CSP, HSTS, X-Frame-Options, etc.).
- **Rate limiting**: Use `@nestjs/throttler` or Fastify rate-limit plugin.
  - Auth endpoints: 5 req/min per IP
  - General API: 100 req/min per IP
- **Request size limits**: Limit JSON body size to 1 MB.
- **Swagger/OpenAPI**: Disable in production.

## Database Security

- Use parameterized queries / TypeORM's built-in query builder (prevents SQL injection).
- Never use `synchronize: true` in production. Use migrations.
- Database user permissions: `SELECT`, `INSERT`, `UPDATE`, `DELETE` only. No DDL in app user.
- Encrypt sensitive columns (PII) at rest using PostgreSQL `pgcrypto`.
- Connection string should use environment variables — never hardcoded.

## Frontend Security

- Sanitize any HTML rendered from API data (use DOMPurify if needed).
- Content Security Policy (CSP) via meta tag or server headers.
- No sensitive data in URL parameters or localStorage.
- Use httpOnly cookies for refresh tokens.
- All API calls go through Vite proxy in dev, nginx in production (no CORS issues).

## Environment & Secrets

- All secrets in environment variables, accessed through `@repo/config`.
- `.env` files are git-ignored. Only `.env.example` is committed.
- Use `.env.local` for local overrides (also git-ignored).
- CI secrets managed through GitHub Actions secrets.
- No API keys, tokens, or passwords in source code.

## Dependency Security

- Run `pnpm audit` regularly in CI.
- Use Dependabot or Renovate for automated dependency updates.
- Pin major versions of critical dependencies (Node, PostgreSQL, NestJS).
- Review new dependencies for maintenance status and security history.

## Docker Security

- Use official Alpine-based images where possible.
- Run containers as non-root user (see `Dockerfile.api`: `USER nestjs`).
- Don't expose unnecessary ports in docker-compose.
- Health checks prevent routing to unhealthy containers.

## Incident Response

- All security errors logged with structured logging (not `console.error`).
- Failed auth attempts logged with IP and timestamp.
- Data access violations result in `403 Forbidden`, logged at WARN level.
- Rate limit violations logged at INFO level (potential DDoS monitoring).
