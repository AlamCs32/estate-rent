---
name: docker-deployment
description: Docker and docker-compose configuration for the EstateRent monorepo. Use when writing Dockerfiles, modifying docker-compose, setting up multi-stage builds, configuring environment variables for containers, or debugging container issues.
license: MIT
metadata:
  author: estate-rent
  version: '1.0.0'
---

# Docker & Deployment — EstateRent

Guide for containerizing and orchestrating the EstateRent stack locally and in production.

## When to Apply

- Writing or modifying `Dockerfile.api` or `Dockerfile.web`
- Editing `docker-compose.yml`
- Setting up environment variables for containers
- Debugging container networking or volume issues
- Configuring Nginx for the web app
- CI/CD deployment pipelines

---

## 1. Multi-Stage Build Principles

### Rules

- **Stage 1 (`deps`)**: Install all dependencies — both prod and dev — for the build.
- **Stage 2 (`builder`)**: Run `pnpm build` with access to dev deps.
- **Stage 3 (`runner`)**: Copy only the compiled output + `node_modules` (prod only). Minimal final image.
- Use `node:20-alpine` as the base image unless a native addon requires full Debian.
- Never leave `devDependencies` in the final image.
- Set `NODE_ENV=production` in the runner stage.
- Run as a non-root user in production.

### API Dockerfile Pattern

```dockerfile
# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM deps AS builder
COPY . .
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/utils build
RUN pnpm --filter @repo/config build
RUN pnpm --filter @repo/api build

# ---- Stage 3: Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy manifests for prod install
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile --prod
# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /app/packages/config/dist ./packages/config/dist
USER nestjs
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
```

---

## 2. docker-compose.yml Structure

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-estate}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-estate_secret}
      POSTGRES_DB: ${POSTGRES_DB:-estate_rent}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-estate}']
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
    ports:
      - '3000:3000'

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - '80:80'

volumes:
  postgres_data:
```

---

## 3. Environment Variables

### Rules

- **Never hardcode secrets** in `Dockerfile` or `docker-compose.yml`.
- Use `.env` files (gitignored) locally; use container environment injection or secrets in CI/CD.
- The `.env.example` file is the canonical list of required variables — keep it up to date.
- Validate all env vars at startup with the Zod env schema in `packages/config`.

### Local Dev Setup

```bash
cp .env.example .env
# Edit .env with your actual values
docker compose up -d db     # start DB only
pnpm dev                    # run apps locally
```

---

## 4. Nginx Config for Web (Production)

```nginx
# nginx.conf (used inside Dockerfile.web)
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://api:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain application/javascript application/json text/css;
}
```

---

## 5. Common Docker Commands

```bash
# Build all images
docker compose build

# Start all services (detached)
docker compose up -d

# View logs for a service
docker compose logs -f api

# Restart a specific service
docker compose restart api

# Run a one-off command in a container
docker compose exec api node apps/api/dist/main.js --help

# Run migrations inside the container
docker compose exec api pnpm --filter @repo/api migration:run

# Prune all stopped containers, volumes, images
docker system prune -af --volumes
```

---

## 6. Debugging Container Networking

- Services in `docker-compose` communicate via service name as hostname (e.g., `db`, `api`).
- `localhost` inside a container refers to the container itself, not the host machine.
- To access the host from inside a container on Docker Desktop: use `host.docker.internal`.
- Check container IP: `docker inspect <container_id> | grep IPAddress`.

---

## 7. GitHub Actions CI Pattern

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.9.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint check-types test build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```
