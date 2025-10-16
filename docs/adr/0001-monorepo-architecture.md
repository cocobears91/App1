# ADR 0001: Monorepo architecture, tooling, and platform composition

- **Status:** Accepted
- **Date:** 2024-10-16
- **Context:** Establishing a greenfield product stack that combines API, worker, web, and mobile clients with shared infrastructure and tooling.

## Decision

Adopt a polyglot monorepo that houses the following components:

1. **FastAPI backend (`apps/backend`)**
   - Python 3.11
   - Serves REST and event-driven endpoints, orchestrates domain logic, integrates with Postgres, Redis, and object storage.
   - Uses Pydantic Settings for configuration sourced from environment variables and optional `.env` files.

2. **Celery worker (`apps/ai_worker`)**
   - Shares environment configuration with the backend.
   - Executes asynchronous jobs (data processing, ML inference, scheduled tasks) pulled from Redis queues.

3. **Next.js web application (`apps/web`)**
   - TypeScript + React 18 with the App Router.
   - Provides the primary desktop browser experience, consuming backend APIs and triggering asynchronous tasks.

4. **React Native mobile application (`apps/mobile`)**
   - Expo-managed workflow for rapid iteration and OTA updates.
   - Shares business logic patterns with the web client where practical.

5. **Infrastructure services** orchestrated via Docker Compose:
   - Postgres 16 (transactional database)
   - Redis 7 (cache + Celery broker)
   - MinIO (S3-compatible object storage for file and model artifacts)
   - Containerized application services (backend API, Celery worker, Next.js web)

6. **Shared tooling** at repository root:
   - Pre-commit hooks for formatting (`black`, `isort`, `prettier`) and correctness (`pytest`, `eslint`).
   - Python linting/formatting configured through `pyproject.toml`.
   - JavaScript linting/formatting via ESLint and Prettier configs (applied per workspace).
   - GitHub Actions CI ensures backend tests and web build/lint run on each push/PR.

## Rationale

- A monorepo allows shared tooling, unified versioning, and coordinated releases across backend, worker, and clients.
- FastAPI, Celery, and Next.js are well-supported, async-friendly frameworks that align with modern Python and React ecosystems.
- Redis and Postgres are ubiquitous services with rich PaaS offerings, easing future deployment concerns.
- MinIO provides local S3-compatible storage that mirrors production cloud object stores.
- npm workspaces simplify dependency management across the web and mobile clients without requiring additional tooling.
- Pre-commit + CI automation enforce quality gates early, reducing integration issues.

## Consequences

- Developers must have both Python and Node.js toolchains installed locally, plus Docker for infrastructure parity.
- Coordinating releases requires attention to cross-service contracts (e.g., API responses, message payloads) but is mitigated by shared repo visibility.
- The monorepo expects consistent code style; teams should align on formatting conventions early.
- CI/CD will need to scale as test suites grow; this skeleton provides a foundation for future caching and parallelization.

## References

- [`docker-compose.yml`](../../docker-compose.yml) for service orchestration.
- [`docs/onboarding.md`](../onboarding.md) for developer setup instructions.
- [`README.md`](../../README.md) for a bird's-eye view of the repository.
