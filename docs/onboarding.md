# Developer onboarding

Welcome to the monorepo! This guide walks through the prerequisites, local environment setup, and common workflows for running the backend, worker, web, and mobile applications.

## Prerequisites

Install the following tools locally:

- **Python** 3.11+
- **Node.js** 20+ (ships with npm v9 workspaces support)
- **Git** 2.44+
- **Docker** 24+ and Docker Compose plugin (or Docker Desktop)
- **Make** (optional, useful for scripting repetitive commands)
- **Pre-commit** (`pip install pre-commit`)

> _Tip:_ Consider using [`asdf`](https://asdf-vm.com/) or [`pyenv`](https://github.com/pyenv/pyenv) + [`nvm`](https://github.com/nvm-sh/nvm) to manage language runtimes.

## Environment variables

1. Copy the example environment file at the repository root:
   ```bash
   cp .env.example .env
   ```
2. Update secrets (passwords, API keys) and service URLs as needed. These values are shared across Docker Compose and local app runs.

Python services read configuration via Pydantic Settings (`apps/backend/app/core/config.py`, `apps/ai_worker/worker/config.py`), which automatically loads values from `.env` and the process environment.

## Install dependencies

### Backend API (FastAPI)

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r apps/backend/requirements-dev.txt
pre-commit install
```

Run the development server:

```bash
uvicorn app.main:app --reload --app-dir apps/backend/app
```

Execute the test suite:

```bash
cd apps/backend
pytest
```

### AI/Celery worker

```bash
python -m venv .venv-worker
source .venv-worker/bin/activate
pip install --upgrade pip
pip install -r apps/ai_worker/requirements-dev.txt
```

Start the worker (expects Redis running):

```bash
cd apps/ai_worker
celery -A worker.main:celery_app worker --loglevel=info
```

### Web frontend (Next.js)

```bash
npm install
npm run dev:web
```

Visit http://localhost:3000 to view the web app. Additional scripts:

- `npm run lint:web` – ESLint checks
- `npm run build:web` – Production build

### Mobile app (Expo React Native)

```bash
npm install
npm run start:mobile
```

This launches the Expo CLI. Use the QR code or simulator to open the app. Lint with `npm run lint:mobile`.

## Docker Compose workflow

The stack can run entirely in containers for parity with shared infrastructure. Ensure Docker is running, then execute:

```bash
docker compose up --build
```

This starts Postgres, Redis, MinIO, backend, worker, and web services. Override service commands or attach debuggers via the `docker-compose.yml` file.

## Pre-commit hooks

Install hooks once per clone:

```bash
pre-commit install
```

Hooks run automatically on `git commit` and include:

- `black` and `isort` (Python formatting)
- `pytest` (backend tests)
- `npm run lint:web` (web ESLint checks)
- `npm run lint:mobile` (Expo/React Native lint rules)

Run all hooks manually with:

```bash
pre-commit run --all-files
```

## Continuous integration

GitHub Actions workflow (`.github/workflows/ci.yml`) validates:

- Backend Python unit tests with pytest
- Web app lint and build commands

As the project evolves, extend CI steps for database migrations, worker integration tests, storybook builds, etc.

## Troubleshooting tips

- Ensure `.env` values match those expected by Docker Compose (service names, ports).
- Clear local caches (`rm -rf node_modules .venv .pytest_cache`) if tooling behaves unexpectedly.
- For Docker Compose, run `docker compose logs -f <service>` to inspect service output.
- When upgrading dependencies, re-run `npm install` / `pip install -r ...` to update lockfiles and virtual environments.

Welcome aboard and happy shipping!
