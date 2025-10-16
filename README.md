# Monorepo Starter

This repository bootstraps a full-stack product platform composed of a FastAPI backend, a Celery-powered AI/automation worker, a Next.js web application, and a React Native mobile client. Shared infrastructure is orchestrated with Docker Compose and relies on Postgres for persistence, Redis for caching/queueing, and MinIO for S3-compatible object storage.

## Architecture overview

- **FastAPI backend** – Provides the main HTTP API surface, manages application state, and exposes async endpoints for client applications.
- **Celery worker (`ai_worker`)** – Performs asynchronous and long-running tasks, consuming jobs from Redis and integrating with AI tooling.
- **Next.js web frontend** – Delivers the browser experience with server-side rendering and React Server Components.
- **React Native mobile client** – Ships the mobile application (Expo-managed) sharing design patterns with the web client.
- **Postgres + Redis + MinIO** – Backing services for transactional data, message brokering, caching, and object storage.

A detailed architectural decision record is available in [`docs/adr/0001-monorepo-architecture.md`](docs/adr/0001-monorepo-architecture.md).

## Repository layout

```
apps/
  backend/       # FastAPI service code, tests, and Dockerfile
  ai_worker/     # Celery worker entrypoint, shared configuration, Dockerfile
  web/           # Next.js application (TypeScript, App Router)
  mobile/        # Expo-managed React Native client
docs/
  adr/           # Architecture decision records and technical notes
.github/
  workflows/     # Continuous integration configuration
```

Shared tooling is configured at the repository root (`.pre-commit-config.yaml`, `pyproject.toml`, `.prettierrc`) so the Python and JavaScript projects follow consistent formatting and linting guidelines.

## Tooling highlights

- **Python** – `black`, `isort`, and `pytest` are configured for the backend and worker. Dependency management is handled through `requirements.txt` / `requirements-dev.txt` files per service.
- **JavaScript / TypeScript** – ESLint and Prettier are preconfigured for both the web and mobile apps. Monorepo workspaces are managed with npm (v9+) workspaces.
- **Pre-commit** – A shared hook set enforces formatting and runs key test/lint commands before each commit.
- **Docker Compose** – Spins up databases, cache, object storage, and application containers using the root `docker-compose.yml` file.
- **CI skeleton** – GitHub Actions workflow (`ci.yml`) exercises backend tests and ensures the web application builds/lints successfully on every push and pull request.

## Getting started

1. Copy the example environment file and adjust values as needed:
   ```bash
   cp .env.example .env
   ```
2. Follow the step-by-step onboarding guide at [`docs/onboarding.md`](docs/onboarding.md) to install prerequisites, bootstrap each workspace, and run the stack locally.
3. Install and activate pre-commit hooks so the shared tooling runs automatically:
   ```bash
   pip install pre-commit
   pre-commit install
   ```

## Additional resources

- **Architecture ADR** – [`docs/adr/0001-monorepo-architecture.md`](docs/adr/0001-monorepo-architecture.md)
- **Onboarding guide** – [`docs/onboarding.md`](docs/onboarding.md)
- **Docker Compose orchestration** – [`docker-compose.yml`](docker-compose.yml)

Feel free to iterate on each application independently—this monorepo provides a foundation for consistent tooling, shared CI, and a unified development experience.
